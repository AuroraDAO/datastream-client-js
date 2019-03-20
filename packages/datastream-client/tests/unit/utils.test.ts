import { expect } from 'chai';
import 'mocha';

import { createRequestID } from '../../src/utils';

describe('[datastream-client] | Utilities', () => {
  it('[createRequestID] | generated `rid` values are prefixed with `rid:`', () => {
    const rid = createRequestID();
    expect(rid.startsWith('rid:')).to.be.equal(true);
  });
});
