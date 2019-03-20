import { Client } from './client';
import { Connection$Connector } from './connection';
import {
  Message$Event,
  Message$Result$Error,
  Message$Result$Success,
} from './request';

export interface BufferConfiguration {
  readonly size: number;
}

/**
 * Any values which are allowed to be changed are merged into a running
 * configuration by accepting an "updater" object which is merged into
 * a new running configuration.
 */
export interface ConfigurationUpdater {
  locale?: string;
  log?: boolean;
}

export interface InitialConfiguration {
  /**
   * The API Key that you wish to use to authenticate
   * with the Datastream server.
   *
   * @required
   */
  readonly key: string;
  readonly connector?: Connection$Connector;
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
  readonly log?: boolean;
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
  readonly locale?: string;
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
  readonly connector: Connection$Connector;
}

export type Configuration = DefaultConfiguration & InitialConfiguration;

export interface Callbacks {
  onConnect(this: Client): void;
  onMessage(
    this: Client,
    message:
      | Message$Result$Success<string, string>
      | Message$Result$Error<string, string>
      | Message$Event,
  ): void;

  onSuccess(this: Client, data: Message$Result$Success<string, string>): void;
  onEvent(this: Client, data: Message$Event): void;
  onError(this: Client, error: Message$Result$Error<string, string>): void;
  /**
   * Called when a reconnect begins.  Provides the total milliseconds
   * before the reconnect attempt will occur.
   *
   * @memberof Callbacks
   */
  onWillReconnect(this: Client, ms: number): void;
  /**
   * Once the reconnect delay (provided by `onWillReconnect`) has expired,
   * the `onReconnect` callback will be called indicating that the reconnect
   * attempt is beginning.
   *
   * @memberof Callbacks
   */
  onReconnect(this: Client): void;
  onDisconnect(this: Client, code: number, reason: string): void;
}
