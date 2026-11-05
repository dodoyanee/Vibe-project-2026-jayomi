const video = document.querySelector('[data-js="selected-video"]');
const toggle = document.querySelector('[data-js="video-toggle"]');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

if (video && toggle) {
  let manuallyPaused = false;
  let isVisible = false;

  const updateControl = () => {
    toggle.textContent = video.paused ? '▶' : 'Ⅱ';
    toggle.setAttribute('aria-pressed', String(video.paused));
    toggle.setAttribute('aria-label', video.paused ? '영상 재생' : '영상 일시정지');
  };
  const updatePlayback = () => {
    if (!isVisible || manuallyPaused || reducedMotion.matches || document.hidden) video.pause();
    else video.play().catch(updateControl);
  };
  toggle.addEventListener('click', () => {
    manuallyPaused = !video.paused;
    if (video.paused) video.play().catch(updateControl);
    else video.pause();
  });
  video.addEventListener('play', updateControl);
  video.addEventListener('pause', updateControl);
  video.addEventListener('loadeddata', updatePlayback);
  reducedMotion.addEventListener('change', updatePlayback);
  document.addEventListener('visibilitychange', updatePlayback);
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting;
      updatePlayback();
    });
    observer.observe(video);
  } else isVisible = true;
  video.autoplay = !reducedMotion.matches;
  updatePlayback();
  updateControl();
}
