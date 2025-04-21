import { MeterProvider } from '@opentelemetry/sdk-metrics';
import { PrometheusExporter } from '@opentelemetry/exporter-prometheus';
import { Meter } from '@opentelemetry/api';

// Get a meter instance
let meter: Meter | undefined = undefined;

export function initPrometheusAdapter() {
  // Initialize Prometheus exporter
  const prometheusExporter = new PrometheusExporter({
    port: 9464,
    endpoint: '/metrics',
  });

  // Creates MeterProvider and installs the exporter as a MetricReader
  const meterProvider = new MeterProvider({
    readers: [prometheusExporter],
  });
  meter = meterProvider.getMeter('scribe-intel');
  console.log('>>> Prometheus adapter initialized');
}

function getMeterInstance(): Meter {
  if (!meter) {
    throw new Error(
      'initPrometheusAdapter must be called before using the meter',
    );
  }
  return meter;
}

/**
 * Record a metric with the given name and labels
 * @param name The name of the metric to record
 * @param labels Key-value pairs of labels to attach to the metric
 */
export function recordMetric(name: string, labels: Record<string, string>) {
  // Get or create a counter for this metric
  const counter = getMeterInstance().createCounter(name, {
    description: `Dynamic metric: ${name}`,
    unit: '1', // Count of occurrences
  });

  // Record the measurement
  counter.add(1, labels);
}
