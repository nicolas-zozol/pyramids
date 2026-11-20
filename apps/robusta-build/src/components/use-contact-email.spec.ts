import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getSeoPyramidsConfig } from '../seopyramids.config.ts';
import {
  EMAIL_REVEAL_DELAY_MS,
  revealContactEmail,
} from './use-contact-email.ts';

const { contact } = getSeoPyramidsConfig();

describe('revealContactEmail', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('waits five seconds', () => {
    expect(EMAIL_REVEAL_DELAY_MS).toBe(5000);
  });

  it('hands over the real address once the delay is over, not before', () => {
    const reveal = vi.fn();
    revealContactEmail(reveal);

    vi.advanceTimersByTime(EMAIL_REVEAL_DELAY_MS - 1);
    expect(reveal).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);
    expect(reveal).toHaveBeenCalledExactlyOnceWith(contact.email);
  });

  it('hands over nothing once cancelled, the page left before the delay', () => {
    const reveal = vi.fn();
    const cancel = revealContactEmail(reveal);

    cancel();
    vi.advanceTimersByTime(EMAIL_REVEAL_DELAY_MS);
    expect(reveal).not.toHaveBeenCalled();
  });
});
