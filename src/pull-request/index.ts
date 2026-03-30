import { detectPRState } from './detector.js';
import { findNativeDeleteButton, createDeleteButton, insertAfterBadge } from './delete-button.js';
import { waitForElement } from '../shared/dom-utils.js';

const BADGE_SELECTOR = [
  // Legacy GitHub Rails HTML
  '.gh-header-meta .State',
  '[class*="State--merged"]',
  '[class*="State--closed"]',
  '[class*="State--open"]',
  // New Primer React UI (class names contain "prc-StateLabel" with a hashed suffix)
  '[class*="prc-StateLabel"]',
].join(', ');

// The merge box is loaded asynchronously by React after the initial page render
const MERGE_BOX_SELECTOR = '[data-testid="mergebox-partial"]';

async function init(): Promise<void> {
  document.getElementById('gh-toolkit-delete-branch')?.remove();

  await waitForElement(BADGE_SELECTOR);

  const state = detectPRState();
  if (state === 'open' || state === null) return;

  // Wait for the async-loaded merge box (contains the native "Delete branch" button)
  await waitForElement(MERGE_BOX_SELECTOR);

  const nativeBtn = findNativeDeleteButton();
  if (!nativeBtn) return; // branch already deleted or PR not eligible

  insertAfterBadge(createDeleteButton(nativeBtn));
}

init();
