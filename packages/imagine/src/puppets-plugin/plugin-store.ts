import { PuppetsPlugin } from './puppets-plugin.js';

const store = new Map<string, PuppetsPlugin<any>>();

export function registerPlugin<T>(name: string, plugin: PuppetsPlugin<T>) {
  store.set(name, plugin);
}

export function getPlugin<T>(name: string): PuppetsPlugin<T> | undefined {
  return store.get(name);
}
