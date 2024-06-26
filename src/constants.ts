export const STORAGE_TYPES = {
  redis: 'redis',
  mysql: 'mysql',
} as const;

export const storageTypeValues = Object.values(STORAGE_TYPES);

export const ERROR_MESSAGES = {
  invalidProxyCacheConfig: 'Invalid proxyCache config object',
  unsupportedProxyCacheType: `Unsupported proxyCache type [possible values: ${storageTypeValues.join(', ')}]`,
  // add all needed error messages
} as const;
