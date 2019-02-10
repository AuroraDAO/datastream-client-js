# @auroradao/datastream-connector-web

Implements the datastream client connector for the `HTML5 WebSocket` by implementing the connector interface.

```javascript
interface Connection$Configuration {
  log: boolean;
  url: string;
}

interface Connection$Callback {
  (event: 'open'): void;
  (event: 'close', code: number, reason: string, clean: boolean): void;
  (event: 'error', error: Error): void;
  (event: 'pong', data: string): void;
  (event: 'message', data: any): void;
}

interface Connection$Socket {
  readonly OPEN: number;
  readonly CONNECTING: number;
  readonly CLOSING: number;
  readonly CLOSED: number;

  readonly readyState: number;

  send(data: any, cb: (err?: Error) => void): void;
  close(code?: number, reason?: string): void;
  ping(sid: string): void;
  terminate(): void;
}

type Connection$Connector = (
  config: Connection$Configuration,
  callback: Connection$Callback
) => Connection$Socket;
```
