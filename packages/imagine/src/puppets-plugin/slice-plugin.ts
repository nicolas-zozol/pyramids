import { ElementHandle } from 'puppeteer';
import { z } from 'zod';
import { PuppetsPlugin } from './puppets-plugin.js';

export const SlicePlugin: PuppetsPlugin<string> = {
  name: 'slice',

  async transform(
    el: ElementHandle<Element>,
    args?: string[],
  ): Promise<string | null> {
    const schema = z.tuple([
      z.string().regex(/^\d+$/),
      z.string().regex(/^\d+$/),
    ]);
    const [startStr, endStr] = schema.parse(args ?? []);
    const start = parseInt(startStr, 10);
    const end = parseInt(endStr, 10);

    const text = await el.evaluate((el) => el.textContent ?? '');
    return text.slice(start, end);
  },
};
