/**
 * hero.js
 *
 * Hero section: SplitText char reveal + CustomEase("hop") + scroll-cue animation.
 *
 * Plugins used (gsap-plugins skill):
 *   - SplitText  — split .hero__word spans into individual chars
 *                  mask: "chars" wraps each in overflow:clip for clean reveal
 *                  autoSplit: true — re-splits when fonts/layout change
 *   - CustomEase — "hop" curve "0.9, 0, 0.1, 1" — steep ease-in, sudden
 *                  deceleration; gives letters a punchy hop-in feel
 *
 * Registration rule (gsap-plugins skill):
 *   ✅ gsap.registerPlugin() called once before any tween/API usage
 *
 * Timeline rules (gsap-timeline skill):
 *   ✅ Labels for readable sequencing
 *   ✅ Position parameter "<" for parallel tweens
 *   ✅ defaults in constructor (shared duration/ease)
 *   ✅ No ScrollTrigger inside the timeline
 *
 * Performance (gsap-performance skill):
 *   ✅ Animating y (transform) — compositor only, no layout
 *   ✅ autoAlpha instead of opacity for fade elements
 *   ✅ will-change: transform on .char elements (set in CSS)
 */

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { CustomEase } from 'gsap/CustomEase';

// Register once — before any SplitText, CustomEase or ScrollTrigger usage
gsap.registerPlugin(ScrollTrigger, SplitText, CustomEase);

// ── CustomEase "hop" — steep deceleration, punchy character reveal ────────────
// "0.9, 0, 0.1, 1" = cubic-bezier: fast start, near-instant stop
const hopEase = CustomEase.create('hop', '0.9, 0, 0.1, 1');

/**
 * initHeroVideo()
 * Lazy-loads the video after preloader, checks screen size / accessibility rules,
 * and sets up Intersection Observer to pause playback when out of view.
 */
function initHeroVideo() {
  const video = document.getElementById('hero-video');
  if (!video) return;

  const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isMobile = window.innerWidth <= 768;

  // 1. Bypass loading completely on mobile and prefers-reduced-motion
  if (isReduced || isMobile) {
    return;
  }

  // 2. Resolve source elements for lazy loading
  const sources = video.querySelectorAll('source');
  sources.forEach((source) => {
    const dataSrc = source.getAttribute('data-src');
    if (dataSrc) {
      source.setAttribute('src', dataSrc);
    }
  });

  video.load();

  // 3. Play video when ready
  video.addEventListener('canplay', () => {
    video.play().catch((err) => {
      console.warn("Autoplay blocked by browser policy:", err);
    });
  }, { once: true });

  // 4. Pause when hero section leaves viewport, play when it returns
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        video.play().catch(() => {});
      } else {
        video.pause();
      }
    });
  }, {
    threshold: 0.05,
  });

  observer.observe(video);
}

export function initHero() {
  const headline   = document.getElementById('hero-headline');
  const eyebrow    = document.getElementById('hero-eyebrow');
  const descriptor = document.getElementById('hero-descriptor');
  const scrollCue  = document.getElementById('hero-scroll-cue');

  // Play background video immediately
  const video = document.getElementById('hero-video');
  if (video) {
    video.play().catch((err) => {
      console.warn("Autoplay blocked by browser policy:", err);
    });

    // Control video playback based on viewport intersection
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      });
    }, {
      threshold: 0.05,
    });
    observer.observe(video);
  }

  // Set all elements to their active/visible states instantly (no entry animation)
  gsap.set('.hero__eyebrow-line', { scaleX: 1 });
  gsap.set(eyebrow, { autoAlpha: 1, x: 0 });
  if (headline) {
    gsap.set(headline, { autoAlpha: 1 });
    gsap.set(headline.querySelectorAll('.hero__word'), { autoAlpha: 1, yPercent: 0 });
  }
  if (descriptor) {
    gsap.set(descriptor.querySelectorAll('span'), { autoAlpha: 1, y: 0 });
  }
  if (scrollCue) {
    gsap.set(scrollCue, { autoAlpha: 1 });
  }

  // Thumb bounces infinitely inside the track
  gsap.to('.hero__scroll-cue-thumb', {
    y: '170%',
    duration: 1.2,
    ease: 'power1.inOut',
    repeat: -1,
    yoyo: true,
  });

  // Fade out scroll cue as user scrolls down
  if (scrollCue) {
    gsap.to(scrollCue, {
      autoAlpha: 0,
      y: -30,
      ease: 'none',
      scrollTrigger: {
        trigger: '#hero',
        start: 'top top',
        end: 'bottom 40%',
        scrub: true,
      },
    });
  }
}
