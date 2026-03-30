export type NotificationStatus = 'open' | 'merged' | 'closed' | 'muted' | 'unknown';

/** CSS selector matching all notification row elements GitHub might render. */
export const ITEM_SELECTOR = [
  'li.notifications-list-item',
  'li.js-notifications-list-item',
  'li.js-notifications-thread',
  'div[data-testid="notification-row"]',
].join(', ');

/** Reads the octicon SVG color class on a notification item and returns its status. */
export function classifyItem(item: Element): NotificationStatus {
  const icon = item.querySelector('svg.octicon, svg[class*="octicon"]');
  if (!icon) return 'unknown';

  const cls = icon.classList;
  if (cls.contains('color-fg-open'))   return 'open';
  if (cls.contains('color-fg-done'))   return 'merged';
  if (cls.contains('color-fg-closed')) return 'closed';
  if (cls.contains('color-fg-muted') || cls.contains('color-fg-subtle') || cls.contains('color-fg-default')) {
    return 'muted';
  }
  return 'unknown';
}

/** Classifies all notification items within root and stamps data-gh-toolkit-status. */
export function classifyAll(root: Element): void {
  root.querySelectorAll(ITEM_SELECTOR).forEach((item) => {
    (item as HTMLElement).dataset.ghToolkitStatus = classifyItem(item);
  });
}
