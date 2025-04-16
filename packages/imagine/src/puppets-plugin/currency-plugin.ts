import { PuppetsPlugin } from './puppets-plugin';
import { ElementHandle } from 'puppeteer';

export class CurrencyPlugin implements PuppetsPlugin<number> {
  async transform(el: ElementHandle<Element>) {
    const textContent = await el.evaluate((element) => element.textContent);
    if (textContent) {
      const match = textContent.match(/[\d,]+(?:\.\d+)?/);
      if (match) {
        return parseFloat(match[0].replace(/,/g, ''));
      }
    }
    return null;
  }
  name = 'currency';
}
