(() => {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let framePending = false;

  function updateStars() {
    framePending = false;
    // Short catalogue sections should still reach the subdued background at the bottom.
    const availableScroll = document.documentElement.scrollHeight - window.innerHeight;
    const fadeDistance = Math.max(Math.min(window.innerHeight * 0.6, availableScroll), 1);
    const progress = Math.min(Math.max(window.scrollY / fadeDistance, 0), 1);
    const opacity = reducedMotion.matches ? 0.1 : 1 - progress * 0.9;
    document.body.style.setProperty('--catalogue-stars-opacity', String(opacity));
  }

  function scheduleUpdate() {
    if (framePending) return;
    framePending = true;
    window.requestAnimationFrame(updateStars);
  }

  window.addEventListener('scroll', scheduleUpdate, { passive: true });
  window.addEventListener('resize', scheduleUpdate);
  window.addEventListener('pageshow', scheduleUpdate);
  reducedMotion.addEventListener('change', scheduleUpdate);
  updateStars();
})();
