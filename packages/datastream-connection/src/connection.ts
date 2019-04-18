import * as $Datastream from '@auroradao/datastream-types';

import { Task$Handler } from 'task-handler';

import { CLOSE_CODES, MAX_RECONNECT_SECONDS, PING_INTERVAL } from './constants';
import { DatastreamNotReadyError } from './errors';

import { createBuffer } from './utils/buffer';
import { createRedelay } from './utils/redelay';

import handleClosure from './close-handlers';
import requests from './requests';

function assertNever(event: never): never {
  console.error(`[ERROR] | DatastreamConnection | Unhandled case "${event}"`);
  return event;
}

/**
 * These do not correlate to the WebSocket states which use
 * a different numbering.
 *
 * This is specific to our connection handler and is used to
 * determine its own state at any given point.
 *
 * @const
 */
const STATE = $Datastream.Connection$State;

interface $StringableValue {
  toString(): string;
}

type SocketEvent$Args<
  E extends $Datastream.Connection$SocketEvents
> = E extends 'close'
  ? [number, string, boolean]
  : E extends 'open'
  ? []
  : E extends 'message'
  ? [$StringableValue]
  : E extends 'pong'
  ? [string]
  : E extends 'error'
  ? [Error]
  : never;

function clearAllConnectionTasks(
  task: Task$Handler,
  buffer?: ReturnType<typeof createBuffer>,
): void {
  task.cancel(
    'connection:flush-buffer',
    'connection:will-reconnect',
    'connection:deferred-reconnect',
    'connection:reconnect',
    'connection:ping',
    'connection:error-reconnect',
  );
  if (buffer) {
    buffer.clear();
  }
}

/**
 * Called when the connection is in a FATAL state and any
 * type of connection is attempted
 */
function handleFatalState(): void {
  throw new Error(
    'Connection State is FATAL and no further connection is allowed.',
  );
}

function isDatastreamEvent(
  message: $Datastream.Message$Result$Socket<string, string>,
): message is $Datastream.Message$Event {
  return (message as $Datastream.Message$Event).event !== undefined;
}

function isDatastreamResponse<RID extends string, REQ extends string>(
  message: $Datastream.Message$Result$Socket<RID, REQ>,
): message is
  | $Datastream.Message$Result$Success<RID, REQ>
  | $Datastream.Message$Result$Error<RID, REQ> {
  return (
    (message as $Datastream.Message$Result$Success<RID, REQ>).request !==
    undefined
  );
}

/**
 * Creates a connection manager which maintains the connection to the
 * datastream and adheres to the specifications general requirements.
 * We will use the provided connector whenever establishing a socket
 * and expect (without validation) that it adheres to the generally
 * expected interface.
 *
 * @export
 * @param {Task$Handler} task
 * @param {$Datastream.Configuration} config
 * @param {(event: $Datastream.Connection$Events) => void} handleClientEvent
 * @returns
 */
export default function createConnection(
  task: Task$Handler,
  config: $Datastream.Configuration,
  handleClientEvent: $Datastream.Client$EventHandler,
): $Datastream.Connection$Controller {
  const redelay = createRedelay(MAX_RECONNECT_SECONDS);
  const buffer = config.buffer ? createBuffer(config.buffer) : undefined;

  let socket: $Datastream.Connection$Socket;
  let state: $Datastream.Connection$State;
  let sid: string;

  function sendToSocket(
    packet:
      | $Datastream.Request$Complete<string, string, string>
      | $Datastream.Request<'handshake'>
      | $Datastream.Request<'bulk'>,
  ): void {
    if (!socket) {
      // sanity check, shouldn't happen!
      throw new Error(
        '[ERROR] | DatastreamConnection | Tried to send to socket before it was created, please report this to the library maintainers.',
      );
    }
    socket.send(JSON.stringify(packet), err =>
      err ? handleSocketEvent('error', err) : undefined,
    );
  }

  function flushBuffer(): void {
    if (
      !socket ||
      state !== STATE.HANDSHAKED ||
      socket.readyState !== socket.OPEN ||
      !buffer ||
      buffer.length === 0
    ) {
      return;
    }
    const request = buffer.flush();
    if (request) {
      sendToSocket({
        sid,
        ...request,
      });
    }
  }

  function startPinger(): void {
    const ref = task.every(
      'connection:ping',
      PING_INTERVAL,
      (): void => {
        try {
          if (![STATE.CONNECTED, STATE.HANDSHAKED].includes(state)) {
            console.warn(
              '[WARN] | DatastreamConnection | An unexpected error condition occurred with the datastream auto-pinger, please report this to the library maintainers.',
            );
            console.trace();
            task.defer('connection:deferred-reconnect', () => reconnect());
            ref.cancel();
            return;
          }
          socket.ping(sid);
        } catch (error) {
          console.error(
            '[ERROR] | DatastreamConnection | A critical error occurred during a client-side ping attempt',
            error,
          );
          task.defer('connection:deferred-reconnect', () => reconnect());
          ref.cancel();
        }
      },
    );
  }

  function parseDatastreamError(str: string): string {
    try {
      // errors may provide all locale values stringified, otherwise it will
      // be a standard string and cause an error here.
      const message = JSON.parse(str);
      return message[config.locale] || message.en || message;
    } catch {
      // if an error then we likely receive a standard error format such as
      // { message: "Invalid Payload" } without translations.
      return str;
    }
  }

  /**
   * When data is received on the
   *
   * @param {(void | $Datastream.Message$Result$Socket<string, string>)} message
   * @returns
   */
  function handleSocketMessage(
    message: void | $Datastream.Message$Result$Socket<string, string>,
  ): void | {
    event: 'message' | 'error' | 'handshake' | 'event';
    message: $Datastream.Message$Result$Socket<string, string>;
  } {
    if (!message || (!isDatastreamEvent(message) && !message.request)) {
      closeSocketIfNeeded(CLOSE_CODES.NORMAL, 'InvalidMessageType');
      reconnect();
      return;
    }
    if (state === STATE.HANDSHAKED && (!message.sid || message.sid !== sid)) {
      closeSocketIfNeeded(CLOSE_CODES.NORMAL, 'SessionIDMismatch');
      reconnect();
      return;
    }

    let event: 'error' | 'message' | 'handshake' | 'event';

    if (isDatastreamResponse(message)) {
      event = message.result === 'error' ? 'error' : 'message';
      switch (message.request) {
        case 'handshake': {
          if (message.result === 'success') {
            ({ sid } = message);
            state = STATE.HANDSHAKED;
            event = 'handshake';
            redelay.reset();
            if (buffer && buffer.length > 0) {
              task.defer('connection:flush-buffer', flushBuffer);
            }
            startPinger();
          }
          break;
        }
        case 'bulk': {
          if (message.result === 'success') {
            // shouldn't happen, but just in case, we flush any contents
            // added to buffer since we last flushed
            if (buffer && buffer.length > 0) {
              task.defer('connection:flush-buffer', flushBuffer);
            }
          }
          return;
        }
        default:
          break;
      }
    } else {
      event = 'event';
    }

    const withMessage = {
      ...message,
    };

    if (typeof withMessage.payload === 'string') {
      withMessage.payload = JSON.parse(withMessage.payload);
    }

    if (event === 'error') {
      if (typeof withMessage.payload.message === 'string') {
        withMessage.payload.message = parseDatastreamError(
          withMessage.payload.message,
        );
      }
    }

    return {
      event,
      message: withMessage as $Datastream.Message$Result$Socket<string, string>,
    };
  }

  /**
   * When our `connector` provides an event from the socket, this function
   * is called to process the result.
   *
   * @param {$Datastream.Connection$Events} event
   * @param {...any[]} args
   */
  function handleSocketEvent(
    event: $Datastream.Connection$SocketEvents,
    ...args: SocketEvent$Args<$Datastream.Connection$SocketEvents>
  ): void {
    let asEvent: $Datastream.Connection$Events;
    let eventArgs: $Datastream.Client$EventArgs<
      Exclude<$Datastream.Connection$Events, 'reconnect' | 'will-reconnect'>
    >;
    switch (event) {
      case 'open': {
        state = STATE.CONNECTED;
        if (config.log) {
          console.info(
            `[CONNECT] | DatastreamConnection | Connection opened with "${
              config.url
            }", starting Datastream handshake.`,
          );
        }
        return sendToSocket(requests.handshake(config));
      }
      case 'close': {
        const [code, reason] = args as SocketEvent$Args<'close'>;
        task.cancel('connection:error-reconnect');
        if (handleClosure[code]) {
          try {
            handleClosure[code](reason, config);
          } catch (error) {
            if (error.message === 'FATAL') {
              return connection.disconnect(true);
            }
            throw error;
          }
        }
        if (
          config.auto &&
          state !== STATE.FATAL &&
          state !== STATE.DISCONNECTED
        ) {
          reconnect();
          return;
        }
        asEvent = 'close';
        eventArgs = [code, reason];
        break;
      }
      case 'pong': {
        const [response] = args as SocketEvent$Args<'pong'>;
        if (!sid || response !== sid) {
          closeSocketIfNeeded(CLOSE_CODES.NORMAL, 'SessionIDMismatch');
          reconnect();
        }
        return;
      }
      case 'message': {
        const [message] = args as SocketEvent$Args<'message'>;
        const parsed = handleSocketMessage(
          message && message.toString
            ? JSON.parse(message.toString())
            : undefined,
        );
        if (!parsed) {
          return;
        }
        ({ event: asEvent } = parsed);
        switch (parsed.event) {
          case 'event': {
            eventArgs = [parsed.message as $Datastream.Message$Event];
            break;
          }
          default: {
            eventArgs = [
              parsed.message as
                | $Datastream.Message$Result$Success<string, string>
                | $Datastream.Message$Result$Error<string, string>,
            ];
          }
        }
        break;
      }
      case 'error': {
        const [error] = args as SocketEvent$Args<'error'>;
        console.error(
          '[ERROR] | DatastreamConnection | Received a socket connection error',
          error,
        );
        /* In the case that the socket does not call "close" as-is
           expected, we create a deferred task to reconnect which 
           will be cancelled by the `close` handler if it is called
           as-expected. */
        task.after('connection:error-reconnect', 1000, () => reconnect());
        return;
      }
      default:
        return assertNever(event);
    }
    if (asEvent) {
      handleClientEvent(asEvent, ...eventArgs);
    }
  }

  /**
   * Closes a socket if one is currently opened.  Optionally
   * provide a "reason", however a CLOSE_CODE is required as
   * defined by RFC6455 and the closure code repository.
   *
   * @see https://www.iana.org/assignments/websocket/websocket.xml#close-code-number-rules
   *
   * @param {number} [code=CLOSE_CODES.NORMAL]
   * @param {string} [reason]
   */
  function closeSocketIfNeeded(
    code: number = CLOSE_CODES.NORMAL,
    reason?: string,
  ): void {
    task.cancel('connection:ping');
    if (socket) {
      const { readyState } = socket;
      if (readyState !== socket.CLOSED && readyState !== socket.CLOSING) {
        if (config.log) {
          console.info(
            `[RESET] | DatastreamConnection | Closing Connection with code (${String(
              code,
            )}${reason ? ` : ${reason}` : ''}) `,
          );
        }
        socket.close(code, reason);
      }
    }
    state = STATE.IDLE;
  }

  /**
   * Called to close any sockets that may currently be opened and establish
   * a new connection with the provided `connector`.
   */
  function resetSocketIfNeeded(): void {
    closeSocketIfNeeded(CLOSE_CODES.NORMAL, 'ConnectionReset');
    state = STATE.CONNECTING;
    socket = config.connector(
      {
        log: config.log,
        url: config.url,
      },
      handleSocketEvent,
    );
  }

  /**
   * Starts a reconnect with the given `connector`.  If `force` is not
   * set to true then it will be delayed based upon exponential backoff.
   *
   * @param {boolean} [force=false]
   * @returns
   */
  function reconnect(force: boolean = false): number {
    if (state === STATE.FATAL) {
      handleFatalState();
    }
    if (!config.auto && !force) {
      // do not allow reconnect
      return Infinity;
    }
    if (force) {
      redelay.reset();
    } else if (
      task.has('connection:reconnect') ||
      task.has('connection:will-reconnect')
    ) {
      return Infinity;
    }
    const ms = redelay.next();
    if (config.log && ms > 0) {
      console.info(
        `[RECONNECT] | DatastreamConnection | Reconnecting to the Datastream after ${Math.round(
          ms / 1000,
        )} seconds.`,
      );
    }
    state = STATE.DISCONNECTED;
    closeSocketIfNeeded(CLOSE_CODES.NORMAL, 'ConnectionReconnect');
    state = STATE.RECONNECTING;
    task.defer(
      'connection:will-reconnect',
      (): void => {
        handleClientEvent('will-reconnect', ms);
        task.after(
          'connection:reconnect',
          ms,
          (): void => {
            if (config.log) {
              console.info(
                `[RECONNECT] | DatastreamConnection | Reconnecting to the Datastream.`,
              );
            }
            handleClientEvent('reconnect');
            resetSocketIfNeeded();
          },
        );
      },
    );
    return ms;
  }

  // console.log(task, config, handleEvent);

  const connection: $Datastream.Connection$Controller = {
    get sid(): string {
      return sid;
    },

    get connected(): boolean {
      return state === STATE.HANDSHAKED;
    },

    get state(): $Datastream.Connection$State {
      return state;
    },

    connect(clearBufferIfNeeded?: boolean): void | boolean {
      switch (state) {
        case STATE.FATAL:
          return handleFatalState();
        case STATE.RECONNECTING:
        case STATE.CONNECTING:
          return false;
        default:
          break;
      }
      try {
        if (clearBufferIfNeeded && buffer) {
          buffer.clear();
        }
        if (config.log) {
          console.info(
            `[CONNECT] | DatastreamConnection | Attempting to Connect to the Datastream at: "${
              config.url
            }"`,
          );
        }
        resetSocketIfNeeded();
        return true;
      } catch (error) {
        // TODO: Should this only log when logging is on?
        console.warn(
          '[ERROR] | DatastreamConnection | Failed to Connect to the Datastream: ',
          error,
        );
        state = STATE.IDLE;
        reconnect();
      }
    },

    /**
     * Disconnects the socket and will not attempt to reconnect.  When
     * this is called, the only time the socket will reconnect is if
     * `connection.connect` is called at a later time.
     */
    disconnect(fatal: boolean = false): void {
      if (!fatal && config.log && state !== STATE.DISCONNECTED) {
        console.warn(
          '[WARN] | DatastreamConnection | Connection is being terminated and will not reconnect until "connection.connect" is called',
        );
      }
      state = fatal === true ? STATE.FATAL : STATE.DISCONNECTED;
      clearAllConnectionTasks(task, buffer);
      closeSocketIfNeeded(CLOSE_CODES.NORMAL, 'ConnectionDisconnect');
    },

    reconnect(): void {
      if (STATE.HANDSHAKED || STATE.CONNECTED) {
        reconnect();
      }
    },

    /**
     *
     *
     * @template RID
     * @template REQ
     * @param {$Datastream.Request$Valid<RID, REQ>} message
     * @param {boolean} shouldBufferRequest
     * @returns
     */
    send<RID extends string, REQ extends string>(
      message: $Datastream.Request$Valid<RID, REQ>,
      shouldBufferRequest: boolean,
    ): boolean {
      if (!message.request) {
        throw new Error(
          '[ERROR] | DatastreamConnection | Attempted to send an invalid message to the Datastream: "message.request was not defined"',
        );
      }
      if (state !== STATE.HANDSHAKED && !buffer) {
        // when no buffer is defined, we throw an error that we are
        // not ready to send messages
        throw new DatastreamNotReadyError(message.rid, message.request, state);
      }
      if (!socket || (state === STATE.HANDSHAKED && !sid)) {
        // sanity check, should not occur
        console.warn(
          '[ERROR] | DatastreamConnection | "socket" or "sid" not found when it was expected, attempting to resolve.  Please report this to the library maintainers.',
        );
        console.trace();
        reconnect();
      }
      if (state !== STATE.HANDSHAKED && shouldBufferRequest) {
        if (!buffer) {
          // this should never occur, sanity check
          throw new DatastreamNotReadyError(
            message.rid,
            message.request,
            state,
          );
        }
        if (config.log) {
          console.log(
            `[BUFFER] | DatastreamClient | Adding request "${
              message.request
            }" to request buffer to be sent upon the next successful handshake`,
          );
        }
        buffer.add(message);
        return false;
      }

      const packet: $Datastream.Request$Complete<RID, REQ, string> = {
        sid,
        ...message,
      };

      sendToSocket(packet);

      return true;
    },

    /**
     *
     *
     * @param {$Datastream.Request$Valid<string, string>} message
     * @returns {boolean}
     */
    removeFromBuffer(
      message: $Datastream.Request$Valid<string, string>,
    ): boolean {
      return buffer ? buffer.remove(message) : false;
    },

    /**
     * Resets a FATAL state if it exists and is only applicable when the `token` or `key` has been
     * changed.
     */
    reset(): void {
      if (state === STATE.FATAL) {
        state = STATE.IDLE;
      }
    },
  };

  return connection;
}
