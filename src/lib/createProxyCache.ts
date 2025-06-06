/*****
 License
 --------------
 Copyright © 2020-2025 Mojaloop Foundation
 The Mojaloop files are made available by the Mojaloop Foundation under the Apache License, Version 2.0 (the "License") and you may not use these files except in compliance with the License. You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, the Mojaloop files are distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.

 Contributors
 --------------
 This is the official list of the Mojaloop project contributors for this file.
 Names of the original copyright holders (individuals or organizations)
 should be listed with a '*' in the first column. People who have
 contributed from an organization can be listed under the organization
 that actually holds the copyright for their contributions (see the
 Mojaloop Foundation for an example). Those individuals should have
 their names indented and be marked with a '-'. Email address can be added
 optionally within square brackets <email>.

 * Mojaloop Foundation
 - Name Surname <name.surname@mojaloop.io>

 * Eugen Klymniuk <eugen.klymniuk@infitx.com>
 --------------
 **********/

import { ProxyCacheFactory, StorageType, ProxyCacheConfig } from '../types';
import { validateRedisClusterProxyCacheConfig, validateRedisProxyCacheConfig } from '../validation';
import { logger } from '../utils';
import { STORAGE_TYPES } from '../constants';
import { ProxyCacheError } from './errors';
import * as storages from './storages';

export const createProxyCache: ProxyCacheFactory = (type: StorageType, proxyConfig: ProxyCacheConfig) => {
  switch (type) {
    case STORAGE_TYPES.redis: {
      return new storages.RedisProxyCache(validateRedisProxyCacheConfig(proxyConfig));
    }
    case STORAGE_TYPES.redisCluster: {
      return new storages.RedisProxyCache(validateRedisClusterProxyCacheConfig(proxyConfig), true);
    }
    case STORAGE_TYPES.mysql:
      throw new Error('Mysql storage is not implemented yet');
    default: {
      const error = ProxyCacheError.unsupportedProxyCacheType();
      logger.warn(error.message, proxyConfig);
      throw error;
    }
  }
};
