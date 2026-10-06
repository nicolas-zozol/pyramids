import { describe, expect, it, vi } from 'vitest';
import { reloadOnce, type ReloadMemory } from './NavigationFailure.js';

function memory(): ReloadMemory & { keys: Set<string> } {
  const keys = new Set<string>();
  return {
    keys,
    has: (key) => keys.has(key),
    remember: (key) => {
      keys.add(key);
    },
  };
}

/**
 * A tab opened before a deploy asks for a route chunk or a data file the new
 * deploy no longer carries. The first failure at an address loads that address
 * in full; a second one at the same address in the same tab is a defect.
 */
describe('reloadOnce', () => {
  it('loads the target address in full on the first failure there', () => {
    const load = vi.fn();
    const outcome = reloadOnce('/articles/c/web/a-slug', memory(), load);

    expect(outcome).toBe('reloading');
    expect(load).toHaveBeenCalledWith('/articles/c/web/a-slug');
  });

  it('gives up on a second failure at the same address in the same tab', () => {
    const load = vi.fn();
    const tab = memory();

    reloadOnce('/articles/c/web/a-slug', tab, load);
    const second = reloadOnce('/articles/c/web/a-slug', tab, load);

    expect(second).toBe('failed');
    expect(load).toHaveBeenCalledTimes(1);
  });

  it('counts each address on its own', () => {
    const load = vi.fn();
    const tab = memory();

    reloadOnce('/articles/c/web/a-slug', tab, load);
    const other = reloadOnce('/l/fr/articles/c/blockchain', tab, load);

    expect(other).toBe('reloading');
    expect(load).toHaveBeenCalledTimes(2);
  });

  it('gives up rather than risk a reload loop when the tab can remember nothing', () => {
    const load = vi.fn();
    const forgetful: ReloadMemory = {
      has: () => {
        throw new Error('storage disabled');
      },
      remember: () => {
        throw new Error('storage disabled');
      },
    };

    expect(reloadOnce('/articles', forgetful, load)).toBe('failed');
    expect(load).not.toHaveBeenCalled();
  });
});
