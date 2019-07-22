import * as $Datastream from '@auroradao/datastream-types';
import { DEFAULT_CONFIG_CLIENT } from './constants';
import { ValidationError } from './errors';

export function modifyRunningConfig(
  config: $Datastream.Configuration,
  update: $Datastream.ConfigurationUpdater,
): void {
  const hasToken = Object.prototype.hasOwnProperty.call(update, 'token');
  const hasKey = Object.prototype.hasOwnProperty.call(update, 'key');
  Object.assign(config, {
    locale: typeof update.locale === 'string' ? update.locale : config.locale,
    log: typeof update.log === 'boolean' ? update.log : config.log,
    token: hasToken ? update.token : config.token,
    key: hasKey ? update.key : config.key,
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
  if (!config) {
    throw new ValidationError(
      'validate-configuration',
      'Failed to validation configuration, no configuration was provided when attempting to create the Datastream Client.',
    );
  }
  if (!config.key && !config.token) {
    throw new ValidationError(
      'validate-configuration',
      'Failed to validation configuration, missing one of either "key" or "token" property.  Please provide a valid Datastream API Key or Token.',
    );
  }
  return {
    ...DEFAULT_CONFIG_CLIENT,
    ...config,
  };
}
