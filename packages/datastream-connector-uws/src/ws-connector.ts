import * as $Datastream from '@auroradao/datastream-types';
import WebSocket from 'uws';

export default function createDatastreamConnector(
  config: $Datastream.Connection$Configuration,
  callback: $Datastream.Connection$Callback,
): $Datastream.Connection$Socket {
  const socket = new WebSocket(config.url);

  socket
    .on('open', () => callback('open', connector))
    .on('close', (code, reason) =>
      callback('close', connector, code, reason, true),
    )
    .on('message', data => callback('message', connector, data))
    .on('pong', data => callback('pong', connector, data.toString()))
    .on('error', error => callback('error', connector, error));

  const connector = {
    OPEN: socket.OPEN,
    CONNECTING: socket.CONNECTING,
    CLOSING: socket.CLOSING,
    CLOSED: socket.CLOSED,
    get readyState() {
      return socket.readyState;
    },
    send(
      data: string | ArrayBuffer | Blob | ArrayBufferView,
      cb: (err?: Error) => void,
    ) {
      try {
        return socket.send(data, cb);
      } catch (err) {
        cb(err);
      }
    },
    ping: socket.ping.bind(socket),
    close: socket.close.bind(socket),
    terminate: socket.terminate.bind(socket),
  };

  return connector;
}
