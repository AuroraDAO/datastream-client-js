import * as $Datastream from '@auroradao/datastream-types';

interface ClosureHandlers {
  [code: number]: (reason: string, config: $Datastream.Configuration) => void;
  1012(reason: string, config: $Datastream.Configuration): void;
  1002(reason: string, config: $Datastream.Configuration): void;
}

/**
 * Handlers for RFC 6455's Status Codes
 *
 * When we receive a closure of a connection, the Datastream
 * Specification requires that we parse the code and reason to
 * determine how we should handle each defined case.
 *
 * In some cases a reconnect will not be attempted without
 * intervention from the user, such as when this clients
 * version becomes out of date or an authentication failure
 * occurs.
 *
 * @see https://tools.ietf.org/html/rfc6455#section-7.4.1
 */
const handlers: ClosureHandlers = {
  /**
   * @ref RFC6455 Closure Code 1002 (Protocol Error)
   *
   * @param {string} reason
   *  @enum {AuthenticationFailure} [`FATAL`]
   *   Generally indicates the provided API Key was not
   *   accepted by the server, but could indicate other
   *   authentication issues have arisen.
   *  @enum {InvalidVersion} [`FATAL`]
   *   The client version is outdated and no longer accepted
   *   by the server.  An update is required before a
   *   connection will be accepted by the server.
   *  @enum {ProtocolNegotationFailure}
   *   Generally means the handshake was not received
   *   by the server before the timeout period expired.
   *  @enum {SessionIDMismatch}
   *   The `sid` value provided to the server during a
   *   request did not match the expected value.  The
   *   server is requesting a resync by disconnecting
   *   the client.
   *
   * @note
   *  When a`FATAL` value is encountered, no further connections will be allowed
   *  until the issue has been resolved (likely requiring a completely restart of
   *  the program after resolving any programming errors or issues).
   */
  1002(reason: string, config: $Datastream.Configuration) {
    switch (reason) {
      case 'AuthenticationFailure': {
        console.error(
          '[FATAL] | DatastreamConnection | The authentication information you have provided is invalid.  No further connection attempts will be made.  Please check the authentication information provided and resolve before trying again.'
        );
        throw new Error('FATAL');
      }
      case 'InvalidVersion': {
        console.error(
          '[FATAL] | DatastreamConnection | This client version has been deprecated and must be upgraded to the newest version before it may interact with the Datastream API.  No further connection attempts will be made.'
        );
        throw new Error('FATAL');
      }
      case 'ProtocolNegotiationFailure': {
        if (config.log) {
          console.warn(
            '[WARN] | DatastreamConnection | A protocol negotation failure occurred.  This may be due to the server receiving higher traffic than usual and should be resolved shortly.  A reconnection attempt will be schedule shortly.'
          );
        }
        break;
      }
      case 'SessionIDMismatch': {
        if (config.log) {
          console.warn(
            '[WARN] | DatastreamConnection | A Session ID mismatch has been detected.  This means that the server and client have gotten out of sync.  A reconnect will be scheduled immediately to re-sync with the Datastream.'
          );
        }
        break;
      }
      default: {
        if (config.log) {
          console.warn(
            `[WARN] | DatastreamConnection | An unhandled protocol error has occurred "${reason}", a reconnect will be scheduled.`
          );
        }
        break;
      }
    }
  },
  /**
   * @ref RFC6455 Closure Code 1012 (Restarting)
   *
   * @param reason
   *  @enum {ServiceRestarting}
   *    The server is restarting, we are expected to begin
   *    a standard reconnect procedure using our exponential
   *    backoff library.
   */
  1012(reason: string) {
    switch (reason) {
      case 'ServiceRestarting': {
        break;
      }
      default: {
        /* A restart is occurring for an unknown reason */
        break;
      }
    }
  },
};

export default handlers;
