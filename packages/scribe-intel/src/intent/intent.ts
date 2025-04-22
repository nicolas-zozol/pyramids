import * as console from 'node:console';
import { undefined } from 'zod';
import * as console from 'node:console';

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

export class DefaultIntentFactory implements IntelInterface {
  constructor(public sender: IntentSender) {}

  createIntent(): IntentInterface {
    return new Intent(this.sender);
  }

  getSender(): IntentSender {
    return this.sender;
  }
}

export class EasyIntentFactory extends DefaultIntentFactory {
  constructor(public collectorUrl: string) {
    super({
      send: (intent: IntentInterface) => {
        // fetch + collectorUrl
        console.log('Sending intent:', intent);
        // Implement the logic to send the intent to the collector URL
      },
    });
  }
  createIntent(): IntentInterface {
    return new Intent(this.sender);
  }
}
