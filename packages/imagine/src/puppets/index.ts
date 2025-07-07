import { BrowserManager } from './browser';
import { ActionFactory } from './actions/factory';
import { Action, ActionOptions } from './types/actions';

function parseArgs(args: string[]): {
  action: Action;
  params: string[];
  options: ActionOptions;
} {
  const keepOpenIndex = args.indexOf('--keep-open');
  const keepOpen = keepOpenIndex !== -1;

  // Remove the --keep-open flag if present
  const filteredArgs = keepOpen
    ? args.filter((_, i) => i !== keepOpenIndex)
    : args;

  if (filteredArgs.length === 0) {
    console.log('Usage: yarn puppets <action> [params...] [--keep-open]');
    console.log('\nAvailable actions:');
    console.log(
      '  search <term1> [term2] ... - Search Google for terms (closes by default)',
    );
    console.log('  open <url> - Open a website (stays open by default)');
    console.log('\nOptions:');
    console.log('  --keep-open - Override the default behavior for the action');
    process.exit(1);
  }

  const [actionName, ...params] = filteredArgs;
  const action = actionName as Action;

  return {
    action,
    params,
    options: { keepOpen },
  };
}

async function main() {
  const { action, params, options } = parseArgs(process.argv.slice(2));

  const browserManager = new BrowserManager();
  const factory = new ActionFactory(browserManager);

  try {
    await browserManager.launch();
    const actionHandler = factory.createAction(action, options);
    console.log({ action, params, options }, actionHandler.toString());
    await actionHandler.execute(params, options);
    //await browserManager.close();
  } catch (error) {
    console.error('An error occurred:', error);
    // Only close if explicitly requested
    if (options.keepOpen === false) {
      await browserManager.close();
    }
  }
}

main().catch(console.error);
