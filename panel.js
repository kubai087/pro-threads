/*
 * The settings panel's library (Tweakpane, from jsDelivr), loaded only when
 * the panel is used. An embedded scene never shows the panel, so it never
 * fetches it; and if the CDN can't be reached in time the scene still
 * runs, with a stand-in that accepts every call the pages make and does
 * nothing. On phones the panel starts folded away, with a button to bring
 * it up (there is no H key to press). Shared by both pages.
 */
import { embedded, params } from './persist.js';
import { t } from './i18n.js';

const TWEAKPANE = 'https://cdn.jsdelivr.net/npm/tweakpane@4.0.5/dist/tweakpane.min.js';
const ESSENTIALS = 'https://cdn.jsdelivr.net/npm/@tweakpane/plugin-essentials@0.2.1/dist/tweakpane-plugin-essentials.min.js';
const WAIT = 8000;

const PHONE = '(max-width: 720px)';

const CSS = `
  .tp-toggle {
    display: none;
    position: fixed;
    right: 12px;
    bottom: calc(var(--sheet-h, 0px) + 12px);
    z-index: 10;
    width: 44px;
    height: 44px;
    padding: 0;
    border: 1px solid rgba(255, 255, 255, 0.14);
    border-radius: 50%;
    background: rgba(17, 18, 21, 0.72);
    color: #c9ced8;
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
  }
  body[data-ui="off"] .tp-toggle { bottom: calc(12px + env(safe-area-inset-bottom)); }
  .tp-toggle svg { display: block; margin: auto; width: 20px; height: 20px; fill: none; stroke: currentColor; stroke-width: 1.8; stroke-linecap: round; }
  @media ${PHONE} { .tp-toggle { display: block; } }
`;

// Sliders when the panel is away, a cross when it is up.
const SLIDERS = '<path d="M4 7h10M18 7h2M4 17h4M12 17h8"/><circle cx="16" cy="7" r="2"/><circle cx="10" cy="17" r="2"/>';
const CROSS = '<path d="M6 6l12 12M18 6L6 18"/>';

if (!embedded && !params.has('ui') && matchMedia(PHONE).matches) document.body.dataset.ui = 'off';

function addToggle() {
  const style = document.createElement('style');
  style.textContent = CSS;
  document.head.append(style);
  const button = document.createElement('button');
  button.className = 'tp-toggle';
  button.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"></svg>';
  const sync = () => {
    const off = document.body.dataset.ui === 'off';
    button.firstChild.innerHTML = off ? SLIDERS : CROSS;
    button.setAttribute('aria-label', t('Settings'));
    button.setAttribute('aria-expanded', !off);
  };
  button.addEventListener('click', () => {
    document.body.dataset.ui = document.body.dataset.ui === 'off' ? 'on' : 'off';
  });
  // The H key flips it too.
  new MutationObserver(sync).observe(document.body, { attributeFilter: ['data-ui'] });
  sync();
  document.body.append(button);
}

// Any property is another stand-in, any call returns one; element is a real
// (detached) node, children an empty list, flags false.
function standIn() {
  const element = document.createElement('div');
  const proxy = new Proxy(function () {}, {
    get(_, key) {
      if (key === 'element') return element;
      if (key === 'children') return [];
      if (key === 'pages') return [proxy, proxy, proxy];
      if (key === 'then' || typeof key === 'symbol') return undefined;
      if (['disabled', 'selected', 'hidden', 'expanded'].includes(key)) return false;
      return proxy;
    },
    apply: () => proxy,
    set: () => true,
  });
  return proxy;
}

// A Pane (with the Essentials plugin), or the stand-in.
export async function createPane(options) {
  if (embedded) return standIn();
  try {
    const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), WAIT));
    const [{ Pane }, Essentials] = await Promise.race([Promise.all([import(TWEAKPANE), import(ESSENTIALS)]), timeout]);
    const pane = new Pane(options);
    pane.registerPlugin(Essentials);
    addToggle();
    return pane;
  } catch {
    console.warn('PRO Threads: the settings panel could not be loaded; the scene runs without it.');
    return standIn();
  }
}
