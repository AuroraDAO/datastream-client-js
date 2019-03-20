import * as $Datastream from '@auroradao/datastream-types';
import { DEFAULT_CONFIG_CLIENT } from './constants';
import { ValidationError } from './errors';

export function modifyRunningConfig(
  config: $Datastream.Configuration,
  update: $Datastream.ConfigurationUpdater,
): void {
  Object.assign(config, {
    locale: typeof update.locale === 'string' ? update.locale : config.locale,
    log: typeof update.log === 'boolean' ? update.log : config.log,
  });
}

/**
 * Takes the user configuration and merges it with the default
 * configuration to create an exact configuration for us to
 * use.
 */
export function createRunningConfig(
  config: $Datastream.InitialConfiguration,
): $Datastream.Configuration {
  if (!config.key) {
    throw new ValidationError(
      'validate-configuration',
      'Failed to validation configuration, missing "key" property.  Please provide a validation API Key.',
    );
  }
  return {
    ...DEFAULT_CONFIG_CLIENT,
    ...config,
  };
}
