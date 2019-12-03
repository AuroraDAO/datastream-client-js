/* eslint-disable max-classes-per-file */
import * as $Datastream from '@auroradao/datastream-types';

export class ValidationError<D extends string> extends Error
  implements $Datastream.ValidationError {
  public readonly name: 'ValidationError' = 'ValidationError';

  public readonly during: D;

  public constructor(during: D, str: string) {
    super(`[ERROR] | datastream-client | ${during} | ${str}`);
    Object.setPrototypeOf(this, Error.prototype);
    // Error.captureStackTrace(this, ValidationError);
    this.during = during;
  }
}

export class DatastreamCancellationError<RID extends string, REQ extends string>
  extends Error
  implements $Datastream.DatastreamCancellationError<RID, REQ> {
  public readonly rid: RID;

  public readonly request: REQ;

  public readonly name = 'DatastreamCancellationError';

  public constructor(rid: RID, request: REQ) {
    super('CANCELLED');
    Object.setPrototypeOf(this, Error.prototype);
    this.rid = rid;
    this.request = request;
  }
}

export class DatastreamServerError<
  RID extends string,
  REQ extends string
> extends Error {
  public readonly rid: RID;

  public readonly request: REQ;

  public readonly name = 'DatastreamServerError';

  public constructor(rid: RID, request: REQ, message: string) {
    super(message);
    Object.setPrototypeOf(this, Error.prototype);
    this.rid = rid;
    this.request = request;
  }
}

export class DatastreamTimeoutError<
  REQ extends string,
  RID extends string
> extends Error {
  public readonly rid: RID;

  public readonly request: REQ;

  public readonly sent: boolean;

  public readonly name = 'DatastreamTimeoutError';

  public constructor(rid: RID, request: REQ, sent: boolean) {
    super('TIMEOUT');
    Object.setPrototypeOf(this, Error.prototype);
    this.rid = rid;
    this.request = request;
    this.sent = sent;
  }
}
