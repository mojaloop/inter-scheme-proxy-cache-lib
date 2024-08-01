import Redis, { Cluster } from 'ioredis';

import * as validation from '../../validation';
import config from '../../config';
import { createLogger } from '../../utils';
import {
  IProxyCache,
  RedisProxyCacheConfig,
  RedisClusterProxyCacheConfig,
  IsLastFailure,
  AlsRequestDetails,
  ILogger,
} from '../../types';
import { REDIS_KEYS_PREFIXES, REDIS_SUCCESS, REDIS_IS_CONNECTED_STATUSES } from './constants';

type RedisClient = Redis | Cluster;
type RedisConfig = RedisProxyCacheConfig | RedisClusterProxyCacheConfig;

const isClusterConfig = (config: RedisConfig): config is RedisClusterProxyCacheConfig => 'cluster' in config;

export class RedisProxyCache implements IProxyCache {
  private readonly redisClient: RedisClient;
  private readonly log: ILogger;
  private readonly defaultTtlSec = config.get('defaultTtlSec');

  constructor(private readonly proxyConfig: RedisConfig) {
    this.log = createLogger(this.constructor.name);
    this.redisClient = this.createRedisClient();
  }

  async addDfspIdToProxyMapping(dfspId: string, proxyId: string): Promise<boolean> {
    const key = RedisProxyCache.formatDfspCacheKey(dfspId);
    const response = await this.redisClient.set(key, proxyId);
    const isAdded = response === REDIS_SUCCESS;
    this.log.debug('proxyMapping is added', { key, proxyId, isAdded });
    return isAdded;
  }

  async lookupProxyByDfspId(dfspId: string): Promise<string | null> {
    const key = RedisProxyCache.formatDfspCacheKey(dfspId);
    const proxyId = await this.redisClient.get(key);
    this.log.debug('lookupProxyByDfspId is done', { key, proxyId });
    return proxyId;
  }

  async removeDfspIdFromProxyMapping(dfspId: string): Promise<boolean> {
    const key = RedisProxyCache.formatDfspCacheKey(dfspId);
    const result = await this.redisClient.del(key);
    const isRemoved = result === 1;
    this.log.debug('proxyMapping is removed', { key, isRemoved, result });
    return isRemoved;
  }

  async setSendToProxiesList(alsReq: AlsRequestDetails, proxyIds: string[], ttlSec: number): Promise<boolean> {
    const key = RedisProxyCache.formatAlsCacheKey(alsReq);

    const isExists = await this.redisClient.exists(key);
    if (isExists) {
      this.log.warn('sendToProxiesList already exists', { key });
      return false;
    }

    const uniqueProxyIds = [...new Set(proxyIds)];
    const ttl = ttlSec ?? this.defaultTtlSec;
    const [addedCount] = await this.executePipeline([
      ['sadd', key, uniqueProxyIds],
      ['expire', key, ttl],
    ]);
    const isOk = addedCount === uniqueProxyIds.length;
    this.log.verbose('setSendToProxiesList is done', { isOk, key, uniqueProxyIds, ttl });
    return isOk;
  }

  async receivedSuccessResponse(alsReq: AlsRequestDetails): Promise<boolean> {
    const key = RedisProxyCache.formatAlsCacheKey(alsReq);
    const delResult = await this.redisClient.del(key);
    const isDeleted = delResult === 1;
    this.log.debug('sendToProxiesList is deleted', { isDeleted, delResult });
    return isDeleted;
  }

  async receivedErrorResponse(alsReq: AlsRequestDetails, proxyId: string): Promise<IsLastFailure> {
    const key = RedisProxyCache.formatAlsCacheKey(alsReq);

    const [delCount, card] = await this.executePipeline([
      ['srem', key, proxyId],
      ['scard', key],
    ]);
    const isLast = delCount === 1 && card === 0;

    this.log.info('receivedErrorResponse is done', { isLast, alsReq, delCount, card });
    return isLast;
  }

  async connect(): Promise<boolean> {
    if (this.isConnected) {
      this.log.warn('proxyCache is already connected');
      return true;
    }
    await this.redisClient.connect();
    const { status } = this.redisClient;
    this.log.verbose('proxyCache is connected', { status });
    return true;
  }

  async disconnect(): Promise<boolean> {
    const response = await this.redisClient.quit();
    const isDisconnected = response === REDIS_SUCCESS;
    this.redisClient.removeAllListeners();
    this.log.info('proxyCache is disconnected', { isDisconnected, response });
    return isDisconnected;
  }

  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.redisClient.ping();
      const isHealthy = response === 'PONG';
      this.log.debug('healthCheck ping response', { isHealthy, response });
      return isHealthy;
    } catch (err: unknown) {
      this.log.warn('healthCheck error', err);
      return false;
    }
  }

  get isConnected(): boolean {
    const isConnected = REDIS_IS_CONNECTED_STATUSES.includes(this.redisClient.status);
    this.log.debug('isConnected', { isConnected });
    return isConnected;
  }

  private createRedisClient() {
    this.proxyConfig.lazyConnect ??= true;
    // prettier-ignore
    const redisClient = isClusterConfig(this.proxyConfig)
      ? new Cluster(this.proxyConfig.cluster, this.proxyConfig)
      : new Redis(this.proxyConfig);

    this.addEventListeners(redisClient);
    return redisClient;
  }

  private addEventListeners(redisClient: RedisClient) {
    const { log } = this;
    // prettier-ignore
    redisClient
      .on('error', (err) => { log.error('redis connection error', err); })
      .on('close', () => { log.info('redis connection closed'); })
      .on('end', () => { log.warn('redis connection ended'); })
      .on('reconnecting', (ms: number) => { log.info('redis connection reconnecting', { ms }); })
      .on('connect', () => { log.verbose('redis connection is established'); })
      .on('ready', () => { log.verbose('redis connection is ready'); });
  }

  private async executePipeline(commands: [string, ...any[]][]): Promise<unknown[]> {
    const pipeline = this.redisClient.pipeline();

    commands.forEach(([command, ...args]) => {
      // @ts-expect-error TS7052: Element implicitly has an any type because type ChainableCommander has no index signature
      if (typeof pipeline[command] === 'function') pipeline[command](...args);
      else this.log.warn('unknown redis command', { command, args });
    });

    try {
      const results = await pipeline.exec();
      if (!results) {
        throw new Error('no pipeline results');
      }
      return results.map((result, index) => {
        if (result[0]) {
          const errMessage = `error in command ${index + 1}: ${result[0].message}`;
          this.log.warn(errMessage, result[0]);
          // todo: think, if we need to "undo" successful commands, if they finished before the error
          throw new Error(errMessage);
        }
        return result[1];
      });
    } catch (error: unknown) {
      this.log.error('pipeline execution failed', error);
      return [];
    }
  }

  static formatAlsCacheKey(alsReq: AlsRequestDetails): string {
    validation.validateAlsRequestDetails(alsReq);
    return `${REDIS_KEYS_PREFIXES.als}:${alsReq.sourceId}:${alsReq.type}:${alsReq.partyId}`;
  }

  static formatDfspCacheKey(dfspId: string): string {
    validation.validateDfspId(dfspId);
    return `${REDIS_KEYS_PREFIXES.dfsp}:${dfspId}`;
  }
}
