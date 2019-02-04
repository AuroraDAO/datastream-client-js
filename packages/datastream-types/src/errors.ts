export interface ValidationError extends Error {
  readonly name: 'ValidationError';
  readonly during: string;
}

export interface DatastreamServerError<RID extends string, REQ extends string>
  extends Error {
  readonly name: 'DatastreamServerError';
  readonly rid: RID;
  readonly request: REQ;
}

export interface DatastreamTimeoutError<RID extends string, REQ extends string>
  extends Error {
  readonly name: 'DatastreamTimeoutError';
  readonly rid: RID;
  readonly request: REQ;
  readonly sent: boolean;
}

export interface DatastreamCancellationError<
  RID extends string,
  REQ extends string
> extends Error {
  readonly name: 'DatastreamCancellationError';
  readonly rid: RID;
  readonly request: REQ;
}

export type Errors<RID extends string, REQ extends string> =
  | DatastreamServerError<RID, REQ>
  | DatastreamTimeoutError<RID, REQ>
  | DatastreamCancellationError<RID, REQ>;
