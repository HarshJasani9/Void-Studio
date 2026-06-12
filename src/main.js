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
import {
  initHeroAnimations,
  initMarquee,
  initRevealAnimations,
} from './js/animations.js';

/* ── Boot ─────────────────────────────────────────────────────────────────── */
async function init() {
  // 1. Smooth scroll — start stopped; loader will call lenis.start() on exit
  const lenis = initLenis();

  // 2. Cursor — attach immediately (works during load)
  initCursor();

  // 3. Noise overlay drift
  initNoise();

  // 4. Preloader — awaited: hero animations fire only after curtain exits
  await initLoader(lenis);

  // 5. Header scroll state (safe to init after loader, ST refresh was called)
  initHeader();

  // 6. Animations — hero entrance, marquee, reveal-on-scroll
  initHeroAnimations();
  initMarquee();
  initRevealAnimations();
}

// Run when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
