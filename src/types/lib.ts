import { storageTypeValues } from '../constants';
import { LogMethods, LogContext, LogLevel } from './utils';

export type StorageType = (typeof storageTypeValues)[number];

export interface IProxyCache {
  addDfspIdToProxyMapping: (dfspId: string, details: PoxyDetails) => Promise<boolean>;
  lookupProxyByDfspId: (dfspId: string) => Promise<PoxyDetails | null>;
  removeDfspIdFromProxyMapping: (dfspId: string) => Promise<boolean>;
  // todo: think, if we need this method

  setSendToProxiesList: (partyId: string, proxyIds: string[]) => Promise<void>;
  checkIfLastErrorCallbackFromSendToProxiesList: (partyId: string, proxyId: string) => Promise<boolean>;
  cleanupSendToProxiesList: (partyId: string) => Promise<boolean>; // should be called on successful callback

  checkJwsSignature?: (jws: string) => Promise<boolean>;
  // todo: think, if we need this method in IProxyCache

  connect: () => Promise<boolean>;
  disconnect: () => Promise<boolean>;
  healthCheck: () => Promise<boolean>;
}

export type PoxyDetails = {
  url: string;
  // todo: think, if we need any other info
};

export type ProxyCacheFactory = (cacheConfig: ProxyCacheConfig) => IProxyCache;
// todo: update signature to: (type: StorageType, proxyConfig?: ProxyCacheConfig) => IProxyCache

export type ProxyCacheConfig = RedisProxyCacheConfig | MySqlProxyCacheConfig;
// think, if it's better to rename to ProxyCacheOptions

export type RedisProxyCacheConfig = BasicProxyCacheConfig & {
  connection: string;
  // todo: add redis-specific options
};

export type MySqlProxyCacheConfig = BasicProxyCacheConfig & {
  connection: string;
  // todo: add mySql-specific options
};

export type BasicProxyCacheConfig = {
  type: StorageType;
  logger?: ILogger; // think, if we need to add possibility to provide custom logger impl.
  timeout?: number;
};

export type LibConfig = {
  logLevel: LogLevel;
};

export interface ILogger extends LogMethods {
  child(context?: LogContext): ILogger;
}
// maybe, it's better to define it in utils types?
