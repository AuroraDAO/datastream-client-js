/**
 * The maximum time that our `exponential backoff` will wait before
 * reconnecting.  It will take, at maximum, a random number between
 * 0 and 30 seconds each iteration where the max will increment each
 * tick.
 *
 * @see {@link ./utils/redelay.ts}
 */
export const MAX_RECONNECT_SECONDS = 30;
