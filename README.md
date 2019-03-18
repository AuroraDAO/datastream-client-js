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

Below is the general information about the available Datastream `subscriptions`, including example payloads. \

> **Important:** Values given in the example payloads are not precise examples and may be abbreviated or changed. They are only meant to represent the general form the event will take.

#### `client.subscribe()`

Subscribing to events is done by calling the `subscribe` method on a given client. This function has the signature as shown below. For the complete set of type signatures you can view them in the [Datastream Types Package](./packages/datastream-types).

```javascript
type Subscribe$Categories =
  | 'accounts'
  | 'markets'
  | 'chains'

subscribe(
  to: Subscribe$Categories,
  topics: string | string[],
  events: string | string[]
): Client$SendResponse<string, Subscribe$Requests>;
```

A client may subscribe to many events for a given topic. However, each request must contain the entirety of the subscription for a given topic. For example, subscribing to multiple markets would look like this:

```javascript
client.subscribe(
  'markets',
  ['ETH_AURA', 'ETH_IDXM'],
  ['market_orders', 'market_cancels', 'market_trades']
);
```

---

#### Account Events

##### account_nonce

Received whenever the subscribed accounts `nonce` has been updated. This new nonce must be used as the base nonce for all future requests.

```javascript
{
  sid: 'sid:ehRMUyHAc26h',
  eid: 'evt:D1_ja4kmeeDc',
  event: 'account_none',
  seq: 2,
  payload: {
    account: '0x...',
    nonce: '999'
  },
}
```

> When using Javascript, it is safest to use a `BigNumber` library (or [`BigInt`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/BigInt) if your environment supports it). Below is example code of incrementing the `nonce` value by 1 when needed using [`BigInt`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/BigInt):

```javascript
// nice and simple :-)
const currentNonce = BigInt(event.payload.nonce);
const nextNonce = currentNonce + 1n;
```

##### account_deposit_complete

Received when a `deposit` is received and credited to the account. At this point the deposited funds are available for trading.

```javascript
{

  sid: 'sid:PKr79dtJs5T',
  eid: 'evt:zIABS7OTq',
  event: 'account_deposit_complete',
  seq: 84,
  payload: {
    account: '0x...',
    deposit: {
      id: 348738,
      user: '0x...',
      token: '0x0000000000000000000000000000000000000000',
      amount: '1000000000000000000',
      transactionHash: '0x...',
      createdAt: '1969-01-01T01:01:01.000Z',
    },
  }
}
```

> **Note:** Deposits are not submitted using an API Request and are instead initiated directly with the IDEX Contract. This event is generated using our internal block scanner which is actively monitoring transactions on the network.

> **Note:** Deposit does not have `dispatched` and `pending` events associated with them as they are directly executed on the IDEX Client and are never processed by the IDEX Backend until they are seen in the blockchain.

##### account_orders

When the subscribed account has new `orders` received and processed by the exchange, this event will be provided including each of the `orders` that were processed in the given batch. At this point the orders should be considered `pending`.

```javascript
{
  sid: 'sid:ehRMUyHAc26h',
  eid: 'evt:U6_8jwkWFMe2',
  event: 'account_orders',
  seq: 9,
  payload: {
    account: '0x...',
    orders: [
      {
        id: 745729,
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
  sid: 'sid:ehRMUyHAc26h',
  eid: 'evt:yiEXBY2UBe3e',
  event: 'account_cancels',
  seq: 10,
  payload: {
    account: '0x...',
    cancels: [
      {
        id: 987832,
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
  sid: 'sid:ehRMUyHAc26h',
  eid: 'evt:IVKYOfslj5e7',
  event: 'account_trades',
  seq: 172,
  payload: {
    account: '0x...',
    total: 1,
    highestTimestamp: 1552536625,
    trades: [
      {
        tid: 98989,
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

```javascript
{
  sid: 'sid:PKr79dtJs5T',
  eid: 'evt:hxp4-qwiYUFk',
  event: 'account_withdrawal_created',
  seq: 59,
  payload: {
    account: [
      '0x...',
      '0x...',
    ],
    withdrawal: {
      id: 909090,
      user: '0x...',
      amount: '1000000000000000000',
      token: '0x0000000000000000000000000000000000000000',
      nonce: 141,
      fee: '209999999800000',
      usdValue: '136.46',
      createdAt: '1969-01-01T01:01:01.000Z',
    },
  },
}
```

##### account_withdrawal_dispatched

A `withdrawal` request is first dispatched to the blockchain. At this point the `withdrawal` should be considered as `confirming`.

```javascript
{
  sid: 'sid:PKr79dtJs5T',
  eid: 'evt:6-VlUU1Wh',
  event: 'account_withdrawal_dispatched',
  seq: 62,
  payload: {
    account: ['0x...'],
    withdrawal: {
      sender: '0x...',
      id: 128,
      transactionHash: '0x...',
    },
  },
}
```

> **Tip:** At this point you will receive the associated `transactionHash` since it has been sent to the blockchain for processing.

##### account_withdrawal_complete

A `withdrawal` request is considered confirmed.

```javascript
{
  sid: 'sid:PKr79dtJs5T',
  eid: 'evt:HfW6bZhDZ',
  event: 'account_withdrawal_complete',
  seq: 74,
  payload: {
    withdrawal: {
      sender: '0x...',
      id: 128,
      transactionHash: '0x...',
      token: '0x0000000000000000000000000000000000000000',
      amount: '1000000000000000000',
    },
  },
}
```

##### account_order_dispatched

An `order` request is first dispatched to the blockchain. At this point the `order` should be considered as `confirming`.

##### account_order_complete

An `order` request is considered confirmed.

##### account_trade_dispatched

A `trade` request is first dispatched to the blockchain. At this point the `trade` should be considered as `confirming`.

```javascript
{
  sid: 'sid:VtKO3C3fzJ5',
  eid: 'evt:ekkwGhwT3',
  event: 'account_trade_dispatched',
  seq: 11,
  payload: {
    account: [
      '0x...',
      '0x...'
    ],
    trade: {
      tid: 472,
      sender: '0x...',
      hash: '0x...',
      transactionHash: '0x...',
    },
  },
}
```

> **Tip:** In the payload, `hash` refers to the hash for the `order` while the `transactionHash` is the hash for the trade transaction which will appear on the blockchain.

##### account_trade_complete

A `trade` request is considered confirmed.

```javascript
{
  sid: 'sid:VtKO3C3fzJ5',
  eid: 'evt:Cgle_CpBh',
  event: 'account_trade_complete',
  seq: 25,
  payload: {
    account: [
      '0x...',
      '0x...',
    ],
    trade: {
      tid: 472,
      sender: '0x...',
      transactionHash: '0x...',
      hash: '0x...',
    },
  },
}
```

##### account_invalidation_dispatched

An `invalidation` request is first dispatched to the blockchain. At this point the `invalidation` should be considered as `confirming`.

##### account_invalidation_complete

An `invalidation` is considered confirmed.

##### account_balance_sheet

The updated balance sheet for the account. Triggered whenever the accounts balances are updated by a given action and includes all non-zero balances for the account. Balances are represented as [`WEI`](https://www.investopedia.com/terms/w/wei.asp).

```javascript
{
  sid: 'sid:PKr79dtJs5T',
  eid: 'evt:oMSLpNwq1fcR',
  event: 'account_balance_sheet',
  seq: 60,
  payload: {
    account: '0x...',
    balance: {
      '0x0000000000000000000000000000000000000000': '6656648607189529963',
      '0x...': '36517409284907215842',
    },
  },
}
```

> **Note:** Each value should be considered a `BigNumber` / `BigInt` value and should always be parsed as such. Using `Number` will almost certainly yield unwanted results.

##### account_rewards

```javascript
{
  sid: 'sid:VtKO3C3fzJ5',
  eid: 'evt:8tq0-D8NPwZH',
  event: 'account_rewards',
  seq: 7,
  payload: {
    account: '0x...',
    rewards: '602.930949384415100868',
  },
}
```

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

When the IDEX internal backend transitions to different states, such as temporarily disabled trading, this event will be dispatched.

```javascript
{
  sid: 'sid:EMKKI9kym1q',
  eid: 'evt:EbB21XwW16TP',
  event: 'chain_status',
  seq: 90,
  payload: {
    status: {
      restarting: false,
      trades: true,
      cancels: true,
      withdrawals: true,
    },
  },
}
```

##### chain_server_block

```javascript
{
  sid: 'sid:ehRMUyHAc26h',
  eid: 'evt:JUZEAB0hu8tJ3',
  event: 'chain_server_block',
  seq: 622,
  payload: {
    block: 7364977
  },
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
  payload: {
    symbol: 'ETH/USD',
    price: 133.30
  },
}
```

##### chain_reward_pool_size

```javascript
{
  sid: 'sid:ehRMUyHAc26h',
  eid: 'evt:18BKijcJMd046',
  event: 'chain_reward_pool_size',
  seq: 682,
  payload: {
    pool: '12695555.461190489851413656'
  },
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
  payload: {
    price: '5'
  },
}
```

> **Note:** Please take note that the price is provided as a `string` here and not a number.
