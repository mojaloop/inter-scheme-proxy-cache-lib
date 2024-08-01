import { storageTypeValues } from '../constants';
import { LogLevel, Prettify } from './utils';

export type StorageType = (typeof storageTypeValues)[number];

export type ProcessKeyCallback = (key: string) => Promise<void>;
export interface IProxyCache {
  addDfspIdToProxyMapping: (dfspId: string, proxyId: string) => Promise<boolean>;
  lookupProxyByDfspId: (dfspId: string) => Promise<string | null>;
  removeDfspIdFromProxyMapping: (dfspId: string) => Promise<boolean>;

  /**
   *  _setSendToProxiesList_ should be called if there's no party's DFSP from Oracle GET /participant/{ID} request,
   *    before sending discovery calls to all available proxies.
   */
  setSendToProxiesList: (alsRequest: AlsRequestDetails, proxyIds: string[], ttlSec: number) => Promise<boolean>;
  receivedSuccessResponse: (alsRequest: AlsRequestDetails) => Promise<boolean>;

  /**
   *  _receivedErrorResponse_ returns `true` if the last failed response is detected. In that case Parties error callback should be sent.
   */
  receivedErrorResponse: (alsRequest: AlsRequestDetails, proxyId: string) => Promise<IsLastFailure>;

  processExpiredAlsKeys: (callbackFn: ProcessKeyCallback, batchSize: number) => Promise<unknown>;

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
// todo: think about making proxyConfig optional, and assemble it using env vars if it wasn't passed

export type ProxyCacheConfig = RedisProxyCacheConfig | RedisClusterProxyCacheConfig | MySqlProxyCacheConfig;

export type RedisProxyCacheConfig = Prettify<BasicConnectionConfig & RedisOptions>;

export type RedisClusterProxyCacheConfig = Prettify<RedisClusterConnectionConfig & RedisClusterOptions>;

export type RedisClusterConnectionConfig = {
  cluster: BasicConnectionConfig[];
};

export type RedisOptions = {
  username?: string;
  password?: string;
  /** @defaultValue `true` */
  lazyConnect?: boolean;
  db?: number; // Defaults to 0
  // define all needed options here
};
 
export type RedisClusterOptions = RedisOptions;

/** **(!)**  _MySqlProxyCacheConfig_ is not supported yet */
// prettier-ignore
export type MySqlProxyCacheConfig = Prettify<BasicConnectionConfig & {
  database: string;
  user?: string;
  password?: string;
  // todo: add mySql-specific options
}>;

export type BasicConnectionConfig = {
  host: string;
  port: number;
};

export type LibConfig = {
  logLevel: LogLevel;
  /** @defaultValue `30sec` */
  defaultTtlSec: number;
};
