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
