const motion = matchMedia('(prefers-reduced-motion: reduce)');
const mouse = matchMedia('(hover: hover) and (pointer: fine)');
const contrast = matchMedia('(forced-colors: active)');
const MAX_PARTICLES = 20;
const SPAWN_INTERVAL = 140;
let stop = null;

function startSnow() {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  if (!context) return () => {};

  canvas.className = 'cursor-snow';
  canvas.setAttribute('aria-hidden', 'true');
  document.body.append(canvas);

  const accent = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim();
  const events = new AbortController();
  const options = { passive: true, signal: events.signal };
  let particles = [];
  let frame = 0;
  let lastSpawn = -Infinity;
  let previousTime = 0;

  function clear() {
    cancelAnimationFrame(frame);
    frame = 0;
    previousTime = 0;
    lastSpawn = -Infinity;
    particles = [];
    context.clearRect(0, 0, innerWidth, innerHeight);
  }

  function resize() {
    clear();
    const scale = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.round(innerWidth * scale);
    canvas.height = Math.round(innerHeight * scale);
    context.setTransform(scale, 0, 0, scale, 0, 0);
  }

  function draw(particle) {
    const { size, snowflake } = particle;
    context.beginPath();
    if (snowflake) {
      for (let arm = 0; arm < 6; arm++) {
        const angle = arm * Math.PI / 3;
        const x = Math.cos(angle);
        const y = Math.sin(angle);
        context.moveTo(0, 0);
        context.lineTo(x * size, y * size);
        for (const side of [-1, 1]) {
          context.moveTo(x * size * .55, y * size * .55);
          context.lineTo(x * size * .55 + Math.cos(angle + side * .85) * size * .35,
            y * size * .55 + Math.sin(angle + side * .85) * size * .35);
        }
      }
      context.stroke();
    } else {
      for (let point = 0; point < 8; point++) {
        const angle = point * Math.PI / 4;
        const radius = point % 2 ? size * .25 : size;
        context.lineTo(Math.cos(angle) * radius, Math.sin(angle) * radius);
      }
      context.closePath();
      context.fill();
    }
  }

  function animate(now) {
    const elapsed = previousTime ? Math.min((now - previousTime) / 1000, .05) : 0;
    previousTime = now;
    context.clearRect(0, 0, innerWidth, innerHeight);
    particles = particles.filter(particle => now - particle.born < particle.life);
    for (const particle of particles) {
      const age = now - particle.born;
      particle.x += particle.drift * elapsed;
      particle.y += particle.fall * elapsed;
      particle.angle += elapsed * .12;
      context.save();
      context.translate(particle.x, particle.y);
      context.rotate(particle.angle);
      // Start visible at the cursor tip, then fade as the particle falls away.
      context.globalAlpha = (1 - age / particle.life) * particle.opacity;
      context.strokeStyle = context.fillStyle = particle.color;
      context.lineWidth = .8;
      context.lineCap = 'round';
      draw(particle);
      context.restore();
    }
    frame = particles.length ? requestAnimationFrame(animate) : 0;
    if (!frame) previousTime = 0;
  }

  function spawnOnMove(event) {
    if (event.pointerType !== 'mouse' || event.buttons || document.hidden) return;
    const now = performance.now();
    if (now - lastSpawn < SPAWN_INTERVAL || particles.length >= MAX_PARTICLES) return;
    lastSpawn = now;
    const color = Math.random();
    particles.push({
      x: event.clientX + (Math.random() - .5) * 2,
      y: event.clientY + (Math.random() - .5) * 2,
      born: now,
      life: 1800 + Math.random() * 1000,
      size: 2.5 + Math.random() * 2,
      // Weighted palette: 15% rose, 18% light grey, 47% grey, 20% charcoal.
      color: color < .15 ? accent : color < .33 ? '#c4c1c2' : color < .8 ? '#8c8a87' : '#1e1e1c',
      opacity: .3 + Math.random() * .15,
      snowflake: Math.random() < .5,
      fall: 14 + Math.random() * 14,
      drift: (Math.random() - .5) * 16,
      angle: Math.random() * Math.PI,
    });
    if (!frame) frame = requestAnimationFrame(animate);
  }

  window.addEventListener('pointermove', spawnOnMove, options);

  window.addEventListener('resize', resize, options);
  window.addEventListener('blur', clear, options);
  window.addEventListener('pagehide', clear, options);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) clear();
  }, options);
  resize();

  return () => {
    clear();
    events.abort();
    canvas.remove();
  };
}

function updateSnow() {
  const enabled = mouse.matches && !motion.matches && !contrast.matches;
  if (enabled && !stop) stop = startSnow();
  if (!enabled && stop) {
    stop();
    stop = null;
  }
}

for (const preference of [motion, mouse, contrast]) preference.addEventListener('change', updateSnow);
updateSnow();
