import * as $Datastream from '@auroradao/datastream-types';
import { DatastreamClient } from './client';
import { createRunningConfig } from './config';

/**
 * Creates the Datastream client based upon your
 * initial configuration. Once created, the client
 * will immediately begin attempting to connect by
 * default.
 *
 * @param {$Datastream.InitialConfiguration} config
 *  You must provide a configuration that is used to
 *  setup the connection to the Datastream server.
 *
 * @param {$Datastream.Callbacks} [callbacks=undefined]
 *  Provide the callbacks that you wish to handle.
 *
 *  @note
 *    You may leave this empty if you plan to handle all
 *    callbacks using promises, however, it is not recommended.
 *    You should at least be handling connection errors and
 *    such.
 */
export default function createDatastreamClient(
  initialConfig: $Datastream.InitialConfiguration,
  callbacks?: Partial<$Datastream.Callbacks>
) {
  const config = createRunningConfig(initialConfig);
  return new DatastreamClient(config, callbacks);
}
