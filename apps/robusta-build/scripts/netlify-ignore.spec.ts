import { execFileSync, spawnSync } from 'node:child_process';
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, describe, expect, it } from 'vitest';
import { ignoreVerdict } from './netlify-ignore.mjs';

const SITE = '@robusta/robusta-build';
const SCRIPT = join(
  dirname(fileURLToPath(import.meta.url)),
  'netlify-ignore.mjs',
);

const GIT_ENV = {
  ...process.env,
  GIT_CONFIG_GLOBAL: '/dev/null',
  GIT_CONFIG_NOSYSTEM: '1',
  GIT_AUTHOR_NAME: 'Fixture',
  GIT_AUTHOR_EMAIL: 'fixture@example.com',
  GIT_COMMITTER_NAME: 'Fixture',
  GIT_COMMITTER_EMAIL: 'fixture@example.com',
};

const manifest = (name: string, fields: Record<string, unknown> = {}) =>
  JSON.stringify({ name, version: '0.0.0', ...fields }, null, 2);

const repos: string[] = [];

afterEach(() => {
  for (const repo of repos.splice(0))
    rmSync(repo, { recursive: true, force: true });
});

function git(repo: string, ...args: string[]): string {
  return execFileSync(
    'git',
    ['-c', 'init.defaultBranch=main', '-c', 'commit.gpgsign=false', ...args],
    { cwd: repo, env: GIT_ENV, encoding: 'utf8' },
  ).trim();
}

function write(repo: string, files: Record<string, string>) {
  for (const [path, text] of Object.entries(files)) {
    mkdirSync(dirname(join(repo, path)), { recursive: true });
    writeFileSync(join(repo, path), text);
  }
}

function commit(
  repo: string,
  files: Record<string, string>,
  message = 'change',
): string {
  write(repo, files);
  git(repo, 'add', '-A');
  git(repo, 'commit', '--allow-empty', '-q', '-m', message);
  return git(repo, 'rev-parse', 'HEAD');
}

/** A monorepo shaped like this one: the site depends on the design system, dakar on helpers. */
function monorepo(): { repo: string; base: string } {
  const repo = mkdtempSync(join(tmpdir(), 'netlify-ignore-'));
  repos.push(repo);
  git(repo, 'init', '-q');
  const base = commit(
    repo,
    {
      'package.json': JSON.stringify({
        name: 'root',
        workspaces: ['apps/*', 'packages/*'],
      }),
      'yarn.lock': '# lock\n',
      '.yarnrc.yml': 'nodeLinker: node-modules\n',
      '.nvmrc': '22\n',
      '.yarn/releases/yarn-4.17.1.cjs': '// yarn\n',
      'ROADMAP.md': '# Roadmap\n',
      'features/a/a.story.md': '# Story\n',
      'apps/robusta-build/package.json': manifest(SITE, {
        dependencies: {
          '@robusta/pyramids-design-system': 'workspace:*',
          react: '^19',
        },
      }),
      'apps/robusta-build/src/index.ts': 'export {};\n',
      'apps/dakar/package.json': manifest('@robusta/dakar', {
        dependencies: { '@robusta/pyramids-helpers': 'workspace:*' },
      }),
      'apps/dakar/src/index.ts': 'export {};\n',
      'apps/robusta/package.json': manifest('@robusta/build'),
      'apps/robusta/src/index.ts': 'export {};\n',
      'apps/robusta-design/brief.md': '# Not a workspace\n',
      'packages/robusta-design-system/package.json': manifest(
        '@robusta/pyramids-design-system',
      ),
      'packages/robusta-design-system/src/index.ts': 'export {};\n',
      'packages/helpers/package.json': manifest('@robusta/pyramids-helpers'),
      'packages/helpers/src/index.ts': 'export {};\n',
    },
    'base',
  );
  return { repo, base };
}

const verdictOf = (repo: string, cachedRef?: string, commitRef?: string) =>
  ignoreVerdict({ repo, site: SITE, cachedRef, commitRef });

describe('ignoreVerdict, watched paths', () => {
  it('skips a range that only touches features/ and ROADMAP.md, and says how many directories it watched', () => {
    const { repo, base } = monorepo();
    const head = commit(repo, {
      'features/a/a.story.md': '# Story v2\n',
      'ROADMAP.md': '# Roadmap v2\n',
    });

    const verdict = verdictOf(repo, base, head);

    expect(verdict.build).toBe(false);
    expect(verdict.reason).toMatch(/2 watched directories/);
  });

  it.each([
    ['a base module', 'packages/helpers/src/index.ts'],
    ['dakar', 'apps/dakar/src/index.ts'],
    ['the v1 site', 'apps/robusta/src/index.ts'],
    ['a directory without manifest', 'apps/robusta-design/brief.md'],
  ])('skips a range that only touches %s', (_, path) => {
    const { repo, base } = monorepo();
    const head = commit(repo, { [path]: 'changed\n' });

    expect(verdictOf(repo, base, head).build).toBe(false);
  });

  it('builds on a change of the site, naming the path and the site', () => {
    const { repo, base } = monorepo();
    const head = commit(repo, {
      'apps/robusta-build/src/index.ts': 'export const a = 1;\n',
    });

    const verdict = verdictOf(repo, base, head);

    expect(verdict.build).toBe(true);
    expect(verdict.reason).toContain('apps/robusta-build/src/index.ts');
    expect(verdict.reason).toContain(SITE);
  });

  it('builds on a change of a module the site depends on, naming the module', () => {
    const { repo, base } = monorepo();
    const head = commit(repo, {
      'packages/robusta-design-system/src/index.ts': 'export const b = 1;\n',
    });

    const verdict = verdictOf(repo, base, head);

    expect(verdict.build).toBe(true);
    expect(verdict.reason).toContain('@robusta/pyramids-design-system');
  });

  it.each([
    'package.json',
    'yarn.lock',
    '.yarnrc.yml',
    '.nvmrc',
    '.yarn/releases/yarn-4.17.1.cjs',
  ])('builds on a change of the install file %s', (path) => {
    const { repo, base } = monorepo();
    const head = commit(repo, {
      [path]:
        path === 'package.json'
          ? JSON.stringify({
              name: 'root',
              private: true,
              workspaces: ['apps/*', 'packages/*'],
            })
          : 'changed\n',
    });

    const verdict = verdictOf(repo, base, head);

    expect(verdict.build).toBe(true);
    expect(verdict.reason).toContain(path);
  });

  it('builds when only the first of three commits touches the site', () => {
    const { repo, base } = monorepo();
    commit(
      repo,
      { 'apps/robusta-build/src/index.ts': 'export const a = 1;\n' },
      'site',
    );
    commit(repo, { 'ROADMAP.md': '# Roadmap v2\n' }, 'docs');
    const head = commit(
      repo,
      { 'features/a/a.story.md': '# Story v2\n' },
      'docs',
    );

    expect(verdictOf(repo, base, head).build).toBe(true);
  });

  it('builds when a file of the site is deleted or moved out of it', () => {
    const { repo, base } = monorepo();
    git(repo, 'mv', 'apps/robusta-build/src/index.ts', 'features/a/index.ts');
    git(repo, 'commit', '-q', '-m', 'move');
    const head = git(repo, 'rev-parse', 'HEAD');

    expect(verdictOf(repo, base, head).build).toBe(true);
  });

  it('watches a module added to the design system, then builds on a change of that module alone', () => {
    const { repo, base } = monorepo();
    const added = commit(repo, {
      'packages/icons/package.json': manifest('@robusta/icons'),
      'packages/icons/src/index.ts': 'export {};\n',
      'packages/robusta-design-system/package.json': manifest(
        '@robusta/pyramids-design-system',
        {
          peerDependencies: { '@robusta/icons': '^1.0.0' },
        },
      ),
    });
    const changed = commit(repo, {
      'packages/icons/src/index.ts': 'export const icon = 1;\n',
    });

    expect(verdictOf(repo, base, added).build).toBe(true);
    const verdict = verdictOf(repo, added, changed);
    expect(verdict.build).toBe(true);
    expect(verdict.reason).toContain('@robusta/icons');
  });

  it('follows devDependencies and optionalDependencies of the site, whatever their range', () => {
    const { repo } = monorepo();
    const added = commit(repo, {
      'packages/tooling/package.json': manifest('@robusta/tooling'),
      'packages/fonts/package.json': manifest('@robusta/fonts'),
      'apps/robusta-build/package.json': manifest(SITE, {
        dependencies: { '@robusta/pyramids-design-system': 'workspace:*' },
        devDependencies: { '@robusta/tooling': '*' },
        optionalDependencies: { '@robusta/fonts': '^2.0.0' },
      }),
    });
    const tooling = commit(repo, {
      'packages/tooling/index.mjs': 'export {};\n',
    });
    const fonts = commit(repo, { 'packages/fonts/index.css': 'a {}\n' });

    expect(verdictOf(repo, added, tooling).build).toBe(true);
    expect(verdictOf(repo, tooling, fonts).build).toBe(true);
  });

  it('reads the manifests at the built commit, not in the working tree', () => {
    const { repo, base } = monorepo();
    const head = commit(repo, { 'packages/helpers/src/index.ts': 'changed\n' });
    write(repo, {
      'apps/robusta-build/package.json': manifest(SITE, {
        dependencies: { '@robusta/pyramids-helpers': 'workspace:*' },
      }),
    });

    expect(verdictOf(repo, base, head).build).toBe(false);
  });
});

describe('ignoreVerdict, refs', () => {
  it.each([
    ['an absent cached ref', undefined],
    ['an empty cached ref', ''],
    ['a cached ref unknown to the clone', 'deadbeef'],
  ])('builds on %s, naming it', (_, cachedRef) => {
    const { repo } = monorepo();
    const head = commit(repo, { 'ROADMAP.md': '# Roadmap v2\n' });

    const verdict = verdictOf(repo, cachedRef, head);

    expect(verdict.build).toBe(true);
    expect(verdict.reason).toMatch(/CACHED_COMMIT_REF/);
  });

  it('builds on an absent commit ref', () => {
    const { repo, base } = monorepo();

    const verdict = verdictOf(repo, base, undefined);

    expect(verdict.build).toBe(true);
    expect(verdict.reason).toMatch(/COMMIT_REF/);
  });

  it('builds when the cached ref equals the commit ref, as on a build without cache or a dashboard retry', () => {
    const { repo } = monorepo();
    const head = commit(repo, { 'ROADMAP.md': '# Roadmap v2\n' });

    expect(verdictOf(repo, head, head).build).toBe(true);
  });

  it('builds when the cached ref equals the commit ref written in short form', () => {
    const { repo } = monorepo();
    const head = commit(repo, { 'ROADMAP.md': '# Roadmap v2\n' });

    expect(verdictOf(repo, head.slice(0, 7), head).build).toBe(true);
  });
});

describe('ignoreVerdict, first-parent history', () => {
  /**
   * main and an epic branch fork at base.
   * - main: a commit of the site, then the production build of main (cached ref)
   * - epic: its own commits
   */
  function forked() {
    const { repo, base } = monorepo();
    git(repo, 'checkout', '-q', '-b', 'epic');
    git(repo, 'checkout', '-q', 'main');
    const production = commit(
      repo,
      { 'apps/robusta-build/src/index.ts': 'export const main = 1;\n' },
      'main site',
    );
    git(repo, 'checkout', '-q', 'epic');
    return { repo, base, production };
  }

  it('builds when the cached ref comes from main while the branch diverged with site code', () => {
    const { repo, production } = forked();
    commit(
      repo,
      { 'apps/robusta-build/src/epic.ts': 'export {};\n' },
      'epic site',
    );
    const head = commit(repo, { 'ROADMAP.md': '# Roadmap v2\n' }, 'epic docs');

    const verdict = verdictOf(repo, production, head);

    expect(verdict.build).toBe(true);
    expect(verdict.reason).toMatch(/first-parent/);
  });

  it('builds when the branch merges main by a merge commit, main carrying site code, the cached ref being the production', () => {
    const { repo, production } = forked();
    git(repo, 'merge', '-q', '--no-ff', '-m', 'merge main', 'main');
    const head = git(repo, 'rev-parse', 'HEAD');

    expect(verdictOf(repo, production, head).build).toBe(true);
  });

  it('builds when the branch merges main carrying site code, the cached ref being the previous branch build', () => {
    const { repo } = forked();
    const previous = commit(
      repo,
      { 'ROADMAP.md': '# Roadmap epic\n' },
      'epic docs',
    );
    git(repo, 'merge', '-q', '--no-ff', '-m', 'merge main', 'main');
    const head = git(repo, 'rev-parse', 'HEAD');

    expect(verdictOf(repo, previous, head).build).toBe(true);
  });

  it('skips a merge of a docs-only main into a branch carrying site code, the cached ref being the previous branch build', () => {
    const { repo } = monorepo();
    git(repo, 'checkout', '-q', '-b', 'epic');
    const previous = commit(
      repo,
      { 'apps/robusta-build/src/epic.ts': 'export {};\n' },
      'epic site',
    );
    git(repo, 'checkout', '-q', 'main');
    commit(repo, { 'features/a/a.story.md': '# Story main\n' }, 'main docs');
    git(repo, 'checkout', '-q', 'epic');
    git(repo, 'merge', '-q', '--no-ff', '-m', 'merge main', 'main');
    const head = git(repo, 'rev-parse', 'HEAD');

    expect(verdictOf(repo, previous, head).build).toBe(false);
  });

  it('skips a branch that takes main by fast-forward and adds a docs-only commit: the accepted exception', () => {
    const { repo, production } = forked();
    git(repo, 'merge', '-q', '--ff-only', 'main');
    const head = commit(repo, { 'ROADMAP.md': '# Roadmap v2\n' }, 'epic docs');

    expect(verdictOf(repo, production, head).build).toBe(false);
  });
});

describe('ignoreVerdict, errors', () => {
  it('builds on an unreadable manifest, naming it', () => {
    const { repo, base } = monorepo();
    const head = commit(repo, {
      'packages/helpers/package.json': '{ not json',
    });

    const verdict = verdictOf(repo, base, head);

    expect(verdict.build).toBe(true);
    expect(verdict.reason).toContain('packages/helpers/package.json');
  });

  it.each(['packages/**', 'apps/robusta-*', '!apps/dakar'])(
    'builds on the workspaces pattern %s it does not understand, naming it',
    (pattern) => {
      const { repo, base } = monorepo();
      const head = commit(repo, {
        'package.json': JSON.stringify({
          name: 'root',
          workspaces: ['apps/*', pattern],
        }),
      });

      const verdict = verdictOf(repo, base, head);

      expect(verdict.build).toBe(true);
      expect(verdict.reason).toContain(pattern);
    },
  );

  it('understands an exact workspace path', () => {
    const { repo } = monorepo();
    commit(repo, {
      'package.json': JSON.stringify({
        name: 'root',
        workspaces: [
          'apps/robusta-build',
          'packages/robusta-design-system',
          'apps/dakar',
        ],
      }),
    });
    const from = git(repo, 'rev-parse', 'HEAD');
    const head = commit(repo, { 'apps/dakar/src/index.ts': 'changed\n' });

    expect(verdictOf(repo, from, head).build).toBe(false);
  });

  it('builds when no workspace carries the site name', () => {
    const { repo, base } = monorepo();
    const head = commit(repo, { 'ROADMAP.md': '# Roadmap v2\n' });

    const verdict = ignoreVerdict({
      repo,
      site: '@robusta/unknown',
      cachedRef: base,
      commitRef: head,
    });

    expect(verdict.build).toBe(true);
    expect(verdict.reason).toContain('@robusta/unknown');
  });

  it('builds outside a git repository, without throwing', () => {
    const dir = mkdtempSync(join(tmpdir(), 'netlify-ignore-nogit-'));
    repos.push(dir);

    const verdict = ignoreVerdict({
      repo: dir,
      site: SITE,
      cachedRef: 'abc1234',
      commitRef: 'def5678',
    });

    expect(verdict.build).toBe(true);
  });
});

describe('netlify-ignore CLI', () => {
  const run = (repo: string, env: Record<string, string>) =>
    spawnSync('node', [SCRIPT, SITE], {
      cwd: repo,
      env: { ...GIT_ENV, CACHED_COMMIT_REF: '', COMMIT_REF: '', ...env },
      encoding: 'utf8',
    });

  it('exits 0 with one skip line when the range touches nothing watched', () => {
    const { repo, base } = monorepo();
    const head = commit(repo, { 'ROADMAP.md': '# Roadmap v2\n' });

    const result = run(repo, { CACHED_COMMIT_REF: base, COMMIT_REF: head });

    expect(result.status).toBe(0);
    expect(result.stdout).toMatch(/^skip: [^\n]+\n$/);
    expect(result.stderr).toBe('');
  });

  it('exits 1 with one build line when the range touches the site', () => {
    const { repo, base } = monorepo();
    const head = commit(repo, {
      'apps/robusta-build/src/index.ts': 'export const a = 1;\n',
    });

    const result = run(repo, { CACHED_COMMIT_REF: base, COMMIT_REF: head });

    expect(result.status).toBe(1);
    expect(result.stdout).toMatch(/^build: [^\n]+\n$/);
    expect(result.stderr).toBe('');
  });

  it('exits 1 with one build line on an unknown cached ref', () => {
    const { repo } = monorepo();
    const head = commit(repo, { 'ROADMAP.md': '# Roadmap v2\n' });

    const result = run(repo, {
      CACHED_COMMIT_REF: 'deadbeef',
      COMMIT_REF: head,
    });

    expect(result.status).toBe(1);
    expect(result.stdout).toMatch(/^build: [^\n]+\n$/);
    expect(result.stderr).toBe('');
  });

  it('imports node: built-ins only', () => {
    const source = readFileSync(SCRIPT, 'utf8');
    const specifiers = [
      ...source.matchAll(/^import\s[^'"]*['"]([^'"]+)['"]/gm),
    ].map((m) => m[1]);

    expect(specifiers.length).toBeGreaterThan(0);
    expect(specifiers.filter((s) => !s.startsWith('node:'))).toEqual([]);
  });
});
