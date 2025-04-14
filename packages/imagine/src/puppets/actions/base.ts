import { Page } from 'puppeteer';
import { ActionHandler, ActionResult } from '../types/actions';
import { BrowserManager } from '../browser';

export abstract class BaseAction implements ActionHandler {
    protected page: Page;
    protected browserManager: BrowserManager;

    constructor(browserManager: BrowserManager) {
        this.browserManager = browserManager;
        this.page = browserManager.getPage();
    }

    abstract execute(params: string[]): Promise<void>;

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
} 