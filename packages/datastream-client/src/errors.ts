import * as $Datastream from '@auroradao/datastream-types';

// tslint:disable-next-line: max-classes-per-file
export class ValidationError extends Error
  implements $Datastream.ValidationError {
  public readonly name: 'ValidationError';
  public readonly during: string;
  constructor(during: string, str: string) {
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
  public readonly name = 'DatastreamCancellationError';
  constructor(public readonly rid: RID, public readonly request: REQ) {
    super('CANCELLED');
  }
}

// tslint:disable-next-line: max-classes-per-file
export class DatastreamServerError<
  RID extends string,
  REQ extends string
> extends Error {
  public readonly name = 'DatastreamServerError';
  constructor(
    public readonly rid: RID,
    public readonly request: REQ,
    public readonly message: string
  ) {
    super(message);
  }
}

// tslint:disable-next-line: max-classes-per-file
export class DatastreamTimeoutError<
  REQ extends string,
  RID extends string
> extends Error {
  public readonly name = 'DatastreamTimeoutError';
  constructor(
    public readonly rid: RID,
    public readonly request: REQ,
    public readonly sent: boolean
  ) {
    super('TIMEOUT');
  }
}
