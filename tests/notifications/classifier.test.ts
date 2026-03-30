import { describe, it, expect, afterEach } from 'vitest';
import { classifyItem } from '../../src/notifications/classifier.js';

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
});
