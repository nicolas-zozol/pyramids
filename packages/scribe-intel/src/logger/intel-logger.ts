import { z } from 'zod';

export const intelLogSchema = z.object({
  timestamp: z.string(),
  timestampNS: z.number(),
  receivedAtNS: z.number(),
  level: z.string(),
  message: z.string(),
  component: z.string(),
  labels: z.record(z.string()).optional(),
  data: z.record(z.unknown()).optional(),
});

export interface IntelLogger {
  timestamp: string;
  timestampNS: number;
  receivedAtNS: number;
  level: 'INFO' | 'ERROR' | 'WARN' | 'DEBUG';
  message: string;
  component: string;
  labels?: Record<string, string>;
  data?: Record<string, any>;
}
