import Redis, { Cluster } from 'ioredis';

import * as validation from '../../validation';
import config from '../../config';
import { logger } from '../../utils';
import {
  IProxyCache,
  RedisProxyCacheConfig,
  RedisClusterProxyCacheConfig,
  RedisConnectionStatus,
  IsLastFailure,
  AlsRequestDetails,
  ILogger,
  ProcessExpiryKeyCallback,
  ProcessNodeStreamSingleKeyCallback,
} from '../../types';
import { REDIS_KEYS_PREFIXES, REDIS_SUCCESS, REDIS_IS_CONNECTED_STATUSES } from './constants';

const PROCESS_NODE_STREAM_TIMEOUT_MS = 2 * 60 * 1000; // todo: make configurable

type RedisClient = Redis | Cluster;
type RedisConfig = RedisProxyCacheConfig | RedisClusterProxyCacheConfig;
type ProcessNodeOptions = {
  pattern: string;
  batchSize: number;
  callbackFn: ProcessExpiryKeyCallback;
  resolve: (...args: any[]) => void;
  reject: (reason?: Error) => void;
};

type NodeStreamOptions = {
  pattern: string;
  batchSize: number;
};

const isClusterConfig = (config: RedisConfig, isCluster: boolean): config is RedisClusterProxyCacheConfig => isCluster;

export class RedisProxyCache implements IProxyCache {
  private readonly redisClient: RedisClient;
  private readonly log: ILogger;
  private readonly defaultTtlSec = config.get('defaultTtlSec');
  private isCluster = false;

  constructor(
    private readonly proxyConfig: RedisConfig,
    isCluster: boolean = false,
  ) {
    isClusterConfig(proxyConfig, isCluster);
    this.isCluster = isCluster;
    this.log = logger.child({ component: this.constructor.name });
    this.redisClient = this.createRedisClient();
  }

  protected get redisNodes() {
    // prettier-ignore
    return this.isCluster
      ? (this.redisClient as Cluster).nodes('master')
      : [this.redisClient as Redis];
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

  async removeProxyGetPartiesTimeout(alsReq: AlsRequestDetails, proxyId: string): Promise<boolean> {
    const key = RedisProxyCache.formatProxyGetPartiesExpiryKey(alsReq, proxyId);
    const result = await this.redisClient.del(key);
    this.log.debug('removeProxyGetPartiesTimeout is done', { result, key });
    return result > 0;
  }

  async setProxyGetPartiesTimeout(
    alsReq: AlsRequestDetails,
    proxyId: string,
    ttlSec: number = this.defaultTtlSec,
  ): Promise<boolean> {
    const key = RedisProxyCache.formatProxyGetPartiesExpiryKey(alsReq, proxyId);
    const expiryTime = Date.now() + ttlSec * 1000;
    const result = await this.redisClient.set(key, expiryTime);
    this.log.debug('setProxyGetPartiesTimeout is done', { result, key, expiryTime });
    return result === REDIS_SUCCESS;
  }

  async setSendToProxiesList(alsReq: AlsRequestDetails, proxyIds: string[], ttlSec: number): Promise<boolean> {
    const key = RedisProxyCache.formatAlsCacheKey(alsReq);
    const expiryKey = RedisProxyCache.formatAlsCacheExpiryKey(alsReq);

    const isExists = await this.redisClient.exists(key);
    if (isExists) {
      this.log.warn('sendToProxiesList already exists', { key });
      return false;
    }

    const uniqueProxyIds = [...new Set(proxyIds)];
    const ttl = ttlSec ?? this.defaultTtlSec;
    const expiryTime = Date.now() + ttl * 1000;
    let isOk;
    if (this.isCluster) {
      // pipeline is not supported in cluster mode for multi-key operations
      const [addedCount, expirySetResult] = await Promise.all([
        this.redisClient.sadd(key, uniqueProxyIds),
        this.redisClient.set(expiryKey, expiryTime),
      ]);
      isOk = addedCount === uniqueProxyIds.length && expirySetResult === REDIS_SUCCESS;
    } else {
      const [addedCount] = await this.executePipeline([
        ['sadd', key, ...uniqueProxyIds],
        ['set', expiryKey, expiryTime],
      ]);
      isOk = addedCount === uniqueProxyIds.length;
    }

    this.log.verbose('setSendToProxiesList is done', { isOk, key, uniqueProxyIds, ttl });
    return isOk;
  }

  async receivedSuccessResponse(alsReq: AlsRequestDetails): Promise<boolean> {
    const key = RedisProxyCache.formatAlsCacheKey(alsReq);
    const expiryKey = RedisProxyCache.formatAlsCacheExpiryKey(alsReq);
    let isDeleted;
    let logMeta;
    if (this.isCluster) {
      const [delResult, delExpiryResult] = await Promise.all([
        this.redisClient.del(key),
        this.redisClient.del(expiryKey),
      ]);
      isDeleted = delResult === 1 && delExpiryResult === 1;
      logMeta = { isDeleted, delResult, delExpiryResult };
    } else {
      const delResult = await this.executePipeline([
        ['del', key],
        ['del', expiryKey],
      ]);
      isDeleted = delResult[0] === 1 && delResult[1] === 1;
      logMeta = { isDeleted, delResult };
    }
    this.log.debug('sendToProxiesList is deleted', logMeta);
    return isDeleted;
  }

  async receivedErrorResponse(alsReq: AlsRequestDetails, proxyId: string): Promise<IsLastFailure> {
    const key = RedisProxyCache.formatAlsCacheKey(alsReq);
    const expiryKey = RedisProxyCache.formatAlsCacheExpiryKey(alsReq);

    const [delCount, card] = await this.executePipeline([
      ['srem', key, proxyId],
      ['scard', key],
    ]);

    const isLast = delCount === 1 && card === 0;

    if (isLast) {
      const [delKeyCount, delExpiryCount] = await Promise.all([
        this.redisClient.del(key),
        this.redisClient.del(expiryKey),
      ]);
      this.log.info('receivedErrorResponse: last response received, keys were deleted', {
        isLast,
        delKeyCount,
        delExpiryCount,
      });
    }

    this.log.info('receivedErrorResponse is done', { isLast, alsReq, delCount, card });
    return isLast;
  }

  async isPendingCallback(alsReq: AlsRequestDetails): Promise<boolean> {
    const key = RedisProxyCache.formatAlsCacheKey(alsReq);
    const card = await this.redisClient.scard(key);
    this.log.debug('isPendingCallbacks for alsReq is done', { key, card });
    return card > 0;
  }

  // todo: refactor to use processAllNodesStream
  async processExpiredAlsKeys(callbackFn: ProcessExpiryKeyCallback, batchSize: number): Promise<unknown> {
    const pattern = RedisProxyCache.formatAlsCacheExpiryKey({ sourceId: '*', type: '*', partyId: '*' });

    return Promise.all(
      this.redisNodes.map(async (node) => {
        return new Promise((resolve, reject) => {
          this.processNode(node, { pattern, batchSize, callbackFn, resolve, reject });
        });
      }),
    );
  }

  // prettier-ignore
  async processExpiredProxyGetPartiesKeys(customFn: ProcessNodeStreamSingleKeyCallback, batchSize: number): Promise<unknown> {
    const pattern = RedisProxyCache.formatProxyGetPartiesExpiryKey({ sourceId: '*', type: '*', partyId: '*' }, '*');

    return this.processAllNodesStream({ pattern, batchSize }, async (key: string) => {
      const result = await Promise.all([
        customFn(key.replace(':expiresAt', '')).catch((err) => {
          this.log.warn(`error processing expired proxyGetParties key ${key} - `, err);
          return err; // or is it better to throw here?
        }),
        this.redisClient.del(key),
      ]);
      this.log.verbose('processExpiredProxyGetPartiesKeys is done', { result });
      return result;
    });
  }

  async connect(): Promise<RedisConnectionStatus> {
    if (this.isConnected) {
      const { status } = this.redisClient;
      this.log.warn('proxyCache is already connected', { status });
      return status;
    }
    await this.redisClient.connect();
    const { status } = this.redisClient;
    this.log.info('proxyCache is connected', { status });
    return status;
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
    const redisClient = isClusterConfig(this.proxyConfig, this.isCluster)
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

  /** @deprecated Use processAllNodesStream */
  private async processNode(node: Redis, options: ProcessNodeOptions): Promise<void> {
    const { pattern: match, batchSize: count, callbackFn, resolve, reject } = options;
    const stream = node.scanStream({ match, count });

    stream.on('data', async (keys) => {
      stream.pause();
      try {
        await Promise.all(keys.map((key: string) => this.processExpiryKey(key, callbackFn)));
      } catch (err: unknown) {
        stream.destroy(err as Error);
        reject(err as Error);
      }
      stream.resume();
    });
    stream.on('end', resolve);
  }

  private async processAllNodesStream(options: NodeStreamOptions, callbackFn: ProcessNodeStreamSingleKeyCallback) {
    const result = await Promise.all(
      this.redisNodes.map((node) => this.processSingleNodeStream(node, options, callbackFn)),
    );
    this.log.debug('processAllNodesStream is done', { result });
    return result;
  }

  private async processSingleNodeStream(
    node: Redis,
    options: NodeStreamOptions,
    processKeyFn: ProcessNodeStreamSingleKeyCallback,
  ): Promise<unknown> {
    const { pattern: match, batchSize: count } = options;

    return new Promise((resolve, reject) => {
      const stream = node.scanStream({ match, count });
      let result: unknown;

      let timer: ReturnType<typeof setTimeout> | null = setTimeout(() => {
        const err = new Error(`Timeout during processNodeStream [${PROCESS_NODE_STREAM_TIMEOUT_MS} ms]`);
        stream.destroy(err);
        reject(err);
      }, PROCESS_NODE_STREAM_TIMEOUT_MS);
      const clearTimer = () => {
        if (timer) {
          clearTimeout(timer);
          timer = null;
        }
      };

      stream.on('data', async (keys) => {
        stream.pause();
        try {
          result = await Promise.all(keys.map(processKeyFn));
        } catch (err: unknown) {
          this.log.warn('error in processNodeStream data: ', err);
          clearTimer();
          stream.destroy(err as Error);
          reject(err);
        }
        stream.resume();
      });
      stream.on('end', () => {
        this.log.debug('processNodeStream is done', { result });
        clearTimer();
        resolve(result);
      });
      stream.on('error', (err) => {
        this.log.warn('processNodeStream stream error: ', err);
        clearTimer();
        reject(err);
      });
    });
  }

  private async processExpiryKey(expiryKey: string, callbackFn: ProcessExpiryKeyCallback): Promise<any> {
    const actualKey = expiryKey.replace(':expiresAt', '');
    const expiresAt = await this.redisClient.get(expiryKey);

    if (Number(expiresAt) >= Date.now()) return;

    // prettier-ignore
    const deleteKeys = this.isCluster
      ? () => Promise.all([this.redisClient.del(actualKey), this.redisClient.del(expiryKey)])
      : () => this.executePipeline([['del', actualKey], ['del', expiryKey]]);

    return Promise.all([
      callbackFn(actualKey).catch((err) => {
        this.log.warn(`processExpiryKey callback error ${expiryKey}`, err);
        return Promise.resolve();
      }),
      deleteKeys().catch((err) => {
        this.log.error(`processExpiryKey key deletion error ${expiryKey}`, err);
        return Promise.reject(err);
      }),
    ]);
  }

  static formatAlsCacheKey(alsReq: AlsRequestDetails): string {
    validation.validateAlsRequestDetails(alsReq);
    return `${REDIS_KEYS_PREFIXES.als}:${alsReq.sourceId}:${alsReq.type}:${alsReq.partyId}`;
  }

  static formatAlsCacheExpiryKey(alsReq: AlsRequestDetails): string {
    return `${RedisProxyCache.formatAlsCacheKey(alsReq)}:expiresAt`;
  }

  static formatProxyGetPartiesExpiryKey(alsReq: AlsRequestDetails, proxyId: string): string {
    return `${REDIS_KEYS_PREFIXES.getParties}:${proxyId}:${alsReq.sourceId}:${alsReq.type}:${alsReq.partyId}:expiresAt`;
  }

  static formatDfspCacheKey(dfspId: string): string {
    validation.validateDfspId(dfspId);
    return `${REDIS_KEYS_PREFIXES.dfsp}:${dfspId}`;
  }
}
