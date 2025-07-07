import axios from 'axios';
import { IntelMetrics } from '@robusta/scribe-intel/dist/telemetry/metrics/intel-metrics.js';

export async function testMetrics(index: number) {
  const metricName = `user_action_${index % 3}`;
  const userTiers = ['free', 'pro', 'enterprise'];
  const components = ['LandingPage', 'Dashboard', 'Settings'];

  const metric: IntelMetrics = {
    name: metricName,
    labels: {
      component: components[index % components.length],
      userTier: userTiers[index % userTiers.length],
      iteration: index.toString(),
    },
    timestamp: new Date().toISOString(),
    timestampNS: Date.now() * 1000000,
    receivedAtNS: Date.now() * 1000000,
  };

  try {
    const response = await axios.post(
      'http://localhost:6000/api/metrics',
      metric
    );
    console.info(`Metric #${index} (${metricName}) sent successfully:`, response.data);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(`Failed to send metric #${index} (${metricName}):`, {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });
    } else {
      console.error(`Unexpected error sending metric #${index} (${metricName}):`, error);
    }
  }
}

// Execute the test if this file is run directly
if (process.argv[1] === import.meta.url) {
  testMetrics(0).catch(console.error); // Run once with index 0 if run directly
}
