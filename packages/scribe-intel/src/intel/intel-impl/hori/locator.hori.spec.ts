/**
 * @vitest-environment jsdom
 */
import { describe, expect, test, beforeEach, afterEach, vi } from 'vitest';
import { LocatorHori } from './locator.hori.js';

describe('LocatorHori', () => {
  const TARGET_SELECTOR = '#test-target';
  const OTHER_SELECTOR = '#other-element';
  const PAGE_NAME = 'TEST_PAGE';
  const PAGE_NAME_ATTR = 'pageName'; // Corresponds to data-page-name

  let targetElement: HTMLElement;
  let otherElement: HTMLElement;

  // Spy on console methods to check warnings/errors
  const consoleWarnSpy = vi.spyOn(console, 'warn');
  const consoleErrorSpy = vi.spyOn(console, 'error');

  beforeEach(() => {
    // Set up the DOM
    document.body.innerHTML = `
      <div>
        <div id="test-target">Target Div</div>
        <span id="other-element">Other Span</span>
      </div>
    `;
    targetElement = document.querySelector<HTMLElement>(TARGET_SELECTOR)!;
    otherElement = document.querySelector<HTMLElement>(OTHER_SELECTOR)!;

    // Clear spies before each test
    consoleWarnSpy.mockClear();
    consoleErrorSpy.mockClear();
  });

  afterEach(() => {
    // Clean up the DOM
    document.body.innerHTML = '';
    // Restore spies
    consoleWarnSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  test('should throw error if constructor is called without a selector', () => {
    expect(() => new LocatorHori('')).toThrow(
      'LocatorHori requires a target CSS selector.',
    );
  });

  test('visit() should set the data-page-name attribute on the target element', () => {
    const locator = new LocatorHori(TARGET_SELECTOR);
    locator.visit(PAGE_NAME);

    expect(targetElement.dataset[PAGE_NAME_ATTR]).toBe(PAGE_NAME);
    // Ensure it doesn't affect other elements
    expect(otherElement.dataset[PAGE_NAME_ATTR]).toBeUndefined();
  });

  test('getCurrentPage() should get the page name from the target element data attribute', () => {
    targetElement.dataset[PAGE_NAME_ATTR] = PAGE_NAME; // Pre-set the attribute
    const locator = new LocatorHori(TARGET_SELECTOR);

    const result = locator.getCurrentPage();

    expect(result.page).toBe(PAGE_NAME);
    expect(result.url).toBe('http://localhost:3000/'); // Expect JSDOM default URL
  });

  test('getCurrentPage() should return null for page name if attribute is not set', () => {
    const locator = new LocatorHori(TARGET_SELECTOR);
    const result = locator.getCurrentPage();

    expect(result.page).toBeNull();
    expect(result.url).toBe('http://localhost:3000/'); // Expect JSDOM default URL
  });

  test('getCurrentPage() should return null for page name if target element does not exist', () => {
    const locator = new LocatorHori('#non-existent-element');
    const result = locator.getCurrentPage();

    expect(result.page).toBeNull();
    expect(result.url).toBe('http://localhost:3000/');
  });

  test('getCurrentPage() should return null for page name if selector is invalid', () => {
    const locator = new LocatorHori('[invalid-selector');
    const result = locator.getCurrentPage();

    expect(result.page).toBeNull();
    expect(result.url).toBe('http://localhost:3000/');
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      expect.stringContaining(
        'LocatorHori: Invalid CSS selector "[invalid-selector".'
      ),
      expect.any(Error),
    );
  });

  test('visit() should not throw but log warning if target element does not exist', () => {
    const locator = new LocatorHori('#non-existent-element');

    expect(() => locator.visit(PAGE_NAME)).not.toThrow();
  });

  test('visit() should not throw but log error if selector is invalid', () => {
    const locator = new LocatorHori('[invalid-selector');

    expect(() => locator.visit(PAGE_NAME)).not.toThrow();

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      expect.stringContaining(
        'LocatorHori: Invalid CSS selector "[invalid-selector".'
      ),
      expect.any(Error),
    );
  });
});
