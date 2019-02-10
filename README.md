# @auroradao/datastream-client

This monorepo provides the necessary packages to easily connect your Javascript/Typescript applications to the IDEX Datastream API. It includes various connectors allowing you to choose the best `WebSocket` implementation based upon your environment.

The client has been built to be as simple as possible to provide a rock-solid connection. We already use the web implementation for our web client and the [`uws`](https://github.com/uNetworking/uWebSockets) for any backend integrations we require.

## Features

- **Web & Node** - No matter your environment we have you covered! We maintain connectors for web and multiple node WebSocket implementations!
- **TypeScript** - All packages are written with [`TypeScript`](https://www.typescriptlang.org) giving you type-safety and awesome IDE features while still fully compatible for Javascripters out there.
- **Datastream Handshake** - The handshake process is handled for you, just create the client and start receiving events!
- **Automatic Reconnect** - Should the connection to the API terminate, it will be maintained and reconnected to for you automatically.
  - We implemented the `exponential-backoff` required by the Datastream specification so you don't have to!
- **Offline Buffer** - No need to worry about connection states, your requests will be sent automatically if possible once the connection is re-established.
- **Stateful Connections** - The Datastream is a session-based connection. As-such, any disconnection means you will have to re-subscribe to your desired events. By turning on the `stateful` feature, the client will attempt to maintain this state for you.

## Installation (Web)

Nothing special is required when using the client on the web, we use the `@auroradao/datastream-connector-web` connector by default so you don't need to provide one!

```bash
yarn add @auroradao/datastream-client
```

## Installation (Node)

On Node we need to provide a `WebSocket` "connector" that we wish to use. A connector is a simple interface that normalizes a given implementation to provide us with the values we expect. You can even provide your own easily!

We currently maintain two packages:

- [`@auroradao/datastream-connector-ws`](./packages/datastream-connector-ws) using the [`ws`](https://github.com/websockets/ws) package
- [`@auroradao/datastream-connector-uws`](./packages/datastream-connector-uws) using an implementation of the [`uws`](https://github.com/uNetworking/uWebSockets) binding for Node.

```bash
yarn add @auroradao/datastream-client
yarn add @auroradao/datastream-connector-uws
```

## Example (Web)

```javascript
import createDatastreamClient from '@auroradao/datastream-client';

const client = createDatastreamClient(
  {
    log: true,
    key: '<API-KEY>',
  },
  {
    onConnect() {
      client.subscribe('account', '0x..', [
        'account_withdrawal_dispatched',
        'account_withdrawal_complete',
      ]);
      // any request may also be used as a promise
      // with a timeout if we need to wait for
      // the result
      client
        .subscribe(
          'markets',
          ['ETH_AURA', 'ETH_IDXM'],
          ['market_orders', 'market_cancels', 'market_trades']
        )
        .promise({ timeout: 10000 })
        .then(result => {
          // subscription successful!
        })
        .catch(err => {
          if (err.message === 'TIMEOUT') {
            // subscription timed out!
          } else {
            // subscription failed!
          }
        });
    },
    onEvent(message) {
      switch (message.event) {
        case 'market_trades':
        case 'market_cancels':
        case 'market_orders': {
          return handleMarketEvent(message);
        }
        case 'account_withdrawal_dispatched':
        case 'account_withdrawal_complete': {
          return handleAccountEvent(message);
        }
      }
    },
  }
);
```

## Example (Node)

```javascript
import createDatastreamClient from '@auroradao/datastream-client';
import uwsConnector from '@auroradao/datastream-connector-uws';

const client = createDatastreamClient(
  {
    log: true,
    key: '<API-KEY>',
    connector: uwsConnector,
  },
  {
    // callbacks
  }
);
```

## API Reference

### Initial Configuration

```javascript
interface BufferConfiguration {
  size: number;
}

interface InitialConfiguration {
  /**
   * The API Key that you wish to use to authenticate
   * with the Datastream server.
   *
   * @required
   */
  key: string;
  /**
   * If using a connector other than HTML5, provide
   * the connector in the initial configuration
   * here.
   */
  connector?: Connection$Connector;
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
  auto?: boolean;
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
  type?: string;
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
  url?: string;
  /**
   * A stateful client will attempt to automatically
   * restore its subscriptions and general state if
   * it needs to reconnect at any point.
   *
   * @defaultValue false
   */
  stateful?: boolean;
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
  buffer?: BufferConfiguration;
}
```

### Subscriptions

---

#### Account Events

##### account_transaction_graph

##### account_nonce

##### account_deposit_complete

##### account_orders

##### account_cancels

##### account_trades

##### account_withdrawal_created

##### account_withdrawal_dispatched

##### account_withdrawal_complete

##### account_order_dispatched

##### account_order_complete

##### account_trade_dispatched

##### account_trade_complete

##### account_invalidation_dispatched

##### account_invalidation_complete

##### account_balance_sheet

##### account_rewards

##### account_idxm_balance

---

#### Market Events

##### market_orders

##### market_cancels

##### market_trades

---

#### Chain Events

##### chain_status

##### chain_server_block

##### chain_symbol_usd_price

##### chain_reward_pool_size

##### chain_gas_price

##### chain_token_list
