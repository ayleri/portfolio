import { AsciiRenderer } from './renderer';
import { World } from './world';

const STEP = 1 / 60;
const MAX_STEPS = 4;
const SPEED = 0.8;
const FADE_DURATION = 900;

/** Runs the upstream simulation only while its canvas is visible and playing. */
export class OceanEngine {
  private world = new World([
    { kind: 'classic', size: 0.9 },
    { kind: 'hammerhead', size: 1.6, speed: 0.4 },
    { kind: 'tiger', size: 0.55 },
    { kind: 'thresher', size: 1.15 },
    { kind: 'nurse', size: 0.85 },
  ]);
  private renderer: AsciiRenderer;
  private events = new AbortController();
  private resizeObserver: ResizeObserver;
  private intersectionObserver: IntersectionObserver;
  private frameId = 0;
  private lastTime = 0;
  private accumulated = 0;
  private visible = false;
  private paused = false;
  private opacity = 1;
  private fadeFrom = 1;
  private fadeTarget = 1;
  private fadeStarted = 0;
  private motion = matchMedia('(prefers-reduced-motion: reduce)');

  constructor(private canvas: HTMLCanvasElement) {
    this.renderer = new AsciiRenderer(canvas);
    const fontFamily = getComputedStyle(canvas).fontFamily;
    this.renderer.setFontFamily(fontFamily);
    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(canvas);
    this.intersectionObserver = new IntersectionObserver(([entry]) => {
      this.visible = entry.isIntersecting;
      this.schedule();
    });
    this.intersectionObserver.observe(canvas);

    const options = { passive: true, signal: this.events.signal };
    // The decorative canvas lets all input through to the page. Observe input
    // passively on the window so links, text selection, and scrolling keep working.
    window.addEventListener('pointermove', this.onPointerMove, options);
    window.addEventListener('pointerdown', this.onPointerDown, options);
    window.addEventListener('pointercancel', this.clearPointer, options);
    document.documentElement.addEventListener('pointerleave', this.clearPointer, options);
    window.addEventListener('blur', this.clearPointer, options);
    document.addEventListener('visibilitychange', () => {
      this.clearPointer();
      this.schedule();
    }, options);
    this.resize();
    // Canvas text does not start webfont loading or repaint itself when it loads.
    document.fonts.load(`400 16px ${fontFamily}`).then(() => {
      if (!this.events.signal.aborted) this.renderer.render(this.world, 0, this.opacity);
    }).catch(() => {
      // Keep the system monospace fallback if the optional font cannot load.
    });
  }

  setPaused(paused: boolean, hideAnimals = paused) {
    const now = performance.now();
    this.updateOpacity(now);
    this.paused = paused;
    this.fadeFrom = this.opacity;
    this.fadeTarget = paused && hideAnimals ? 0 : 1;
    this.fadeStarted = now;
    if (this.motion.matches) this.opacity = this.fadeFrom = this.fadeTarget;
    this.clearPointer();
    this.renderer.render(this.world, 0, this.opacity);
    this.schedule();
  }

  destroy() {
    cancelAnimationFrame(this.frameId);
    this.events.abort();
    this.resizeObserver.disconnect();
    this.intersectionObserver.disconnect();
  }

  addRandomShark() {
    this.world.addRandomShark();
    this.renderer.render(this.world, 0, this.opacity);
    return this.world.sharks.length;
  }

  private resize() {
    const { width, height } = this.canvas.getBoundingClientRect();
    if (width < 1 || height < 1) return;
    this.renderer.resize(width, height, Math.min(devicePixelRatio || 1, 2));
    this.world.resize(width, height, this.renderer.cellWidth, this.renderer.cellHeight);
    // Give the initial frame a settled composition, including without animation.
    if (this.world.time === 0) {
      for (let i = 0; i < 120; i++) this.world.step(STEP);
    }
    this.renderer.render(this.world, this.paused ? 0 : STEP, this.opacity);
  }

  private updateOpacity(now: number) {
    const progress = Math.min(1, Math.max(0, (now - this.fadeStarted) / FADE_DURATION));
    const eased = progress * progress * (3 - 2 * progress);
    this.opacity = this.fadeFrom + (this.fadeTarget - this.fadeFrom) * eased;
  }

  private schedule() {
    cancelAnimationFrame(this.frameId);
    this.frameId = 0;
    this.accumulated = 0;
    if (!this.visible || document.hidden || (this.paused && this.opacity === this.fadeTarget)) return;
    this.lastTime = performance.now();
    this.frameId = requestAnimationFrame(this.frame);
  }

  private frame = (now: number) => {
    this.frameId = 0;
    const elapsed = Math.min((now - this.lastTime) / 1000, 0.1) * SPEED;
    this.lastTime = now;
    const moving = !this.paused || (this.fadeTarget === 0 && this.opacity > 0);
    if (moving) {
      this.accumulated += elapsed;
      let steps = 0;
      while (this.accumulated >= STEP && steps < MAX_STEPS) {
        this.world.step(STEP);
        this.accumulated -= STEP;
        steps++;
      }
      if (steps === MAX_STEPS) this.accumulated = 0;
    }
    this.updateOpacity(now);
    this.renderer.render(this.world, moving ? elapsed : 0, this.opacity);
    if (!this.paused || this.opacity !== this.fadeTarget) {
      this.frameId = requestAnimationFrame(this.frame);
    }
  };

  private point(event: PointerEvent) {
    const bounds = this.canvas.getBoundingClientRect();
    return { x: event.clientX - bounds.left, y: event.clientY - bounds.top };
  }

  private onPointerMove = (event: PointerEvent) => {
    if (this.paused || event.pointerType === 'touch' || event.buttons) {
      this.clearPointer();
      return;
    }
    Object.assign(this.world.pointer, this.point(event), { active: true });
  };

  private onPointerDown = (event: PointerEvent) => {
    if (this.paused || event.button !== 0 || event.defaultPrevented) return;
    if (event.target instanceof Element && event.target.closest('a, button, input, textarea, select, video, [role="button"]')) return;
    const { x, y } = this.point(event);
    this.world.splash(x, y);
  };

  private clearPointer = () => {
    this.world.pointer.active = false;
  };
}
