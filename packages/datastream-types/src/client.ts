import { Configuration } from './config';
import { Connection$Controller, Connection$Events } from './connection';
import {
  Client$SendResponse,
  Message$Event,
  Message$Result$Error,
  Message$Result$Success,
  Subscribe$Categories,
  Subscribe$Requests,
} from './request';

export type Client$EventArgs<
  E extends Connection$Events
> = E extends 'handshake'
  ? []
  : E extends 'close'
  ? [number, string]
  : E extends 'will-reconnect'
  ? [number]
  : E extends 'reconnect'
  ? []
  : E extends 'message' | 'error'
  ? [

        | Message$Result$Success<string, string>
        | Message$Result$Error<string, string>
    ]
  : E extends 'event'
  ? [Message$Event]
  : never;

export type Client$EventHandler = (
  event: Connection$Events,
  ...args: Client$EventArgs<Connection$Events>
) => void;

export interface Client {
  readonly connected: Connection$Controller['connected'];
  log: Configuration['log'];
  locale: Configuration['locale'];
  readonly connect: Connection$Controller['connect'];
  readonly disconnect: Connection$Controller['disconnect'];

  send<RID extends string, REQ extends string>(
    this: this,
    request: REQ,
    payload?: undefined | Record<string | number, unknown>,
    shouldBufferRequest?: boolean,
    context?: Record<string | number, unknown>,
  ): Client$SendResponse<RID, REQ>;

  subscribe(
    to: Subscribe$Categories,
    topics: string,
    events?: string | string[],
    context?: Record<string | number, unknown>,
  ): Client$SendResponse<string, Subscribe$Requests>;

  unsubscribe(
    from: Subscribe$Categories,
    topics: string | string[],
    context?: Record<string | number, unknown>,
  ): Client$SendResponse<string, Subscribe$Requests>;

  clear(
    from: Subscribe$Categories,
    context?: Record<string | number, unknown>,
  ): Client$SendResponse<string, Subscribe$Requests>;
}
