const links = [...document.querySelectorAll('.footer-link')];

// Re-entering or refocusing an icon makes its label available again.
for (const link of links) {
  const reset = () => {
    for (const other of links) {
      other.toggleAttribute('data-tooltip-dismissed', other !== link);
    }
  };
  link.addEventListener('pointerover', event => {
    if (event.target === link) reset();
  });
  link.addEventListener('focus', reset);
}

document.addEventListener('keydown', event => {
  if (event.key !== 'Escape') return;
  for (const link of links) {
    if (link.matches(':hover, :focus-visible')) {
      link.setAttribute('data-tooltip-dismissed', '');
    }
  }
});
