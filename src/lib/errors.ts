import { ERROR_MESSAGES } from '../constants';

export class ProxyCacheError extends Error {
  constructor(message: string) {
    super(message);
    Error.captureStackTrace(this, this.constructor);
    this.name = this.constructor.name;
  }

  static invalidProxyCacheConfig() {
    return new ProxyCacheError(ERROR_MESSAGES.invalidProxyCacheConfig);
  }

  static unsupportedProxyCacheType() {
    return new ProxyCacheError(ERROR_MESSAGES.unsupportedProxyCacheType);
  }
}
