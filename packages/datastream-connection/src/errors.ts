// tslint:disable-next-line: max-classes-per-file
export class DatastreamNotReadyError<
  REQ extends string,
  RID extends string
> extends Error {
  public readonly rid: RID;

  public readonly request: REQ;

  public readonly state: number;

  public readonly name = 'DatastreamNotReadyError';

  public constructor(rid: RID, request: REQ, state: number) {
    super('DatastreamNotReady');
    this.rid = rid;
    this.request = request;
    this.state = state;
  }
}
