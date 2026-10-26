import { OceanEngine } from '../src/lib/ascii-ocean/engine.ts';

class AsciiOcean extends HTMLElement {
  engine;
  events;

  connectedCallback() {
    const canvas = this.querySelector('canvas');
    const button = this.querySelector('.ocean-pause');
    const addButton = this.querySelector('.ocean-add');
    const status = this.querySelector('[role="status"]');
    if (!canvas?.getContext('2d') || !button || !addButton) return;

    this.hidden = false;
    this.engine = new OceanEngine(canvas);
    this.events = new AbortController();
    const options = { signal: this.events.signal };
    const motion = matchMedia('(prefers-reduced-motion: reduce)');
    let userPaused = false;

    const updatePlayback = () => {
      const paused = userPaused || motion.matches;
      this.engine?.setPaused(paused, userPaused);
      button.hidden = motion.matches;
      button.toggleAttribute('data-paused', paused);
      const label = `${paused ? 'Resume' : 'Pause'} ocean animation`;
      button.setAttribute('aria-label', label);
      button.title = label;
    };

    button.addEventListener('click', () => {
      userPaused = !userPaused;
      updatePlayback();
    }, options);
    addButton.addEventListener('click', () => {
      // Make a new arrival visible when the user has paused the ocean.
      if (userPaused) {
        userPaused = false;
        updatePlayback();
      }
      const count = this.engine?.addRandomShark();
      if (status && count) status.textContent = `${count} sharks in the ocean.`;
    }, options);
    motion.addEventListener('change', updatePlayback, options);
    updatePlayback();
  }

  disconnectedCallback() {
    this.engine?.destroy();
    this.events?.abort();
  }
}

customElements.define('ascii-ocean', AsciiOcean);
