import shortid from 'shortid';

/**
 * Create a (fairly) unique id to be sent with each
 * request.  It will be returned with the response
 * from the server.
 */
export function createRequestID<RID extends string>(): RID {
  return `rid:${shortid.generate()}` as RID;
}

/**
 * Tries to parse a string as JSON and returns the original
 * value if it fails.
 */
export function tryParseJSON(value: string): string | object {
  if (typeof value !== 'string') {
    return value;
  }
  try {
    return JSON.parse(value);
    // eslint-disable-next-line no-empty
  } catch {}
  return value;
}
