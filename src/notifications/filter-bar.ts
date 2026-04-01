import type { NotificationStatus } from './classifier.js';

export type FilterValue = Exclude<NotificationStatus, 'unknown'>;
export type FilterState = Set<FilterValue>;

export interface FilterBarResult {
  element: HTMLElement;
  updateSelectedCount: (n: number) => void;
}

interface FilterDef {
  label: string;
  value: FilterValue;
  color: string;
  shape: 'circle' | 'hexagon';
}

interface ComboFilterDef {
  label: string;
  values: FilterValue[];
  colors: string[];
  shapes: FilterDef['shape'][];
}

const FILTERS: FilterDef[] = [
  { label: 'Open',   value: 'open',   color: '#3fb950', shape: 'circle'  },
  { label: 'Merged', value: 'merged', color: '#a371f7', shape: 'hexagon' },
  { label: 'Closed', value: 'closed', color: '#f85149', shape: 'circle'  },
  { label: 'Muted',  value: 'muted',  color: '#6e7681', shape: 'circle'  },
];

const COMBO_FILTERS: ComboFilterDef[] = [
  {
    label: 'Merged+Closed',
    values: ['merged', 'closed'],
    colors: ['#a371f7', '#f85149'],
    shapes: ['hexagon', 'circle'],
  },
];

const SVG_NS = 'http://www.w3.org/2000/svg';

function makeShape(color: string, shape: FilterDef['shape']): SVGSVGElement {
  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('width', '10');
  svg.setAttribute('height', '10');
  svg.setAttribute('viewBox', '0 0 10 10');
  svg.setAttribute('aria-hidden', 'true');

  if (shape === 'circle') {
    const circle = document.createElementNS(SVG_NS, 'circle');
    circle.setAttribute('cx', '5');
    circle.setAttribute('cy', '5');
    circle.setAttribute('r', '5');
    circle.setAttribute('fill', color);
    svg.appendChild(circle);
  } else {
    const poly = document.createElementNS(SVG_NS, 'polygon');
    poly.setAttribute('points', '5,0 9.3,2.5 9.3,7.5 5,10 0.7,7.5 0.7,2.5');
    poly.setAttribute('fill', color);
    svg.appendChild(poly);
  }
  return svg;
}

function makeFilterButton(f: FilterDef): HTMLButtonElement {
  const btn = document.createElement('button');
  btn.className = 'gh-tk-btn gh-tk-filter';
  btn.dataset.filter = f.value;
  btn.type = 'button';
  btn.appendChild(makeShape(f.color, f.shape));
  btn.appendChild(document.createTextNode(` ${f.label}`));
  return btn;
}

function makeComboButton(f: ComboFilterDef): HTMLButtonElement {
  const btn = document.createElement('button');
  btn.className = 'gh-tk-btn gh-tk-combo';
  btn.dataset.comboFilter = f.values.join(',');
  btn.type = 'button';
  f.colors.forEach((color, i) => btn.appendChild(makeShape(color, f.shapes[i])));
  btn.appendChild(document.createTextNode(` ${f.label}`));
  return btn;
}

function injectStyles(): void {
  if (document.getElementById('gh-toolkit-styles')) return;
  const style = document.createElement('style');
  style.id = 'gh-toolkit-styles';
  style.textContent = [
    '#gh-toolkit-filter-bar{display:flex;align-items:center;flex-wrap:wrap;gap:6px;',
    'padding:7px 16px;background:#0d1117;border-bottom:1px solid #21262d;',
    'font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}',
    '.gh-tk-label{color:#6e7681;font-size:11px;font-weight:600;text-transform:uppercase;',
    'letter-spacing:.05em;margin-right:2px}',
    '.gh-tk-btn{display:inline-flex;align-items:center;gap:5px;border:1px solid #30363d;',
    'border-radius:999px;padding:3px 10px;background:#161b22;color:#8b949e;',
    'font-size:12px;cursor:pointer;transition:border-color .15s,color .15s}',
    '.gh-tk-btn:hover{border-color:#58a6ff;color:#c9d1d9}',
    '.gh-tk-btn.gh-tk-active{border-color:#388bfd;color:#58a6ff;background:#0d1117}',
    '.gh-tk-sep{width:1px;height:18px;background:#30363d;margin:0 2px;flex-shrink:0}',
    '.gh-tk-refresh{display:inline-flex;align-items:center;gap:4px;color:#6e7681;',
    'font-size:12px;cursor:pointer;user-select:none}',
    '.gh-tk-refresh input{accent-color:#388bfd;cursor:pointer;margin:0}',
  ].join('');
  document.head.appendChild(style);
}

/**
 * Creates and returns the filter bar.
 * Does NOT insert it into the DOM — caller is responsible for placement.
 * Pass initialActive to restore a previously saved filter state.
 */
export function createFilterBar(
  onFilter: (active: FilterState, refresh: boolean) => void,
  onOpenSelected: () => void,
  onOpenAllVisible: () => void,
  initialActive?: FilterState,
): FilterBarResult {
  injectStyles();

  const bar = document.createElement('div');
  bar.id = 'gh-toolkit-filter-bar';
  bar.setAttribute('role', 'toolbar');
  bar.setAttribute('aria-label', 'GitHub Chrome Toolkit Extension filters');

  const label = document.createElement('span');
  label.className = 'gh-tk-label';
  label.textContent = 'Filter';
  bar.appendChild(label);

  const active: FilterState = new Set(initialActive);

  const emit = () => onFilter(new Set(active), refreshCb.checked);

  FILTERS.forEach((f) => {
    const btn = makeFilterButton(f);
    btn.addEventListener('click', () => {
      if (active.has(f.value)) active.delete(f.value);
      else active.add(f.value);
      syncActive(bar, active);
      emit();
    });
    bar.appendChild(btn);
  });

  COMBO_FILTERS.forEach((f) => {
    const btn = makeComboButton(f);
    btn.addEventListener('click', () => {
      const allOn = f.values.every((v) => active.has(v));
      if (allOn) f.values.forEach((v) => active.delete(v));
      else f.values.forEach((v) => active.add(v));
      syncActive(bar, active);
      emit();
    });
    bar.appendChild(btn);
  });

  const sep = document.createElement('div');
  sep.className = 'gh-tk-sep';
  sep.setAttribute('aria-hidden', 'true');
  bar.appendChild(sep);

  // Refresh checkbox
  const refreshLabel = document.createElement('label');
  refreshLabel.className = 'gh-tk-refresh';
  const refreshCb = document.createElement('input');
  refreshCb.type = 'checkbox';
  refreshCb.id = 'gh-tk-refresh-cb';
  refreshLabel.appendChild(refreshCb);
  refreshLabel.appendChild(document.createTextNode('Refresh'));
  bar.appendChild(refreshLabel);

  const sep2 = document.createElement('div');
  sep2.className = 'gh-tk-sep';
  sep2.setAttribute('aria-hidden', 'true');
  bar.appendChild(sep2);

  const openSelectedBtn = document.createElement('button');
  openSelectedBtn.className = 'gh-tk-btn';
  openSelectedBtn.type = 'button';
  openSelectedBtn.textContent = 'Open Selected';
  openSelectedBtn.addEventListener('click', onOpenSelected);
  bar.appendChild(openSelectedBtn);

  const openAll = document.createElement('button');
  openAll.className = 'gh-tk-btn';
  openAll.type = 'button';
  openAll.textContent = 'Open All Visible';
  openAll.addEventListener('click', onOpenAllVisible);
  bar.appendChild(openAll);

  // Apply initial state visually (no callback fired — caller applies filter separately)
  if (initialActive && initialActive.size > 0) {
    syncActive(bar, active);
  }

  return {
    element: bar,
    updateSelectedCount(n: number) {
      openSelectedBtn.textContent = n > 0 ? `Open Selected (${n})` : 'Open Selected';
    },
  };
}

function syncActive(bar: HTMLElement, active: FilterState): void {
  bar.querySelectorAll<HTMLButtonElement>('.gh-tk-filter').forEach((btn) => {
    btn.classList.toggle('gh-tk-active', active.has(btn.dataset.filter as FilterValue));
  });

  bar.querySelectorAll<HTMLButtonElement>('.gh-tk-combo').forEach((btn) => {
    const values = (btn.dataset.comboFilter ?? '').split(',') as FilterValue[];
    btn.classList.toggle('gh-tk-active', values.every((v) => active.has(v)));
  });
}
