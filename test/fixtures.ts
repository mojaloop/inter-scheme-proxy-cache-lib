import { randomUUID } from 'node:crypto';
import { RedisProxyCacheConfig, RedisClusterProxyCacheConfig, AlsRequestDetails } from '../src/types';

export const redisProxyConfigDto = ({
  host = '127.0.0.1',
  port = 26379,
  lazyConnect = true,
} = {}): RedisProxyCacheConfig => ({
  host,
  port,
  lazyConnect,
});

export const redisClusterProxyConfigDto = ({
  cluster = [{ host: '127.0.0.1', port: 56379 }],
  lazyConnect = true,
} = {}): RedisClusterProxyCacheConfig => ({
  cluster,
  lazyConnect,
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
