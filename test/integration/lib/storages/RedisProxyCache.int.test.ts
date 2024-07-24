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

const port = parseInt(env.REDIS_PORT || '');
// todo: use convict
const cluster = [{ host: 'localhost', port }];
const redisProxyConfig = fixtures.redisProxyConfigDto({ cluster });
logger.info('redisProxyConfig', redisProxyConfig);

describe('RedisProxyCache Integration Tests -->', () => {
  let proxyCache: IProxyCache;

  beforeAll(async () => {
    proxyCache = createProxyCache(STORAGE_TYPES.redis, redisProxyConfig);
    await proxyCache.connect();
  });

  afterAll(async () => {
    await proxyCache.disconnect();
  });

  describe('Use Cases Tests -->', () => {
    test('should perform proxyMapping use case', async () => {
      await useCases.proxyMappingUseCase(proxyCache);
    });

    test('should detect the final ALS error callback', async () => {
      await useCases.detectFinalErrorCallbackUseCase(proxyCache);
    });

    test('should have shared db info for all connected instances', async () => {
      const anotherProxyCache = createProxyCache(STORAGE_TYPES.redis, redisProxyConfig);
      await anotherProxyCache.connect();
      const alsReq = fixtures.alsRequestDetailsDto();
      const proxyId = 'proxyAB';

      const isOk = await proxyCache.setSendToProxiesList(alsReq, [proxyId], 1);
      expect(isOk).toBe(true);

      const isLast = await anotherProxyCache.receivedErrorResponse(alsReq, proxyId);
      expect(isLast).toBe(true);

      await anotherProxyCache.disconnect();
    });
  });

  test('should save only the first alsRequest', async () => {
    const alsReq = fixtures.alsRequestDetailsDto();
    const proxyIds = ['proxy1', 'proxy2', 'proxy3'];

    const [isOk1, isOk2] = await Promise.all([
      proxyCache.setSendToProxiesList(alsReq, proxyIds, 1),
      proxyCache.setSendToProxiesList(alsReq, proxyIds, 1),
    ]);
    expect(isOk1).not.toBe(isOk2);
  });

  test('should have healthCheck method', async () => {
    const isOk = await proxyCache.healthCheck();
    expect(isOk).toBe(true);
  });
});
