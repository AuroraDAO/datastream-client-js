import * as $Datastream from '@auroradao/datastream-types';
import WebSocket from 'ws';

function toArrayBuffer(data: Buffer): ArrayBuffer {
  return data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength);
}

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
    .on('message', data => {
      if (Buffer.isBuffer(data) || Array.isArray(data)) {
        const buf = Array.isArray(data) ? Buffer.concat(data) : data;
        return callback('message', connector, toArrayBuffer(buf));
      }
      return callback('message', connector, data);
    })
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
