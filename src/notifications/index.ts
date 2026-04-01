import { classifyAll, classifyItem, ITEM_SELECTOR } from './classifier.js';
import { createFilterBar } from './filter-bar.js';
import { openSelected, openAllVisible } from './tabs.js';
import type { FilterState, FilterValue } from './filter-bar.js';
import { waitForElement, onSPANavigate } from '../shared/dom-utils.js';

const LIST_SELECTOR = [
  'ul.notifications-list',
  '.notifications-list',
  'div[data-testid="notifications-list"] ul',
].join(', ');

const STORAGE_KEY = 'gh-toolkit-active-filters';

let listRoot: Element | null = null;
let observer: MutationObserver | null = null;

async function init(): Promise<void> {
  observer?.disconnect();
  observer = null;
  document.getElementById('gh-toolkit-filter-bar')?.remove();

  listRoot = await waitForElement(LIST_SELECTOR);

  classifyAll(listRoot);
  setupObserver(listRoot);

  // Restore filter persisted before a refresh-triggered reload
  const savedRaw = sessionStorage.getItem(STORAGE_KEY);
  sessionStorage.removeItem(STORAGE_KEY);
  const initialActive: FilterState | undefined = savedRaw
    ? new Set(JSON.parse(savedRaw) as FilterValue[])
    : undefined;

  const { element: bar, updateSelectedCount } = createFilterBar(
    (active, refresh) => applyFilter(active, refresh),
    () => { if (listRoot) openSelected(listRoot); },
    () => { if (listRoot) openAllVisible(listRoot); },
    initialActive,
  );

  // Keep "Open Selected" count in sync with checkbox changes
  listRoot.addEventListener('change', (e) => {
    if ((e.target as HTMLElement).matches('input[type="checkbox"]')) {
      updateSelectedCount(countChecked(listRoot!));
    }
  });

  const container = listRoot.closest('#js-pjax-container, main') ?? document.body;
  container.insertBefore(bar, container.firstElementChild);

  // Apply restored filter without triggering another reload
  if (initialActive && initialActive.size > 0) {
    applyFilter(initialActive, false);
  }
}

function countChecked(root: Element): number {
  return root.querySelectorAll<HTMLInputElement>('input[type="checkbox"]:checked').length;
}

function applyFilter(active: FilterState, refresh: boolean): void {
  if (!listRoot) return;

  let needed = false;
  listRoot.querySelectorAll<HTMLElement>(ITEM_SELECTOR).forEach((item) => {
    const shouldShow =
      active.size === 0 || active.has(item.dataset.ghToolkitStatus as FilterValue);
    const isShown = item.style.display !== 'none';
    if (shouldShow !== isShown) needed = true;
    item.style.display = shouldShow ? '' : 'none';
  });

  if (refresh && needed) {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify([...active]));
    location.reload();
  }
}

function setupObserver(root: Element): void {
  observer = new MutationObserver((mutations) => {
    for (const m of mutations) {
      m.addedNodes.forEach((node) => {
        if (!(node instanceof Element)) return;
        if (node.matches(ITEM_SELECTOR)) {
          (node as HTMLElement).dataset.ghToolkitStatus = classifyItem(node);
        } else {
          classifyAll(node);
        }
      });
    }
  });
  observer.observe(root, { childList: true, subtree: true });
}

init();
onSPANavigate(() => init());
