import { Locator } from '../../../visitor/visitor.js';

/**
 * Implementation of the Locator interface that uses a data attribute (`data-page-name`)
 * on a specific DOM element identified by a CSS selector.
 * This implementation is intended for browser environments only.
 */
export class LocatorHori implements Locator {
  private readonly pageNameDataAttribute = 'pageName'; // Corresponds to data-page-name
  private readonly targetSelector: string;

  /**
   * Creates an instance of LocatorHori.
   * @param targetSelector A CSS selector string to identify the element
   *                       that will hold the `data-page-name` attribute.
   */
  constructor(targetSelector: string) {
    if (!targetSelector) {
      // Ensure a selector is provided. Alternatively, could default to 'body'.
      throw new Error('LocatorHori requires a target CSS selector.');
    }
    this.targetSelector = targetSelector;
  }

  /**
   * Finds the target element based on the provided CSS selector.
   * Handles potential errors during query selection.
   * @returns The found HTMLElement or null if not found, not in browser, or selector is invalid.
   */
  private getTargetElement(): HTMLElement | null {
    if (typeof document === 'undefined') {
      console.warn(
        'LocatorHori accessed outside of a browser environment. Cannot find target element.',
      );
      return null;
    }
    try {
      // querySelector can return HTMLElement or null
      const element = document.querySelector<HTMLElement>(this.targetSelector);
      if (!element) {
        console.warn(
          `LocatorHori: Element with selector "${this.targetSelector}" not found.`,
        );
      }
      return element;
    } catch (error) {
      console.error(
        `LocatorHori: Invalid CSS selector "${this.targetSelector}".`,
        error,
      );
      return null;
    }
  }

  /**
   * Assigns a logical name to the current page by setting the
   * `data-page-name` attribute on the target element specified by the selector.
   *
   * Logs warnings/errors if called outside a browser environment,
   * the selector is invalid, or the element is not found.
   *
   * @param pageName The logical name to assign (e.g., "PRODUCT", "PROFILE").
   */
  visit(pageName: string): void {
    const targetElement = this.getTargetElement();
    if (targetElement) {
      targetElement.dataset[this.pageNameDataAttribute] = pageName;
    } else {
      // Warning/error already logged by getTargetElement
      console.warn(
        `LocatorHori.visit(): Could not set page name "${pageName}" as target element was not found or accessible.`,
      );
    }
  }

  /**
   * Retrieves the logical name of the current page by reading the
   * `data-page-name` attribute from the target element specified by the selector,
   * and the current browser URL.
   *
   * Returns null for page name if the attribute/element is not found or invalid.
   * Returns undefined for url if not in a browser environment.
   *
   * @returns An object containing the logical page name (or null) and the current URL (or undefined).
   */
  getCurrentPage(): { page: string | null; url: string | undefined } {
    let pageName: string | null = null;
    let currentUrl: string | undefined = undefined;

    const targetElement = this.getTargetElement();
    if (targetElement) {
      pageName = targetElement.dataset[this.pageNameDataAttribute] || null;
    }

    if (typeof window !== 'undefined' && window.location) {
      currentUrl = window.location.href;
    }

    return { page: pageName, url: currentUrl };
  }
}
