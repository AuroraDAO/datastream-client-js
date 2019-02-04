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
export default {
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
   */
  1002(reason: string) {
    switch (reason) {
      case 'ProtocolNegotiationFailure': {
        break;
      }
      case 'AuthenticationFailure': {
        break;
      }
      case 'InvalidVersion': {
        break;
      }
      case 'SessionIDMismatch': {
        break;
      }
      default: {
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
