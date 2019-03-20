import * as $Datastream from '@auroradao/datastream-types';

// tslint:disable-next-line: max-classes-per-file
export class ValidationError extends Error
  implements $Datastream.ValidationError {
  public readonly name: 'ValidationError';

  public readonly during: string;

  public constructor(during: string, str: string) {
    const message = `[ERROR] | datastream-client | ${during} | ${str}`;
    super(message);
    // Error.captureStackTrace(this, ValidationError);
    this.name = 'ValidationError';
    this.during = during;
  }
}

// tslint:disable-next-line: max-classes-per-file
export class DatastreamCancellationError<RID extends string, REQ extends string>
  extends Error
  implements $Datastream.DatastreamCancellationError<RID, REQ> {
  public readonly rid: RID;

  public readonly request: REQ;

  public readonly name = 'DatastreamCancellationError';

  public constructor(rid: RID, request: REQ) {
    super('CANCELLED');
    this.rid = rid;
    this.request = request;
  }
}

// tslint:disable-next-line: max-classes-per-file
export class DatastreamServerError<
  RID extends string,
  REQ extends string
> extends Error {
  public readonly rid: RID;

  public readonly request: REQ;

  public readonly name = 'DatastreamServerError';

  public constructor(rid: RID, request: REQ, message: string) {
    super(message);
    this.rid = rid;
    this.request = request;
  }
}

// tslint:disable-next-line: max-classes-per-file
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
    this.rid = rid;
    this.request = request;
    this.sent = sent;
  }
}
