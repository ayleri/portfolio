import './demo.mjs';

const panels = [...document.querySelectorAll('main [data-panel]')];
const links = [...document.querySelectorAll('.navbar [data-tab]')];
const normalize = path => path.replace(/\/$/, '') || '/';
const routes = new Map(links.map(link => [normalize(new URL(link.href).pathname), link.dataset.tab]));
// Keep older /about/ links and browser-history entries working.
routes.set('/about', 'about');

function showPanel(focus = false) {
  const active = routes.get(normalize(location.pathname));
  if (!active) return;

  for (const panel of panels) {
    const hidden = panel.dataset.panel !== active;
    if (hidden && !panel.hidden) panel.dispatchEvent(new Event('panelhide'));
    if (panel.hidden !== hidden) panel.hidden = hidden;
    if (!hidden && focus) panel.focus({ preventScroll: true });
  }
  for (const link of links) {
    if (link.dataset.tab === active) {
      if (link.getAttribute('aria-current') !== 'page') link.setAttribute('aria-current', 'page');
    } else {
      link.removeAttribute('aria-current');
    }
  }
}

document.addEventListener('click', event => {
  if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  const link = event.target.closest('a');
  if (!link || link.hasAttribute('download') || (link.target && link.target !== '_self')) return;

  const url = new URL(link.href);
  if (url.origin !== location.origin || !routes.has(normalize(url.pathname)) || url.hash) return;

  event.preventDefault();
  if (url.href !== location.href) history.pushState(null, '', url.pathname + url.search);
  showPanel(true);
  window.scrollTo(0, 0);
});

window.addEventListener('popstate', () => showPanel());
showPanel();

// Leave the meta tag empty until you have your own GoatCounter endpoint.
const endpoint = document.querySelector('meta[name="goatcounter"]')?.content.trim();
if (endpoint) {
  const script = document.createElement('script');
  script.dataset.goatcounter = endpoint;
  script.async = true;
  script.src = 'https://gc.zgo.at/count.js';
  document.head.append(script);
}
