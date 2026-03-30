import { describe, it, expect, afterEach } from 'vitest';
import { classifyItem, classifyAll, ITEM_SELECTOR } from '../../src/notifications/classifier.js';

function makeItem(iconClass: string): Element {
  const li = document.createElement('li');
  li.className = 'notifications-list-item';
  const svg = document.createElement('svg');
  svg.className = `octicon ${iconClass}`;
  li.appendChild(svg);
  return li;
}

afterEach(() => { document.body.innerHTML = ''; });

describe('classifyItem', () => {
  it('returns open for color-fg-open', () => {
    expect(classifyItem(makeItem('color-fg-open'))).toBe('open');
  });
  it('returns merged for color-fg-done', () => {
    expect(classifyItem(makeItem('color-fg-done'))).toBe('merged');
  });
  it('returns closed for color-fg-closed', () => {
    expect(classifyItem(makeItem('color-fg-closed'))).toBe('closed');
  });
  it('returns muted for color-fg-muted', () => {
    expect(classifyItem(makeItem('color-fg-muted'))).toBe('muted');
  });
  it('returns muted for color-fg-subtle', () => {
    expect(classifyItem(makeItem('color-fg-subtle'))).toBe('muted');
  });
  it('returns unknown for unrecognized class', () => {
    expect(classifyItem(makeItem('some-other-class'))).toBe('unknown');
  });
  it('returns unknown when no icon present', () => {
    expect(classifyItem(document.createElement('li'))).toBe('unknown');
  });
  it('returns muted for color-fg-default', () => {
    expect(classifyItem(makeItem('color-fg-default'))).toBe('muted');
  });
});

describe('classifyAll', () => {
  it('stamps data-gh-toolkit-status on all matched items', () => {
    const root = document.createElement('div');

    const open = document.createElement('li');
    open.className = 'notifications-list-item';
    const svgOpen = document.createElement('svg');
    svgOpen.className = 'octicon color-fg-open';
    open.appendChild(svgOpen);

    const merged = document.createElement('li');
    merged.className = 'notifications-list-item';
    const svgMerged = document.createElement('svg');
    svgMerged.className = 'octicon color-fg-done';
    merged.appendChild(svgMerged);

    root.appendChild(open);
    root.appendChild(merged);

    classifyAll(root);

    expect((open as HTMLElement).dataset.ghToolkitStatus).toBe('open');
    expect((merged as HTMLElement).dataset.ghToolkitStatus).toBe('merged');
  });

  it('uses ITEM_SELECTOR to find items', () => {
    const root = document.createElement('div');
    const item = document.createElement('li');
    item.className = 'js-notifications-list-item'; // second selector variant
    const svg = document.createElement('svg');
    svg.className = 'octicon color-fg-closed';
    item.appendChild(svg);
    root.appendChild(item);

    classifyAll(root);

    expect((item as HTMLElement).dataset.ghToolkitStatus).toBe('closed');
  });

  it('ITEM_SELECTOR covers all expected notification row patterns', () => {
    expect(ITEM_SELECTOR).toContain('li.notifications-list-item');
    expect(ITEM_SELECTOR).toContain('li.js-notifications-list-item');
    expect(ITEM_SELECTOR).toContain('div[data-testid="notification-row"]');
  });
});
