import { initSiteNavigation } from './modules/site-navigation.js';
import { initNoticeBoard } from './modules/notice-board.js';
import { setupNoticeAuthControls } from './modules/notice-auth.js';

initSiteNavigation();
setupNoticeAuthControls(() => {});
initNoticeBoard();
