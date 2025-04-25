// USe getIntelInstance
// Create intent decorator here: will start the inent, end it or fail it

import { getIntelInstance } from './intent.js'; // Assuming getIntelInstance is exported

export function intent(name: string) {
  // This is the decorator factory
  return function <T extends (...args: any[]) => any>(
    target: any, 
    propertyKey: string, 
    descriptor: TypedPropertyDescriptor<T>
  ): TypedPropertyDescriptor<T> | void { // Return type adjustment
    
    const originalMethod = descriptor.value;

    if (!originalMethod) {
        throw new Error('Original method is undefined, cannot apply decorator.');
    }

    // We modify the descriptor's value property
    descriptor.value = (async function (this: any, ...args: Parameters<T>): Promise<Awaited<ReturnType<T>>> { // More specific types
      const intel = getIntelInstance();
      const intentInstance = intel.createIntent(name);
      intentInstance.start('decorator-start', { method: propertyKey });

      try {
        // Execute the original method bound to the correct 'this' context
        const result = originalMethod.apply(this, args);

        // Handle async methods
        if (result instanceof Promise) {
          const awaitedResult = await result;
          intentInstance.end('decorator-end-success-async');
          return awaitedResult;
        } else {
          intentInstance.end('decorator-end-success-sync');
          // Explicitly cast sync result if necessary, though Promise<Awaited<...>> should handle it
          return result as Awaited<ReturnType<T>>;
        }
      } catch (error) {
        intentInstance.fail('decorator-fail', { error: String(error) });
        throw error;
      }
    }) as T; // Cast the async wrapper back to the original method type T

    // Return the modified descriptor
    // return descriptor; // Standard practice, but void is also allowed if no descriptor modification needed beyond .value
    // Let's stick to returning void for simplicity if only value is changed, or return descriptor if other props were changed.
    // Since we only change descriptor.value, returning void is okay based on some TS patterns,
    // but returning the descriptor is safer across versions/configs.
    return descriptor; 
  };
}

// Optional: Higher-order function for standalone functions
export function withIntent(intentName: string, fn: (...args: any[]) => any) {
  // Return an async function to handle both sync/async fn
  return async function(this: any, ...args: any[]) { // Explicitly type 'this' as any
    const intel = getIntelInstance();
    const intentInstance = intel.createIntent(intentName);
    intentInstance.start('hof-start'); // hof = higher-order function

    try {
      const result = fn.apply(this, args);
      if (result instanceof Promise) {
        await result;
        intentInstance.end('hof-end-success-async');
      } else {
        intentInstance.end('hof-end-success-sync');
      }
      return result;
    } catch (error) {
      intentInstance.fail('hof-fail', { error: String(error) });
      throw error;
    }
  };
}
