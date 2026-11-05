import { initArchive } from './modules/archive.js';

initArchive();

import { initCraftAccordion } from './modules/craft-accordion.js';
import { initNarrative } from './modules/narrative.js';

initCraftAccordion();
initNarrative();

import './modules/selected-video.js';
import { initHeroScroll } from './modules/hero-scroll.js';
import { initSiteNavigation } from './modules/site-navigation.js';
import { initSiteCursor } from './modules/site-cursor.js';
import { initShowcaseVideo } from './modules/showcase-video.js';

initSiteCursor();
initHeroScroll();
initShowcaseVideo();

initSiteNavigation();
