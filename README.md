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

const client = createDatastreamClient({
  log: true,
  key: '<API-KEY>',
  connector: uwsConnector,
});
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

##### account_nonce

Received whenever the subscribed accounts `nonce` has been updated. This new nonce must be used as the base nonce for all future requests.

##### account_deposit_complete

Received when a `deposit` is received and credited to the account. At this point the deposited funds are available for trading.

##### account_orders

When the subscribed account has new `orders` received and processed by the exchange, this event will be provided including each of the `orders` that were processed in the given batch. At this point the orders should be considered `pending`.

```javascript
{
  eid: 'evt:U6_8jwkWFMe2',
  event: 'account_orders',
  seq: 9,
  sid: 'sid:ehRMUyHAc26h',
  payload: {
    account: '0x...',
    orders: [
      {
        id: 101010,
        amountBuy: '205795770000',
        amountSell: '1392477916542192014',
        tokenBuy: '0x3db6ba6ab6f95efed1a6e794cad492faaabf294d',
        tokenSell: '0x0000000000000000000000000000000000000000',
        nonce: 101010,
        hash: '0x...',
        user: '0x...',
        createdAt: '1969-01-01T01:01:01.000Z',
        updatedAt: '1969-01-01T01:01:01.000Z',
      },
    ],
  },
}
```

##### account_cancels

When the subscribed account has new `cancels` received and processed by the exchange, this event will be provided including each of the `cancels` that were processed in the given batch. At this point the `cancels` should be considered `pending`.

```javascript
{
  eid: 'evt:yiEXBY2UBe3e',
  event: 'account_cancels',
  seq: 10,
  sid: 'sid:ehRMUyHAc26h',
  payload: {
    account: '0x...',
    cancels: [
      {
        id: 101010,
        market: 'ETH_LTO',
        orderHash: '0x...',
        createdAt: '1969-01-01T01:01:01.000Z',
      },
    ],
  },
}
```

##### account_trades

When the subscribed account has new `trades` received and processed by the exchange, this event will be provided including each of the `trades` that were processed in the given batch. At this point the `trades` should be considered `pending`.

```javascript
{
  eid: 'evt:IVKYOfslj5e7',
  event: 'account_trades',
  seq: 172,
  sid: 'sid:ehRMUyHAc26h',
  payload: {
    account: '0x...',
    total: 1,
    highestTimestamp: 1552536625,
    trades: [
      {
        tid: 101010,
        type: 'buy',
        date: '1969-01-01T01:01:01.000Z',
        timestamp: 1552536625,
        market: 'ETH_LTO',
        usdValue: '411.171696117038254309',
        price: '0.000687600842795718',
        amount: '4557.68612841',
        total: '3.133868823093068736',
        taker: '0x...',
        maker: '0x...',
        orderHash: '0x...',
        gasFee: '1.483418775132356598',
        tokenBuy: '0x0000000000000000000000000000000000000000',
        tokenSell: '0x3db6ba6ab6f95efed1a6e794cad492faaabf294d',
        buyerFee: '4.55768612841',
        sellerFee: '0.002193708176165148',
        amountWei: '3133868823093068736',
        updatedAt: '1969-01-01T01:01:01.000Z',
      },
    ],
  },
};
```

##### account_withdrawal_created

A `withdrawal` request is first received by the server and queued to be dispatched to the blockchain. At this point the `withdrawal` should be considered as `pending`.

##### account_withdrawal_dispatched

A `withdrawal` request is first dispatched to the blockchain. At this point the `withdrawal` should be considered as `confirming`.

##### account_withdrawal_complete

A `withdrawal` request is considered confirmed.

##### account_order_dispatched

An `order` request is first dispatched to the blockchain. At this point the `order` should be considered as `confirming`.

##### account_order_complete

An `order` request is considered confirmed.

##### account_trade_dispatched

A `trade` request is first dispatched to the blockchain. At this point the `trade` should be considered as `confirming`.

##### account_trade_complete

A `trade` request is considered confirmed.

##### account_invalidation_dispatched

An `invalidation` request is first dispatched to the blockchain. At this point the `invalidation` should be considered as `confirming`.

##### account_invalidation_complete

An `invalidation` is considered confirmed.

##### account_balance_sheet

The updated balance sheet for the account. Triggered whenever the accounts balances are updated by a given action.

##### account_rewards

---

#### Market Events

##### market_orders

```javascript
{
  sid: 'sid:ehRMUyHAc26h',
  eid: 'evt:AB_9awkWFMe2',
  event: 'market_orders',
  seq: 229,
  payload: {
    market: 'ETH_LTO',
    orders: [
      {
        id: 101010,
        amountBuy: '205795770000',
        amountSell: '1392477916542192014',
        tokenBuy: '0x3db6ba6ab6f95efed1a6e794cad492faaabf294d',
        tokenSell: '0x0000000000000000000000000000000000000000',
        nonce: 101010,
        hash: '0x...',
        user: '0x...',
        createdAt: '1969-01-01T01:01:01.000Z',
        updatedAt: '1969-01-01T01:01:01.000Z',
      },
    ],
  },
}
```

##### market_cancels

```javascript
{
  sid: 'sid:ehRMUyHAc26h',
  eid: 'evt:xiAXRY2UAe2b',
  event: 'market_cancels',
  seq: 28,
  payload: {
    market: 'ETH_LTO',
    cancels: [
      {
        id: 101010,
        orderHash: '0x...',
        createdAt: '1969-01-01T01:01:01.000Z',
      },
    ],
  },
}
```

##### market_trades

```javascript
{
  sid: 'sid:ehRMUyHAc26h',
  eid: 'evt:ARvEax5lj5mm',
  event: 'market_trades',
  seq: 199,
  payload: {
    market: 'ETH_LTO',
    total: 1,
    highestTimestamp: 1552536625,
    trades: [
      {
        tid: 101010,
        type: 'buy',
        date: '1969-01-01T01:01:01.000Z',
        timestamp: 1552536625,
        market: 'ETH_LTO',
        usdValue: '411.171696117038254309',
        price: '0.000687600842795718',
        amount: '4557.68612841',
        total: '3.133868823093068736',
        taker: '0x...',
        maker: '0x...',
        orderHash: '0x...',
        gasFee: '1.483418775132356598',
        tokenBuy: '0x0000000000000000000000000000000000000000',
        tokenSell: '0x3db6ba6ab6f95efed1a6e794cad492faaabf294d',
        buyerFee: '4.55768612841',
        sellerFee: '0.002193708176165148',
        amountWei: '3133868823093068736',
        updatedAt: '1969-01-01T01:01:01.000Z',
      },
    ],
  },
};
```

---

#### Chain Events

##### chain_status

##### chain_server_block

```javascript
{
  eid: 'evt:JUZEAB0hu8tJ3',
  event: 'chain_server_block',
  seq: 622,
  sid: 'sid:ehRMUyHAc26h',
  payload: { block: 7364977 },
}
```

##### chain_symbol_usd_price

Receives the latest usd pricing used by the exchange for the given symbol.

```javascript
{
  sid: 'sid:ehRMUyHAc26h',
  eid: 'evt:gKefqaoPKobEz',
  event: 'chain_symbol_usd_price',
  seq: 618,
  payload: { symbol: 'ETH/USD', price: 133.30 },
}
```

##### chain_reward_pool_size

```javascript
{
  sid: 'sid:ehRMUyHAc26h',
  eid: 'evt:18BKijcJMd046',
  event: 'chain_reward_pool_size',
  seq: 682,
  payload: { pool: '12695555.461190489851413656' },
}
```

##### chain_gas_price

Provides the latest gas price in GWEI used by the exchange.

```javascript
{
  sid: 'sid:ehRMUyHAc26h',
  eid: 'evt:E9PRHmh7XFVws',
  event: 'chain_gas_price',
  seq: 361,
  payload: { price: '5' },
}
```

##### chain_token_list
