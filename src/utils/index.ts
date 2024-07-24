import { loggerFactory } from '@mojaloop/central-services-logger/src/contextLogger';
import { LogContext } from '../types';
import config from '../config';

export const createLogger = (context: LogContext) => {
  const log = loggerFactory(context);
  log.setLevel(config.get('logLevel'));
  return log;
};

export const logger = createLogger('ISPCL'); // global logger
