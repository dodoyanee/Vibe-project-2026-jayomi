import './modules/selected-video.js';
import { scrollToHash, setMenuScrollLocked } from './modules/scroll-motion.js';

const DESKTOP_QUERY = '(min-width: 1200px)';
const CLOSE_FALLBACK_MS = 450;

const menuToggle = document.querySelector('[data-js="menu-toggle"]');
const menuPanel = document.querySelector('[data-js="menu-panel"]');

if (menuToggle && menuPanel) {
  const menuLinks = [...menuPanel.querySelectorAll('[data-js="menu-link"]')];
  const desktopQuery = window.matchMedia(DESKTOP_QUERY);
  let isMenuOpen = false;
  let closeTimer = 0;
  let closeToken = 0;
  let pendingHash = '';

  const updateMenuState = (isOpen) => {
    menuToggle.setAttribute('aria-expanded', String(isOpen));
    menuToggle.setAttribute('aria-label', isOpen ? '메뉴 닫기' : '메뉴 열기');
    menuToggle.textContent = isOpen ? 'CLOSE' : 'MENU';
  };

  const finishClosing = (token) => {
    if (isMenuOpen || menuPanel.dataset.menuState !== 'closing' || token !== closeToken) {
      return;
    }

    window.clearTimeout(closeTimer);
    menuPanel.dataset.menuState = 'closed';
    menuPanel.setAttribute('aria-hidden', 'true');
    setMenuScrollLocked(false);

    if (pendingHash) {
      scrollToHash(pendingHash, { updateHistory: true });
      pendingHash = '';
    }
  };

  const closeMenu = ({ immediate = false, restoreFocus = false, hash = '' } = {}) => {
    if (!isMenuOpen && menuPanel.dataset.menuState === 'closed') {
      return;
    }

    isMenuOpen = false;
    pendingHash = hash;
    menuPanel.inert = true;
    menuPanel.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('menu-is-open');
    updateMenuState(false);

    if (restoreFocus) {
      menuToggle.focus();
    }

    window.clearTimeout(closeTimer);
    closeToken += 1;
    const token = closeToken;

    if (immediate || desktopQuery.matches) {
      menuPanel.dataset.menuState = 'closed';
      setMenuScrollLocked(false);
      if (pendingHash) scrollToHash(pendingHash, { updateHistory: true });
      pendingHash = '';
      return;
    }

    menuPanel.dataset.menuState = 'closing';
    closeTimer = window.setTimeout(() => finishClosing(token), CLOSE_FALLBACK_MS);
  };

  const openMenu = () => {
    if (isMenuOpen || desktopQuery.matches) {
      return;
    }

    window.clearTimeout(closeTimer);
    closeToken += 1;
    isMenuOpen = true;
    pendingHash = '';
    setMenuScrollLocked(true);
    menuPanel.inert = false;
    menuPanel.setAttribute('aria-hidden', 'false');
    document.body.classList.add('menu-is-open');
    updateMenuState(true);
    menuPanel.dataset.menuState = 'opening';
    window.requestAnimationFrame(() => {
      if (isMenuOpen) {
        menuPanel.dataset.menuState = 'open';
      }
    });
    menuLinks[0]?.focus();
  };

  menuToggle.addEventListener('click', () => {
    if (isMenuOpen) {
      closeMenu({ restoreFocus: true });
      return;
    }

    openMenu();
  });

  menuPanel.addEventListener('click', (event) => {
    const link = event.target.closest('[data-js="menu-link"]');

    if (!link || !menuPanel.contains(link)) {
      return;
    }

    event.preventDefault();
    closeMenu({ restoreFocus: true, hash: link.hash });
  });

  menuPanel.addEventListener('transitionend', (event) => {
    if (event.target === menuPanel && event.propertyName === 'transform') {
      finishClosing(closeToken);
    }
  });

  document.addEventListener('keydown', (event) => {
    if (!isMenuOpen) {
      return;
    }

    if (event.key === 'Escape') {
      event.preventDefault();
      closeMenu({ restoreFocus: true });
      return;
    }

    if (event.key !== 'Tab') {
      return;
    }

    const firstLink = menuLinks[0];
    const lastLink = menuLinks.at(-1);

    if (event.shiftKey && document.activeElement === menuToggle) {
      event.preventDefault();
      lastLink?.focus();
    } else if (event.shiftKey && document.activeElement === firstLink) {
      event.preventDefault();
      menuToggle.focus();
    } else if (!event.shiftKey && document.activeElement === menuToggle) {
      event.preventDefault();
      firstLink?.focus();
    } else if (!event.shiftKey && document.activeElement === lastLink) {
      event.preventDefault();
      menuToggle.focus();
    }
  });

  desktopQuery.addEventListener('change', (event) => {
    if (event.matches) {
      closeMenu({ immediate: true });
    }
  });
}
