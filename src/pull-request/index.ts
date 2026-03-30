import { detectPRState } from './detector.js';
import { findNativeDeleteButton, createDeleteButton, insertAfterBadge } from './delete-button.js';
import { waitForElement } from '../shared/dom-utils.js';

const BADGE_SELECTOR = [
  '.gh-header-meta .State',
  '[class*="State--merged"]',
  '[class*="State--closed"]',
  '[class*="State--open"]',
].join(', ');

async function init(): Promise<void> {
  document.getElementById('gh-toolkit-delete-branch')?.remove();

  await waitForElement(BADGE_SELECTOR);

  const state = detectPRState();
  if (state === 'open' || state === null) return;

  // Allow time for GitHub to render the merge status box (loads after the header)
  await new Promise<void>((resolve) => setTimeout(resolve, 600));

  const nativeBtn = findNativeDeleteButton();
  if (!nativeBtn) return; // branch already deleted or PR not eligible

  insertAfterBadge(createDeleteButton(nativeBtn));
}

init();
