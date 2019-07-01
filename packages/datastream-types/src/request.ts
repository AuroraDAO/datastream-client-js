import { Task$Ref, Task$Handler, TASK_CANCELLED } from 'task-handler';

import { PromiseConfig } from './config';
import { DatastreamServerError } from './errors';

export interface Request<REQ extends string> {
  readonly request: REQ;
  readonly payload: string;
  _context?: object;
}

/**
 * Valid requests include rid, request, payload, and possibly _context
 */
export type Request$Valid<RID extends string, REQ extends string> = Request<
  REQ
> & {
  readonly rid: RID;
};

/**
 * Complete request include the `sid` which is added by the `connection`
 */
export type Request$Complete<
  RID extends string,
  REQ extends string,
  SID extends string
> = Request$Valid<RID, REQ> & {
  sid: SID;
};

export type Subscribe$Requests =
  | 'subscribeToAccounts'
  | 'subscribeToUsers'
  | 'subscribeToMarkets'
  | 'subscribeToChains';

export type Subscribe$Categories =
  | 'accounts'
  | 'users'
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
  readonly payload: Record<string, unknown>;
  readonly seq: number;
}

export interface Message$Result$Success<
  RID extends string,
  REQ extends string
> {
  readonly result: 'success';
  readonly rid: RID;
  readonly sid: string;
  readonly request: REQ;
  readonly payload: Record<string, unknown>;
}

export interface Message$Result$Error<RID extends string, REQ extends string> {
  readonly result: 'error';
  readonly rid: RID;
  readonly sid: string;
  readonly request: REQ;
  readonly payload: {
    message: string;
  };
}

export type Message$Result$Socket<RID extends string, REQ extends string> =
  | Message$Result$Success<RID, REQ>
  | Message$Result$Error<RID, REQ>
  | Message$Event;

/**
 * Promises will have error thrown / rejected so error is
 * not included
 */
export type Message$PromiseResult<RID extends string, REQ extends string> =
  | Message$Result$Success<RID, REQ>
  | typeof TASK_CANCELLED;

export type Message$Result<RID extends string, REQ extends string> =
  | Message$Result$Success<RID, REQ>
  | DatastreamServerError<RID, REQ>
  | typeof TASK_CANCELLED;

export type Request$Job$Ref<RID extends string, REQ extends string> = Task$Ref<
  'job',
  RID,
  Message$PromiseResult<RID, REQ>,
  Task$Handler
>;

export interface Client$SendResponse<RID extends string, REQ extends string> {
  rid: RID;
  request: REQ;
  promise(
    promiseConfig?: PromiseConfig,
  ): Promise<Message$Result$Success<RID, REQ>>;
}
