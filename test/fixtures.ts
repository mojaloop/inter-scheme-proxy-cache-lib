import { RedisProxyCacheConfig, RedisClusterProxyCacheConfig, AlsRequestDetails } from '#src/types';
import * as testUtils from '#test/utils';

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
  sourceId = `source-${testUtils.randomIntString()}`,
  type = 'MSISDN', // use enum for type
  partyId = `party-${testUtils.randomIntString()}`,
} = {}): AlsRequestDetails => ({
  sourceId,
  type,
  partyId,
});
