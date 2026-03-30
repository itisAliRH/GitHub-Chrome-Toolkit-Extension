/** Finds GitHub's native "Delete branch" button in the merge status box. */
export function findNativeDeleteButton(): HTMLButtonElement | null {
  // GitHub renders a submit button inside a delete-branch form at the bottom of the PR timeline
  return (
    document.querySelector<HTMLButtonElement>('form[action*="delete-branch"] button[type="submit"]') ??
    document.querySelector<HTMLButtonElement>('button[data-ga-click*="delete branch" i]') ??
    // Fallback: scan all buttons for exact text match
    Array.from(document.querySelectorAll<HTMLButtonElement>('button')).find(
      (b) => b.textContent?.trim() === 'Delete branch',
    ) ?? null
  );
}

/** Creates the shortcut delete button styled to GitHub's dark theme. */
export function createDeleteButton(nativeButton: HTMLButtonElement): HTMLButtonElement {
  const btn = document.createElement('button');
  btn.id = 'gh-toolkit-delete-branch';
  btn.type = 'button';
  btn.textContent = '🗑 Delete branch';
  btn.title = 'Delete the head branch (scrolls to and clicks the native button)';
  btn.style.cssText = [
    'border:1px solid #f85149',
    'border-radius:6px',
    'padding:4px 12px',
    'background:transparent',
    'color:#f85149',
    'font-size:12px',
    'font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif',
    'cursor:pointer',
    'display:inline-flex',
    'align-items:center',
    'gap:5px',
    'vertical-align:middle',
  ].join(';');

  btn.addEventListener('mouseenter', () => { btn.style.background = 'rgba(248,81,73,.1)'; });
  btn.addEventListener('mouseleave', () => { btn.style.background = 'transparent'; });

  btn.addEventListener('click', () => {
    nativeButton.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setTimeout(() => { nativeButton.click(); }, 300);
    btn.remove();
  });

  return btn;
}

/** Inserts btn immediately after the Merged/Closed status badge. */
export function insertAfterBadge(btn: HTMLButtonElement): void {
  const badge = document.querySelector<HTMLElement>(
    '.gh-header-meta .State, [class*="State--merged"], [class*="State--closed"]',
  );
  if (!badge) return;
  badge.insertAdjacentElement('afterend', btn);
}
