import type { NotificationStatus } from './classifier.js';

export type FilterState = Exclude<NotificationStatus, 'unknown'> | 'all';

interface FilterDef {
  label: string;
  value: Exclude<NotificationStatus, 'unknown'>;
  color: string;
  shape: 'circle' | 'hexagon';
}

const FILTERS: FilterDef[] = [
  { label: 'Open',   value: 'open',   color: '#3fb950', shape: 'circle'  },
  { label: 'Merged', value: 'merged', color: '#a371f7', shape: 'hexagon' },
  { label: 'Closed', value: 'closed', color: '#f85149', shape: 'circle'  },
  { label: 'Muted',  value: 'muted',  color: '#6e7681', shape: 'circle'  },
];

const SVG_NS = 'http://www.w3.org/2000/svg';

function makeDotSvg(color: string, shape: FilterDef['shape']): SVGSVGElement {
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
  btn.appendChild(makeDotSvg(f.color, f.shape));
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
  ].join('');
  document.head.appendChild(style);
}

/**
 * Creates and returns the filter bar element.
 * Does NOT insert it into the DOM — caller is responsible for placement.
 */
export function createFilterBar(
  onFilter: (status: FilterState) => void,
  onOpenSelected: () => void,
  onOpenAllVisible: () => void,
): HTMLElement {
  injectStyles();

  const bar = document.createElement('div');
  bar.id = 'gh-toolkit-filter-bar';
  bar.setAttribute('role', 'toolbar');
  bar.setAttribute('aria-label', 'GitHub Chrome Toolkit Extension filters');

  const label = document.createElement('span');
  label.className = 'gh-tk-label';
  label.textContent = 'Filter';
  bar.appendChild(label);

  let active: NotificationStatus | null = null;

  FILTERS.forEach((f) => {
    const btn = makeFilterButton(f);
    btn.addEventListener('click', () => {
      if (active === f.value) {
        active = null;
        updateActive(bar, null);
        onFilter('all');
      } else {
        active = f.value;
        updateActive(bar, f.value);
        onFilter(f.value);
      }
    });
    bar.appendChild(btn);
  });

  const sep = document.createElement('div');
  sep.className = 'gh-tk-sep';
  sep.setAttribute('aria-hidden', 'true');
  bar.appendChild(sep);

  const openSelected = document.createElement('button');
  openSelected.className = 'gh-tk-btn';
  openSelected.type = 'button';
  openSelected.textContent = 'Open Selected';
  openSelected.addEventListener('click', onOpenSelected);
  bar.appendChild(openSelected);

  const openAll = document.createElement('button');
  openAll.className = 'gh-tk-btn';
  openAll.type = 'button';
  openAll.textContent = 'Open All Visible';
  openAll.addEventListener('click', onOpenAllVisible);
  bar.appendChild(openAll);

  return bar;
}

function updateActive(bar: HTMLElement, active: string | null): void {
  bar.querySelectorAll<HTMLButtonElement>('.gh-tk-filter').forEach((btn) => {
    btn.classList.toggle('gh-tk-active', btn.dataset.filter === active);
  });
}
