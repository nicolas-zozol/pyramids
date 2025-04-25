/**
 * Other possible name:
 * - VisitorInterface
 * - SessionInterface
 * - SessionContext
 */
export interface Visitor extends Identifier, Locator {}

export interface Identifier {
  identify: (key: string, user: any, data?: Record<string, any>) => void;
  getUserId(): string;
}

/**
 * Interface for locating or identifying the current logical page.
 */
export interface Locator {
  /**
   * Assigns a logical name to the current page.
   * This is typically done by setting a specific attribute in the DOM.
   * Should only be called in a browser environment.
   * @param pageName The logical name to assign (e.g., "PRODUCT", "PROFILE").
   */
  visit(pageName: string): void;

  /**
   * Retrieves the logical name of the current page and the current URL.
   * The logical name typically reads a specific attribute from the DOM.
   * Should only be called in a browser environment.
   * @returns An object containing the logical page name (or null) and the current URL (or undefined).
   */
  getCurrentPage(): { page: string | null; url: string | undefined };
}
