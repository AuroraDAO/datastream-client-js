import createConnection from '@auroradao/datastream-connection';
import * as $Datastream from '@auroradao/datastream-types';

import createTaskHandler, { Task$Ref, TASK_CANCELLED } from 'task-handler';

import { DEFAULT_CONFIG_PROMISE, TO_REQUEST } from './constants';

import {
  DatastreamCancellationError,
  DatastreamTimeoutError,
  ValidationError,
} from './errors';

import { createRequestID } from './utils';

type Any$Ref = Task$Ref<any, any, any, any>;

interface IClientState {
  connected: boolean;
}

/**
 * The core class providing the public interface methods to the user.  Maintains the top-level
 * client state and request handling.
 */
export class DatastreamClient {
  public state: IClientState = {
    connected: false,
  };

  private queue: Map<string, Any$Ref> = new Map();
  private task = createTaskHandler();
  private connection = createConnection(
    this.task,
    this.config,
    this.handleEvent
  );

  constructor(
    public readonly config: $Datastream.Configuration,
    private readonly callbacks?: $Datastream.Callbacks
  ) {
    if (this.config.auto) {
      this.connection.connect();
    }
  }

  public connect() {
    this.connection.connect();
  }

  public disconnect() {
    this.connection.disconnect();
  }

  /**
   * Allows sending a request to the Datastream. In most cases this
   * should never need to be used as `subscribe`, `unsubscribe`, and `clear`
   * methods are all you should require.
   *
   * @param {string} request - The request you wish to send.
   */
  public send<REQ extends string, RID extends string>(
    this: this,
    request: REQ,
    payload: { [key: string]: any } = {},
    buffer: boolean = Boolean(this.config.buffer),
    context?: object
  ) {
    if (context && this.config.type !== 'proxy') {
      throw new ValidationError('client.subscribe', '"context" is not allowed');
    }
    const rid: RID = createRequestID();
    let ref: $Datastream.Request$Job$Ref<RID, REQ>;
    const data: $Datastream.Request<RID, REQ> = {
      rid,
      request,
      payload: JSON.stringify(payload),
    };
    const sent = this.connection.send(data, buffer, context);
    return {
      rid,
      request,
      promise: async (
        promiseConfig: $Datastream.PromiseConfig = DEFAULT_CONFIG_PROMISE
      ) => {
        if (!ref) {
          ref = this.createPromisedRequest(
            rid,
            request,
            data,
            sent,
            promiseConfig
          );
        }
        try {
          const { result } = await ref.promise;
          if (result === TASK_CANCELLED) {
            throw new DatastreamCancellationError(rid, request);
          }
          return result;
        } catch (err) {
          delete err.taskRef;
          throw err;
        }
      },
    };
  }

  public subscribe(
    to: $Datastream.Subscribe$Categories,
    rawTopics: string | string[],
    rawEvents?: string | string[],
    context?: object
  ) {
    if (!rawTopics) {
      throw new ValidationError(
        'client.subscribe',
        '"topics" must be a string or array of strings defining the topics for-which you wish to subscribe.'
      );
    }
    const request = TO_REQUEST[to];
    if (!request) {
      throw new ValidationError(
        'client.subscribe',
        `"to" must be a valid value from "account, accounts, market, markets, chain, chains" but got "${to}"`
      );
    }
    const topics: string[] = Array.isArray(rawTopics) ? rawTopics : [rawTopics];
    const events: undefined | string[] = rawEvents
      ? Array.isArray(rawEvents)
        ? rawEvents
        : [rawEvents]
      : undefined;

    return this.send(
      request,
      {
        action: 'subscribe',
        topics,
        events,
      },
      !this.config.stateful,
      context
    );
  }

  public unsubscribe(
    from: $Datastream.Subscribe$Categories,
    rawTopics?: string | string[],
    context?: object
  ) {
    const request = TO_REQUEST[from];
    if (!request) {
      throw new ValidationError(
        'client.unsubscribe',
        `"from" must be a valid value from "account, accounts, market, markets, chain, chains" but got "${from}"`
      );
    }
    const topics: undefined | string[] = rawTopics
      ? Array.isArray(rawTopics)
        ? rawTopics
        : [rawTopics]
      : undefined;
    return this.send(
      request,
      {
        action: 'unsubscribe',
        topics,
      },
      !this.config.stateful,
      context
    );
  }

  public clear(from: $Datastream.Subscribe$Categories, context?: object) {
    const request = TO_REQUEST[from];
    if (!request) {
      throw new ValidationError(
        'client.clear',
        `"from" must be a valid value from "account, accounts, market, markets, chain, chains" but got "${from}"`
      );
    }
    return this.send(
      request,
      { action: 'clear' },
      !this.config.stateful,
      context
    );
  }

  private handleEvent(event: $Datastream.Connection$Events) {
    console.log(event, this.callbacks);
  }

  private createPromisedRequest<RID extends string, REQ extends string>(
    rid: RID,
    request: REQ,
    data: $Datastream.Request<RID, REQ>,
    alreadySent: boolean,
    { timeout }: $Datastream.PromiseConfig
  ) {
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
            const sent = alreadySent
              ? alreadySent
              : !this.connection.removeFromBuffer(data);
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
