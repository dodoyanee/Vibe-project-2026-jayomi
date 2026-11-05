const POINTER_QUERY = '(hover: hover) and (pointer: fine)';
const CARD_SELECTOR = '[data-js="work-card"]';
const NATIVE_CURSOR_SELECTOR = [
  'input', 'textarea', 'select', '[contenteditable]:not([contenteditable="false"])',
  '[role="textbox"]', 'iframe', 'object', 'embed', '[data-native-cursor]',
].join(',');

export const initSiteCursor = () => {
  const cursor = document.querySelector('[data-js="site-cursor"]');
  if (!cursor || !window.matchMedia || !window.PointerEvent) return () => {};

  const root = document.documentElement;
  const pointerQuery = window.matchMedia(POINTER_QUERY);
  const lifecycle = new AbortController();
  let listeners = null;
  let frame = 0;
  let hasPointer = false;
  let x = 0;
  let y = 0;

  const hide = () => {
    window.cancelAnimationFrame(frame);
    frame = 0;
    hasPointer = false;
    cursor.dataset.cursorState = 'hidden';
    root.classList.remove('custom-cursor-ready');
  };

  const stop = () => {
    hide();
    listeners?.abort();
    listeners = null;
  };

  const render = () => {
    frame = 0;
    if (!hasPointer || !pointerQuery.matches) return;
    if (document.hidden || !document.hasFocus()) {
      hide();
      return;
    }
    try {
      // Re-hit-test on scroll/resize, even when the mouse itself has not moved.
      const target = document.elementFromPoint(x, y);
      if (!target) {
        hide();
        return;
      }
      if (target.closest(NATIVE_CURSOR_SELECTOR)) {
        cursor.dataset.cursorState = 'hidden';
        root.classList.remove('custom-cursor-ready');
        return;
      }
      cursor.style.setProperty('--cursor-x', `${x}px`);
      cursor.style.setProperty('--cursor-y', `${y}px`);
      cursor.dataset.cursorState = target.closest(CARD_SELECTOR) ? 'view' : 'default';
      root.classList.add('custom-cursor-ready');
    } catch {
      // A runtime failure must restore a usable system cursor immediately.
      stop();
    }
  };

  const schedule = () => {
    if (hasPointer && !frame) frame = window.requestAnimationFrame(render);
  };

  const move = (event) => {
    if (event.pointerType !== 'mouse') {
      hide();
      return;
    }
    x = event.clientX;
    y = event.clientY;
    hasPointer = true;
    schedule();
  };

  const leave = (event) => {
    if (!event.relatedTarget) hide();
  };

  const onKeyDown = (event) => {
    if (event.key === 'Tab') hide();
  };

  const onVisibilityChange = () => {
    if (document.hidden) hide();
  };

  const start = () => {
    stop();
    if (!pointerQuery.matches) return;
    const style = window.getComputedStyle(cursor);
    if (style.position !== 'fixed' || style.pointerEvents !== 'none'
      || style.display === 'none') return;
    listeners = new AbortController();
    const options = { passive: true, signal: listeners.signal };
    document.addEventListener('pointermove', move, options);
    document.addEventListener('pointerover', move, options);
    document.addEventListener('pointerdown', move, options);
    document.addEventListener('pointerout', leave, options);
    document.addEventListener('pointercancel', hide, options);
    document.addEventListener('mouseleave', hide, options);
    document.addEventListener('visibilitychange', onVisibilityChange, options);
    document.addEventListener('keydown', onKeyDown, { signal: listeners.signal });
    document.addEventListener('scroll', schedule, { ...options, capture: true });
    window.addEventListener('resize', schedule, options);
    window.addEventListener('blur', hide, options);
  };

  pointerQuery.addEventListener('change', start, { signal: lifecycle.signal });
  window.addEventListener('pagehide', stop, { signal: lifecycle.signal });
  window.addEventListener('pageshow', start, { signal: lifecycle.signal });
  start();

  return () => {
    stop();
    lifecycle.abort();
    cursor.style.removeProperty('--cursor-x');
    cursor.style.removeProperty('--cursor-y');
  };
};
