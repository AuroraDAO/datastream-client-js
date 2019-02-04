The IDEX Datastream API is a realtime API using WebSockets to deliver realtime information to your application based on a simple subscription model. The API follows the "Datastream Specification" provided below. Any consumer application **must adhere to this specification.**

> **Note:** Failure to follow the specification may result in your application being throttled or blacklisted.

# Protocol Details

- **Current Version:** 1.0.0
- **Allowed Versions:** `~1.0`
- **Endpoint:** wss://wss.idex.market

# Format Reference

```json
{
  "result": "success",
  "sid": "sid:98efc99887",
  "rid": "my-subscribe-request",
  "request": "subscribeToChains",
  "warnings": ["Potential Warning Message"],
  "payload": "{ \"response\": \"here\" }"
}
```

<details><summary><b>Request Format</b></summary>
<p>

<hr />

All requests must meet the expected request format or they will be ignored by the server. This format consists of a `header` providing metadata on the request that is used to efficiently handle the request and a `payload` which is then parsed and handled at the proper point internally.

<div class="table-wrap">
  <table>
    <thead>
      <th width="100px">Parameter</th>
      <th>Required</th>
      <th width="100%">Description</th>
    </thead>
    <tbody>
      <tr>
        <td>sid</td>
        <td>true</td>
        <td>
          <p>
            The Session ID which was provided as a result of the initial
            handshake.
          </p>
          <blockquote>
            <ul>
              <li>
                This <b>must be provided with every request</b> after the
                initial handshake is made.
              </li>
              <li>
                Any request made that doesn't match the
                <code>sid</code> provided from the handshake request will cause
                an immediate termination of the session.
              </li>
              <li>
                Your client should monitor the <code>sid</code> value with every
                response and <b>immediately reconnect</b> if not a match.
              </li>
            </ul>
          </blockquote>
        </td>
      </tr>
      <tr>
        <td>rid</td>
        <td>false</td>
        <td>
          <p>A unique ID that can be used to identify the given request.</p>
          <blockquote>
            <ul>
              <li>
                It will always be returned with any responses that are generated
                as a result of the request.
              </li>
              <li>
                If not provided, a unique value will be generated automatically.
              </li>
            </ul>
          </blockquote>
        </td>
      </tr>
      <tr>
        <td>request</td>
        <td>true</td>
        <td>
          The request to perform. <code>payload</code> is expected to
          conform to the provided requests schema (see below).
        </td>
      </tr>
      <tr>
        <td>payload</td>
        <td>true</td>
        <td>
          The payload of the request based upon the
          <code>request</code> parameter provided.
        </td>
      </tr>
    </tbody>
  </table>
</div>

```json
{
  "rid": "my-subscribe-request",
  "sid": "sid:98efc99887",
  "request": "subscribeToChains",
  "payload": "{ \"data\": \"here\" }"
}q
```

> **IMPORTANT:** `payload` must **always** be a string representation of the actual request body (as shown above).

<hr />

</p>
</details><br />

<details><summary><b>Response Format</b></summary>
<p>

<hr />

In response to any requests the Datastream will provide a standard formatting to parse.

### Success Response

```json
{
  "result": "success",
  "sid": "sid:98efc99887",
  "rid": "my-subscribe-request",
  "request": "subscribeToChains",
  "warnings": ["Potential Warning Message"],
  "payload": "{ \"response\": \"here\" }"
}
```

### Error Response

```json
{
  "result": "error",
  "sid": "sid:98efc99887",
  "rid": "my-subscribe-request",
  "request": "subscribeToChains",
  "warnings": ["Potential Warning Message"],
  "payload": "{ \"message\": \"Error Message\" }"
}
```

<hr />

</p>
</details><br />

<details><summary><b>Event Format</b></summary>
<p>

<hr />

Events are sent when one of your subscribed topics receives a message. These have a different format from the standard responses and should be handled by the client accordingly.

> See [Subscriptions](#subscriptions) for more information on how to handle event messages.

```json
{
  "sid": "sid:98efc99887",
  "eid": "eid:s78c-988da",
  "seq": 505,
  "event": "chain_status",
  "warnings": ["Potential Warning Message"],
  "payload": "\"{\"data\": \"here\"}\""
}
```

<hr />

</p>
</details><br />


## Protocol Events & Errors

There are two levels of errors that may occur while interacting with the Datastream API. Server Errors indicate an error on the communication layer (with the Datastream Protocol itself), whereas application errors indicate an application-level error occurred (which are presented using the format above).

Protocol Errors are critical-level errors and must be handled properly. In most cases, a protocol error will result in the immediate disconnect of your application from the server. Each will provide a status code conforming to the [RFC 6455](https://tools.ietf.org/html/rfc6455#section-7.4).

Not all disconnects are errors. Some will include information referencing the reason for the disconnect and provide appropriate information for how the client should behave in response.

<details><summary><b>Protocol Events Reference</b></summary>
<p>

<hr />

<div class="table-wrap">
  <table>
    <thead>
      <th>Message</th>
      <th width="75px">Code</th>
      <th width="100%">Description</th>
    </thead>
    <tbody>
      <tr>
        <td>ProtocolNegotationFailure</td>
        <td>1002</td>
        <td>
          <p>The client failed to handshake with the protocol.</p>
          <blockquote>
            <ul>
              <li>
                A client must immmediately handshake with the protocol upon
                connecting or it will be disconnected.
              </li>
              <li>
                A client must meet all expectations during the handshake to be
                considered a valid Datastream Consumer.
              </li>
            </ul>
          </blockquote>
        </td>
      </tr>
      <tr>
        <td>AuthenticationFailure</td>
        <td>1002</td>
        <td>
          <p>
            This generally indicates that the API Key you have provided is not
            being accepted during a handshake.
          </p>
          <blockquote>
            <ul>
              <li>
                This is not recoverable. <b>Do not try to reconnect</b> without
                changing your API Key to an accepted value.
              </li>
            </ul>
          </blockquote>
        </td>
      </tr>
      <tr>
        <td>InvalidVersion</td>
        <td>1002</td>
        <td>
          <p>
            The client provided a version in the handshake which did not satisfy
            the constraint of the server.
          </p>
          <blockquote>
            <ul>
              <li>
                Your client must indicate that it conforms to one of the
                protocol versions that conform to the
                <a href="#handshake">protocol version constraints.</a>
              </li>
              <li>
                You must not attempt to reconnect until updating your
                application code to meet the new specifications.
              </li>
              <li>
                <b
                  >If your application begins to get this message, then there
                  are breaking changes to the API.</b
                >
              </li>
            </ul>
          </blockquote>
        </td>
      </tr>
      <tr>
        <td>SessionIDMismatch</td>
        <td>1002</td>
        <td>
          <p>
            You provided a <code>sid</code> value which does not match the
            expected value.
          </p>
          <blockquote>
            <ul>
              <li>
                Whenever a <code>sid</code> value is unmatched by either end of
                the socket, the receiving party must disconnect immediately.
                Communication should be considered invalid and out-of-sync.
              </li>
              <li>In some cases reconnecting will resolve the issue.</li>
              <li>
                Your application may not be properly providing the
                <code>sid</code> value received with the initial handshake. Any
                request made without the value will cause an immediate
                disconnect.
              </li>
            </ul>
          </blockquote>
        </td>
      </tr>
      <tr>
        <td>ServiceRestarting</td>
        <td>1012</td>
        <td>
          <p>
            The service is restarting and will be available shortly.
          </p>
          <blockquote>
            <ul>
              <li>
                When received the client should begin the <a href="#reconnect-logic">exponential backoff</a> reconnect
                process.
              </li>
            </ul>
          </blockquote>
        </td>
      </tr>
    </tbody>
  </table>
</div>

<hr />

</p>
</details><br />

## API Reference

### Handshake

<details><summary><b>Request Summary</b></summary>
<p>

<hr />

The handshake is **the first request that must be made immediately upon connecting with the server.** Any other data sent to the Datastream before a handshake is made will result in an immediate disconnection of the session.

In response, the client will receive a `sid` (Session ID) value which **must be included with every request thereafter.**

<hr />

</p>
</details><br />

<details><summary><b>Payload Parameters</b></summary>
<p>

<hr />

<div class="table-wrap">
  <table>
    <thead>
      <th width="100px">Parameter</th>
      <th>Required</th>
      <th width="100%">Description</th>
    </thead>
    <tbody>
      <tr>
        <td>version</td>
        <td>true</td>
        <td>
          <p>The version that the client is expecting.</p>
          <blockquote>
            <ul>
              <li>
                This represents the exact
                <a href="https://semver.org/">semver</a> version that the client
                is equipped to handle.
              </li>
              <li>
                This is strictly enforced and must meet the current semver
                constraint defined in the
                <a href="#protocol-details">Protocol Details</a> section above.
              </li>
              <li>
                More details are available in the "Versioning Expectations"
                section below.
              </li>
            </ul>
          </blockquote>
        </td>
      </tr>
      <tr>
        <td>type</td>
        <td>false</td>
        <td>
          <p>The type of client that is connecting.</p>
          <blockquote>
            <ul>
              <li>
                If not provided, defaults to the only currently valid value of
                <code>client</code>
              </li>
            </ul>
          </blockquote>
        </td>
      </tr>
      <tr>
        <td>key</td>
        <td>true</td>
        <td>
          <p>The API Key of the client that is connecting.</p>
          <blockquote>
            <ul>
              <li>
                The authentication key to use by default can be found in the
                "Authentication (API Key)" section below.
              </li>
            </ul>
          </blockquote>
        </td>
      </tr>
    </tbody>
  </table>
</div>

<hr />

</p>
</details><br />

<details><summary><b>Authentication (API Key)</b></summary>
<p>

<hr />

At this time, we provide a static API Key to use with your `handshake` requests. This is subject to change in the future.

- **API Key:** `17paIsICur8sA0OBqG6dH5G1rmrHNMwt4oNk4iX9`

<hr />

</p>
</details><br />

<details><summary><b>Versioning Expectations (IMPORTANT)</b></summary>
<p>

<hr />

**Important:** In order to be able to quickly update our backend and serve our users with the best possible user experience, we follows a strict versioning protocol which you will need to understand in order to be successful with using the Datastream API.

During the handshake, the `version` you provide is a strict binding between the servers API and your own. You are indicating which exact version of the backend your script has been built to support and in response we will either reject or accept your connection.

In the event of a pending deprecation or breaking change, a warning may also be emitted with the handshake response. This should be handled by your script in a way that will keep you informed on potential upcoming issues that you must adjust your script for.

<hr />

</p>
</details><br />

## Datastream Methods

- handshake
- subscribeToChains
- subscribeToMarkets
- subscribeToAccounts
