import { expect } from 'chai';
import 'mocha';

import * as Errors from '../../src/errors';

describe('[datastream-client] | Custom Error Objects', () => {
  it('[ValidationError] | has the expected properties', () => {
    const error = new Errors.ValidationError(
      'function-name',
      'Invalid Argument Value',
    );
    expect(error.name).to.equal('ValidationError');
    expect(error.during).to.equal('function-name');
  });

  it('[DatastreamServerError] | has the expected properties', () => {
    const error = new Errors.DatastreamServerError(
      'my-rid',
      'my-request',
      'Server Error',
    );
    expect(error.name).to.equal('DatastreamServerError');
    expect(error.rid).to.equal('my-rid');
    expect(error.request).to.equal('my-request');
  });

  it('[DatastreamCancellationError] | has the expected properties', () => {
    const error = new Errors.DatastreamCancellationError(
      'my-rid',
      'my-request',
    );
    expect(error.name).to.equal('DatastreamCancellationError');
    expect(error.rid).to.equal('my-rid');
    expect(error.request).to.equal('my-request');
    expect(error.message).to.equal('CANCELLED');
  });

  it('[DatastreamTimeoutError] | has the expected properties', () => {
    const error = new Errors.DatastreamTimeoutError(
      'my-rid',
      'my-request',
      false,
    );
    expect(error.name).to.equal('DatastreamTimeoutError');
    expect(error.rid).to.equal('my-rid');
    expect(error.request).to.equal('my-request');
    expect(error.sent).to.equal(false);
    expect(error.message).to.equal('TIMEOUT');
  });
});
