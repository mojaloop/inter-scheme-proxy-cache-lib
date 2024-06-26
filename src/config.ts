import convict from 'convict';
import { LibConfig, logLevelValues, logLevelsMap } from './types';

const config = convict<LibConfig>({
  logLevel: {
    doc: 'Log level for the library.',
    format: logLevelValues,
    default: logLevelsMap.warn,
    env: 'PROXY_CACHE_LOG_LEVEL',
  },

  defaultTtlSec: {
    doc: 'Default cache TTL for sendToProxiesList keys.',
    format: Number,
    default: 30,
    env: 'PROXY_CACHE_DEFAULT_TTL_SEC',
  },
});

config.validate({ allowed: 'strict' });

export default config;
