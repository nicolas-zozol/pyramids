export type MetricValue = string | number | boolean | undefined;
export type MetricRecord = Record<
  string,
  string | number | boolean | undefined
>;

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

export interface IntentFactory {
  createIntel: (sender: IntentSender) => IntelInterface;
}

let mainIntelInstance: IntelInterface | undefined = undefined;

export function setMainIntelInstance(intelInstance: IntelInterface): void {
  if (mainIntelInstance) {
    console.warn(
      'Main Intel instance already set. Overwriting with new instance.',
    );
  }
  mainIntelInstance = intelInstance;
}

export function getIntelInstance(): IntelInterface {
  if (!mainIntelInstance) {
    throw new Error(
      'Intel instance not created. Call createIntelInstance first.',
    );
  }
  return mainIntelInstance;
}
