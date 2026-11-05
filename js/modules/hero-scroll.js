import { SCROLL_MOTION } from '../config.js';

export const initHeroScroll = () => {
  const track = document.querySelector('[data-js="hero-scroll-track"]');
  const hero = track?.querySelector('[data-scroll="hero-section"]');
  if (!track || !hero) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const mobile = window.matchMedia('(max-width: 806px)');
  let frame = 0;
  let needsMeasure = true;
  let start = 0;
  let distance = 1;
  let travel = 0;
  let previousProgress = null;

  const render = () => {
    frame = 0;
    if (reducedMotion.matches) return;

    if (needsMeasure) {
      // Measure the untransformed track, never the shrinking sticky section.
      start = track.getBoundingClientRect().top + window.scrollY;
      distance = Math.max(1, track.offsetHeight - hero.offsetHeight);
      travel = hero.offsetHeight * (mobile.matches
        ? SCROLL_MOTION.heroTravelMobile : SCROLL_MOTION.heroTravelDesktop);
      needsMeasure = false;
      previousProgress = null;
    }

    const progress = Math.min(1, Math.max(0, (window.scrollY - start) / distance));
    if (progress === previousProgress) return;
    previousProgress = progress;

    // A shared smoothstep keeps all three effects reversible and locked to scroll.
    const eased = progress * progress * (3 - 2 * progress);
    hero.style.setProperty('--hero-scale', String(1 + (SCROLL_MOTION.heroScale - 1) * eased));
    hero.style.setProperty('--hero-translate-y', `${-travel * eased}px`);
    hero.style.setProperty('--hero-opacity', String(1 - eased));
    hero.dataset.scrollPhase = progress < 1 ? 'active' : 'complete';
  };

  const schedule = () => {
    if (!frame && !reducedMotion.matches) frame = window.requestAnimationFrame(render);
  };
  const measure = () => {
    needsMeasure = true;
    schedule();
  };
  const applyMotionPreference = () => {
    window.cancelAnimationFrame(frame);
    frame = 0;
    if (reducedMotion.matches) {
      delete track.dataset.scrollState;
      delete hero.dataset.scrollPhase;
      ['--hero-scale', '--hero-translate-y', '--hero-opacity'].forEach((property) => {
        hero.style.removeProperty(property);
      });
    } else {
      // This motion is explicitly requested in addition to the existing site effects.
      track.dataset.scrollState = 'active';
      measure();
    }
  };

  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', measure, { passive: true });
  window.addEventListener('pageshow', measure);
  window.addEventListener('load', measure, { once: true });
  window.addEventListener('pagehide', () => {
    window.cancelAnimationFrame(frame);
    frame = 0;
  });
  reducedMotion.addEventListener('change', applyMotionPreference);
  mobile.addEventListener('change', measure);

  const resizeObserver = typeof ResizeObserver === 'function' ? new ResizeObserver(measure) : null;
  resizeObserver?.observe(track);
  resizeObserver?.observe(hero);
  document.fonts?.ready.then(measure);
  applyMotionPreference();
};
