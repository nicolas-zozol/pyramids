import { ElementHandle } from 'puppeteer';

export interface PuppetsPlugin<T> {
  transform: (el: ElementHandle<Element>, args?: string[]) => Promise<T | null>;
  name: string;
}

export type PuppetsPluginModule = {
  default: PuppetsPlugin<any> & { name: string };
};
