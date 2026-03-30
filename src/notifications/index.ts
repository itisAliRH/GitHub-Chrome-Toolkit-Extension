import { classifyAll, classifyItem, ITEM_SELECTOR } from './classifier.js';
import { createFilterBar } from './filter-bar.js';
import { openSelected, openAllVisible } from './tabs.js';
import type { FilterState } from './filter-bar.js';
import { waitForElement, onSPANavigate } from '../shared/dom-utils.js';

const LIST_SELECTOR = [
  'ul.notifications-list',
  '.notifications-list',
  'div[data-testid="notifications-list"] ul',
].join(', ');

let listRoot: Element | null = null;
let observer: MutationObserver | null = null;

async function init(): Promise<void> {
  observer?.disconnect();
  observer = null;
  document.getElementById('gh-toolkit-filter-bar')?.remove();

  listRoot = await waitForElement(LIST_SELECTOR);

  classifyAll(listRoot);
  setupObserver(listRoot);

  const bar = createFilterBar(
    (filter: FilterState) => applyFilter(filter),
    () => { if (listRoot) openSelected(listRoot); },
    () => { if (listRoot) openAllVisible(listRoot); },
  );

  const container = listRoot.closest('#js-pjax-container, main') ?? document.body;
  container.insertBefore(bar, container.firstElementChild);
}

function applyFilter(filter: FilterState): void {
  if (!listRoot) return;
  listRoot.querySelectorAll<HTMLElement>(ITEM_SELECTOR).forEach((item) => {
    item.style.display =
      filter === 'all' || item.dataset.ghToolkitStatus === filter ? '' : 'none';
  });
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
