/**
 * lenis-setup.js
 *
 * Syncs Lenis smooth scroll with GSAP ScrollTrigger via:
 *   1. gsap.ticker drives Lenis RAF — one unified animation loop
 *   2. gsap.ticker.lagSmoothing(0) — prevents GSAP skipping frames on
 *      background tabs, which would desync Lenis position
 *   3. ScrollTrigger.scrollerProxy() — tells ScrollTrigger to read scroll
 *      position from Lenis instead of native window.scrollY
 *   4. lenis.on('scroll', ScrollTrigger.update) — notifies ScrollTrigger
 *      every time Lenis moves so calculations stay accurate
 *
 * Skill reference: gsap-scrolltrigger › ScrollTrigger.scrollerProxy()
 */

import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register once — safe to call multiple times, GSAP deduplicates
gsap.registerPlugin(ScrollTrigger);

/**
 * initLenis()
 * Creates and configures Lenis, wires it into GSAP ticker + ScrollTrigger.
 * Returns the Lenis instance for external control (stop, start, scrollTo, etc.)
 *
 * @returns {Lenis}
 */
export function initLenis() {
  const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (isReduced) {
    return {
      on: () => {},
      raf: () => {},
      stop: () => {},
      start: () => {},
      destroy: () => {},
      scroll: 0,
      scrollTo: () => {},
    };
  }

  // ── 1. Create Lenis instance ──────────────────────────────────────────────
  const lenis = new Lenis({
    duration: 1.2,
    // Exponential easing — feels natural without being too floaty
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    orientation: 'vertical',
    gestureOrientation: 'vertical',
    smoothWheel: true,
    wheelMultiplier: 1,
    touchMultiplier: 2,
    infinite: false,
  });

  // ── 2. Tell ScrollTrigger to read scroll position from Lenis ─────────────
  //
  // scrollTop(value) acts as getter (no arg) and setter (with arg).
  // getBoundingClientRect returns viewport dimensions for ST's
  // start/end calculations.
  //
  // Per skill: "When the third-party scroller updates, ScrollTrigger must
  // be notified via ScrollTrigger.update as a listener."
  ScrollTrigger.scrollerProxy(document.documentElement, {
    scrollTop(value) {
      if (arguments.length) {
        lenis.scrollTo(value, { immediate: true });
      }
      return lenis.scroll;
    },
    getBoundingClientRect() {
      return {
        top: 0,
        left: 0,
        width: window.innerWidth,
        height: window.innerHeight,
      };
    },
    // Use 'fixed' so pinned elements stay locked while Lenis transforms
    pinType: document.documentElement.style.transform ? 'transform' : 'fixed',
  });

  // ── 3. Keep ScrollTrigger in sync on every Lenis scroll event ────────────
  //
  // Per skill: "Register ScrollTrigger.update as a listener; without this,
  // ScrollTrigger's calculations will be out of date."
  lenis.on('scroll', ScrollTrigger.update);

  // ── 4. Drive Lenis via GSAP ticker — single unified RAF loop ─────────────
  //
  // GSAP time is in seconds; Lenis.raf() expects milliseconds.
  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });

  // ── 5. Disable lag smoothing ──────────────────────────────────────────────
  //
  // When a browser tab is backgrounded, GSAP throttles its ticker.
  // lagSmoothing(0) disables the catch-up behaviour so Lenis position
  // never desyncs from ScrollTrigger on tab re-focus.
  gsap.ticker.lagSmoothing(0);

  // ── 6. Re-initialise ScrollTrigger after Lenis proxy is wired ────────────
  ScrollTrigger.refresh();

  return lenis;
}
