import { RedisProxyCacheConfig, AlsRequestDetails } from '#src/types';

export const redisProxyConfigDto = ({
  host = 'localhost',
  port = 16379,
  lazyConnect = true,
} = {}): RedisProxyCacheConfig => ({
  host,
  port,
  lazyConnect,
});

export const alsRequestDetailsDto = ({
  sourceId = 'test-source',
  type = 'MSISDN', // todo: use enum for type
  partyId = `${Date.now()}`,
} = {}): AlsRequestDetails => ({
  sourceId,
  type,
  partyId,
});
