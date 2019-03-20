import { expect } from 'chai';
import 'mocha';

import { DEFAULT_CONFIG_CLIENT } from '../../src/constants';
import { ValidationError } from '../../src/errors';
import { createRunningConfig, modifyRunningConfig } from '../../src/config';

const BASE_CONFIG = Object.freeze({
  key: 'my-key',
});

describe('[datastream-client] | Client Configuration', () => {
  it('[createRunningConfig] should throw ValidationError if no configuration is provided', () => {
    expect(createRunningConfig).to.throw(
      ValidationError,
      'no configuration was provided',
    );
  });

  it('[createRunningConfig] should throw ValidationError if `key` is not given', () => {
    expect(() => createRunningConfig({} as any)).to.throw(
      ValidationError,
      'missing "key" property',
    );
  });

  it('[createRunningConfig] should have default properties mixed with base config', () => {
    const config = createRunningConfig(BASE_CONFIG);
    expect(config).to.be.deep.equal({
      ...DEFAULT_CONFIG_CLIENT,
      ...BASE_CONFIG,
    });
  });

  it('[createRunningConfig] should overwrite default properties when provided', () => {
    const config = createRunningConfig({
      ...BASE_CONFIG,
      log: true,
      auto: false,
    });
    expect(config).to.be.deep.equal({
      ...DEFAULT_CONFIG_CLIENT,
      ...BASE_CONFIG,
      log: true,
      auto: false,
    });
  });

  it('[modifyRunningConfig] should allow modifying whitelisted config properties', () => {
    const config = createRunningConfig({
      ...BASE_CONFIG,
      log: true,
      locale: 'es',
    });
    expect(config).to.be.deep.equal({
      ...DEFAULT_CONFIG_CLIENT,
      ...BASE_CONFIG,
      log: true,
      locale: 'es',
    });
    modifyRunningConfig(config, {
      locale: 'en',
      log: false,
    });
    expect(config).to.be.deep.equal({
      ...DEFAULT_CONFIG_CLIENT,
      ...BASE_CONFIG,
      log: false,
      locale: 'en',
    });
  });

  it('[modifyRunningConfig] should ignore any extraneous or unsupported properties', () => {
    const config = createRunningConfig({
      ...BASE_CONFIG,
      log: true,
      locale: 'es',
    });
    expect(config).to.be.deep.equal({
      ...DEFAULT_CONFIG_CLIENT,
      ...BASE_CONFIG,
      log: true,
      locale: 'es',
    });
    modifyRunningConfig(config, {
      key: 'value',
    } as any);
    expect(config.key).to.equal(BASE_CONFIG.key);
  });
});
