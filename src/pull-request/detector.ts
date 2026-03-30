export type PRState = 'open' | 'merged' | 'closed';

/** Reads the PR status badge and returns the current PR state, or null if not found. */
export function detectPRState(): PRState | null {
  // Covers legacy GitHub (State--merged) and new Primer React UI (prc-StateLabel-*)
  const badge = document.querySelector<HTMLElement>(
    '.gh-header-meta .State, [class*="State--merged"], [class*="State--closed"], [class*="State--open"], [class*="prc-StateLabel"]',
  );
  if (!badge) return null;

  // New GitHub UI uses hashed class names — read text content and icon class instead
  const cls = badge.className;
  const text = badge.textContent?.trim().toLowerCase() ?? '';

  if (cls.includes('State--merged') || text === 'merged') return 'merged';
  if (cls.includes('State--closed') || text === 'closed') return 'closed';
  if (cls.includes('State--open')   || text === 'open')   return 'open';

  // Icon-based fallback (SVG class is stable even when container class is hashed)
  if (badge.querySelector('.octicon-git-merge'))                                   return 'merged';
  if (badge.querySelector('.octicon-git-pull-request-closed, .octicon-circle-slash')) return 'closed';

  return null;
}
