import { BrowserManager } from './browser';
import { ActionFactory } from './actions/factory';
import { Action } from './types/actions';

async function main() {
    const args = process.argv.slice(2);
    if (args.length === 0) {
        console.log('Usage: yarn puppets <action> [params...]');
        console.log('Available actions:');
        console.log('  search <term1> [term2] ... - Search Google for terms');
        console.log('  open <url> - Open a website');
        process.exit(1);
    }

    const [actionName, ...params] = args;
    const action = actionName as Action;

    const browserManager = new BrowserManager();
    try {
        await browserManager.launch();
        
        const factory = new ActionFactory(browserManager);
        const actionHandler = factory.createAction(action);
        
        await actionHandler.execute(params);
    } catch (error) {
        console.error('An error occurred:', error);
    } finally {
        await browserManager.close();
    }
}

main().catch(console.error); 