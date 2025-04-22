type MetricValue = string | number | boolean | undefined;
type MetricRecord = Record<string, string | number | boolean | undefined>;

export interface ObserverInterface {
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
  identify(key: string, user: any, data?: MetricRecord): void {
    // No operation
  }

  page(name: string, data?: MetricRecord): void {
    // No operation
  }

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
}

export interface IntentSender {
  send: (intent: IntentInterface) => void;
}

export class IdentifyIntent extends EmptyIntent implements IntentInterface {
  constructor(public sender: IntentSender) {
    super();
  }

  identify(key: string, user: any, data?: MetricRecord): void {
    console.log('IdentifyIntent:', key, user, data);
  }
}

export class PageIntent extends EmptyIntent implements IntentInterface {
  constructor(public sender: IntentSender) {
    super();
  }

  page(name: string, data?: MetricRecord): void {
    console.log('PageIntent:', name, data);
  }
}

export class Intent extends EmptyIntent implements IntentInterface {
  constructor(public sender: IntentSender) {
    super();
  }

  start(value?: MetricValue, data?: MetricRecord): void {
    console.log('StartIntent:', name, value, data);
  }

  continue(value?: MetricValue, data?: MetricRecord): void {
    console.log('ContinueIntent:', name, value, data);
  }

  end(value?: MetricValue, data?: MetricRecord): void {
    console.log('EndIntent:', name, value, data);
  }

  instant(value?: MetricValue, data?: MetricRecord): void {
    console.log('InstantIntent:', name, value, data);
  }
}

export interface IntentFactory {
  createIntent: (sender: IntentSender) => IntentInterface;
}

export class DefaultIntentFactory implements IntentFactory {
  constructor(public sender: IntentSender) {}
  createIntent(sender: IntentSender): IntentInterface {
    return new Intent(sender);
  }
}

export class EasyIntentFactory implements IntentFactory {
  public sender: IntentSender;

  constructor(public collectorUrl: string) {
    this.sender = {
      send: (intent: IntentInterface) => {
        // fetch + collectorUrl
        console.log('Sending intent:', intent);
        // Implement the logic to send the intent to the collector URL
      },
    };
  }
  createIntent(): IntentInterface {
    return new Intent(this.sender);
  }
}
