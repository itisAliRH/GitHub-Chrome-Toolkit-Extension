/**
 * Resolves when a matching element is found in the DOM.
 * Uses MutationObserver — safe to call before the element exists.
 */
export function waitForElement(
  selector: string,
  root: Document | Element = document,
): Promise<Element> {
  return new Promise((resolve) => {
    const existing = root.querySelector(selector);
    if (existing) { resolve(existing); return; }

    const observeTarget = root instanceof Document ? root.body : root;
    const observer = new MutationObserver(() => {
      const el = root.querySelector(selector);
      if (el) { observer.disconnect(); resolve(el); }
    });
    observer.observe(observeTarget, { childList: true, subtree: true });
  });
}

/**
 * Calls callback after GitHub's SPA navigation completes.
 * GitHub uses Turbo for navigation; older versions used pjax.
 */
export function onSPANavigate(callback: () => void): void {
  document.addEventListener('turbo:load', callback);
  document.addEventListener('pjax:end', callback);
}
