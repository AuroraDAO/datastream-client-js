interface Redelay$Instance {
  reset(): void;
  next(): number;
}

/**
 * Creates a `redelay` handler which implements exponential
 * backoff.  Once created, each invocation of `.next()` will
 * increment the attempts and return the next number in the
 * sequence.
 *
 * Calling `.reset()` will reset the attempts to 0.
 */
export function createRedelay(maxSeconds: number): Redelay$Instance {
  let attempts = 0;
  return {
    reset() {
      attempts = 0;
    },
    next() {
      attempts += 1;
      return Math.round(
        Math.random() * Math.min(maxSeconds, 2 ** attempts - 1) * 1000 + 1,
      );
    },
  };
}
