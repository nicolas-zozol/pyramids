import { z } from 'zod';

export interface IntelMetricsInterface {
  /**
   * The name of the metric.
   */
  name: string;

  /**
   * The value of the metric.
   * undefined for a counter metric.
   */
  value?: number;

  /**
   * Optional labels to categorize the metric.
   * it includes component, userTier, and other relevant information.
   */
  labels?: Record<string, string>;

  /**
   * Optional timestamp for the metric.
   */
  timestamp: string;
  timestampNS: number;
  receivedAtNS: number;
}

export const intelMetricsSchema = z.object({
  name: z.string(),
  value: z.number().optional(),
  labels: z.record(z.string()).optional(),
  timestamp: z.string(),
  timestampNS: z.number(),
  receivedAtNS: z.number(),
});

export type IntelMetrics = z.infer<typeof intelMetricsSchema>;
