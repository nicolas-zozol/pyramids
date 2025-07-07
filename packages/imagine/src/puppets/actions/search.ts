import { Page } from 'puppeteer';
import { config } from '../config';
import { sleep } from '../utils/delay';
import { SearchResult } from '../types';
import { BaseAction } from './base';
import { CookieHandler } from './cookies';
import { ActionOptions, ActionConfig } from '../types/actions';
import { BrowserManager } from '../browser/index.js';

export class SearchAction extends BaseAction {
  private cookieHandler: CookieHandler;
  private searchHandler: SearchHandler;

  constructor(
    browserManager: BrowserManager,
    options: ActionOptions,
    config: ActionConfig,
  ) {
    super(browserManager, options, config);
    this.cookieHandler = new CookieHandler(this.page);
    this.searchHandler = new SearchHandler(this.page);
  }

  async execute(params: string[], options: ActionOptions): Promise<void> {
    if (params.length === 0) {
      await this.handleResult({
        success: false,
        message: 'No search terms provided',
      });
      return;
    }

    try {
      // Navigate to Google if not already there
      const currentUrl = this.page.url();
      if (!currentUrl.includes('google.com')) {
        await this.browserManager.navigateTo(config.baseUrl);
        await this.cookieHandler.handleCookieConsent('accept');
      }

      // Process each search term
      for (const query of params) {
        console.log(`\n🔍 Processing query: "${query}"`);

        const result = await this.searchHandler.performSearch(query);
        await this.handleResult({
          success: true,
          message: `Found ${result.suggestions.length} suggestions for "${query}"`,
          data: result.suggestions,
        });

        await sleep(config.delays.betweenQueries);
      }
    } catch (error) {
      await this.handleResult({
        success: false,
        message: `Error performing search: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    } finally {
      await this.cleanup();
    }
  }
}

export class SearchHandler {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async performSearch(query: string): Promise<SearchResult> {
    try {
      // Wait for and clear the search input
      const searchInput = await this.page.waitForSelector(
        config.selectors.searchInput,
      );
      if (!searchInput) {
        throw new Error('Search input not found');
      }

      // Clear any existing text
      await this.page.evaluate((selector) => {
        const input = document.querySelector(selector) as HTMLTextAreaElement;
        if (input) input.value = '';
      }, config.selectors.searchInput);

      // Type the query
      await searchInput.type(query);
      await sleep(config.delays.afterTyping);

      // Wait for suggestions to appear
      await this.page.waitForSelector(config.selectors.suggestions.container, {
        timeout: 5000,
      });

      // Extract suggestions
      const suggestions = await this.page.evaluate((selector) => {
        const elements = document.querySelectorAll(selector);
        return Array.from(elements)
          .map((el) => el.textContent || '')
          .filter(Boolean);
      }, config.selectors.suggestions.items);

      return {
        query,
        suggestions,
        timestamp: new Date(),
      };
    } catch (error) {
      console.error('Error performing search:', error);
      return {
        query,
        suggestions: [],
        timestamp: new Date(),
      };
    }
  }
}
