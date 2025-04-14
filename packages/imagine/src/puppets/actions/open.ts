import { BaseAction } from './base';
import { ActionResult } from '../types/actions';

export class OpenAction extends BaseAction {
    async execute(params: string[]): Promise<void> {
        if (params.length === 0) {
            await this.handleResult({
                success: false,
                message: 'No URL provided'
            });
            return;
        }

        const url = params[0];
        try {
            await this.browserManager.navigateTo(url);
            await this.handleResult({
                success: true,
                message: `Successfully opened ${url}`
            });
        } catch (error) {
            await this.handleResult({
                success: false,
                message: `Error opening ${url}: ${error.message}`
            });
        }
    }
} 