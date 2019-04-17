import * as $Datastream from '@auroradao/datastream-types';

import { PROTOCOL_VERSION } from './constants';

export default {
  bulk: (requests: string[]): $Datastream.Request<'bulk'> => ({
    request: 'bulk',
    payload: JSON.stringify({
      requests,
    }),
  }),
  handshake: (
    config: $Datastream.Configuration,
  ): $Datastream.Request<'handshake'> => ({
    request: 'handshake',
    payload: JSON.stringify({
      locale: config.locale,
      type: config.type,
      version: PROTOCOL_VERSION,
      key: config.key,
      token: config.token,
    }),
  }),
};
