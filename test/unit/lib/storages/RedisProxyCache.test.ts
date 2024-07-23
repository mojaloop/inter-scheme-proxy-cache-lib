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

import { IoRedisMock } from '../../mocks';
jest.mock('ioredis', () => IoRedisMock);

import { createProxyCache, IProxyCache, STORAGE_TYPES } from '#src/index';
import { RedisProxyCache } from '#src/lib/storages';
import { ValidationError } from '#src/lib/errors';

import * as useCases from '#test/useCases';
import * as fixtures from '#test/fixtures';

const redisProxyConfig = fixtures.redisProxyConfigDto();

describe('RedisProxyCache Tests -->', () => {
  const { cluster, ...redisOptions } = redisProxyConfig;
  const redisClient = new IoRedisMock.Cluster(cluster, { redisOptions });

  let proxyCache: IProxyCache;

  beforeEach(async () => {
    proxyCache = createProxyCache(STORAGE_TYPES.redis, redisProxyConfig);
    // prettier-ignore
    await Promise.any([
      proxyCache.connect(),
      redisClient.connect()
    ]);
    expect(proxyCache.isConnected).toBe(true);
  });

  afterEach(async () => {
    // prettier-ignore
    await Promise.all([
      proxyCache?.disconnect(),
      redisClient?.quit(),
    ]);
  });

  describe('Use cases Tests -->', () => {
    test('should add/get/remove dfspId to proxyMapping', async () => {
      const isPassed = await useCases.proxyMappingUseCase(proxyCache);
      expect(isPassed).toBe(true);
    });

    test('should detect final errorCallback response', async () => {
      const isPassed = await useCases.detectFinalErrorCallbackUseCase(proxyCache);
      expect(isPassed).toBe(true);
    });
  });

  describe('setSendToProxiesList Method Tests -->', () => {
    test('should set proxiesList', async () => {
      const alsReq = fixtures.alsRequestDetailsDto();
      const proxyIds = ['proxy1', 'proxy2'];
      const isOk = await proxyCache.setSendToProxiesList(alsReq, proxyIds, 1);
      expect(isOk).toBe(true);
    });

    test('should set the same proxiesList only once', async () => {
      const alsReq = fixtures.alsRequestDetailsDto();
      const proxyIds = ['proxy1', 'proxy2'];
      let isOk = await proxyCache.setSendToProxiesList(alsReq, proxyIds, 1);
      expect(isOk).toBe(true);
      isOk = await proxyCache.setSendToProxiesList(alsReq, proxyIds, 1);
      expect(isOk).toBe(false);
    });

    test('should NOT set another proxiesList for the same ALS request (sourceId/type/partyId)', async () => {
      const alsReq = fixtures.alsRequestDetailsDto();
      const proxyIds = ['proxy1', 'proxy2'];
      let isOk = await proxyCache.setSendToProxiesList(alsReq, proxyIds, 1);
      expect(isOk).toBe(true);
      isOk = await proxyCache.setSendToProxiesList(alsReq, ['proxyA'], 1);
      expect(isOk).toBe(false);
    });

    test('should set proxiesList with proper TTL', async () => {
      const alsReq = fixtures.alsRequestDetailsDto();
      const proxyIds = ['proxy1', 'proxy2'];
      const ttlSec = 1;
      const isOk = await proxyCache.setSendToProxiesList(alsReq, proxyIds, ttlSec);
      expect(isOk).toBe(true);

      const key = RedisProxyCache.formatAlsCacheKey(alsReq);
      let rawExistsResult = await redisClient.exists(key);
      expect(rawExistsResult).toBe(1);

      await new Promise((resolve) => setTimeout(resolve, ttlSec * 1000));

      rawExistsResult = await redisClient.exists(key);
      expect(rawExistsResult).toBe(0);
    });

    test('should throw validation error if alsRequest is invalid', async () => {
      expect(() => {
        RedisProxyCache.formatAlsCacheKey({} as any);
      }).toThrow(ValidationError);
    });
  });

  describe('receivedSuccessResponse Method Tests -->', () => {
    test('should delete sendToProxiesList on receivedSuccessResponse call', async () => {
      const alsReq = fixtures.alsRequestDetailsDto();
      const proxyIds = ['proxy1', 'proxy2'];
      const isOk = await proxyCache.setSendToProxiesList(alsReq, proxyIds, 2);
      expect(isOk).toBe(true);

      const key = RedisProxyCache.formatAlsCacheKey(alsReq);
      let rawExistsResult = await redisClient.exists(key);
      expect(rawExistsResult).toBe(1);

      const isDeleted = await proxyCache.receivedSuccessResponse(alsReq);
      expect(isDeleted).toBe(true);

      rawExistsResult = await redisClient.exists(key);
      expect(rawExistsResult).toBe(0);
    });

    test('should delete sendToProxiesList only once', async () => {
      const alsReq = fixtures.alsRequestDetailsDto();
      await proxyCache.setSendToProxiesList(alsReq, ['proxyX'], 2);

      let isDeleted = await proxyCache.receivedSuccessResponse(alsReq);
      expect(isDeleted).toBe(true);

      isDeleted = await proxyCache.receivedSuccessResponse(alsReq);
      expect(isDeleted).toBe(false);
    });
  });

  describe('addDfspIdToProxyMapping Method Tests -->', () => {
    test('should throw validation error if dfspId is invalid', async () => {
      // prettier-ignore
      await expect(() => proxyCache.addDfspIdToProxyMapping('', 'proxy1'))
        .rejects.toThrow(ValidationError);
    });
  });

  test('should have healthCheck method', async () => {
    const isOk = await proxyCache.healthCheck();
    expect(isOk).toBe(true);
  });
});
