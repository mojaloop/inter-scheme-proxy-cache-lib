import { RedisProxyCacheConfig, AlsRequestDetails } from '#src/types';

export const redisProxyConfigDto = ({
  cluster = [{ host: '127.0.0.1', port: 16379 }],
  lazyConnect = true,
} = {}): RedisProxyCacheConfig => ({
  cluster,
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
