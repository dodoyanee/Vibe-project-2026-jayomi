export function initNarrative() {
  const title = document.querySelector('[data-js="narrative-title"]');
  const words = [...document.querySelectorAll('[data-js="narrative-word"]')];
  const video = document.querySelector('[data-js="narrative-video"]');
  const toggle = document.querySelector('[data-js="narrative-toggle"]');
  const status = document.querySelector('[data-js="narrative-status"]');
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let frame = 0;
  const reveal = () => {
    frame = 0;
    if (!title) return;
    if (motion.matches) { title.removeAttribute('data-reveal'); return; }
    const rect = title.getBoundingClientRect();
    const progress = Math.max(0, Math.min(1, (window.innerHeight * .85 - rect.top) / (window.innerHeight * .65)));
    title.dataset.reveal = 'ready';
    words.forEach((word, index) => { word.dataset.lit = String(index < Math.ceil(progress * words.length)); });
  };
  const scheduleReveal = () => { if (!frame) frame = window.requestAnimationFrame(reveal); };
  window.addEventListener('scroll', scheduleReveal, { passive: true });
  window.addEventListener('resize', scheduleReveal, { passive: true });
  motion.addEventListener('change', scheduleReveal);
  reveal();
  if (!video || !toggle) return;
  let manualPause = false;
  let visible = !('IntersectionObserver' in window);
  let failed = false;
  const updateControl = () => {
    toggle.textContent = video.paused ? '▶' : 'Ⅱ';
    toggle.setAttribute('aria-pressed', String(video.paused));
    toggle.setAttribute('aria-label', video.paused ? '내러티브 영상 재생' : '내러티브 영상 일시정지');
  };
  const updatePlayback = () => {
    if (failed || !visible || manualPause || motion.matches || document.hidden) video.pause();
    else video.play().catch(updateControl);
  };
  toggle.addEventListener('click', () => {
    manualPause = !video.paused;
    if (video.paused) video.play().catch(updateControl);
    else video.pause();
  });
  video.addEventListener('play', updateControl);
  video.addEventListener('pause', updateControl);
  video.addEventListener('loadeddata', updatePlayback);
  video.addEventListener('error', () => {
    failed = true;
    toggle.hidden = true;
    if (status) status.hidden = false;
  });
  motion.addEventListener('change', () => { video.autoplay = !motion.matches; updatePlayback(); });
  document.addEventListener('visibilitychange', updatePlayback);
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; updatePlayback(); }).observe(video);
  }
  video.autoplay = !motion.matches;
  updatePlayback();
  updateControl();
}
