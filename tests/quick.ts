/* This file is used to quickly test and iterate the "final package" by running it with
   ts-node-dev. When running `yarn test:quick`, it will run the file and watch for changes,
   automatically restarting when needed. */
import createDatastreamClient from '../packages/datastream-client';
// import wsConnector from '../packages/datastream-connector-ws';
import wsConnector from '../packages/datastream-connector-uws';

const client = createDatastreamClient(
  {
    log: true,
    url: 'wss://datastream.idex.market',
    key: '',
    connector: wsConnector,
  },
  {
    onConnect() {
      console.log('Connected!');
      this.subscribe('chains', 'eth', [
        'chain_symbol_usd_price',
        'chain_24hr_usd_volume',
      ]);
      this.subscribe('users', '24ccecd0-6385-4e64-8b6c-0dbf4c77c2f1', [
        'user_profile_updated',
      ]);
    },

    onMessage(message) {
      console.log('Message Received: ', message);
    },
  },
);
