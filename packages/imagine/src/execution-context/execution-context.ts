/**
 * ExecutionContext represents the shared state and metadata between different tools
 * in the PuppetAI system. It serves as a central data store for:
 * - Extracted data from web pages
 * - Execution metadata and logs
 * - Tool-specific namespaces
 * 
 * @interface ExecutionContext
 * @property {any} data - The main payload containing structured data extracted from web pages
 * @property {Object} meta - Metadata about the execution process
 * @property {string} [meta.tool] - The current tool being used (e.g., 'puppet', 'llm')
 * @property {ActionLog[]} meta.history - Chronological log of all actions performed
 * @property {string[]} meta.errors - List of errors encountered during execution
 * @property {string[]} meta.warnings - List of warnings encountered during execution
 * @property {any} [meta.*] - Additional tool-specific metadata
 * @property {any} [*] - Tool-specific namespaces (e.g., context.puppet)
 */
export interface ExecutionContext {
  data: any; // structured output (extracted info, maps, etc.)
  meta: {
    tool?: string; // e.g. 'puppet', 'llm', etc.
    history: ActionLog[];
    errors: string[];
    warnings: string[];
    [key: string]: any; // extra info
  };
  [key: string]: any; // for tool-specific namespaces (e.g. context.puppet)
}

/**
 * ActionLog represents a single action performed during execution
 * 
 * @interface ActionLog
 * @property {string} action - The type of action performed (e.g., 'click', 'set', 'extract')
 * @property {string} [selector] - The CSS selector used, if applicable
 * @property {any} [value] - The value associated with the action
 * @property {string} timestamp - ISO timestamp of when the action occurred
 * @property {string} [error] - Error message if the action failed
 * 
 * @example
 * // Successful action example
 * {
 *   action: 'set',
 *   selector: '.product-title',
 *   value: 'Smartphone XYZ',
 *   timestamp: '2024-03-15T14:30:00.000Z'
 * }
 * 
 * @example
 * // Failed action example
 * {
 *   action: 'click',
 *   selector: '#submit-button',
 *   timestamp: '2024-03-15T14:31:00.000Z',
 *   error: 'Element not found: #submit-button'
 * }
 * 
 * @example
 * // Data extraction example
 * {
 *   action: 'extract',
 *   selector: '.price@[data-currency]',
 *   value: { amount: 99.99, currency: 'USD' },
 *   timestamp: '2024-03-15T14:32:00.000Z'
 * }
 */
export interface ActionLog {
  action: string;
  selector?: string;
  value?: any;
  timestamp: string;
  error?: string;
}
