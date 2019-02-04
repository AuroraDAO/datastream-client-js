/* @flow */
import * as $Datastream from '@auroradao/datastream-types';

export function createBuffer(config: $Datastream.BufferConfiguration) {
  let queue: string[] = [];

  return {
    get length() {
      return queue.length;
    },
    add(request: $Datastream.Request<any, any>) {
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
    remove(request: $Datastream.Request<any, any>) {
      if (queue.length === 0) {
        return false;
      }
      const str = JSON.stringify(request);
      const prevLength = queue.length;
      queue = queue.filter(v => v !== str);
      return queue.length !== prevLength;
    },
    clear() {
      queue = [];
    },
    flush(): void | { request: 'bulk'; payload: string } {
      if (!queue.length) {
        return;
      }
      const prevQueue = queue.slice();
      queue = [];
      return prevQueue.length > 0
        ? {
            request: 'bulk',
            payload: JSON.stringify({
              requests: prevQueue,
            }),
          }
        : undefined;
    },
  };
}
