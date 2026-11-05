/**
 * The Netlify ignore rule of a non-production build: it skips the build when no
 * commit since the cached ref touches the site, a module it reaches, or a root
 * install file. Runs before dependency install: git and `node:` built-ins only.
 *
 * Design: features/pyramid-v2-epic/netlify-deploy/netlify-deploy.design.md
 * Requirements: R-NETLIFY-01, R-NETLIFY-02, R-NETLIFY-03, R-NETLIFY-04, R-NETLIFY-05, R-NETLIFY-06, R-NETLIFY-07
 */
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

const DEPENDENCY_FIELDS = [
  'dependencies',
  'devDependencies',
  'peerDependencies',
  'optionalDependencies',
];
const INSTALL_FILES = [
  'package.json',
  'yarn.lock',
  '.yarnrc.yml',
  '.yarn/releases',
  '.nvmrc',
];
const INSTALL_OWNER = 'install root';
const EXACT_WORKSPACE = /^[^*?[\]{}!]+$/;
const DIRECTORY_WORKSPACE = /^([^*?[\]{}!]+)\/\*$/;

/**
 * @typedef {{ repo: string, site: string, cachedRef?: string, commitRef?: string }} IgnoreInput
 * @typedef {{ build: boolean, reason: string }} IgnoreVerdict
 * @typedef {{ path: string, owner: string }} WatchedPath
 */

/**
 * Never throws: any failure is a build verdict whose reason carries the error.
 * @param {IgnoreInput} input
 * @returns {IgnoreVerdict}
 */
export function ignoreVerdict({ repo, site, cachedRef, commitRef }) {
  try {
    const git = gitIn(repo);
    const refs = judgeableRefs(git, cachedRef, commitRef);
    if ('reason' in refs) return { build: true, reason: refs.reason };

    const watched = watchedPaths(git, refs.commit, site);
    const directories = watched.length - INSTALL_FILES.length;
    const touched = firstTouched(git, refs.cached, refs.commit, watched);
    const range = `${short(refs.cached)}..${short(refs.commit)}`;

    return touched
      ? {
          build: true,
          reason: `${touched.file} (${touched.owner}) changed in ${short(touched.sha)}, ${range}, ${directories} watched directories`,
        }
      : {
          build: false,
          reason: `no commit of ${range} touches the ${directories} watched directories or the install files`,
        };
  } catch (error) {
    return { build: true, reason: `rule failed: ${messageOf(error)}` };
  }
}

function gitIn(repo) {
  return (...args) =>
    execFileSync(
      'git',
      ['-c', 'core.quotePath=false', '-c', 'log.showSignature=false', ...args],
      {
        cwd: repo,
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'pipe'],
        maxBuffer: 256 * 1024 * 1024,
      },
    );
}

function judgeableRefs(git, cachedRef, commitRef) {
  if (!commitRef) return { reason: 'COMMIT_REF is absent' };
  if (!cachedRef) return { reason: 'CACHED_COMMIT_REF is absent' };

  const commit = resolveCommit(git, commitRef);
  if (!commit)
    return { reason: `COMMIT_REF ${commitRef} is unknown to the clone` };
  const cached = resolveCommit(git, cachedRef);
  if (!cached)
    return { reason: `CACHED_COMMIT_REF ${cachedRef} is unknown to the clone` };
  if (cached === commit)
    return { reason: `CACHED_COMMIT_REF equals COMMIT_REF ${short(commit)}` };

  const firstParents = git('rev-list', '--first-parent', commit).split('\n');
  if (!firstParents.includes(cached)) {
    return {
      reason: `CACHED_COMMIT_REF ${short(cached)} is not on the first-parent history of ${short(commit)}`,
    };
  }
  return { cached, commit };
}

function resolveCommit(git, ref) {
  try {
    return (
      git('rev-parse', '--verify', '--quiet', `${ref}^{commit}`).trim() ||
      undefined
    );
  } catch {
    return undefined;
  }
}

/** @returns {WatchedPath[]} */
function watchedPaths(git, commit, site) {
  const workspaces = workspacesAt(git, commit);
  const siteWorkspace = workspaces.find((workspace) => workspace.name === site);
  if (!siteWorkspace) throw new Error(`no workspace is named ${site}`);

  const byName = new Map(
    workspaces.map((workspace) => [workspace.name, workspace]),
  );
  const reached = new Map([[site, siteWorkspace]]);
  const pending = [siteWorkspace];
  while (pending.length > 0) {
    const workspace = pending.pop();
    for (const name of dependencyNames(workspace.manifest)) {
      const dependency = byName.get(name);
      if (dependency && !reached.has(name)) {
        reached.set(name, dependency);
        pending.push(dependency);
      }
    }
  }

  return [
    ...[...reached.values()].map(({ directory, name }) => ({
      path: directory,
      owner: name,
    })),
    ...INSTALL_FILES.map((path) => ({ path, owner: INSTALL_OWNER })),
  ];
}

function workspacesAt(git, commit) {
  const root = manifestAt(git, commit, 'package.json');
  if (!Array.isArray(root.workspaces))
    throw new Error('package.json: workspaces is not a list');

  return root.workspaces
    .flatMap((pattern) => workspaceDirectories(git, commit, pattern))
    .filter((directory) => hasManifest(git, commit, directory))
    .map((directory) => ({
      directory,
      manifest: manifestAt(git, commit, `${directory}/package.json`),
    }))
    .filter(({ manifest }) => typeof manifest.name === 'string')
    .map(({ directory, manifest }) => ({
      directory,
      manifest,
      name: manifest.name,
    }));
}

function workspaceDirectories(git, commit, pattern) {
  const normalized =
    typeof pattern === 'string'
      ? pattern.replace(/^\.\//, '').replace(/\/$/, '')
      : '';
  const parent = DIRECTORY_WORKSPACE.exec(normalized)?.[1];
  if (parent) {
    return git('ls-tree', commit, '--', `${parent}/`)
      .split('\n')
      .filter(Boolean)
      .map((line) => line.split('\t'))
      .filter(([meta]) => meta.split(' ')[1] === 'tree')
      .map(([, path]) => path);
  }
  if (EXACT_WORKSPACE.test(normalized)) return [normalized];
  throw new Error(
    `workspaces pattern ${JSON.stringify(pattern)} is not understood`,
  );
}

function hasManifest(git, commit, directory) {
  return (
    git('ls-tree', commit, '--', `${directory}/package.json`).trim() !== ''
  );
}

function manifestAt(git, commit, path) {
  try {
    return JSON.parse(git('show', `${commit}:${path}`));
  } catch (error) {
    throw new Error(
      `${path} at ${short(commit)} is unreadable: ${messageOf(error)}`,
    );
  }
}

function dependencyNames(manifest) {
  return DEPENDENCY_FIELDS.flatMap((field) =>
    manifest[field] && typeof manifest[field] === 'object'
      ? Object.keys(manifest[field])
      : [],
  );
}

// Every commit of the range, oldest first, second-parent ones included; a merge is diffed against its first parent only.
function firstTouched(git, cached, commit, watched) {
  const log = git(
    'log',
    '--reverse',
    '--no-renames',
    '--diff-merges=first-parent',
    '--format=%x00%H',
    '--name-only',
    `${cached}..${commit}`,
  );
  for (const entry of log.split('\0').filter(Boolean)) {
    const [sha, ...files] = entry.split('\n').filter(Boolean);
    for (const file of files) {
      const owner = ownerOf(file, watched);
      if (owner) return { sha, file, owner };
    }
  }
  return undefined;
}

function ownerOf(file, watched) {
  return watched.find(
    ({ path }) => file === path || file.startsWith(`${path}/`),
  )?.owner;
}

function short(sha) {
  return sha.slice(0, 7);
}

function messageOf(error) {
  const stderr = error?.stderr
    ? String(error.stderr).trim().split('\n')[0]
    : '';
  return (
    stderr ||
    (error instanceof Error ? error.message.split('\n')[0] : String(error))
  );
}

function main() {
  const verdict = ignoreVerdict({
    repo: process.cwd(),
    site: process.argv[2] ?? '',
    cachedRef: process.env.CACHED_COMMIT_REF,
    commitRef: process.env.COMMIT_REF,
  });
  console.log(`${verdict.build ? 'build' : 'skip'}: ${verdict.reason}`);
  process.exit(verdict.build ? 1 : 0);
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  main();
}
