import { STORAGE_TYPE_VALUES } from '../constants';
import { LogMethods, LogContext, LogLevel } from './utils';

export type StorageType = (typeof STORAGE_TYPE_VALUES)[number];

export interface IProxyCache {
  getProxyByDfspId: (dfspId: string) => Promise<PoxyDetails | null>
  setProxyByDfspId: (dfspId: string, details: PoxyDetails) => Promise<void>

  setSendToProxiesList: (partyId: string, proxyIds: string[]) => Promise<void>
  removeFromSendToProxiesList: (partyId: string, proxyId: string) => Promise<number | null>
  // todo: define all needed methods with input/output types
}

export type PoxyDetails = {
  url: string;
  // todo: think, if we need any other info
};

export type ProxyCacheFactory = (cacheConfig: ProxyCacheConfig) => IProxyCache;

export type ProxyCacheConfig = RedisProxyCacheConfig | MySqlProxyCacheConfig | InMemoryProxyCacheConfig;
// todo: think, if it's better to rename to ProxyCacheOptions

export type RedisProxyCacheConfig = BasicProxyCacheConfig & {
  connection: string;
};

export type MySqlProxyCacheConfig = BasicProxyCacheConfig & {
  connection: string;
};

export type InMemoryProxyCacheConfig = BasicProxyCacheConfig;

export type BasicProxyCacheConfig = {
  type: StorageType;
  logger?: ILogger;
  jsonMode?: boolean;
};

export type LibConfig = {
  logLevel: LogLevel;
};

export interface ILogger extends LogMethods {
  child(context?: LogContext): ILogger;
}
// maybe, it's better to define it in utils types?
