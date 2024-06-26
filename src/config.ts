import convict from 'convict';
import { LibConfig, logLevelValues, logLevelsMap } from './types';

const config = convict<LibConfig>({
  logLevel: {
    doc: 'Log level for the library.',
    format: logLevelValues,
    default: logLevelsMap.warn,
    env: 'LOG_LEVEL_PROXY_CACHE',
  },
});

config.validate({ allowed: 'strict' });

export default config;
