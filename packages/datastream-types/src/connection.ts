export interface Connection$Configuration {
  readonly url: string;
}

export type Connection$Events =
  | 'message'
  | 'error'
  | 'handshake'
  | 'open'
  | 'close'
  | 'pong';

export type Connection$States =
  | 'DISCONNECTED'
  | 'IDLE'
  | 'CONNECTING'
  | 'RECONNECTING'
  | 'CONNECTED'
  | 'HANDSHAKED';

export interface Connection$Socket {
  readonly OPEN: number;
  readonly CONNECTING: number;
  readonly CLOSING: number;
  readonly CLOSED: number;

  readonly readyState: number;

  send(data: any, cb: (err?: Error) => void): void;
  close(code?: number, reason?: string): void;
  terminate(): void;
}

export interface Connection$Callback {
  (event: 'open'): void;
  (event: 'close', code: number, reason: string, clean: boolean): void;
  (event: 'error', error: Error): void;
  (event: 'message' | 'pong', data: any): void;
}

export type Connection$Connector = (
  config: Connection$Configuration,
  callback: Connection$Callback
) => Connection$Socket;
