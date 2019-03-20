import shortid from 'shortid';

/**
 * Create a (fairly) unique id to be sent with each
 * request.  It will be returned with the response
 * from the server.
 */
export function createRequestID<RID extends string>(): RID {
  return `rid:${shortid.generate()}` as RID;
}
