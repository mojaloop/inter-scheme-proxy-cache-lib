import { IoRedisMock } from '../../mocks';
jest.mock('ioredis', () => IoRedisMock);
// jest.mock('ioredis', () => jest.requireActual('ioredis-mock'));
import { createProxyCache, IProxyCache, RedisProxyCacheConfig, STORAGE_TYPES } from '#src/index';
import { RedisProxyCache } from '#src/lib/storages';

import * as useCases from '#test/useCases';
import * as fixtures from '#test/fixtures';

const redisProxyConfig = fixtures.redisProxyConfigDto();

describe('RedisProxyCache Tests -->', () => {
  let proxyCache: IProxyCache;
  let redisClient: IoRedisMock; // to check internal Redis state

  beforeEach(async () => {
    proxyCache = createProxyCache(STORAGE_TYPES.redis, redisProxyConfig);
    redisClient = new IoRedisMock(redisProxyConfig);
    // prettier-ignore
    await Promise.any([
      proxyCache.connect(),
      redisClient.connect(),
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

  test('should have healthCheck method', async () => {
    const isOk = await proxyCache.healthCheck();
    expect(isOk).toBe(true);
  });
});
