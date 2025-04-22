import { createIntelInstance } from './intent.js';

export function testIntentFlow() {
  const intel = createIntelInstance('http://localhost:6000');
  const intent = intel.createIntent('test');

  intent.start('easy going', { key: 'value' });
  intent.continue('easy going', { key: 'value' });
  intent.fail();
  const tata = intent.sub('tata');
  tata.cancel();
}
