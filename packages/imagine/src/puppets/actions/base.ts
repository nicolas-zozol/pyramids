import { Page } from 'puppeteer';
import {
  ActionHandler,
  ActionResult,
  ActionOptions,
  ActionConfig,
} from '../types/actions';
import { BrowserManager } from '../browser';

export abstract class BaseAction implements ActionHandler {
  protected page: Page;
  protected browserManager: BrowserManager;
  protected options: ActionOptions;
  protected config: ActionConfig;

  constructor(
    browserManager: BrowserManager,
    options: ActionOptions,
    config: ActionConfig,
  ) {
    this.browserManager = browserManager;
    this.page = browserManager.getPage();
    this.options = options;
    this.config = config;
  }

  abstract execute(params: string[], options: ActionOptions): Promise<void>;

  protected async handleResult(result: ActionResult): Promise<void> {
    if (result.success) {
      console.log(`✅ ${result.message}`);
      if (result.data) {
        console.log('Data:', result.data);
      }
    } else {
      console.error(`❌ ${result.message}`);
    }
  }

  protected async cleanup(): Promise<void> {
    const shouldKeepOpen = this.options.keepOpen ?? this.config.defaultKeepOpen;
    console.log(shouldKeepOpen);
    if (!shouldKeepOpen) {
      await this.browserManager.close();
    } else {
      console.log('Browser kept open as requested. Press Ctrl+C to close it.');
    }
  }

  toString(): string {
    return `Action: ${this.constructor.name}, Options: ${JSON.stringify(this.options)}, Config: ${JSON.stringify(this.config)}`;
  }
}
