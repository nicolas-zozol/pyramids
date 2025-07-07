import { Page } from 'puppeteer';
import { config } from '../config';
import { sleep } from '../utils/delay';

export class CookieHandler {
    private page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    async handleCookieConsent(action: 'accept' | 'reject' = 'accept'): Promise<boolean> {
        try {
            const selector = action === 'accept' 
                ? config.selectors.cookieConsent.acceptButton
                : config.selectors.cookieConsent.rejectButton;

            // Wait for the cookie consent button to appear
            const button = await this.page.waitForSelector(selector, { timeout: 5000 });
            
            if (button) {
                await button.click();
                await sleep(config.delays.afterCookieConsent);
                return true;
            }
            
            return false;
        } catch (error) {
            console.log('No cookie consent popup found or already handled');
            return false;
        }
    }
} 