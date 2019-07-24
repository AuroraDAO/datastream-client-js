/* This file is used to quickly test and iterate the "final package" by running it with
   ts-node-dev. When running `yarn test:quick`, it will run the file and watch for changes,
   automatically restarting when needed. */
import createDatastreamClient from '../packages/datastream-client';
// import wsConnector from '../packages/datastream-connector-ws';
import wsConnector from '../packages/datastream-connector-uws';

const client = createDatastreamClient(
  {
    log: true,
    url: 'wss://datastream-test.idex.market',
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

setTimeout(() => {
  console.log('Set Token');
  client.token =
    'eyJraWQiOiJwNkZuT1hxcjJhODkySG8zbXc0QkM4QlpETkdOK0RNbDlTZFcwUzNOek9vPSIsImFsZyI6IlJTMjU2In0.eyJzdWIiOiJiYjEyZWJmZi1hMmU1LTQ3MjgtOWNhNi01Njg3OTNhMzJjZWMiLCJhdWQiOiIycWQ0NXNqODRsdDU2aDFqNHUzaGFvZ3ZvaCIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJiaXJ0aGRhdGUiOiIxOTg4LTA2LTE0IiwiZXZlbnRfaWQiOiIyYWE0NjhhNS04YjRmLTQ4MmItYTk1Ny05NjdmZTJkNmJkMTUiLCJ0b2tlbl91c2UiOiJpZCIsImF1dGhfdGltZSI6MTU2MzgzMzE1MiwiaXNzIjoiaHR0cHM6XC9cL2NvZ25pdG8taWRwLmNhLWNlbnRyYWwtMS5hbWF6b25hd3MuY29tXC9jYS1jZW50cmFsLTFfM2lQZHowMWhFIiwiY29nbml0bzp1c2VybmFtZSI6ImJiMTJlYmZmLWEyZTUtNDcyOC05Y2E2LTU2ODc5M2EzMmNlYyIsImV4cCI6MTU2NDAxMTU0NSwiaWF0IjoxNTY0MDA3OTQ1LCJlbWFpbCI6ImJyYWRlbiswNzIyMDFAaWRleC5pbyJ9.eGZUohu6ccz9KUr29hcA2cIx2m64sP0hHMQJFcNR14Ao3KPPdmejScg7O6qjS56O1GamFxPz6-2_vFvUFKdhmYBXwxB9ogkioEclfWz0mumA3nhGfOTADpDiDtAymBUq51B7lyUvDEJY9ti-RIUDEE6hgMqfJ0z8tH9MSn8jO4n0TSXt83PZxHdO1VOqXA_qtnYfAeVwQDaT3F7vW0e4q-luLsoYJubPWv56litpKWPagqCXOzMPN9lXAWGyj3-i6mLByBCHlOy4AlJfD51ATrsB4WiN1VLirGP8DY5gQ1C-rbktFYfG0vUECSvv5zGNii8_1OVPXcatLiSqzbtkCw';
}, 100);
console.log('Client Created');
