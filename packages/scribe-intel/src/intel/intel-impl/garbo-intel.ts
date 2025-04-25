import {
  EmptyIntent,
  getIntelInstance,
  IntelInterface,
  IntentInterface,
  IntentSender,
  MetricRecord,
  MetricValue,
  setMainIntelInstance,
} from '../intent.js';

export class GarboIntent extends EmptyIntent implements IntentInterface {
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
    return new GarboIntent(hierarchicalName, this.sender) as this;
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

  cancel(
    valueOrComment?: MetricValue | undefined,
    data?: MetricRecord | undefined,
  ): void {
    console.log('CancelIntent:', this.getName(), valueOrComment, data);
    // TODO: Replace with this.sender.send({...})
  }

  fail(
    valueOrComment?: MetricValue | undefined,
    data?: MetricRecord | undefined,
  ): void {
    console.log('FailIntent:', this.getName(), valueOrComment, data);
    // TODO: Replace with this.sender.send({...})
  }
}

/**
 * Juan Pujol Garcia aka Garbo is one of the main agent of Fortitude operation
 */
export class GarboIntelClient implements IntelInterface {
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
    return new GarboIntent(name, this.sender);
  }

  createIntent(name: string): IntentInterface {
    // Linter Error: Expected 2 arguments, but got 1. - Needs name!
    // This implementation fulfills the IntelInterface requirement
    return new GarboIntent(name, this.sender);
  }

  getSender(): IntentSender {
    return this.sender;
  }
}

// Replace EasyIntelFactory class with a setup function
export function createIntelInstance(collectorUrl: string): IntelInterface {
  if (getIntelInstance()) {
    console.warn(
      'Intel instance already created. Nevertheless creating and setting a new instance.',
    );
  }

  const sender: IntentSender = {
    send: async (payload: any) => {
      // Accept a generic payload
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
            { url: collectorUrl, body: responseBody },
          );
        }
        // Optionally log success for debugging
        // else { console.log('Intel Send Success', payload); }
      } catch (error) {
        // Catch network errors or issues with fetch itself
        console.error('Intel Send Network Error:', {
          url: collectorUrl,
          error,
        });
      }
    },
  };

  const garboIntelInstance = new GarboIntelClient(sender);
  setMainIntelInstance(garboIntelInstance);
  return garboIntelInstance;
}
