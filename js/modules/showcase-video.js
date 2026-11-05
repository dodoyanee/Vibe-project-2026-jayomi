export function initShowcaseVideo(root = document) {
  const media = root.querySelector('[data-js="showcase-media"]');
  const video = root.querySelector('[data-js="showcase-video"]');
  const toggle = root.querySelector('[data-js="showcase-toggle"]');
  if (!media || !video || !toggle) return;

  const icon = root.querySelector('[data-js="showcase-toggle-icon"]');
  const status = root.querySelector('[data-js="showcase-status"]');
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const events = new AbortController();
  const state = { isVisible: false, userPaused: false, userPlayed: false, hasError: false };
  const context = { media, video, toggle, icon, status, motion, state };
  const sync = () => syncControl(context);
  const update = () => updatePlayback(context);

  video.muted = true;
  video.autoplay = !motion.matches;
  toggle.hidden = false;
  toggle.addEventListener('click', () => togglePlayback(context), { signal: events.signal });
  ['play', 'pause'].forEach((event) => video.addEventListener(event, sync, { signal: events.signal }));
  video.addEventListener('loadeddata', update, { signal: events.signal });
  video.addEventListener('error', () => showError(context), { capture: true, signal: events.signal });
  motion.addEventListener('change', () => {
    state.userPlayed = false;
    video.autoplay = !motion.matches;
    update();
  }, { signal: events.signal });
  document.addEventListener('visibilitychange', update, { signal: events.signal });
  const observer = observeMedia(media, state, update);
  sync();
  update();
  return () => {
    events.abort();
    observer?.disconnect();
    video.pause();
  };
}

function observeMedia(media, state, update) {
  if (!('IntersectionObserver' in window)) {
    state.isVisible = true;
    return null;
  }
  const observer = new IntersectionObserver(([entry]) => {
    state.isVisible = entry.isIntersecting;
    update();
  });
  observer.observe(media);
  return observer;
}

function updatePlayback(context) {
  const { video, state, motion } = context;
  const motionPaused = motion.matches && !state.userPlayed;
  if (!state.isVisible || state.userPaused || state.hasError || motionPaused || document.hidden) {
    video.pause();
    return;
  }
  video.play().catch(() => syncControl(context));
}

function togglePlayback(context) {
  const { video, state } = context;
  state.userPaused = !video.paused;
  state.userPlayed = video.paused;
  if (video.paused) video.play().catch(() => syncControl(context));
  else video.pause();
}

function syncControl({ media, video, toggle, icon, state }) {
  if (state.hasError) return;
  media.dataset.playback = video.paused ? 'paused' : 'playing';
  toggle.setAttribute('aria-pressed', String(video.paused));
  toggle.setAttribute('aria-label', video.paused ? '쇼케이스 영상 재생' : '쇼케이스 영상 일시정지');
  icon.textContent = video.paused ? '▶' : 'Ⅱ';
}

function showError({ media, video, toggle, status, state }) {
  state.hasError = true;
  video.pause();
  media.dataset.playback = 'error';
  toggle.hidden = true;
  status.textContent = '영상을 불러오지 못했습니다. 페이지를 새로고침해 주세요.';
  status.hidden = false;
}
