/**
 * OpenTelemetry setup for the application
 *
 * This file initializes OpenTelemetry for the application, setting up
 * the necessary providers, exporters, and instrumentation.
 *
 * Note: This file should be imported early in the application lifecycle,
 * typically in a custom _app.tsx or similar entry point.
 */

// This is a placeholder for the actual OpenTelemetry setup
// To fully implement, you'll need to install the following packages:
// - @opentelemetry/api
// - @opentelemetry/sdk-node
// - @opentelemetry/auto-instrumentations-node
// - @opentelemetry/exporter-trace-otlp-http (or another exporter)

export async function setupTelemetry(): Promise<void> {
  // Skip setup in test environment
  if (process.env.NODE_ENV === 'test') {
    return;
  }
}

// Extend Window interface to include our custom properties
declare global {
  interface Window {
    __mockTelemetrySetup?: boolean;
    __OPENTELEMETRY_API_MOCK?: {
      trace: any;
      context: any;
      SpanStatusCode: {
        OK: string;
        ERROR: string;
      };
    };
  }
}

// For development purposes, provide a mock implementation of OpenTelemetry
// This allows the code to work without the actual dependencies installed
export function setupMockTelemetry(): void {
  if (typeof window !== 'undefined' && !window.__mockTelemetrySetup) {
    // Only set up once
    window.__mockTelemetrySetup = true;

    // Mock the OpenTelemetry API
    const mockSpan = {
      setAttribute: () => {},
      addEvent: () => {},
      setStatus: () => {},
      end: () => {},
      recordException: () => {},
    };

    const mockTracer = {
      startSpan: () => mockSpan,
    };

    const mockTrace = {
      getTracer: () => mockTracer,
    };

    // Add to global scope for development
    if (typeof window !== 'undefined') {
      window.__OPENTELEMETRY_API_MOCK = {
        trace: mockTrace,
        context: {
          active: () => ({}),
          with: (_context: any, fn: Function) => fn(),
        },
        SpanStatusCode: {
          OK: 'OK',
          ERROR: 'ERROR',
        },
      };
    }
  }
}

// Auto-setup mock telemetry in development
if (process.env.NODE_ENV === 'development') {
  setupMockTelemetry();
}
