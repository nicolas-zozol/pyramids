import axios from 'axios';
import { IntelLog } from '@robusta/scribe-intel';

export async function testLog(index: number) {
  const now = new Date();
  const timestampNS = BigInt(now.getTime()) * BigInt(1000000); // Convert to nanoseconds

  const testLog: IntelLog = {
    timestamp: now.toISOString(),
    timestampNS: Number(timestampNS), // Convert BigInt to number for JSON
    receivedAtNS: Number(timestampNS),
    level: 'info',
    message: `Test log message #${index} from script`,
    component: 'test-script',
    labels: {
      environment: 'development',
      service: 'scribe-intel-collector',
      test: 'true',
      iteration: index.toString(),
    },
    data: {
      runAt: now.toISOString(),
      testId: Math.random().toString(36).slice(2),
      someValue: 42 + index,
      iteration: index,
    },
  };

  // --- Send Log ---
  try {
    const response = await axios.post(
      'http://localhost:6000/api/logs', // Reverted back to localhost as 127.0.0.1 didn't fix fetch issue
      testLog,
    );
    console.info(`Log #${index} sent successfully:`, response.data);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(`Failed to send log #${index} or check health:`, {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });
    } else {
      console.error(
        `Unexpected error sending log #${index} or checking health:`,
        error,
      );
    }
  }
}

// Execute the test if this file is run directly
if (process.argv[1] === import.meta.url) {
  testLog(0).catch(console.error); // Run once with index 0 if run directly
}
