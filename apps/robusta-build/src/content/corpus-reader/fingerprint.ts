import { createHash } from 'node:crypto';

const WHITESPACE = /\s+/g;
const LENGTH = 12;

/** What an article's fingerprint covers: its title, its excerpt and its raw markdown body. */
export interface FingerprintedText {
  title: string;
  excerpt: string;
  body: string;
}

/** The first 12 hexadecimal characters of the SHA-256 of the text, every run of whitespace read as one space. */
export function fingerprint({
  title,
  excerpt,
  body,
}: FingerprintedText): string {
  // A collapsed field holds no newline, so joining on one keeps the fields apart.
  const text = [title, excerpt, body].map(collapse).join('\n');
  return createHash('sha256').update(text).digest('hex').slice(0, LENGTH);
}

function collapse(field: string): string {
  return field.replace(WHITESPACE, ' ').trim();
}
