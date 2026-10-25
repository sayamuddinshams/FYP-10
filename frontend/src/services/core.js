import api from './api';
import { emit, subscribe, getVersion } from './events';

export class ServiceError extends Error {
  constructor(message, status = 400, errors = null) {
    super(message);
    this.name = 'ServiceError';
    this.status = status;
    this.errors = errors;
  }
}

export function fail(message, status = 400) {
  throw new ServiceError(message, status);
}

/** Optional no-op or micro-delay when needed */
export function delay(ms = 0) {
  if (ms <= 0) return Promise.resolve();
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export { api, emit, subscribe, getVersion };
