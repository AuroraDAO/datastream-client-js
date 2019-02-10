// tslint:disable-next-line: max-classes-per-file
export class DatastreamNotReadyError<
  REQ extends string,
  RID extends string
> extends Error {
  public readonly name = 'DatastreamNotReadyError';
  constructor(
    public readonly rid: RID,
    public readonly request: REQ,
    public readonly state: number
  ) {
    super('DatastreamNotReady');
  }
}
