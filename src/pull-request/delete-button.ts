/** Finds GitHub's native "Delete branch" button in the merge status box. */
export function findNativeDeleteButton(): HTMLButtonElement | null {
  // Legacy GitHub: form-based delete action
  const legacy =
    document.querySelector<HTMLButtonElement>('form[action*="delete-branch"] button[type="submit"]') ??
    document.querySelector<HTMLButtonElement>('button[data-ga-click*="delete branch" i]');
  if (legacy) return legacy;

  // New GitHub React UI: button is inside the merge box, identified by text content
  const mergeBox = document.querySelector('[data-testid="mergebox-partial"]');
  const scope = mergeBox ?? document;
  return (
    Array.from(scope.querySelectorAll<HTMLButtonElement>('button')).find(
      (b) => b.textContent?.includes('Delete branch'),
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
    nativeButton.click();
    btn.remove();
  });

  return btn;
}

/** Inserts btn immediately after the Merged/Closed status badge. */
export function insertAfterBadge(btn: HTMLButtonElement): void {
  const badge = document.querySelector<HTMLElement>(
    '.gh-header-meta .State, [class*="State--merged"], [class*="State--closed"], [class*="prc-StateLabel"]',
  );
  if (!badge) return;
  badge.insertAdjacentElement('afterend', btn);
}
