import { useRouterState } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { FailedNavigationPage } from './FailedNavigationPage.tsx';

export interface ReloadMemory {
  has(key: string): boolean;
  remember(key: string): void;
}

export type ReloadOutcome = 'reloading' | 'failed';

const KEY_PREFIX = 'robusta-build:reloaded:';

/** Loads `href` in full the first time it fails in this tab, and gives up the second time. */
export function reloadOnce(
  href: string,
  memory: ReloadMemory,
  load: (href: string) => void,
): ReloadOutcome {
  const key = `${KEY_PREFIX}${href}`;
  try {
    if (memory.has(key)) {
      return 'failed';
    }
    memory.remember(key);
  } catch {
    return 'failed';
  }
  load(href);
  return 'reloading';
}

/** The router's error state: one full load of the address that failed, then the site's error copy. */
export function NavigationFailure() {
  const href = useRouterState({ select: (state) => state.location.href });
  const [outcome, setOutcome] = useState<ReloadOutcome>('reloading');

  useEffect(() => {
    setOutcome(
      reloadOnce(href, tabMemory(), (target) => window.location.assign(target)),
    );
  }, [href]);

  if (outcome === 'reloading') {
    return null;
  }
  return <FailedNavigationPage href={href} />;
}

function tabMemory(): ReloadMemory {
  return {
    has: (key) => window.sessionStorage.getItem(key) !== null,
    remember: (key) => window.sessionStorage.setItem(key, '1'),
  };
}
