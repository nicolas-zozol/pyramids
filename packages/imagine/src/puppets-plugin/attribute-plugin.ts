import { ElementHandle } from 'puppeteer';
import { z } from 'zod';
import { PuppetsPlugin } from './puppets-plugin.js';

export const AttributePlugin: PuppetsPlugin<string> = {
  name: 'attr',

  async transform(
    el: ElementHandle<Element>,
    args?: string[],
  ): Promise<string | null> {
    const schema = z.tuple([z.string().min(1)]);
    const [attr] = schema.parse(args ?? []);
    return await el.evaluate((element, attribute) => {
      return element.getAttribute(attribute);
    }, attr);
  },
};
