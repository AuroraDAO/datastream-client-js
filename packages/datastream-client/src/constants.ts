import * as $Datastream from '@auroradao/datastream-types';

/**
 * The Datastream protocol version that this client library was built to
 * support.
 */
export const PROTOCOL_VERSION = '1.0.0';

/**
 * The default configuration that will be used.  Any of these values that are
 * provided in the `initialConfiguration` will be replaced.
 */
export const DEFAULT_CONFIG_CLIENT: $Datastream.DefaultConfiguration = Object.freeze(
  {
    auto: true,
    locale: 'en',
    log: false,
    stateful: false,
    url: 'wss://datastream.idex.market',
  }
);

/**
 * When calling `.send().promise(config)`, this represents the
 * default configuration that will be used if no configuration is given.
 */
export const DEFAULT_CONFIG_PROMISE = {
  timeout: 30000,
};

/**
 * Maps subscribe/unsubscribe/clear arguments from their simple names to their
 * Datastream request values for transmission.
 */
export const TO_REQUEST: Record<string, $Datastream.Subscribe$Requests> = {
  account: 'subscribeToAccounts',
  accounts: 'subscribeToAccounts',
  market: 'subscribeToMarkets',
  markets: 'subscribeToMarkets',
  chain: 'subscribeToChains',
  chains: 'subscribeToChains',
};
