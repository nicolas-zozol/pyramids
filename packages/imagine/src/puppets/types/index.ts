export interface BrowserConfig {
    headless: boolean;
    defaultViewport: {
        width: number;
        height: number;
    };
    args: string[];
}

export interface SearchResult {
    query: string;
    suggestions: string[];
    timestamp: Date;
}

export interface GoogleSelectors {
    searchInput: string;
    cookieConsent: {
        acceptButton: string;
        rejectButton: string;
    };
    suggestions: {
        container: string;
        items: string;
    };
}

export interface Config {
    baseUrl: string;
    selectors: GoogleSelectors;
    delays: {
        betweenQueries: number; // in milliseconds
        afterCookieConsent: number;
        afterTyping: number;
    };
} 