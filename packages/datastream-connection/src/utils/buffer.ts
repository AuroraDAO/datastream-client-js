/* @flow */
import * as $Datastream from '@auroradao/datastream-types';
import requests from '../requests';

interface Buffer$Instance {
  length: number;
  add(request: $Datastream.Request<string>): boolean;
  remove(request: $Datastream.Request<string>): boolean;
  clear(): void;
  flush(): void | $Datastream.Request<'bulk'>;
}

/**
 * A factory function that returns an instance to aid in
 * buffering commands during reconnect sequences.
 *
 * @export
 * @param {$Datastream.BufferConfiguration} config
 * @returns {Buffer$Instance}
 */
export function createBuffer(
  config: $Datastream.BufferConfiguration,
): Buffer$Instance {
  let queue: string[] = [];

  return {
    get length(): number {
      return queue.length;
    },
    add(request: $Datastream.Request<string>): boolean {
      const str = JSON.stringify(request);
      if (queue.includes(str)) {
        return false;
      }
      if (queue.length >= config.size) {
        queue.shift();
      }
      queue.push(str);
      return true;
    },
    remove(request: $Datastream.Request<string>): boolean {
      if (queue.length === 0) {
        return false;
      }
      const str = JSON.stringify(request);
      const prevLength = queue.length;
      queue = queue.filter(v => v !== str);
      return queue.length !== prevLength;
    },
    clear(): void {
      queue = [];
    },
    flush(): void | $Datastream.Request<'bulk'> {
      if (!queue.length) {
        return;
      }
      const prevQueue = queue.slice();
      queue = [];
      return prevQueue.length > 0 ? requests.bulk(prevQueue) : undefined;
    },
  };
}
