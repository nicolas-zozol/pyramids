import * as console from 'node:console';
import { undefined } from 'zod';

type MetricValue = string | number | boolean | undefined;
type MetricRecord = Record<string, string | number | boolean | undefined>;

export interface IntelInterface {
  identify: (key: string, user: any, data?: MetricRecord) => void;
  page: (name: string, data?: MetricRecord) => void;
  instantIntent: (
    name: string,
    value?: MetricValue,
    data?: MetricRecord,
  ) => void;
  log(name: string, component: string, data?: MetricRecord): void;
  error(name: string, component: string, data?: MetricRecord): void;
  warning(name: string, component: string, data?: MetricRecord): void;
  createIntent: (name: string) => IntentInterface;
}

interface WebIdentifier {
  identify: (key: string, user: any, data?: MetricRecord) => void;
  page: (name: string, data?: MetricRecord) => void;
}

interface IntelLogger {
  log: (name: string, component: string, data?: MetricRecord) => void;
  error: (name: string, component: string, data?: MetricRecord) => void;
  warning: (name: string, component: string, data?: MetricRecord) => void;
}

export interface IntentInterface {
  getName: () => string;
  start: (valueOrComment?: MetricValue, data?: MetricRecord) => void;
  continue: (valueOrComment?: MetricValue, data?: MetricRecord) => void;
  end: (valueOrComment?: MetricValue, data?: MetricRecord) => void;
  instant: (valueOrComment?: MetricValue, data?: MetricRecord) => void;
  cancel: (valueOrComment?: MetricValue, data?: MetricRecord) => void;
  fail: (valueOrComment?: MetricValue, data?: MetricRecord) => void;
  sub(name: string): this;
}

export abstract class EmptyIntent implements IntentInterface {
  start(value?: MetricValue, data?: MetricRecord): void {
    // No operation
  }

  continue(value?: MetricValue, data?: MetricRecord): void {
    // No operation
  }

  end(value?: MetricValue, data?: MetricRecord): void {
    // No operation
  }
  instant(value?: MetricValue, data?: MetricRecord): void {
    // No operation
  }

  cancel(value?: MetricValue, data?: MetricRecord): void {
    // No operation
  }

  fail(value?: MetricValue, data?: MetricRecord): void {
    // No operation
  }

  abstract getName(): string;

  abstract sub(name: string): this;
}

export interface IntentSender {
  send: (intent: IntentInterface) => void;
}

export class Identifier implements WebIdentifier {
  constructor(public sender: IntentSender) {}

  identify(key: string, user: any, data?: MetricRecord): void {
    console.log('IdentifyIntent:', key, user, data);
  }

  page(name: string, data: MetricRecord | undefined): void {}
}

export class PageIntent extends EmptyIntent implements IntentInterface {
  constructor(public sender: IntentSender) {
    super();
  }

  getName(): string {
    return 'Page';
  }

  sub(name: string): this {
    console.warn('Sub-intents are not typical for PageIntent');
    return this;
  }

  page(name: string, data?: MetricRecord): void {
    console.log('PageIntent:', name, data);
  }
}

export class Intent extends EmptyIntent implements IntentInterface {
  constructor(
    public name: string,
    public sender: IntentSender,
  ) {
    super();
  }

  getName(): string {
    return this.name;
  }

  sub(subName: string): this {
    // Create a new Intent instance with a hierarchical name
    // Note: This creates a *new* instance. If state needs to be shared,
    // this approach might need adjustment.
    const hierarchicalName = `${this.name}.${subName}`;
    // We need to cast to 'this' type, which might be restrictive.
    // Consider if Intent should return IntentInterface or a new Intent.
    return new Intent(hierarchicalName, this.sender) as this;
  }

  start(value?: MetricValue, data?: MetricRecord): void {
    console.log('StartIntent:', this.getName(), value, data);
    // TODO: Replace with this.sender.send({...})
  }

  continue(value?: MetricValue, data?: MetricRecord): void {
    console.log('ContinueIntent:', this.getName(), value, data);
    // TODO: Replace with this.sender.send({...})
  }

  end(value?: MetricValue, data?: MetricRecord): void {
    console.log('EndIntent:', this.getName(), value, data);
    // TODO: Replace with this.sender.send({...})
  }

  instant(value?: MetricValue, data?: MetricRecord): void {
    console.log('InstantIntent:', this.getName(), value, data);
    // TODO: Replace with this.sender.send({...})
  }

  cancel(valueOrComment?: MetricValue | undefined, data?: MetricRecord | undefined): void {
    console.log('CancelIntent:', this.getName(), valueOrComment, data);
    // TODO: Replace with this.sender.send({...})
  }

  fail(valueOrComment?: MetricValue | undefined, data?: MetricRecord | undefined): void {
    console.log('FailIntent:', this.getName(), valueOrComment, data);
    // TODO: Replace with this.sender.send({...})
  }
}

export interface IntentFactory {
  createIntel: (sender: IntentSender) => IntelInterface;
}

export class IntelClient implements IntelInterface {
  constructor(public sender: IntentSender) {}

  identify(key: string, user: any, data?: MetricRecord): void {
    console.log('[IntelClient] Identify:', key, user, data);
    // TODO: Implement sending identify payload via this.sender
  }

  page(name: string, data?: MetricRecord): void {
    console.log('[IntelClient] Page:', name, data);
    // TODO: Implement sending page payload via this.sender
  }

  instantIntent(name: string, value?: MetricValue, data?: MetricRecord): void {
    const intent = this.createIntent(name); // Create an intent instance
    intent.instant(value, data); // Use the intent's instant method which should use the sender
  }

  log(name: string, component: string, data?: MetricRecord): void {
    console.log('[IntelClient] Log:', name, component, data);
    // TODO: Implement sending log payload via this.sender
  }

  error(name: string, component: string, data?: MetricRecord): void {
    console.log('[IntelClient] Error:', name, component, data);
    // TODO: Implement sending error payload via this.sender
  }

  warning(name: string, component: string, data?: MetricRecord): void {
    console.log('[IntelClient] Warning:', name, component, data);
    // TODO: Implement sending warning payload via this.sender
  }

  createIntentInstance(name: string): IntentInterface {
    // Linter Error: Expected 2 arguments, but got 1. - Needs name!
    return new Intent(name, this.sender);
  }

  createIntent(name: string): IntentInterface {
    // Linter Error: Expected 2 arguments, but got 1. - Needs name!
    // This implementation fulfills the IntelInterface requirement
    return new Intent(name, this.sender);
  }

  getSender(): IntentSender {
    return this.sender;
  }
}

// Replace EasyIntelFactory class with a setup function
export function createIntelInstance(collectorUrl: string): IntelInterface {
  const sender: IntentSender = {
    send: async (payload: any) => { // Accept a generic payload
      try {
        // Basic validation
        if (!collectorUrl) {
          console.error('Intel collector URL is not configured.');
          return;
        }
        if (!payload) {
            console.error('Intel payload is empty.');
            return;
        }

        const response = await fetch(collectorUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            // TODO: Add any other necessary headers (e.g., authentication)
          },
          // Ensure payload is always stringified
          body: typeof payload === 'string' ? payload : JSON.stringify(payload),
        });

        if (!response.ok) {
          // Log error but don't throw to avoid crashing the frontend app
          const responseBody = await response.text(); // Read body for context
          console.error(
            `Intel Send Error: ${response.status} ${response.statusText}`,
            { url: collectorUrl, body: responseBody }
          );
        }
        // Optionally log success for debugging
        // else { console.log('Intel Send Success', payload); }

      } catch (error) {
        // Catch network errors or issues with fetch itself
        console.error('Intel Send Network Error:', { url: collectorUrl, error });
      }
    },
  };

  return new IntelClient(sender);
}
