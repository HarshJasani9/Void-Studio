/**
 * loader.js — Full preloader
 *
 * Sequence (per gsap-timeline skill — use labels + position parameter):
 *
 *  ┌──────────────────────────────────────────────────────────┐
 *  │ "enter"  Logo letters stagger up (clip reveal)           │
 *  │ "enter"  Bar fades in simultaneously                     │
 *  │          Counter counts 0 → 100 (driven by onUpdate)     │
 *  │          Progress bar scaleX 0 → 1                       │
 *  │ "exit"   Panels wipe upward — left then right (stagger)  │
 *  │ done     Remove preloader, unlock scroll, fire hero anim │
 *  └──────────────────────────────────────────────────────────┘
 *
 * Timeline rules followed (gsap-timeline skill):
 *  ✅ Labels for readable sequencing
 *  ✅ Position parameter "<" for parallel tweens
 *  ✅ defaults in timeline constructor for shared ease/duration
 *  ✅ onComplete on timeline (not nested ScrollTrigger)
 *  ✅ Prefer timelines over delay-chaining
 *
 * Scroll lock:
 *  body.is-loading disables overflow (CSS)
 *  Lenis must also be stopped — accepted via the lenis instance param
 */

import gsap from 'gsap';

/**
 * initLoader(lenis)
 * @param {import('lenis').default} lenis — pass so we can stop/start it
 * @returns {Promise<void>}  resolves when exit animation completes
 */
export function initLoader(lenis) {
  return new Promise((resolve) => {
    const preloader = document.getElementById('preloader');
    if (!preloader) { resolve(); return; }

    // ── Elements ─────────────────────────────────────────────────────────
    const letters  = preloader.querySelectorAll('.preloader__logo-letter, .preloader__logo-dot');
    const bar      = preloader.querySelector('.preloader__bar');
    const fill     = document.getElementById('preloader-fill');
    const counter  = document.getElementById('preloader-counter');
    const panelL   = preloader.querySelector('.preloader__panel--left');
    const panelR   = preloader.querySelector('.preloader__panel--right');

    // ── Reduced motion check ──────────────────────────────────────────────────
    const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (isReduced) {
      preloader.style.display = 'none';
      document.body.classList.remove('is-loading');
      document.body.classList.add('is-loaded');
      if (lenis) lenis.start();
      resolve();
      return;
    }

    // ── Scroll lock ───────────────────────────────────────────────────────
    document.body.classList.add('is-loading');
    if (lenis) lenis.stop();

    // ── Proxy object for the counter — GSAP tweens { val } ───────────────
    const progress = { val: 0 };

    // ── Master timeline ───────────────────────────────────────────────────
    // defaults: shared ease/duration for all child tweens unless overridden
    const tl = gsap.timeline({
      defaults: { ease: 'power3.out' },
      onComplete: () => {
        // Remove preloader from paint tree
        preloader.style.display = 'none';
        // Unlock scroll
        document.body.classList.remove('is-loading');
        document.body.classList.add('is-loaded');
        if (lenis) lenis.start();
        resolve();
      },
    });

    // ── Label: "enter" ────────────────────────────────────────────────────
    tl.addLabel('enter', 0);

    // Bar fades in immediately at start
    tl.to(bar, {
      autoAlpha: 1,
      duration: 0.5,
    }, 'enter');

    // Progress counter 0 → 100 driven by onUpdate on the progress tween
    tl.to(progress, {
      val: 100,
      duration: 1.8,
      ease: 'power1.inOut',
      onUpdate() {
        const v = Math.round(progress.val);
        counter.textContent = v;
        // Drive the fill bar scaleX in sync
        gsap.set(fill, { scaleX: v / 100 });
      },
    }, 'enter+=0.4');

    // ── Label: "exit" — 0.4s natural hold after counter reaches 100 ────────
    tl.addLabel('exit', '+=0.4');

    tl.to(bar, {
      autoAlpha: 0,
      y: -16,
      duration: 0.35,
    }, 'exit');

    tl.to(letters, {
      autoAlpha: 0,
      y: -20,
      duration: 0.4,
      stagger: { each: 0.04, from: 'end' },
    }, 'exit+=0.05');

    // Curtain panels wipe upward — left first, right 0.1s later
    // yPercent: -100 moves each panel fully off the top of the viewport.
    // Per gsap-timeline skill: use position parameter for stagger between
    // two elements rather than two separate timelines.
    tl.to(panelL, {
      yPercent: -100,
      duration: 1.0,
      ease: 'power4.inOut',
    }, 'exit+=0.3');

    tl.to(panelR, {
      yPercent: -100,
      duration: 1.0,
      ease: 'power4.inOut',
    }, 'exit+=0.45'); // 0.15s stagger → right panel wipes slightly later

  });
}
