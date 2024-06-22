// prettier-ignore
export type Json =
  | string
  | number
  | boolean
  | { [x: string]: Json }
  | Array<Json>;

// todo: import from @mojaloop/central-services-logger
export const logLevelsMap = {
  error: 'error',
  warn: 'warn',
  info: 'info',
  verbose: 'verbose',
  debug: 'debug',
  silly: 'silly',
  audit: 'audit',
  trace: 'trace',
  perf: 'perf',
} as const;
export const logLevelValues = Object.values(logLevelsMap);

export type LogLevel = (typeof logLevelValues)[number];
export type LogContext = Json | string | null;
export type LogMeta = unknown; //  Json | Error | null;

export type LogMethod = (message: string, meta?: LogMeta) => void;
export type LogMethods = {
  [key in LogLevel]: LogMethod;
} & {
  [isKey in `is${Capitalize<LogLevel>}Enabled`]: boolean;
};
