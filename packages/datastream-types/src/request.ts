import { Task$Ref, TASK_CANCELLED } from 'task-handler';

import { DatastreamServerError } from './errors';

export interface Request<RID extends string, REQ extends string> {
  readonly rid: RID;
  readonly request: REQ;
  readonly payload: string;
  _context?: object;
}

export type Request$Complete<
  RID extends string,
  REQ extends string,
  SID extends string
> = Request<RID, REQ> & {
  readonly sid: SID;
};

export type Subscribe$Requests =
  | 'subscribeToAccounts'
  | 'subscribeToMarkets'
  | 'subscribeToChains';

export type Subscribe$Categories =
  | 'accounts'
  | 'markets'
  | 'chains'
  | 'account'
  | 'market'
  | 'chain';

export type Message$Event$Types = '';

export interface Message$Event {
  readonly sid: string;
  readonly eid: string;
  readonly event: Message$Event$Types;
  readonly payload: Record<string, any>;
}

export interface Message$Result$Success<
  RID extends string,
  REQ extends string
> {
  readonly result: 'success';
  readonly rid: RID;
  readonly sid: string;
  readonly request: REQ;
  readonly payload: Record<string, any>;
}

export interface Message$Result$Error<RID extends string, REQ extends string> {
  readonly result: 'error';
  readonly rid: RID;
  readonly sid: string;
  readonly request: REQ;
  readonly payload: {
    readonly message: string;
  };
}

export type Message$Result<RID extends string, REQ extends string> =
  | Message$Result$Success<RID, REQ>
  | DatastreamServerError<RID, REQ>
  | typeof TASK_CANCELLED;

export type Request$Job$Ref<RID extends string, REQ extends string> = Task$Ref<
  'job',
  RID,
  Message$Result<RID, REQ>,
  any
>;
