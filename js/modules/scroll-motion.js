import { SCROLL_MOTION } from '../config.js';

const header = document.querySelector('[data-js="site-header"]');
const section = document.querySelector('[data-scroll="selected-section"]');
const media = document.querySelector('[data-js="selected-media"]');
const title = document.querySelector('[data-js="selected-title"]');
const words = [...document.querySelectorAll('[data-js="selected-word"]')];
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
let lenis = null;
let menuLocked = false;
let revealHeader = null;

export const setMenuScrollLocked = (locked) => {
  menuLocked = locked;
  if (locked) {
    revealHeader?.(true);
    lenis?.stop();
  } else {
    lenis?.start();
  }
};

export const scrollToHash = (hash, { updateHistory = false } = {}) => {
  const target = hash.startsWith('#') && document.getElementById(hash.slice(1));
  if (!target || menuLocked) return false;
  if (updateHistory && window.location.hash !== hash) window.history.pushState(null, '', hash);
  if (lenis) {
    lenis.scrollTo(target, { immediate: reducedMotion.matches });
  } else {
    window.scrollTo({
      top: target.getBoundingClientRect().top + window.scrollY,
      behavior: reducedMotion.matches ? 'instant' : 'smooth',
    });
  }
  if (target.id === 'main-content') target.focus({ preventScroll: true });
  return true;
};

document.addEventListener('click', (event) => {
  if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey
    || event.shiftKey || event.altKey) return;
  const link = event.target.closest('a[href^="#"]');
  if (!link || link.hasAttribute('download') || link.target === '_blank') return;
  if (scrollToHash(link.hash, { updateHistory: true })) event.preventDefault();
});

window.addEventListener('popstate', () => scrollToHash(window.location.hash || '#home'));
document.addEventListener('keydown', (event) => {
  if (event.key === 'Tab' || event.key === 'Escape') revealHeader?.(true);
}, { capture: true });
header?.addEventListener('focusin', () => revealHeader?.(true));

const initializeMotion = () => {
  const { gsap, ScrollTrigger, Lenis } = window;
  if (!gsap || !ScrollTrigger || !Lenis) {
    document.documentElement.dataset.scrollEngine = 'native';
    return;
  }

  gsap.registerPlugin(ScrollTrigger);
  const responsiveMotion = gsap.matchMedia();
  responsiveMotion.add({
    desktop: '(min-width: 1200px)',
    tablet: '(min-width: 807px) and (max-width: 1199px)',
    mobile: '(max-width: 806px)',
    reduce: '(prefers-reduced-motion: reduce)',
  }, (context) => {
    if (context.conditions.reduce) {
      document.documentElement.dataset.scrollEngine = 'native';
      return;
    }

    const smoothScroll = new Lenis({
      autoRaf: false,
      lerp: SCROLL_MOTION.lerp,
      smoothWheel: true,
      syncTouch: false,
      anchors: false,
    });
    lenis = smoothScroll;
    document.documentElement.dataset.scrollEngine = 'lenis';
    const tick = (seconds) => smoothScroll.raf(seconds * 1000);
    smoothScroll.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    if (menuLocked) smoothScroll.stop();

    // GSAP owns transform/opacity; animated inline values are required by the requested library.
    const clearHeaderMotion = () => {
      if (!header) return;
      gsap.set(header, { clearProps: 'transform,opacity,visibility' });
      header.dataset.headerState = 'visible';
      header.inert = false;
    };
    const headerTween = header && gsap.to(header, {
      yPercent: SCROLL_MOTION.headerHiddenPercent,
      autoAlpha: 0,
      duration: SCROLL_MOTION.headerDuration,
      ease: 'power2.out',
      paused: true,
      onReverseComplete: clearHeaderMotion,
    });

    const showHeader = (immediate = false) => {
      if (!header) return;
      header.inert = false;
      header.dataset.headerState = 'visible';
      if (immediate) {
        headerTween.pause(0);
        clearHeaderMotion();
      } else {
        headerTween.reverse();
      }
    };
    revealHeader = showHeader;

    if (header) {
      let lastScroll = window.scrollY;
      let lastDirection = 0;
      let directionDistance = 0;
      ScrollTrigger.create({
        start: 0,
        end: 'max',
        onUpdate: (self) => {
          const scroll = Math.max(0, self.scroll());
          const delta = scroll - lastScroll;
          lastScroll = scroll;
          const insideSelected = section
            && scroll >= section.offsetTop - window.innerHeight * SCROLL_MOTION.headerEntryRatio;
          if (scroll <= header.offsetHeight || insideSelected || menuLocked
            || header.contains(document.activeElement)) {
            if (header.dataset.headerState === 'hidden') showHeader(menuLocked);
            directionDistance = 0;
            return;
          }
          if (!delta) return;
          const direction = Math.sign(delta);
          if (direction !== lastDirection) directionDistance = 0;
          lastDirection = direction;
          directionDistance += Math.abs(delta);
          if (directionDistance < SCROLL_MOTION.headerDirectionThreshold) return;
          if (direction < 0) {
            if (header.dataset.headerState === 'hidden') showHeader();
          } else if (header.dataset.headerState !== 'hidden') {
            header.dataset.headerState = 'hidden';
            header.inert = true;
            headerTween.play();
          }
        },
      });
    }

    if (section && media && title) {
      const travelRatio = context.conditions.mobile ? SCROLL_MOTION.mediaTravelMobile
        : context.conditions.desktop ? SCROLL_MOTION.mediaTravelDesktop : SCROLL_MOTION.mediaTravelTablet;
      const entryTrigger = {
        trigger: section,
        start: 'top bottom',
        end: 'top top',
        scrub: SCROLL_MOTION.scrub,
        invalidateOnRefresh: true,
      };
      gsap.fromTo(media, {
        y: () => window.innerHeight * travelRatio,
        scale: SCROLL_MOTION.mediaScale,
      }, {
        y: 0,
        scale: 1,
        ease: 'none',
        scrollTrigger: { ...entryTrigger },
      });
      gsap.fromTo(title, { y: SCROLL_MOTION.titleTravel }, {
        y: 0,
        ease: 'none',
        scrollTrigger: { ...entryTrigger },
      });
      gsap.fromTo(words, {
        yPercent: SCROLL_MOTION.wordTravelPercent,
        opacity: SCROLL_MOTION.wordOpacity,
      }, {
        yPercent: 0,
        opacity: 1,
        stagger: SCROLL_MOTION.wordStagger,
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top 82%',
          end: 'top 12%',
          scrub: SCROLL_MOTION.scrub,
          invalidateOnRefresh: true,
        },
      });
    }

    const refresh = () => {
      smoothScroll.resize();
      ScrollTrigger.refresh();
    };
    const resizeObserver = typeof ResizeObserver === 'function' ? new ResizeObserver(refresh) : null;
    if (section) resizeObserver?.observe(section);
    document.fonts?.ready.then(() => {
      if (lenis === smoothScroll) refresh();
    });
    refresh();

    return () => {
      resizeObserver?.disconnect();
      gsap.ticker.remove(tick);
      smoothScroll.off('scroll', ScrollTrigger.update);
      smoothScroll.destroy();
      lenis = null;
      revealHeader = null;
      clearHeaderMotion();
      document.documentElement.dataset.scrollEngine = 'native';
    };
  });

  window.addEventListener('pagehide', (event) => {
    if (!event.persisted) responsiveMotion.revert();
  });
};

// Wait for all deferred CDN scripts; a failed CDN keeps the complete native page usable.
if (document.readyState === 'complete') initializeMotion();
else window.addEventListener('load', initializeMotion, { once: true });
