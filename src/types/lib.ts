import { storageTypeValues } from '../constants';
import { LogMethods, LogContext, LogLevel } from './utils';

export type StorageType = (typeof storageTypeValues)[number];

export interface IProxyCache {
  addDfspIdToProxyMapping: (dfspId: string, proxyId: string) => Promise<boolean>;
  lookupProxyByDfspId: (dfspId: string) => Promise<string | null>;
  removeDfspIdFromProxyMapping: (dfspId: string) => Promise<boolean>;

  setSendToProxiesList: (alsRequest: AlsRequestDetails, proxyIds: string[], ttlSec: number) => Promise<boolean>;
  receivedSuccessResponse: (alsRequest: AlsRequestDetails) => Promise<boolean>;
  receivedErrorResponse: (alsRequest: AlsRequestDetails, proxyId: string) => Promise<IsLastFailure>;
  // if (IsLastFailure === true) - send error callback to source/type/id

  connect: () => Promise<boolean>;
  disconnect: () => Promise<boolean>;
  healthCheck: () => Promise<boolean>;
  isConnected: boolean;
}

export type PartyIdType = string; // todo: use enum for this type

export type AlsRequestDetails = {
  sourceId: string;
  type: PartyIdType;
  partyId: string;
};

export type IsLastFailure = boolean;

export type ProxyCacheFactory = (type: StorageType, proxyConfig: ProxyCacheConfig) => IProxyCache;
// todo: thin about making proxyConfig optional, and assemble it using env vars if it wasn't passed

export type ProxyCacheConfig = RedisProxyCacheConfig | MySqlProxyCacheConfig;
// think, if it's better to rename to ProxyCacheOptions

export type RedisProxyCacheConfig = BasicProxyCacheConfig & {
  host: string;
  port: number;
  username?: string;
  password?: string;
  lazyConnect?: boolean; // Defaults to false
  // db: number; // Defaults to 0
  // tls?: ConnectionOptions
  // todo: define all needed options
};

export type MySqlProxyCacheConfig = BasicProxyCacheConfig & {
  connection: string;
  // todo: add mySql-specific options
};

export type BasicProxyCacheConfig = {
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
