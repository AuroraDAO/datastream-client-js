import * as $Datastream from '@auroradao/datastream-types';
import WebSocket from 'uws';

export default function createDatastreamConnector(
  config: $Datastream.Connection$Configuration,
  callback: $Datastream.Connection$Callback
): $Datastream.Connection$Socket {
  const socket = new WebSocket(config.url);

  socket
    .on('open', () => callback('open'))
    .on('close', (code, reason) => callback('close', code, reason, true))
    .on('message', data => callback('message', data))
    .on('pong', data => callback('pong', data))
    .on('error', error => callback('error', error));

  return {
    OPEN: socket.OPEN,
    CONNECTING: socket.CONNECTING,
    CLOSING: socket.CLOSING,
    CLOSED: socket.CLOSED,
    get readyState() {
      return socket.readyState;
    },
    send(data: any, cb: (err?: Error) => void) {
      try {
        return socket.send(data, cb);
      } catch (err) {
        cb(err);
      }
    },
    close: socket.close,
    terminate: socket.terminate,
  };
}
