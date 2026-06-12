/**
 * main.js
 * VOID Studio — Application entry point
 * Initializes styles, smooth scroll, animations, and interactive modules
 */

/* Styles */
import './styles/main.css';
import 'lenis/dist/lenis.css';

/* Modules */
import { initLenis } from './js/lenis-setup.js';
import { initLoader } from './js/loader.js';
import { initCursor } from './js/cursor.js';
import { initNoise }  from './js/noise.js';
import { initHeader } from './js/header.js';
import {
  initHeroAnimations,
  initMarquee,
  initRevealAnimations,
} from './js/animations.js';

/* -------- Boot -------- */
function init() {
  // 1. Smooth scroll (Lenis + GSAP sync)
  const lenis = initLenis();

  // 2. Intro loader animation
  initLoader();

  // 3. Custom cursor
  initCursor();

  // 4. Noise overlay drift
  initNoise();

  // 5. Header scroll state
  initHeader();

  // 6. Animations
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
