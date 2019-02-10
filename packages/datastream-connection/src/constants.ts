/**
 * This is an important value which defines the protocol version
 * that this version of the `datastream-connection` client supports.
 *
 * This is used to guarantee support between client/server and should
 * only be changed when the client has been updated to meet the specification
 * changes of the newer version(s) of the Datastream Specification.
 */
export const PROTOCOL_VERSION = '1.0.0';

export const PING_INTERVAL = 10000;

/**
 * The maximum time that our `exponential backoff` will wait before
 * reconnecting.  It will take, at maximum, a random number between
 * 0 and 30 seconds each iteration where the max will increment each
 * tick.
 *
 * @see {@link ./utils/redelay.ts}
 */
export const MAX_RECONNECT_SECONDS = 30;

/**
 * Close Codes as defined in the status codes registry, an expansion of
 * RFC 6455
 *
 * @see https://www.iana.org/assignments/websocket/websocket.xml#close-code-number-rules
 */
export const CLOSE_CODES = {
  NORMAL: 1000,
  LEAVING: 1001,
  PROTOCOL: 1002,
  INVALID: 1003,
  TYPE_ERROR: 1007,
  POLICY: 1008,
  SIZE: 1009,
  BAD_EXTENSION: 1010,
  UNKNOWN: 1011,
  RESTART: 1012,
};
