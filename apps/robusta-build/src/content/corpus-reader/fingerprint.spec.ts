import { createHash } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { fingerprint } from './fingerprint.ts';

const LEAVING_GMAIL = {
  title: 'Leaving Gmail',
  excerpt: 'Gmail was a revolution in 2004.',
  body: 'Why leave it? Because it reads your mail.',
};

describe('fingerprint', () => {
  it('is the first twelve hexadecimal characters of the SHA-256 of the title, the excerpt and the body', () => {
    const expected = createHash('sha256')
      .update(
        [LEAVING_GMAIL.title, LEAVING_GMAIL.excerpt, LEAVING_GMAIL.body].join(
          '\n',
        ),
      )
      .digest('hex')
      .slice(0, 12);

    expect(fingerprint(LEAVING_GMAIL)).toBe(expected);
    expect(fingerprint(LEAVING_GMAIL)).toMatch(/^[0-9a-f]{12}$/);
  });

  it('changes with the title, the excerpt or the body', () => {
    const before = fingerprint(LEAVING_GMAIL);

    expect(fingerprint({ ...LEAVING_GMAIL, title: 'Leaving Google' })).not.toBe(
      before,
    );
    expect(
      fingerprint({ ...LEAVING_GMAIL, excerpt: 'Gmail was a revolution.' }),
    ).not.toBe(before);
    expect(
      fingerprint({ ...LEAVING_GMAIL, body: 'Why leave it? It reads mail.' }),
    ).not.toBe(before);
  });

  it('reads every run of whitespace as one space, so a reflow changes nothing', () => {
    const reflowed = {
      title: '  Leaving   Gmail ',
      excerpt: '\nGmail was a\nrevolution in 2004.\n\n',
      body: 'Why leave it?\n\nBecause it\treads   your\r\nmail.\n',
    };

    expect(fingerprint(reflowed)).toBe(fingerprint(LEAVING_GMAIL));
  });

  it('keeps the three fields apart, so text moving from one to the next is a change', () => {
    expect(
      fingerprint({ title: 'Leaving Gmail', excerpt: 'Gmail', body: 'was' }),
    ).not.toBe(
      fingerprint({ title: 'Leaving', excerpt: 'Gmail Gmail', body: 'was' }),
    );
  });
});
