import { Connection$Connector } from './connection';

export interface BufferConfiguration {
  readonly size: number;
}

export interface InitialConfiguration {
  /**
   * The API Key that you wish to use to authenticate
   * with the Datastream server.
   *
   * @required
   */
  readonly key: string;
  readonly connector: Connection$Connector;
  /**
   * Should the client automatically maintain a persistent
   * connection to the server?
   *
   * @note
   *  This will automatically begin connecting immediately
   *  after the client is created.
   *
   * @defaultValue true
   */
  readonly auto?: boolean;
  /**
   * Optionally provide the type of client connection
   * that should be established.
   *
   * @note
   *  In most cases this should not need to be changed
   *  from the default value.
   *
   * @defaultValue "client"
   */
  readonly type?: string;
  /**
   * Enable or disable the clients internal logging.
   *
   * @defaultValue false
   */
  log?: boolean;
  /**
   * Optionally provide a WebSocket URL to use instead
   * of the default server.
   *
   * @defaultValue "wss://datastream.idex.market"
   */
  readonly url?: string;
  /**
   * A stateful client will attempt to automatically
   * restore its subscriptions and general state if
   * it needs to reconnect at any point.
   *
   * @defaultValue false
   */
  readonly stateful?: boolean;
  /**
   * You may optionally provide a locale which will
   * indicate what language should be returned for
   * any messages or errors.
   *
   * @note
   *  If a translation is not available for a given
   *  message or error, it may instead return "en"
   *  (English).
   *
   * @defaultValue "en"
   */
  locale?: string;
  readonly buffer?: BufferConfiguration;
}

export interface PromiseConfig {
  timeout: number;
}

export interface DefaultConfiguration {
  readonly auto: boolean;
  readonly locale: string;
  readonly log: boolean;
  readonly stateful: boolean;
  readonly url: string;
}

export type Configuration = DefaultConfiguration & InitialConfiguration;

export interface Callbacks {
  onConnect?: () => void;
  onMessage?: (data: any) => any;
  onEvent?: (data: any) => any;
  onError?: (data: any) => any;
  onReconnect?: (data: any) => any;
  onDisconnect?: (code?: number, reason?: string) => void;
}
