import { describe, it, expect, afterEach } from 'vitest';
import { detectPRState } from '../../src/pull-request/detector.js';

function setBody(html: string): void {
  document.body.innerHTML = html;
}

afterEach(() => { document.body.innerHTML = ''; });

describe('detectPRState', () => {
  it('detects merged from State--merged class', () => {
    setBody('<div class="gh-header-meta"><span class="State State--merged">Merged</span></div>');
    expect(detectPRState()).toBe('merged');
  });
  it('detects closed from State--closed class', () => {
    setBody('<div class="gh-header-meta"><span class="State State--closed">Closed</span></div>');
    expect(detectPRState()).toBe('closed');
  });
  it('detects open from State--open class', () => {
    setBody('<div class="gh-header-meta"><span class="State State--open">Open</span></div>');
    expect(detectPRState()).toBe('open');
  });
  it('falls back to text content for merged', () => {
    setBody('<div class="gh-header-meta"><span class="State">Merged</span></div>');
    expect(detectPRState()).toBe('merged');
  });
  it('returns null when no badge found', () => {
    setBody('<div class="gh-header-meta"><h1>No badge here</h1></div>');
    expect(detectPRState()).toBeNull();
  });
});
