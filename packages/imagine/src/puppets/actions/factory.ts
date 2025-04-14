import { BrowserManager } from '../browser';
import { Action } from '../types/actions';
import { SearchAction } from './search';
import { OpenAction } from './open';
import { BaseAction } from './base';

export class ActionFactory {
    private browserManager: BrowserManager;

    constructor(browserManager: BrowserManager) {
        this.browserManager = browserManager;
    }

    createAction(action: Action): BaseAction {
        switch (action) {
            case 'search':
                return new SearchAction(this.browserManager);
            case 'open':
                return new OpenAction(this.browserManager);
            default:
                throw new Error(`Unknown action: ${action}`);
        }
    }
} 