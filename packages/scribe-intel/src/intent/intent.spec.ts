import { EasyIntentFactory } from './intent.js';

export function testIntentFlow() {
  const intentFactory = new EasyIntentFactory('http://localhost:6000');
  const intent = intentFactory.createIntent();

  intent.start('test', 1, { key: 'value' });
}
