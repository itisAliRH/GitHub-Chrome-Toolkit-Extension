export type PRState = 'open' | 'merged' | 'closed';

/** Reads the PR status badge and returns the current PR state, or null if not found. */
export function detectPRState(): PRState | null {
  const badge = document.querySelector<HTMLElement>(
    '.gh-header-meta .State, [class*="State--merged"], [class*="State--closed"], [class*="State--open"]',
  );
  if (!badge) return null;

  const cls = badge.className;
  const text = badge.textContent?.trim().toLowerCase() ?? '';

  if (cls.includes('State--merged') || text === 'merged') return 'merged';
  if (cls.includes('State--closed') || text === 'closed') return 'closed';
  if (cls.includes('State--open')   || text === 'open')   return 'open';

  return null;
}
