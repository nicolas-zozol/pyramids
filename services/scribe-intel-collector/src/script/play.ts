import { testLog } from './test-log.js';
import { testMetrics } from './test-metrics.js';

const NUM_REQUESTS = 5; // Control how many logs/metrics to send
const DELAY_MS = 100; // Delay between requests in milliseconds

const sendMetrics = true;
async function runTests() {
  console.log(
    `Starting tests: Sending ${NUM_REQUESTS} logs and ${NUM_REQUESTS} metrics...\n`,
  );

  // --- Test Logs ---
  console.log('--- Sending Logs ---');
  for (let i = 0; i < NUM_REQUESTS; i++) {
    await testLog(i);
    await new Promise((resolve) => setTimeout(resolve, DELAY_MS)); // Add delay
  }
  console.log('--- Finished Sending Logs ---\n');

  // --- Test Metrics ---
  if (sendMetrics) {
    console.log('--- Sending Metrics ---');
    for (let i = 0; i < NUM_REQUESTS; i++) {
      await testMetrics(i);
      await new Promise((resolve) => setTimeout(resolve, DELAY_MS)); // Add delay
    }
    console.log('--- Finished Sending Metrics ---');
  }

  console.log('\nAll tests completed.');
}

runTests().catch(console.error);
