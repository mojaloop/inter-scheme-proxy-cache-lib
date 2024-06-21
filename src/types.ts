import { LogMethods, LogContext, LogLevel } from './utils/types';
import { STORAGE_TYPE_VALUES } from './constants';

export type StorageType = (typeof STORAGE_TYPE_VALUES)[number];

export interface IProxyCache {
  get: (key: string) => Promise<string | null>;
  // todo: define all methods with input/output types
}

export type ProxyCacheConfig = RedisProxyCacheConfig | MySqlProxyCacheConfig | InMemoryProxyCacheConfig;
// todo: think, if it's better to rename to ProxyCacheOptions

export type RedisProxyCacheConfig = BasicProxyCacheConfig & {
  connection: string;
};

export type MySqlProxyCacheConfig = BasicProxyCacheConfig & {
  connection: string;
};

export type InMemoryProxyCacheConfig = BasicProxyCacheConfig & {
  connection: string;
};

export type ProxyCacheFactory = (cacheConfig: ProxyCacheConfig) => IProxyCache;

type BasicProxyCacheConfig = {
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
