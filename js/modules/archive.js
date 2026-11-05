export function initArchive(root = document) {
  const gallery = root.querySelector('[data-js="archive-gallery"]');
  const track = root.querySelector('[data-js="archive-track"]');
  const set = root.querySelector('[data-js="archive-set"]');
  const toggle = root.querySelector('[data-js="archive-toggle"]');
  if (!gallery || !track || !set || !toggle || gallery.dataset.ready === 'true') return;

  // Equal set widths, including the trailing gap, make the -50% loop seamless.
  const duplicate = set.cloneNode(true);
  duplicate.removeAttribute('data-js');
  duplicate.setAttribute('aria-hidden', 'true');
  duplicate.inert = true;
  track.append(duplicate);

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let isManuallyPaused = false;
  let isVisible = false;
  const update = () => {
    const isPaused = isManuallyPaused || reducedMotion.matches || document.hidden || !isVisible;
    gallery.dataset.paused = String(isPaused);
    toggle.setAttribute('aria-pressed', String(isManuallyPaused));
    toggle.setAttribute('aria-label', isManuallyPaused
      ? '아카이브 이미지 이동 재생' : '아카이브 이미지 이동 일시정지');
  };
  toggle.hidden = false;
  gallery.dataset.ready = 'true';
  toggle.addEventListener('click', () => {
    isManuallyPaused = !isManuallyPaused;
    update();
  });
  const observer = new IntersectionObserver(([entry]) => {
    isVisible = entry.isIntersecting;
    update();
  });
  observer.observe(gallery);
  reducedMotion.addEventListener('change', update);
  document.addEventListener('visibilitychange', update);
  update();
}
