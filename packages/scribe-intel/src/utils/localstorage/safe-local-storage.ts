import { NodeLocalStorage } from './node-local-storage.js';
import { SimpleLocalStorage } from './simple-local-storage.js';

export function getSafeLocalStorage(): SimpleLocalStorage {
  if (typeof window !== 'undefined' && window.localStorage) {
    return window.localStorage;
  }
  return new NodeLocalStorage();
}
