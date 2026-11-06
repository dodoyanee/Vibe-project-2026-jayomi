import { initArchive } from './modules/archive.js';
import { initCraftAccordion } from './modules/craft-accordion.js';
import { initNarrative } from './modules/narrative.js';
import './modules/selected-video.js';
import { initHeroScroll } from './modules/hero-scroll.js';
import { initSiteNavigation } from './modules/site-navigation.js';
import { initSiteCursor } from './modules/site-cursor.js';
import { initShowcaseVideo } from './modules/showcase-video.js';
import { initSiteChrome } from './modules/site-chrome.js';

await initSiteChrome();
initArchive();
initCraftAccordion();
initNarrative();
initSiteCursor();
initHeroScroll();
initShowcaseVideo();

initSiteNavigation();
import('./modules/notice-auth.js')
  .then(({ setupNoticeAuthControls }) => setupNoticeAuthControls(() => {}))
  .catch(() => {
    document.querySelectorAll('[data-js="auth-error"]').forEach((status) => {
      status.hidden = false;
      status.textContent = '로그인 기능을 불러오지 못했습니다. 페이지를 새로고침해 주세요.';
    });
  });
