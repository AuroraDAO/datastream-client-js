import * as $Datastream from '@auroradao/datastream-types';

export default function createDatastreamConnector(
  config: $Datastream.Connection$Configuration,
  callback: $Datastream.Connection$Callback
): $Datastream.Connection$Socket {
  const socket = new WebSocket(config.url);

  socket.addEventListener('open', () => callback('open'));
  socket.addEventListener('close', ({ code, reason, wasClean }) =>
    callback('close', code, reason, wasClean)
  );
  socket.addEventListener('message', event => callback('message', event.data));
  socket.addEventListener('error', () =>
    /* We don't get any real information on web */
    callback('error', new Error('ConnectionError'))
  );

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
        socket.send(data);
        cb();
      } catch (err) {
        cb(err);
      }
    },
    close: socket.close,
    terminate: socket.close,
  };
}
