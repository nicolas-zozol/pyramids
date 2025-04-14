import { Config, BrowserConfig } from '../types';

export const browserConfig: BrowserConfig = {
    headless: false,
    defaultViewport: {
        width: 1280,
        height: 800
    },
    args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu'
    ]
};

export const config: Config = {
    baseUrl: 'https://www.google.com',
    selectors: {
        searchInput: 'textarea[name="q"]',
        cookieConsent: {
            acceptButton: 'button:has-text("Accept all")',
            rejectButton: 'button:has-text("Reject all")'
        },
        suggestions: {
            container: 'ul[role="listbox"]',
            items: 'ul[role="listbox"] li'
        }
    },
    delays: {
        betweenQueries: 2000, // 2 seconds between queries
        afterCookieConsent: 1000, // 1 second after handling cookies
        afterTyping: 500 // 0.5 seconds after typing
    }
}; 