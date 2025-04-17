import { trace, context, Span, SpanStatusCode } from '@opentelemetry/api';

/**
 * Tracer - Manages OpenTelemetry spans and trace context
 *
 * Provides methods for creating, managing, and ending spans,
 * as well as attaching events and attributes to spans.
 */
export class Tracer {
  private static readonly TRACER_NAME = 'robusta-telemetry-app';

  /**
   * Start a new span for tracing an operation
   * @param name - Name of the operation being traced
   * @param options - Optional span options
   * @returns The created span
   */
  static startSpan(
    name: string,
    options?: { attributes?: Record<string, any> },
  ): Span {
    const tracer = trace.getTracer(this.TRACER_NAME);
    const span = tracer.startSpan(name);

    // Add attributes if provided
    if (options?.attributes) {
      Object.entries(options.attributes).forEach(([key, value]) => {
        span.setAttribute(key, value);
      });
    }

    return span;
  }

  /**
   * End a span, optionally with a status
   * @param span - The span to end
   * @param status - Optional status to set on the span
   */
  static endSpan(
    span: Span,
    status?: { code: SpanStatusCode; message?: string },
  ): void {
    if (!span) return;

    if (status) {
      span.setStatus(status);
    }

    span.end();
  }

  /**
   * Add an event to a span
   * @param span - The span to add the event to
   * @param name - Name of the event
   * @param attributes - Optional attributes for the event
   */
  static addEvent(
    span: Span,
    name: string,
    attributes?: Record<string, any>,
  ): void {
    if (!span) return;

    span.addEvent(name, attributes);
  }

  /**
   * Set an attribute on a span
   * @param span - The span to set the attribute on
   * @param key - Attribute key
   * @param value - Attribute value
   */
  static setAttribute(span: Span, key: string, value: any): void {
    if (!span) return;

    span.setAttribute(key, value);
  }

  /**
   * Record an error on a span
   * @param span - The span to record the error on
   * @param error - The error to record
   */
  static recordError(span: Span, error: Error | unknown): void {
    if (!span) return;

    span.recordException(
      error instanceof Error ? error : new Error(String(error)),
    );
    span.setStatus({
      code: SpanStatusCode.ERROR,
      message: error instanceof Error ? error.message : String(error),
    });
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
    const span = this.startSpan(name, options);

    try {
      const result = await fn(span);
      this.endSpan(span);
      return result;
    } catch (error) {
      this.recordError(span, error);
      this.endSpan(span, {
        code: SpanStatusCode.ERROR,
        message: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }
}
