import puppeteer, { Browser, Page } from 'puppeteer';
import { browserConfig } from '../config';
import { sleep } from '../utils/delay';

export class BrowserManager {
    private browser: Browser | null = null;
    private page: Page | null = null;

    async launch(): Promise<void> {
        this.browser = await puppeteer.launch(browserConfig);
        this.page = await this.browser.newPage();
        
        // Set a reasonable timeout
        this.page.setDefaultTimeout(10000);
        
        // Set user agent to avoid detection
        await this.page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36');
    }

    async close(): Promise<void> {
        if (this.browser) {
            await this.browser.close();
            this.browser = null;
            this.page = null;
        }
    }

    getPage(): Page {
        if (!this.page) {
            throw new Error('Browser not initialized. Call launch() first.');
        }
        return this.page;
    }

    async navigateTo(url: string): Promise<void> {
        const page = this.getPage();
        await page.goto(url, { waitUntil: 'networkidle0' });
        await sleep(1000); // Wait for page to stabilize
    }
} 