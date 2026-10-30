/*
 * <pro-threads>: a live PRO Threads scene in any page.
 *
 *   <script type="module" src="https://cdn.jsdelivr.net/gh/kubai087/pro-threads@main/embed.js"></script>
 *   <pro-threads scene="mobius" style="height: 100vh"></pro-threads>
 *
 * The scene fills the element's box. It is drawn in an iframe, so it can't
 * clash with the page's own styles or scripts, from the hosted site, or
 * from your own copy if `src` points to one. It pauses while scrolled out
 * of view.
 *
 * Attributes (all optional):
 *   scene     pro (the wallpaper, the default), az (the alphabet), ring,
 *             blackhole, perspective, mobius or tunnel
 *   text      the word on the wallpaper, up to 10 letters
 *   palette   xdr-blue, graphite, ember, chroma, violet, ocean, aurora,
 *             rose-gold or paper
 *   fps       the most frames a second: 30, 60 (the default) or 120
 *   settings  any other settings, as a query string; the panel's Embed
 *             button writes it for you
 *   src       where your own copy of the site is, e.g. "/pro-threads/"
 */

const HOSTED = 'https://www.kubai.design/pro-threads/';
const HERO = ['ring', 'blackhole', 'perspective', 'mobius', 'tunnel'];

const STYLE = `
  :host { display: block; position: relative; min-height: 200px; overflow: hidden; background: #000; }
  iframe { position: absolute; inset: 0; width: 100%; height: 100%; border: 0; }
`;

class ProThreads extends HTMLElement {
  static observedAttributes = ['scene', 'text', 'palette', 'fps', 'settings', 'src'];

  connectedCallback() {
    if (!this.shadowRoot) {
      const root = this.attachShadow({ mode: 'open' });
      const style = document.createElement('style');
      style.textContent = STYLE;
      this.frame = document.createElement('iframe');
      this.frame.title = 'PRO Threads';
      this.frame.loading = 'lazy';
      // Decoration: kept out of the tab order and from screen readers.
      this.frame.tabIndex = -1;
      this.frame.setAttribute('aria-hidden', 'true');
      root.append(style, this.frame);
    }
    this.update();
  }

  attributeChangedCallback() {
    if (this.frame) this.update();
  }

  // The address of the scene the attributes ask for.
  get url() {
    const params = new URLSearchParams(this.getAttribute('settings') ?? '');
    const scene = (this.getAttribute('scene') ?? params.get('scene') ?? 'pro').toLowerCase().replace(/[^a-z]/g, '');
    const hero = HERO.includes(scene);
    params.delete('scene');
    params.delete('view');
    if (hero) {
      params.set('scene', scene);
      if (!params.has('landing')) params.set('landing', '0');
    } else if (scene === 'az') {
      params.set('view', 'az');
    }
    for (const key of ['text', 'palette', 'fps']) {
      if (this.hasAttribute(key)) params.set(key, this.getAttribute(key));
    }
    params.set('embed', '1');
    const base = new URL(this.getAttribute('src') || HOSTED, location.href);
    return new URL(`${hero ? 'hero/' : ''}?${params}`, base).href;
  }

  update() {
    const url = this.url;
    if (this.frame.src !== url) this.frame.src = url;
  }
}

if (!customElements.get('pro-threads')) customElements.define('pro-threads', ProThreads);
