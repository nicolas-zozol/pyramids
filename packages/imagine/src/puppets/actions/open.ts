import { BaseAction } from './base';
import { ActionResult, ActionOptions, ActionConfig } from '../types/actions';
import { BrowserManager } from '../browser/index.js';

const OPEN_CONFIG: ActionConfig = {
  defaultKeepOpen: true,
  description: 'Open a website in the browser',
};

export class OpenAction extends BaseAction {
  constructor(browserManager: BrowserManager, options: ActionOptions) {
    super(browserManager, options, OPEN_CONFIG);
  }

  async execute(params: string[], options: ActionOptions): Promise<void> {
    if (params.length === 0) {
      await this.handleResult({
        success: false,
        message: 'No URL provided',
      });
      return;
    }

    const url = params[0];
    try {
      await this.browserManager.navigateTo(url);
      await this.handleResult({
        success: true,
        message: `Successfully opened ${url}`,
      });
    } catch (error) {
      await this.handleResult({
        success: false,
        message: `Error opening ${url}: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    } finally {
      await this.cleanup();
    }
  }
}
