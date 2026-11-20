import { useEffect, useState } from 'react';
import { getSeoPyramidsConfig } from '../seopyramids.config.ts';

/** How long the browser shows the decoy address before the real one, in ms. */
export const EMAIL_REVEAL_DELAY_MS = 5000;

/**
 * Hands `reveal` the real contact address after `EMAIL_REVEAL_DELAY_MS`;
 * returns the cancel.
 */
export function revealContactEmail(
  reveal: (email: string) => void,
): () => void {
  const { contact } = getSeoPyramidsConfig();
  const timer = setTimeout(() => reveal(contact.email), EMAIL_REVEAL_DELAY_MS);
  return () => clearTimeout(timer);
}

/**
 * The contact address to show: the decoy at prerender and on the first
 * render in the browser, the real one five seconds later. A bot that reads
 * the HTML, or leaves before the delay, only gets the decoy.
 */
export function useContactEmail(): string {
  const [email, setEmail] = useState(getSeoPyramidsConfig().contact.decoyEmail);
  useEffect(() => revealContactEmail(setEmail), []);
  return email;
}
