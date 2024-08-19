import { randomUUID } from 'node:crypto';
import { RedisProxyCacheConfig, RedisClusterProxyCacheConfig, AlsRequestDetails } from '#src/types';

export const redisProxyConfigDto = ({
  host = '127.0.0.1',
  port = 26379,
  lazyConnect = true,
  mapping = { 'dfsp-1': 'proxy-1' },
} = {}): RedisProxyCacheConfig => ({
  host,
  port,
  lazyConnect,
  mapping,
});

export const redisClusterProxyConfigDto = ({
  cluster = [{ host: '127.0.0.1', port: 56379 }],
  lazyConnect = true,
  mapping = { 'dfsp-1': 'proxy-1' },
} = {}): RedisClusterProxyCacheConfig => ({
  cluster,
  lazyConnect,
  mapping,
});

export const alsRequestDetailsDto = ({
  sourceId = `test-source-${Date.now()}`,
  type = 'MSISDN', // use enum for type
  partyId = `party-${randomUUID()}`,
} = {}): AlsRequestDetails => ({
  sourceId,
  type,
  partyId,
});
