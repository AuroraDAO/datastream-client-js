# @auroradao/datastream-connector-uws

Implements the datastream client connector for the `uws` package by implementing the connector interface.

```javascript
export interface Connection$Socket {
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
```
