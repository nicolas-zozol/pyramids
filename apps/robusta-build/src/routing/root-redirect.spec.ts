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

let toml: string;

beforeAll(async () => {
  toml = await readFile(new URL('../../netlify.toml', import.meta.url), 'utf8');
});

describe('the redirect rule of netlify.toml', () => {
  it('is one rule, from the bare site root', () => {
    const rules = redirectRules(toml);

    expect(rules).toHaveLength(1);
    expect(rules[0].from).toBe('/');
  });

  it('leads to the landing page of the default Locale, as buildUrl writes it', () => {
    const [rule] = redirectRules(toml);

    expect(rule.to).toBe(
      buildUrl(urlScheme, { kind: 'landing', locale: urlScheme.defaultLocale }),
    );
  });

  it('is permanent and not forced, so it applies only while no file occupies /', () => {
    const [rule] = redirectRules(toml);

    expect(rule.status).toBe(301);
    expect(rule.force ?? false).toBe(false);
  });

  it('is no longer denied by the header of the file', () => {
    expect(toml).not.toMatch(/no redirect rule/i);
  });
});
