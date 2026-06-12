/**
 * main.js
 * VOID Studio — Application entry point
 */

/* Styles */
import './styles/main.css';
import 'lenis/dist/lenis.css';

/* Modules */
import { initLenis }   from './js/lenis-setup.js';
import { initLoader }  from './js/loader.js';
import { initCursor }  from './js/cursor.js';
import { initNoise }   from './js/noise.js';
import { initHeader }  from './js/header.js';
import { initHero }    from './js/hero.js';
import { initAbout }   from './js/about.js';
import { initMarquee, initRevealAnimations } from './js/animations.js';

/* ── Boot ─────────────────────────────────────────────────────────────────── */
async function init() {
  // 1. Smooth scroll — Lenis starts stopped; loader unlocks it on exit
  const lenis = initLenis();

  // 2. Cursor + noise — attach immediately, visible during load
  initCursor();
  initNoise();

  // 3. Preloader — await full exit before firing hero animations
  await initLoader(lenis);

  // 4. Post-load modules — Lenis is running, ST positions are valid
  initHeader();
  initHero();
  initAbout();
  initMarquee();
  initRevealAnimations();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
