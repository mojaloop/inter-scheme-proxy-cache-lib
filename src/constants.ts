export const STORAGE_TYPES = {
  redis: 'redis',
  mysql: 'mysql',
} as const;

export const storageTypeValues = Object.values(STORAGE_TYPES);

export const ERROR_MESSAGES = {
  unsupportedProxyCacheType: `Unsupported proxyCache type [possible values: ${storageTypeValues.join(', ')}]`,
  invalidFormat: 'Invalid format',
  // add all needed error messages
} as const;
