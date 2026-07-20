import { ITEM_SELECTOR } from './classifier.js';

const BAR_ID = 'gh-toolkit-filter-bar';

/**
 * Locates GitHub's notification list header row — the bar holding the "Select all"
 * checkbox, which becomes "N selected / Done / Unsubscribe" once rows are checked.
 *
 * Class names on that row change often, so it is found structurally: the only
 * visible checkbox that is not inside a notification row, then walking up to the
 * first ancestor wide enough to be the row itself (without swallowing the list).
 */
export function findHeaderRow(list: Element): HTMLElement | null {
  const checkboxes = document.querySelectorAll<HTMLInputElement>('input[type="checkbox"]');
  const selectAll = Array.from(checkboxes).find(
    (cb) => !cb.closest(ITEM_SELECTOR) && !cb.closest(`#${BAR_ID}`) && cb.offsetParent !== null,
  );
  if (!selectAll) return null;

  const minWidth = (list as HTMLElement).offsetWidth * 0.8;
  let el = selectAll.parentElement;
  while (el && el !== document.body) {
    if (el.contains(list)) return null;
    if (el.offsetWidth >= minWidth) return el;
    el = el.parentElement;
  }
  return null;
}

/**
 * Keeps the filter bar inside the header row. React re-renders that row whenever the
 * selection changes, which drops our node, so re-attach on any mutation around the list.
 * Falls back to placing the bar above the list while no header row exists.
 * Returns a disposer.
 */
export function mountInHeader(bar: HTMLElement, list: Element): () => void {
  const fallbackParent = list.closest('#js-pjax-container, main') ?? document.body;

  const attach = (): void => {
    const header = findHeaderRow(list);
    if (header) {
      if (bar.parentElement !== header) header.appendChild(bar);
      return;
    }
    if (!bar.isConnected) fallbackParent.insertBefore(bar, fallbackParent.firstElementChild);
  };

  attach();

  let queued = false;
  const observer = new MutationObserver(() => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      attach();
    });
  });
  observer.observe(list.parentElement ?? document.body, { childList: true, subtree: true });

  return () => observer.disconnect();
}
