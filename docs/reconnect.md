## Reconnect Logic

> **Important:** All clients are expected to adhere to the expected reconnect handling. A failure to adhere to this policy will result in throttling or blacklisting.

> **Important:** Be sure to review the [Protocol Events & Errors](#protocol-events--errors) and also properly handle each [RFC 6455](https://tools.ietf.org/html/rfc6455#section-7.4) closure code according to the specification provided.

In order to appropriately handle standard maintenance in a way that never degrades the overall performance of the API, all clients are expected to utilize [exponential backoff](https://en.wikipedia.org/wiki/Exponential_backoff) when handling connection issues or disconnects.

Exponential backoff is a powerful and simple method of ensuring there is not a large influx of connection requests simultaneously when expected disconnects or restarts are performed. With each connection attempt, the possible max delay for reconnect is increased and a random value between `0` and `max` is chosen so that clients will all connect at different times once the server is re-established.

- **Minimum Expected Maximum:** 30 seconds

#### Exponential Backoff Examples

```javascript
function createRedelay(maxSeconds) {
  let attempts = 0;
  return {
    reset() {
      attempts = 0;
    },
    next() {
      const expo = 2 ** attempts;
      attempts += 1;
      return Math.round(
        Math.random() * Math.min(maxSeconds, expo - 1) * 1000 + 1
      );
    }
  };
}
```

```javascript
const redelay = createRedelay(60);

for (let i = 0; i < 5; i += 1) {
  console.log(redelay.next());
}
console.log("Reset");
redelay.reset();
for (let i = 0; i < 10; i += 1) {
  console.log(redelay.next());
}
```

```javascript
1;
958;
2620;
1200;
13317;
Reset;
1;
669;
2014;
2247;
805;
9548;
16833;
20578;
5995;
5907;
```
