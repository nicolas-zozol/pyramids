import { readFile } from 'node:fs/promises';
import { beforeAll, describe, expect, it } from 'vitest';
import { urlScheme } from './scheme.ts';
import { buildUrl } from './url-scheme/index.ts';

type TomlValue = string | number | boolean;

/** The `[[redirects]]` tables of a netlify.toml, each one's `key = value` lines read as scalars. */
function redirectRules(toml: string): Record<string, TomlValue>[] {
  const rules: Record<string, TomlValue>[] = [];
  let current: Record<string, TomlValue> | undefined;

  for (const raw of toml.split('\n')) {
    const line = raw.replace(/\s+#.*$/, '').trim();
    if (line === '' || line.startsWith('#')) continue;

    if (line.startsWith('[')) {
      current = line === '[[redirects]]' ? {} : undefined;
      if (current !== undefined) rules.push(current);
      continue;
    }

    const assignment = /^([\w.-]+)\s*=\s*(.+)$/.exec(line);
    if (current !== undefined && assignment !== null) {
      current[assignment[1]] = JSON.parse(assignment[2]) as TomlValue;
    }
  }

  return rules;
}

/** The rules matching on a path alone, every host of the site. */
function pathRules(toml: string): Record<string, TomlValue>[] {
  return redirectRules(toml).filter((rule) =>
    String(rule.from).startsWith('/'),
  );
}

let toml: string;

beforeAll(async () => {
  toml = await readFile(new URL('../../netlify.toml', import.meta.url), 'utf8');
});

// R-ROOTLOCALE-41, R-ROOTLOCALE-42: the host leads a page marked with the
// default Locale to the same page unmarked.
describe('the redirect rules of netlify.toml', () => {
  const marker = `/${urlScheme.defaultLocale}`;

  it('are exactly two path rules, from the marked default Locale and from everything under it', () => {
    const rules = pathRules(toml);

    expect(rules.map((rule) => rule.from)).toEqual([marker, `${marker}/*`]);
  });

  it('lead the marker alone to the landing page of the default Locale, as buildUrl writes it', () => {
    const [landing] = pathRules(toml);

    expect(landing.to).toBe(
      buildUrl(urlScheme, { kind: 'landing', locale: urlScheme.defaultLocale }),
    );
  });

  it('lead everything under the marker to the same path unmarked', () => {
    const [, underMarker] = pathRules(toml);

    expect(underMarker.to).toBe('/:splat');
  });

  it('are permanent and not forced', () => {
    for (const rule of pathRules(toml)) {
      expect(rule.status).toBe(301);
      expect(rule.force ?? false).toBe(false);
    }
  });

  it('leave the bare site root to the file that occupies it', () => {
    expect(redirectRules(toml).map((rule) => rule.from)).not.toContain('/');
    expect(toml).not.toMatch(/build writes no index\.html/i);
  });
});

// R-GOLIVE-21, R-GOLIVE-22: one host, www.robusta.build.
describe('the host rule of netlify.toml', () => {
  it('opens the redirects, forcing the Netlify subdomain permanently to the same path on www.robusta.build', () => {
    const [first] = redirectRules(toml);

    expect(first).toEqual({
      from: 'https://robusta-build.netlify.app/*',
      to: 'https://www.robusta.build/:splat',
      status: 301,
      force: true,
    });
  });

  it('is the only rule naming a host, and none targets www.robusta.build from itself or the apex', () => {
    const hostRules = redirectRules(toml).filter(
      (rule) => !String(rule.from).startsWith('/'),
    );

    expect(hostRules.map((rule) => rule.from)).toEqual([
      'https://robusta-build.netlify.app/*',
    ]);
    expect(toml).not.toMatch(/from\s*=\s*"https?:\/\/(www\.)?robusta\.build/);
  });
});
