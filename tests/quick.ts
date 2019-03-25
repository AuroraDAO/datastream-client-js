/* This file is used to quickly test and iterate the "final package" by running it with
   ts-node-dev. When running `yarn test:quick`, it will run the file and watch for changes,
   automatically restarting when needed. */
import createDatastreamClient from '../packages/datastream-client';
// import wsConnector from '../packages/datastream-connector-ws';
import wsConnector from '../packages/datastream-connector-uws';

createDatastreamClient(
  {
    log: true,
    url: 'wss://datastream.idex.market',
    key: '17paIsICur8sA0OBqG6dH5G1rmrHNMwt4oNk4iX9',
    connector: wsConnector,
  },
  {
    onConnect() {
      console.log('Connected!');
      this.subscribe('chains', 'eth', [
        'chain_symbol_usd_price',
        'chain_24hr_usd_volume',
      ]);
    },
    onMessage(message) {
      console.log('Message Received: ', message);
    },
  },
);

console.log('Client Created');
