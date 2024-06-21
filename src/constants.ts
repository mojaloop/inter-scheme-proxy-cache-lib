export const STORAGE_TYPE_VALUES = ['redis', 'mysql', 'in-memory'] as const;

export const ERROR_MESSAGES = {
  invalidProxyCacheConfig: 'Invalid proxyCache config object',
  unsupportedProxyCacheType: `Unsupported proxyCache type [possible values: ${Object.values(STORAGE_TYPE_VALUES).join(', ')}]`,
  // add all needed error messages
};
