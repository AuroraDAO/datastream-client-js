import * as $Datastream from '@auroradao/datastream-types';

/**
 * NOTE: Work In Progess
 *
 * The purpose of this package is to simulate the Datastream Server and
 * to allow for easy unit testing of the client and/or implementation.
 *
 * It takes a mock configuration that controls how it will respond to
 * simulate various situations.  It then returns a `controller` that
 * allows modifying various values of the connector so that we can
 * properly test for situations.
 *
 * It's `connector` is provided by calling the `connector` function
 * that is returned as a property of the `controller`.
 */

interface Mock$Configuration {
  /** How long until we fire the 'open' event? */
  connectTimeout: number;
  /** How long should we wait before handling any request sent? */
  respondTimeout: number;
}

const OPEN = 1;
const CONNECTING = 0;
const CLOSING = 2;
const CLOSED = 3;

const message = {
  event: (sid: string, eid: string, event: string, payload: object) => ({
    sid,
    eid,
    event,
    payload: JSON.stringify(payload),
  }),
  success: (sid: string, rid: string, request: string, payload: object) => ({
    result: 'success',
    sid,
    rid,
    request,
    payload: JSON.stringify(payload),
  }),
  error: (sid: string, rid: string, request: string, message: string) => ({
    result: 'error',
    sid,
    rid,
    request,
    payload: JSON.stringify({
      message,
    }),
  }),
};

export default function createMockConnectorEnvironment(
  mock: Mock$Configuration
) {
  let callback: $Datastream.Connection$Callback;
  const state = {
    readyState: 0,
    isHandshaked: false,
  };
  const controller = {
    setState(n: 0 | 1 | 2 | 3) {
      state.readyState = n;
    },
    serverClose(code: number, reason: string) {
      controller.setState(CLOSED);
      state.isHandshaked = false;
      if (callback) {
        callback('close', code, reason, true);
      }
    },
  };
  return {
    ...controller,
    connector(
      config: $Datastream.Connection$Configuration,
      clientCallback: $Datastream.Connection$Callback
    ): $Datastream.Connection$Socket {
      // send an open event to the client
      callback = clientCallback;
      setTimeout(() => callback('open'), mock.connectTimeout);

      // socket
      //   .on('open', () => callback('open'))
      //   .on('close', (code, reason) => callback('close', code, reason, true))
      //   .on('message', data => callback('message', data))
      //   .on('pong', data => callback('pong', data))
      //   .on('error', error => callback('error', error));

      function handleMockResponse(data: any) {
        if (data.request !== 'handshake' && !state.isHandshaked) {
          controller.serverClose(1002, '');
        }
      }

      return {
        OPEN,
        CONNECTING,
        CLOSED,
        CLOSING,
        get readyState() {
          return state.readyState;
        },
        send(data: any) {
          setTimeout(() => handleMockResponse(data), mock.respondTimeout);
        },
        close(code?: number, reason?: string) {
          state.readyState = 3;
        },
        terminate() {
          state.readyState = 3;
        },
      };
    },
  };
}
