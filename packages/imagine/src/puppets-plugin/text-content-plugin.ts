import { ElementHandle } from 'puppeteer';
import { PuppetsPlugin } from './puppets-plugin.js';

export class TextContentPuppetsPlugin implements PuppetsPlugin<string> {
  async transform(el: ElementHandle<Element>) {
    const textContent = await el.evaluate((element) => element.textContent);
    return textContent || null;
  }
  name = 'textContent';
}
