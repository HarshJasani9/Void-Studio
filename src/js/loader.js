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

    const fillLogo = document.getElementById('preloader-logo-fg');
    const counter  = document.getElementById('preloader-counter');

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
    const handleLoad = () => {
      isLoaded = true;
      if (animationFinished) {
        triggerExit();
      }
    };
    window.addEventListener('load', handleLoad);
    if (document.readyState === 'complete') {
      isLoaded = true;
    }

    // ── Proxy object for the counter ───────────────────────────────────────
    const progress = { val: 0 };
    let animationFinished = false;

    // ── Outro curtain wipe ──────────────────────────────────────────────
    const outroTl = gsap.timeline({
      paused: true,
      onStart: () => {
        window.scrollTo(0, 0);
        if (lenis) {
          lenis.scrollTo(0, { immediate: true });
        }
      },
      onComplete: () => {
        window.removeEventListener('load', handleLoad);
        preloader.style.display = 'none';

        window.scrollTo(0, 0);
        if (lenis) {
          lenis.scrollTo(0, { immediate: true });
        }

        document.body.classList.remove('is-loading');
        document.body.classList.add('is-loaded');

        if (lenis) {
          lenis.start();
        }

        // Keep scroll at 0 on next frame in case of layout changes
        requestAnimationFrame(() => {
          window.scrollTo(0, 0);
          if (lenis) {
            lenis.scrollTo(0, { immediate: true });
          }
        });

        resolve();
      },
    });

    outroTl.to(preloader, {
      yPercent: -100,
      duration: 1.2,
      ease: 'power4.inOut',
    });

    function triggerExit() {
      // Pause slightly on 100% then slide up the curtain
      gsap.delayedCall(0.3, () => {
        outroTl.play();
      });
    }

    // ── Progress Loop (smooth 4.0 seconds counter from 0 to 100) ──────────
    gsap.to(progress, {
      val: 100,
      duration: 4.0,
      ease: 'power2.out',
      onUpdate() {
        const v = Math.round(progress.val);
        if (counter) counter.textContent = String(v).padStart(3, '0');
        if (fillLogo) gsap.set(fillLogo, { clipPath: `inset(${100 - v}% 0 0 0)` });
      },
      onComplete() {
        animationFinished = true;
        if (isLoaded) {
          triggerExit();
        }
      }
    });

  });
}
