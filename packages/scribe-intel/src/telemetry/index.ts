import { Logger } from './logger.js';
import { Tracer } from './tracer.js';
import type { Span, SpanStatusCode } from '@opentelemetry/api';

export type TelemetryComponentType =
  | 'Component'
  | 'Function'
  | 'API'
  | 'DB'
  | 'Middleware'
  | 'Class';

/**
 * Telemetry - High-level API combining logging and tracing
 *
 * Provides a unified interface for both logging (via Logger) and
 * tracing (via Tracer) to simplify instrumentation throughout the application.
 */
export class Telemetry {
  constructor(
    public component: TelemetryComponentType,
    public name: string,
  ) {}

  // Logging methods
  /**
   * Log an informational message
   * @param message - The main log message
   * @param component - Source component (e.g., "Component: LoginForm")
   * @param data - Optional additional data to include in the log
   */
  log(message: string, data?: Record<string, any>): void {
    Logger.log(message, this.component, data);
  }

  /**
   * Log an error message
   * @param message - The main error message
   * @param component - Source component (e.g., "API: /user/me")
   * @param error - Optional Error object to extract message and stack from
   */
  error(message: string, error?: Error | any): void {
    Logger.error(message, this.component, error);
  }

  /**
   * Log a warning message
   * @param message - The main warning message
   * @param component - Source component (e.g., "Function: validateUser")
   * @param error - Optional Error object to extract message and stack from
   */
  warn(message: string, error?: Error | unknown): void {
    Logger.warn(message, this.component, error);
  }

  /**
   * Log a debug message
   * @param message - The main debug message
   * @param component - Source component (e.g., "Function: validateUser")
   * @param data - Optional additional data to include in the log
   */
  debug(message: string, data?: Record<string, any>): void {
    Logger.debug(message, this.component, data);
  }

  // Tracing methods
  /**
   * Start a new span for tracing an operation
   * @param name - Name of the operation being traced
   * @param options - Optional span options
   * @returns The created span
   */
  startSpan(
    name: string,
    options?: { attributes?: Record<string, any> },
  ): Span {
    return Tracer.startSpan(name, options);
  }

  /**
   * End a span, optionally with a status
   * @param span - The span to end
   * @param status - Optional status to set on the span
   */
  endSpan(
    span: Span,
    status?: { code: SpanStatusCode; message?: string },
  ): void {
    Tracer.endSpan(span, status);
  }

  /**
   * Add an event to a span
   * @param span - The span to add the event to
   * @param name - Name of the event
   * @param attributes - Optional attributes for the event
   */
  addEvent(span: Span, name: string, attributes?: Record<string, any>): void {
    Tracer.addEvent(span, name, attributes);
  }

  /**
   * Set an attribute on a span
   * @param span - The span to set the attribute on
   * @param key - Attribute key
   * @param value - Attribute value
   */
  static setAttribute(span: Span, key: string, value: any): void {
    Tracer.setAttribute(span, key, value);
  }

  /**
   * Record an error on a span
   * @param span - The span to record the error on
   * @param error - The error to record
   */
  static recordError(span: Span, error: Error | unknown): void {
    Tracer.recordError(span, error);
  }

  /**
   * Execute a function within the context of a span
   * @param name - Name of the span
   * @param fn - Function to execute
   * @param options - Optional span options
   * @returns The result of the function
   */
  static async withSpan<T>(
    name: string,
    fn: (span: Span) => Promise<T> | T,
    options?: { attributes?: Record<string, any> },
  ): Promise<T> {
    return Tracer.withSpan(name, fn, options);
  }

  /**
   * Create component identifier for logs
   * @param type - Component type (Component, Function, API, etc.)
   * @param name - Component name
   * @returns Formatted component identifier
   */
  static factory(type: TelemetryComponentType, name: string): Telemetry {
    return new Telemetry(type, name);
  }
}

// Export individual classes for direct access if needed
export { Logger, Tracer };

// Export types
export type { Span };
