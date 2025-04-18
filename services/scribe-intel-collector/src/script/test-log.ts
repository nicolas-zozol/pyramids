import axios from 'axios';
import { IntelLog } from '@robusta/scribe-intel';

export async function testLog() {
  const now = new Date();
  const timestampNS = BigInt(now.getTime()) * BigInt(1000000); // Convert to nanoseconds

  const testLog: IntelLog = {
    timestamp: now.toISOString(),
    timestampNS: Number(timestampNS), // Convert BigInt to number for JSON
    receivedAtNS: Number(timestampNS),
    level: 'info',
    message: 'Test log message from script',
    component: 'test-script',
    labels: {
      environment: 'development',
      service: 'scribe-intel-collector',
      test: 'true',
    },
    data: {
      runAt: now.toISOString(),
      testId: Math.random().toString(36).slice(2),
      someValue: 42,
    },
  };

  try {
    const response = await axios.post(
      'http://localhost:6000/api/logs',
      testLog,
    );
    console.info('Log sent successfully:', response.data);

    // Also test the health endpoint
    const health = await axios.get('http://localhost:6000/api/health');
    console.info('Health check response:', health.data);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Failed to send log:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });
    } else {
      console.error('Unexpected error:', error);
    }
  }
}

// Execute the test if this file is run directly
if (process.argv[1] === import.meta.url) {
  testLog().catch(console.error);
}
