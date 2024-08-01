import { ERROR_MESSAGES } from '../constants';

export class ProxyCacheError extends Error {
  constructor(message: string) {
    super(message);
    Error.captureStackTrace(this, this.constructor);
    this.name = this.constructor.name;
  }

  static unsupportedProxyCacheType() {
    return new ProxyCacheError(ERROR_MESSAGES.unsupportedProxyCacheType);
  }
}

export class ValidationError extends ProxyCacheError {
  static invalidFormat(details?: string) {
    const erMessage = `${ERROR_MESSAGES.invalidFormat}${details ? ` - ${details}` : ''}`;
    return new ValidationError(erMessage);
  }
}
