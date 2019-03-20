import { expect } from 'chai';
import 'mocha';

// import createDatastreamClient from '../../src';

import * as client from '../../src/client';

describe('[datastream-client] | Client Tests', () => {
  it('[parseRawTopicsOrEvents] | returns `undefined` if any falsy value is given', () => {
    expect(client.parseRawTopicsOrEvents()).to.be.equal(undefined);
    expect(client.parseRawTopicsOrEvents(false)).to.be.equal(undefined);
    expect(client.parseRawTopicsOrEvents(0)).to.be.equal(undefined);
    expect(client.parseRawTopicsOrEvents(null)).to.be.equal(undefined);
  });

  it('[parseRawTopicsOrEvents] | wraps a string argument in an array', () => {
    expect(client.parseRawTopicsOrEvents('hello')).to.be.deep.equal(['hello']);
  });

  it('[parseRawTopicsOrEvents] | returns the original value if already an array', () => {
    const arr = ['hello'];
    expect(client.parseRawTopicsOrEvents(arr)).to.be.equal(arr);
  });

  it('[assertNever] | throws `Error` if called', () => {
    expect(client.assertNever).to.throw(Error, 'Unhandled connection event');
  });
});
