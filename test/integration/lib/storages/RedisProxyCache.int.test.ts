/*****
 License
 --------------
 Copyright © 2017 Bill & Melinda Gates Foundation
 The Mojaloop files are made available by the Bill & Melinda Gates Foundation under the Apache License, Version 2.0 (the "License") and you may not use these files except in compliance with the License. You may obtain a copy of the License at
 http://www.apache.org/licenses/LICENSE-2.0
 Unless required by applicable law or agreed to in writing, the Mojaloop files are distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.

 Contributors
 --------------
 This is the official list of the Mojaloop project contributors for this file.
 Names of the original copyright holders (individuals or organizations)
 should be listed with a '*' in the first column. People who have
 contributed from an organization can be listed under the organization
 that actually holds the copyright for their contributions (see the
 Gates Foundation organization for an example). Those individuals should have
 their names indented and be marked with a '-'. Email address can be added
 optionally within square brackets <email>.
 * Gates Foundation
 - Name Surname <name.surname@gatesfoundation.com>

 * Eugen Klymniuk <eugen.klymniuk@infitx.com>
 --------------
 **********/
import { env } from 'node:process';
import { createProxyCache, IProxyCache, STORAGE_TYPES } from '#src/index';
import { logger } from '#src/utils';

import * as useCases from '#test/useCases';
import * as fixtures from '#test/fixtures';

const port = parseInt(env.REDIS_STANDALONE_PORT || '');
const portCluster = parseInt(env.REDIS_CLUSTER_PORT || '');
// todo: use convict

const redisProxyConfig = fixtures.redisProxyConfigDto({ port });
const redisClusterProxyConfig = fixtures.redisClusterProxyConfigDto({
  cluster: [{ host: 'localhost', port: portCluster }],
});
logger.info('redis proxyConfigs', { redisClusterProxyConfig, redisProxyConfig });

describe('RedisProxyCache Integration Tests -->', () => {
  const runUseCases = (proxyCache: IProxyCache, anotherProxyCache: IProxyCache) => {
    beforeAll(async () => {
      await Promise.all([proxyCache.connect(), anotherProxyCache.connect()]);
    });

    afterAll(async () => {
      await Promise.all([proxyCache.disconnect(), anotherProxyCache.disconnect()]);
    });

    test('should perform proxyMapping use case', async () => {
      await useCases.proxyMappingUseCase(proxyCache);
    });

    test('should detect the final ALS error callback', async () => {
      await useCases.detectFinalErrorCallbackUseCase(proxyCache);
    });

    test('should save only the first alsRequest', async () => {
      await useCases.setSendToProxiesListOnceUseCase(proxyCache);
    });

    test('should process process expired ALS keys', async () => {
      await useCases.processExpiredAlsKeysUseCase(proxyCache);
    }, 10_000);

    test('should have shared db info for all connected instances', async () => {
      await useCases.shareDbInfoForAllConnectedInstances(proxyCache, anotherProxyCache);
    });

    test('should have healthCheck method', async () => {
      const isOk = await proxyCache.healthCheck();
      expect(isOk).toBe(true);
    });
  };

  describe('Use Cases Tests with redis cluster -->', () => {
    const proxyCache = createProxyCache(STORAGE_TYPES.redisCluster, redisClusterProxyConfig);
    const anotherProxyCache = createProxyCache(STORAGE_TYPES.redisCluster, redisClusterProxyConfig);
    runUseCases(proxyCache, anotherProxyCache);
  });

  describe('Use Cases Tests with standalone redis -->', () => {
    const proxyCache = createProxyCache(STORAGE_TYPES.redis, redisProxyConfig);
    const anotherProxyCache = createProxyCache(STORAGE_TYPES.redis, redisProxyConfig);
    runUseCases(proxyCache, anotherProxyCache);
  });
});
