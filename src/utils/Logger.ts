import stringify from 'fast-safe-stringify';
import mlLogger from '@mojaloop/central-services-logger';
/*
 Mojaloop Logger has several Typescript errors, coz it exports WinstonLogger type, but implements it badly:
  1. All 'is{Level}Enabled' should be functions (which return boolean), and NOT just boolean.
  2. Impl. has isPerfEnabled/perf, isAuditEnabled/audit, isTraceEnabled/trace methods, which don't exist on WinstonLogger type.
 */
import { ILogger, LogContext, LogMeta, Json, LogLevel, logLevelsMap } from '../types';
import config from '../config';

interface AnyError extends Error {
  code?: string;
  cause?: Error;
}

const makeLogString = (message: string, metaData?: unknown) => {
  return metaData ? `${message} - ${stringify(metaData)}` : message;
};

export const loggerFactory = (context?: LogContext): ILogger => new Logger(context);

export class Logger implements ILogger {
  private readonly mlLogger = mlLogger;
  private readonly context: LogContext;

  constructor(context: LogContext = null) {
    this.context = this.createContext(context);
    this.setLevel(config.get('logLevel'));
  }

  error(message: string, meta?: LogMeta) {
    this.isErrorEnabled && this.mlLogger.error(this.formatLog(message, meta));
  }

  warn(message: string, meta?: LogMeta) {
    this.isWarnEnabled && this.mlLogger.warn(this.formatLog(message, meta));
  }

  info(message: string, meta?: LogMeta) {
    this.isInfoEnabled && this.mlLogger.info(this.formatLog(message, meta));
  }

  verbose(message: string, meta?: LogMeta) {
    this.isVerboseEnabled && this.mlLogger.verbose(this.formatLog(message, meta));
  }

  debug(message: string, meta?: LogMeta) {
    this.isDebugEnabled && this.mlLogger.debug(this.formatLog(message, meta));
  }

  silly(message: string, meta?: LogMeta) {
    this.isSillyEnabled && this.mlLogger.silly(this.formatLog(message, meta));
  }

  audit(message: string, meta?: LogMeta) {
    // @ts-expect-error TS2339: Property audit does not exist on type Logger
    this.isAuditEnabled && this.mlLogger.audit(this.formatLog(message, meta));
  }

  trace(message: string, meta?: LogMeta) {
    // @ts-expect-error TS2339: Property trace does not exist on type Logger
    this.isTraceEnabled && this.mlLogger.trace(this.formatLog(message, meta));
  }

  perf(message: string, meta?: LogMeta) {
    // @ts-expect-error TS2339: Property perf does not exist on type Logger
    this.isPerfEnabled && this.mlLogger.perf(this.formatLog(message, meta));
  }

  child(context: LogContext) {
    const childContext = this.createContext(context);
    return new Logger(Object.assign({}, this.context, childContext));
  }

  protected setLevel(level: LogLevel): void {
    this.mlLogger.level = level;
  }

  private formatLog(message: string, meta: LogMeta): string {
    if (!meta && !this.context) return makeLogString(message);
    // prettier-ignore
    const metaData = meta instanceof Error
      ? Logger.formatError(meta as AnyError)
      : typeof meta === 'object' ? meta : { meta };
    // try to add requestId from req (using AsyncLocalStorage)
    return makeLogString(message, Object.assign({}, metaData, this.context));
  }

  private createContext(context: LogContext): LogContext {
    // prettier-ignore
    return !context
      ? null
      : typeof context === 'object' ? context : { context };
  }

  // the next is{Level}Enabled props are to be able to follow the same logic: log.isDebugEnabled && log.debug(`some log message: ${data}`)
  get isErrorEnabled(): boolean {
    return this.mlLogger.isLevelEnabled(logLevelsMap.error);
  }

  get isWarnEnabled(): boolean {
    return this.mlLogger.isLevelEnabled(logLevelsMap.warn);
  }

  get isInfoEnabled(): boolean {
    return this.mlLogger.isLevelEnabled(logLevelsMap.info);
  }

  get isVerboseEnabled(): boolean {
    return this.mlLogger.isLevelEnabled(logLevelsMap.verbose);
  }

  get isDebugEnabled(): boolean {
    return this.mlLogger.isLevelEnabled(logLevelsMap.debug);
  }

  get isSillyEnabled(): boolean {
    return this.mlLogger.isLevelEnabled(logLevelsMap.silly);
  }

  get isAuditEnabled(): boolean {
    return this.mlLogger.isLevelEnabled(logLevelsMap.audit);
  }

  get isTraceEnabled(): boolean {
    return this.mlLogger.isLevelEnabled(logLevelsMap.trace);
  }

  get isPerfEnabled(): boolean {
    return this.mlLogger.isLevelEnabled(logLevelsMap.perf);
  }

  static formatError(error: AnyError): Json {
    const { message, stack, code, cause } = error;

    return {
      message,
      ...(stack && { stack }),
      ...(code && { code }),
      ...(cause instanceof Error && { cause: Logger.formatError(cause as AnyError) }),
    };
  }
}
