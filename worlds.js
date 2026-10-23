(() => {
  'use strict';
  const body = document.body;
  body.classList.add(body.dataset.project ? 'world-detail' : 'store-home');
  // Native scrolling remains in charge. Motion only decorates visible chapters.
  const chapters = [...document.querySelectorAll('[data-world-scene]')];
  if (!chapters.length || !window.IntersectionObserver) return;
  const active = new Set();
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      entry.target.classList.toggle('world-in-view', entry.isIntersecting);
      if (entry.isIntersecting) active.add(entry.target); else active.delete(entry.target);
    });
    schedule();
  }, {rootMargin:'100px'});
  chapters.forEach(chapter => observer.observe(chapter));
  let frame = 0;
  function paint() {
    frame = 0;
    const reduced = body.classList.contains('motion-reduced') || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    active.forEach(chapter => {
      const rect = chapter.getBoundingClientRect();
      const progress = Math.max(0, Math.min(1, (innerHeight - rect.top) / (innerHeight + rect.height)));
      chapter.style.setProperty('--scene-progress', reduced ? '.5' : progress.toFixed(4));
    });
  }
  function schedule() { if (!frame) frame = requestAnimationFrame(paint); }
  addEventListener('scroll', schedule, {passive:true});
  document.querySelector('#main')?.addEventListener('scroll', schedule, {passive:true});
  addEventListener('resize', schedule, {passive:true});
  new MutationObserver(schedule).observe(body, {attributes:true, attributeFilter:['class']});
})();
