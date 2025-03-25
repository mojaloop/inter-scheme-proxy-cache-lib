export const REDIS_KEYS_PREFIXES = {
  als: 'als',
  dfsp: 'dfsp',
  getParties: 'getParties',
} as const;

export const REDIS_SUCCESS = 'OK' as const;

export const REDIS_IS_CONNECTED_STATUSES = ['connect', 'ready'];
