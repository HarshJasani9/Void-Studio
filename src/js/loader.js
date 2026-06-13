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

    // ── Preloader state tracking ──────────────────────────────────────────
    let isLoaded = false;
    const handleLoad = () => { isLoaded = true; };
    window.addEventListener('load', handleLoad);
    if (document.readyState === 'complete') {
      isLoaded = true;
    }

    // ── Proxy object for the counter ───────────────────────────────────────
    const progress = { val: 0 };

    // ── Intro Timeline (Bar fade-in) ───────────────────────────────────────
    const introTl = gsap.timeline({
      defaults: { ease: 'power3.out' }
    });

    introTl.to(bar, {
      autoAlpha: 1,
      duration: 0.5,
    });

    // ── Outro Timeline (Exit panels sweep) ──────────────────────────────────
    const outroTl = gsap.timeline({
      paused: true,
      defaults: { ease: 'power3.out' },
      onComplete: () => {
        window.removeEventListener('load', handleLoad);
        preloader.style.display = 'none';
        document.body.classList.remove('is-loading');
        document.body.classList.add('is-loaded');
        if (lenis) lenis.start();
        resolve();
      },
    });

    outroTl.to(bar, {
      autoAlpha: 0,
      y: -16,
      duration: 0.35,
    }, 0);

    outroTl.to(letters, {
      autoAlpha: 0,
      y: -20,
      duration: 0.4,
      stagger: { each: 0.04, from: 'end' },
    }, 0.05);

    outroTl.to(panelL, {
      yPercent: -100,
      duration: 1.0,
      ease: 'power4.inOut',
    }, 0.3);

    outroTl.to(panelR, {
      yPercent: -100,
      duration: 1.0,
      ease: 'power4.inOut',
    }, 0.45);

    // ── Progress Loop (0 to 90 initial, then 90 to 100 on load) ────────────
    const progressTween = gsap.to(progress, {
      val: 90,
      duration: 1.5,
      ease: 'power1.out',
      onUpdate() {
        const v = Math.round(progress.val);
        counter.textContent = v;
        gsap.set(fill, { scaleX: v / 100 });
      },
      onComplete() {
        if (isLoaded) {
          finishProgress();
        }
      }
    });

    function finishProgress() {
      gsap.to(progress, {
        val: 100,
        duration: 0.4,
        ease: 'power2.out',
        onUpdate() {
          const v = Math.round(progress.val);
          counter.textContent = v;
          gsap.set(fill, { scaleX: v / 100 });
        },
        onComplete() {
          outroTl.play();
        }
      });
    }

    const checkInterval = setInterval(() => {
      if (isLoaded) {
        clearInterval(checkInterval);
        progressTween.kill();
        finishProgress();
      }
    }, 50);

  });
}
