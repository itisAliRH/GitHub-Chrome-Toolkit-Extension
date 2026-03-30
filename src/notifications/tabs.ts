import { ITEM_SELECTOR } from './classifier.js';

function getNotificationUrl(item: Element): string | null {
  // Prefer links to the actual PR/issue/commit over thread links
  const link = item.querySelector<HTMLAnchorElement>(
    'a[href*="/pull/"], a[href*="/issues/"], a[href*="/commit/"], a[href]',
  );
  return link?.href ?? null;
}

/** Opens URLs for items whose GitHub checkbox is currently checked. */
export function openSelected(root: Element): void {
  const urls: string[] = [];
  root.querySelectorAll<HTMLInputElement>('input[type="checkbox"]:checked').forEach((cb) => {
    const item = cb.closest(ITEM_SELECTOR);
    const url = item ? getNotificationUrl(item) : null;
    if (url) urls.push(url);
  });
  sendOpenTabs(urls);
}

/** Opens URLs for all currently visible (non-hidden) notification items. */
export function openAllVisible(root: Element): void {
  const urls: string[] = [];
  root.querySelectorAll<HTMLElement>(ITEM_SELECTOR).forEach((item) => {
    if (item.style.display === 'none' || !item.offsetParent) return;
    const url = getNotificationUrl(item);
    if (url) urls.push(url);
  });
  sendOpenTabs(urls);
}

function sendOpenTabs(urls: string[]): void {
  if (urls.length === 0) return;
  chrome.runtime.sendMessage({ type: 'OPEN_TABS', urls });
}
