import {
  EmptyIntent,
  getIntelInstance,
  IntelInterface,
  IntentInterface,
  IntentSender,
  MetricRecord,
  MetricValue,
  setMainIntelInstance,
} from '../../intent.js';

export class HoriIntent extends EmptyIntent implements IntentInterface {
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
    return new HoriIntent(hierarchicalName, this.sender) as this;
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
