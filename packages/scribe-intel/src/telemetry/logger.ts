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

export type IntelLog = z.infer<typeof intelLogSchema>;

/**
 * Logger - Handles structured logging with consistent formatting
 *
 * Provides methods for logging at different levels (INFO, WARN, ERROR, DEBUG)
 * with consistent structure and minimal nesting.
 */
export class Logger {
  /**
   * Log an informational message
   * @param message - The main log message
   * @param component - Source component (e.g., "Component: LoginForm")
   * @param data - Optional additional data to include in the log
   */
  static log(
    message: string,
    component: string,
    data?: Record<string, any>,
  ): void {
    //console.info(message, JSON.stringify({ ...(data && { data }) }));
  }

  /**
   * Log an error message
   * @param message - The main error message
   * @param component - Source component (e.g., "API: /user/me")
   * @param error - Optional Error object to extract message and stack from
   */
  static error(
    message: string,
    component: string,
    error?: Error | unknown,
  ): void {
    console.error(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        level: 'ERROR',
        message,
        component,
        error: error instanceof Error ? error.message : String(error || ''),
        stack: error instanceof Error ? error.stack : undefined,
      }),
    );
  }

  static warn(
    message: string,
    component: string,
    error?: Error | unknown,
  ): void {
    console.warn(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        level: 'WARN',
        message,
        component,
        error: error instanceof Error ? error.message : String(error || ''),
        stack: error instanceof Error ? error.stack : undefined,
      }),
    );
  }

  /**
   * Log a debug message (only shown in development or when debug is enabled)
   * @param message - The main debug message
   * @param component - Source component (e.g., "Function: validateUser")
   * @param data - Optional additional data to include in the log
   */
  static debug(
    message: string,
    component: string,
    data?: Record<string, any>,
  ): void {
    // Only log in development or when debug is enabled
    if (
      process.env.NODE_ENV === 'development' ||
      process.env.DEBUG === 'true'
    ) {
      console.debug(
        JSON.stringify({
          timestamp: new Date().toISOString(),
          level: 'DEBUG',
          message,
          component,
          ...(data && { data: JSON.stringify(data) }),
        }),
      );
    }
  }
}
