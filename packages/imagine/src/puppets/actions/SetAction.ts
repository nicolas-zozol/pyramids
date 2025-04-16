import { setIn } from '../utils/set-in.js';
import { BaseAction } from './base.js';
import { ExecutionContext } from '../../execution-context/execution-context.js';
import { getPlugin } from '../../puppets-plugin/plugin-store.js'; // helper to deep set into objects

export class SetAction extends BaseAction {
  async execute(params: string[], options: any): Promise<void> {
    const rawSelector = params[0];
    const setKey = options.contextKey ?? 'data'; // fallback if setkey missing
    const context: ExecutionContext = options.context;

    const { selector, pluginName, pluginArgs } =
      this.parseSelector(rawSelector);

    const plugin = getPlugin(pluginName);
    if (!plugin) {
      throw new Error(`Plugin '${pluginName}' not found.`);
    }

    const element = await this.page.$(selector);
    if (!element) {
      const errorLog = {
        action: 'set',
        selector: rawSelector,
        timestamp: new Date().toISOString(),
        error: `Element not found: ${selector}`,
      };
      context.meta.errors.push(errorLog.error);
      context.meta.history.push(errorLog);
      return;
    }

    const value = await plugin.transform(element, pluginArgs);

    setIn(context.data, setKey, value);

    const log = {
      action: 'set',
      selector: rawSelector,
      value,
      timestamp: new Date().toISOString(),
    };

    context.meta.history.push(log);
  }

  private parseSelector(raw: string): {
    selector: string;
    pluginName: string;
    pluginArgs: string[];
  } {
    const match = raw.match(/^(.*?)@(\w+)(?:\[(.*?)\])?$/);
    if (!match) {
      return {
        selector: raw,
        pluginName: 'textContent',
        pluginArgs: [],
      };
    }

    const [, selector, pluginName, rawArgs] = match;
    const pluginArgs = rawArgs ? rawArgs.split(',').map((s) => s.trim()) : [];

    return { selector, pluginName, pluginArgs };
  }
}
