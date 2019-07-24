import createConnection from '@auroradao/datastream-connection';
import * as $Datastream from '@auroradao/datastream-types';

import createTaskHandler, {
  Task$Ref,
  Task$Types,
  Task$Handler,
  TASK_CANCELLED,
} from 'task-handler';

import { modifyRunningConfig } from './config';
import { DEFAULT_CONFIG_PROMISE, TO_REQUEST } from './constants';

import {
  DatastreamCancellationError,
  DatastreamServerError,
  DatastreamTimeoutError,
  ValidationError,
} from './errors';

import { createRequestID } from './utils';

type PartialCallbacks = Partial<$Datastream.Callbacks>;

type Any$Ref = Task$Ref<Task$Types, unknown, unknown, Task$Handler>;

export function assertNever(event: never): never {
  throw new Error(
    `[ERROR] | DatastreamClient | Unhandled connection event "${event}"`,
  );
}

export function parseRawTopicsOrEvents(
  value: void | null | false | 0 | string[] | string,
): undefined | string[] {
  if (!value) return undefined;
  return Array.isArray(value) ? value : [value];
}

/**
 * The core class providing the public interface methods to the user.  Maintains the top-level
 * client state and request handling.
 */
export class DatastreamClient implements $Datastream.Client {
  private readonly callbacks?: PartialCallbacks;

  private queue: Map<string, Any$Ref> = new Map();

  private task = createTaskHandler();

  private connection = createConnection(
    this.task,
    this.config,
    this.handleEvent.bind(this),
  );

  public constructor(
    // needed here for the connection
    // establishment to work as needed
    // eslint-disable-next-line @typescript-eslint/no-parameter-properties
    private readonly config: $Datastream.Configuration,
    callbacks?: PartialCallbacks,
  ) {
    this.callbacks = callbacks;
    if (this.config.auto) {
      this.connection.connect();
    }
  }

  public get connected(): boolean {
    return this.connection.connected;
  }

  public get log(): boolean {
    return this.config.log;
  }

  /**
   * Set whether the client should log its internal
   * actions to the console.
   *
   * @memberof DatastreamClient
   */
  public set log(to: boolean) {
    if (typeof to !== 'boolean') {
      throw new TypeError(
        '[ERROR] | DatastreamClient | client.logging must be a boolean value.',
      );
    }
    modifyRunningConfig(this.config, {
      log: to,
    });
  }

  public get key(): undefined | string {
    return this.config.key;
  }

  /**
   * Sets the `key` value of the config, reconnect
   * required for the key to go into effect.
   */
  public set key(key: undefined | string) {
    if (key !== this.config.key) {
      modifyRunningConfig(this.config, { key });
      if (this.connection.connected) {
        if (!this.connection.handshake()) {
          this.connection.reset();
          this.connection.reconnect();
        }
      }
    }
  }

  public get token(): undefined | string {
    return this.config.token;
  }

  /**
   * Sets the `token` config option, will be sent on reconnect
   * to be validated.
   */
  public set token(token: undefined | string) {
    if (token !== this.config.token) {
      modifyRunningConfig(this.config, { token });
      if (this.connection.connected) {
        if (!this.connection.handshake()) {
          this.connection.reset();
          this.connection.reconnect();
        }
      }
    }
  }

  /**
   * Get the current locale being used by the client.  Locale
   * will determine how various error messages are returned
   * when received from the server.
   *
   * @memberof DatastreamClient
   */
  public get locale(): string {
    return this.config.locale || 'en';
  }

  /**
   * Modify the locale used by the client.
   *
   * @memberof DatastreamClient
   */
  public set locale(to: string) {
    modifyRunningConfig(this.config, {
      locale: to,
    });
  }

  /**
   *
   *
   * @memberof DatastreamClient
   */
  public connect(): boolean {
    return Boolean(this.connection.connect());
  }

  /**
   *
   *
   * @memberof DatastreamClient
   */
  public disconnect(): void {
    return this.connection.disconnect();
  }

  /**
   * Allows sending a request to the Datastream. In most cases this
   * should never need to be used as `subscribe`, `unsubscribe`, and `clear`
   * methods are all you should require.
   *
   * @template REQ
   * @template RID
   * @param {REQ} request
   * @param {{ [key: string]: any }} [payload={}]
   * @param {boolean} [buffer=Boolean(this.config.buffer)]
   * @returns {$Datastream.Client$SendRequest}
   * @memberof DatastreamClient
   */
  public send<RID extends string, REQ extends string>(
    this: this,
    request: REQ,
    payload: Record<string | number, unknown> = {},
    shouldBufferRequest: boolean = Boolean(this.config.buffer),
    context?: Record<string | number, unknown>,
  ): $Datastream.Client$SendResponse<RID, REQ> {
    if (context && this.config.type !== 'proxy') {
      throw new ValidationError('client.send', '"context" is not allowed');
    }
    if (typeof payload !== 'object') {
      throw new ValidationError(
        'client.send',
        '"payload" should be an object type',
      );
    }
    const rid: RID = createRequestID();
    let ref: $Datastream.Request$Job$Ref<RID, REQ>;
    const message: $Datastream.Request$Valid<RID, REQ> = {
      rid,
      request,
      payload: JSON.stringify(payload),
    };
    if (context) {
      message._context = context;
    }
    const sent = this.connection.send(message, shouldBufferRequest);
    return {
      rid,
      request,
      promise: async (
        promiseConfig: $Datastream.PromiseConfig = DEFAULT_CONFIG_PROMISE,
      ) => {
        if (!ref) {
          ref = this.createPromisedRequest(
            rid,
            request,
            message,
            sent,
            promiseConfig,
          );
        }
        try {
          const { result } = await ref.promise();
          if (result === TASK_CANCELLED) {
            throw new DatastreamCancellationError(rid, request);
          }
          return result as $Datastream.Message$Result$Success<RID, REQ>;
        } catch (err) {
          delete err.taskRef;
          throw err;
        }
      },
    };
  }

  /**
   * Allows subscribing to a given datastream topic with
   * one or multiple events.
   *
   * @param {$Datastream.Subscribe$Categories} to
   * @param {(string | string[])} rawTopics
   * @param {(string | string[])} [rawEvents]
   * @param {object} [context]
   * @returns
   * @memberof DatastreamClient
   */
  public subscribe(
    to: $Datastream.Subscribe$Categories,
    topics: string,
    rawEvents?: string | string[],
    context?: Record<string | number, unknown>,
  ): $Datastream.Client$SendResponse<string, $Datastream.Subscribe$Requests> {
    if (!topics) {
      throw new ValidationError(
        'client.subscribe',
        '"topics" must be a string defining the topic for-which you wish to subscribe.',
      );
    }
    const request = TO_REQUEST[to];
    if (!request) {
      throw new ValidationError(
        'client.subscribe',
        `"to" must be a valid value from "account, accounts, users, market, markets, chain, chains" but got "${to}"`,
      );
    }

    const events: undefined | string[] = parseRawTopicsOrEvents(rawEvents);

    return this.send(
      request,
      {
        action: 'subscribe',
        topics,
        events,
      },
      !this.config.stateful,
      context,
    );
  }

  /**
   *
   *
   * @param {$Datastream.Subscribe$Categories} from
   * @param {(string | string[])} [rawTopics]
   * @param {object} [context]
   * @returns {$Datastream.Client$SendRequest<string, $Datastream.Subscribe$Requests>}
   * @memberof DatastreamClient
   */
  public unsubscribe(
    from: $Datastream.Subscribe$Categories,
    rawTopics?: string | string[],
    context?: Record<string | number, unknown>,
  ): $Datastream.Client$SendResponse<string, $Datastream.Subscribe$Requests> {
    const request = TO_REQUEST[from];
    if (!request) {
      throw new ValidationError(
        'client.unsubscribe',
        `"from" must be a valid value from "account, accounts, users, market, markets, chain, chains" but got "${from}"`,
      );
    }

    const topics: undefined | string[] = parseRawTopicsOrEvents(rawTopics);

    return this.send(
      request,
      {
        action: 'unsubscribe',
        topics,
      },
      !this.config.stateful,
      context,
    );
  }

  /**
   * Clears all subscriptions for the given topic.
   *
   * @param {$Datastream.Subscribe$Categories} from
   * @param {object} [context]
   * @returns
   * @memberof DatastreamClient
   */
  public clear(
    from: $Datastream.Subscribe$Categories,
    context?: Record<string | number, unknown>,
  ): $Datastream.Client$SendResponse<string, $Datastream.Subscribe$Requests> {
    const request = TO_REQUEST[from];
    if (!request) {
      throw new ValidationError(
        'client.clear',
        `"from" must be a valid value from "account, accounts, market, markets, chain, chains" but got "${from}"`,
      );
    }
    return this.send(
      request,
      { action: 'clear' },
      !this.config.stateful,
      context,
    );
  }

  /**
   * When an event is received by our `connection`, it will call this
   * callback to allow the client to handle the event as-necessary.
   *
   * @private
   * @param {$Datastream.Connection$Events} event
   * @param {*} [data]
   * @memberof DatastreamClient
   */
  private handleEvent(
    event: $Datastream.Connection$Events,
    ...args: $Datastream.Client$EventArgs<$Datastream.Connection$Events>
  ): unknown {
    if (event === 'message' || event === 'error') {
      const [data] = args as $Datastream.Client$EventArgs<'message' | 'error'>;
      const ref = this.queue.get(data.rid);
      if (ref) {
        if (event === 'message') {
          return ref.resolve(data as $Datastream.Message$Result$Success<
            string,
            string
          >);
        }
        return ref.reject(
          new DatastreamServerError(
            data.rid,
            data.request,
            String(data.payload.message),
          ),
        );
      }
    }
    // TODO: better way to handle dynamic args like this in TypeScript?
    if (this.callbacks) {
      switch (event) {
        case 'handshake': {
          const callback = this.callbacks.onConnect;
          if (callback) {
            callback.apply(this, args as $Datastream.Client$EventArgs<
              'handshake'
            >);
          }
          break;
        }
        case 'close': {
          const callback = this.callbacks.onDisconnect;
          if (callback) {
            callback.apply(this, args as $Datastream.Client$EventArgs<'close'>);
          }
          break;
        }
        case 'will-reconnect': {
          const callback = this.callbacks.onWillReconnect;
          if (callback) {
            callback.apply(this, args as $Datastream.Client$EventArgs<
              'will-reconnect'
            >);
          }
          break;
        }
        case 'reconnect': {
          const callback = this.callbacks.onReconnect;
          if (callback) {
            callback.apply(this, args as $Datastream.Client$EventArgs<
              'reconnect'
            >);
          }
          break;
        }
        case 'event': {
          const callback = this.callbacks.onEvent || this.callbacks.onMessage;
          if (callback) {
            callback.apply(this, args as $Datastream.Client$EventArgs<'event'>);
          }
          break;
        }
        case 'error': {
          const callback = this.callbacks.onError || this.callbacks.onMessage;
          if (callback) {
            callback.apply(this, args as $Datastream.Client$EventArgs<'error'>);
          }
          break;
        }
        case 'message': {
          const callback = this.callbacks.onSuccess || this.callbacks.onMessage;
          if (callback) {
            callback.apply(this, args as $Datastream.Client$EventArgs<
              'message'
            >);
          }
          break;
        }
        default:
          return assertNever(event);
      }
    }
  }

  /**
   * Used to generate a promise that resolves when the given
   * request resolves.  Allows also setting a timeout that will
   * instead reject the given timeout.
   *
   * When using a promised response, the users callback handlers
   * will not be called unless a timeout occurred.
   *
   * @private
   * @template RID
   * @template REQ
   * @param {RID} rid
   * @param {REQ} request
   * @param {$Datastream.Request<RID, REQ>} data
   * @param {boolean} alreadySent
   * @param {$Datastream.PromiseConfig} { timeout }
   * @returns
   * @memberof DatastreamClient
   */
  private createPromisedRequest<RID extends string, REQ extends string>(
    rid: RID,
    request: REQ,
    message: $Datastream.Request$Valid<RID, REQ>,
    alreadySent: boolean,
    { timeout }: $Datastream.PromiseConfig,
  ): $Datastream.Request$Job$Ref<RID, REQ> {
    let timeoutID: NodeJS.Timeout;
    return this.task.job(rid, ref => ({
      start: () => {
        this.queue.set(rid, ref);
        if (typeof timeout === 'number') {
          timeoutID = setTimeout(() => {
            if (ref.status.complete) {
              return;
            }
            // remove from buffer when timed out if
            // it exists.  `removeFromBuffer` will return
            // a boolean indicating if it successfully removed
            // the request from the buffer.  If not then we can
            // likely assume that the request was sent.
            // HOWEVER, this will give a false positive if the
            // request was removed due to the maxBufferSize removing
            // it for now.
            const sent =
              alreadySent || !this.connection.removeFromBuffer(message);
            return ref.reject(new DatastreamTimeoutError(rid, request, sent));
          }, timeout);
        }
      },
      complete: () => {
        clearTimeout(timeoutID);
        this.queue.delete(rid);
      },
    }));
  }
}
