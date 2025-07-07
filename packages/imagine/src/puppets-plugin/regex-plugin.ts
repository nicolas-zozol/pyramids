import { ElementHandle } from 'puppeteer';
import { z } from 'zod';
import { PuppetsPlugin } from './puppets-plugin.js';

export const RegexPlugin: PuppetsPlugin<string> = {
  name: 'regex',

  async transform(
    el: ElementHandle<Element>,
    args?: string[],
  ): Promise<string | null> {
    const schema = z.tuple([z.string().min(1)]);
    const [pattern] = schema.parse(args ?? []);
    const regex = new RegExp(pattern);

    const text = await el.evaluate((el) => el.textContent ?? '');
    const match = text.match(regex);
    return match ? match[0] : null;
  },
};
