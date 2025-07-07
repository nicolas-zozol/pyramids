import { createIntelInstance } from './intent.js';
import { intent, withIntent } from './intent-decorator.js';

export function testIntentFlow() {
  console.log('--- Manual Intent Flow ---');
  const intel = createIntelInstance('http://localhost:6000/api');
  const intentInstance = intel.createIntent('manualTest');

  intentInstance.start('easy going', { key: 'value' });
  intentInstance.continue('still going', { key2: 'value2' });
  const subIntent = intentInstance.sub('subTask');
  subIntent.start();
  subIntent.end();
  intentInstance.fail('manual fail');
  const tata = intentInstance.sub('tata');
  tata.cancel('manual cancel');
  console.log('--- End Manual Intent Flow ---');
}

class MyService {
  @intent('decoratedServiceMethod')
  async doSomething(waitFor: number, shouldFail: boolean = false) {
    console.log('  [Decorated Method] doing something...');
    await new Promise((resolve) => setTimeout(resolve, waitFor));
    if (shouldFail) {
      console.log('  [Decorated Method] throwing error!');
      throw new Error('Intentional failure in decorated method');
    }
    console.log('  [Decorated Method] done.');
    return 'Success value';
  }
}

async function testDecorator() {
  console.log('\n--- Decorator Test ---');
  createIntelInstance('http://localhost:6000/api');
  
  const service = new MyService();
  
  console.log('Calling decorated method (success)...');
  await service.doSomething(500);

  console.log('\nCalling decorated method (failure)...');
  try {
    await service.doSomething(300, true);
  } catch (e: any) {
    console.log('Caught expected error from decorated method:', e.message);
  }
  console.log('--- End Decorator Test ---');
}

async function originalTestFunction(shouldFail: boolean) {
  console.log('  [Original HOF Function] doing something...');
  await new Promise((resolve) => setTimeout(resolve, 400));
  if (shouldFail) {
      console.log('  [Original HOF Function] throwing error!');
      throw new Error('Intentional failure in HOF function');
  }
  console.log('  [Original HOF Function] done.');
}

const testFunctionWithIntent = withIntent('testHOFunction', originalTestFunction);

async function testHOF() {
    console.log('\n--- Higher-Order Function Test ---');
    console.log('Calling HOF wrapped function (success)...');
    await testFunctionWithIntent(false);

    console.log('\nCalling HOF wrapped function (failure)...');
    try {
        await testFunctionWithIntent(true);
    } catch (e: any) {
        console.log('Caught expected error from HOF wrapped function:', e.message);
    }
    console.log('--- End Higher-Order Function Test ---');
}

async function runAll() {
    testIntentFlow();
    await testDecorator();
    await testHOF();
}

runAll();