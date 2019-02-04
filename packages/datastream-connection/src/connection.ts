import * as $Datastream from '@auroradao/datastream-types';

import { Task$Handler } from 'task-handler';

import { MAX_RECONNECT_SECONDS } from './constants';

import { createBuffer } from './utils/buffer';
import { createRedelay } from './utils/redelay';

import handleClosure from './close-handlers';

type Connection$States = 0 | 1 | 2 | 3 | 4 | 5;

/**
 * These do not correlate to the WebSocket states which use
 * a different numbering.
 *
 * This is specific to our connection handler and is used to
 * determine its own state at any given point.
 *
 * @const
 */
const STATE: Record<string, Connection$States> = {
  DISCONNECTED: 0,
  IDLE: 1,
  CONNECTING: 2,
  RECONNECTING: 3,
  CONNECTED: 4,
  HANDSHAKED: 5,
};

type SocketEvent$Args<
  E extends $Datastream.Connection$Events
> = E extends 'close'
  ? [number, string, boolean]
  : E extends 'open'
  ? void[]
  : E extends 'message' | 'pong'
  ? [any]
  : E extends 'error'
  ? [Error]
  : never;

export default function createConnection(
  task: Task$Handler,
  config: $Datastream.Configuration,
  handleClientEvent: (event: $Datastream.Connection$Events) => void
) {
  const redelay = createRedelay(MAX_RECONNECT_SECONDS);
  const buffer = config.buffer ? createBuffer(config.buffer) : undefined;

  let socket: $Datastream.Connection$Socket;
  let state: Connection$States;
  let sid: string;

  function flushBuffer() {
    if (
      !socket ||
      state !== STATE.HANDSHAKED ||
      socket.readyState !== socket.OPEN ||
      !buffer
    ) {
      return;
    }
    const request = buffer.flush();
    if (request) {
      connection.send(request);
    }
  }

  function resetSocketIfNeeded() {
    if (socket) {
      const { readyState } = socket;
      if (readyState !== socket.CLOSED && readyState !== socket.CLOSING) {
        if (config.log) {
          console.info('[RESET] | DatastreamClient | Resetting Connection');
        }
        socket.close(1012, 'ResettingConnection');
      }
    }
    socket = config.connector(
      {
        url: config.url,
      },
      handleSocketEvent
    );
  }

  function handleSocketEvent<E extends $Datastream.Connection$Events>(
    event: E,
    ...args: any[]
  ) {
    switch (event) {
      case 'option': {
        break;
      }
      case 'close': {
        const [code, reason, clean] = args as SocketEvent$Args<'close'>;
        break;
      }
      case 'pong':
      case 'message': {
        const [message] = args;
        console.log(args);
        break;
      }
      case 'error': {
        const [error] = args;
        console.log(error);
        break;
      }
    }
  }

  console.log(task, config, handleEvent);

  const connection = {
    get sid() {
      return sid;
    },
    connect(clearBufferIfNeeded?: boolean) {
      switch (state) {
        case STATE.RECONNECTING:
        case STATE.CONNECTING:
          return false;
        default: {
          state = STATE.CONNECTING;
          break;
        }
      }
      if (clearBufferIfNeeded && buffer) {
        buffer.clear();
      }
    },
    disconnect() {},
    send(...args: any[]) {
      return true;
    },
    removeFromBuffer(...args: any[]) {
      console.log(args);
      return false;
    },
  };

  return connection;
}
