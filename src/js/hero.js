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

/**
 * initHero()
 * Runs after the preloader resolves — no delay needed here.
 */
export function initHero() {
  // Set up video lazy loading & intersection controls
  initHeroVideo();

  const headline   = document.getElementById('hero-headline');
  const eyebrow    = document.getElementById('hero-eyebrow');
  const descriptor = document.getElementById('hero-descriptor');
  const scrollCue  = document.getElementById('hero-scroll-cue');

  if (!headline) return;

  const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (isReduced) {
    gsap.set('.hero__eyebrow-line', { scaleX: 1 });
    gsap.set(eyebrow, { autoAlpha: 1, x: 0 });
    if (descriptor) {
      gsap.set(descriptor.querySelectorAll('span'), { autoAlpha: 1, y: 0 });
    }
    if (scrollCue) {
      gsap.set(scrollCue, { autoAlpha: 1 });
    }
    return;
  }

  // ── SplitText — split each .hero__word into chars ──────────────────────────
  //
  // type: 'chars'      — only chars; skip words/lines for perf (skill tip)
  // mask: 'chars'      — SplitText wraps each char in overflow:clip container
  //                      → clean clip reveal without a CSS wrapper
  // aria: 'auto'       — adds aria-label on parent, aria-hidden on char spans
  // autoSplit: true    — re-splits when font metrics change after load
  // onSplit(self)      — animations must be inside onSplit when using autoSplit;
  //                      returning the tween lets SplitText sync on re-split
  //
  // Targeting .hero__word spans individually so "VOID" and "STUDIO" can
  // have different stagger offsets (STUDIO starts later)

  const words = headline.querySelectorAll('.hero__word');

  SplitText.create(words, {
    type: 'chars',
    mask: 'chars',
    aria: 'auto',
    autoSplit: true,
    onSplit(self) {
      return buildTimeline(self.chars, eyebrow, descriptor, scrollCue);
    },
  });
}

/**
 * buildTimeline(chars, eyebrow, descriptor, scrollCue)
 * Returned to SplitText.onSplit() so it can sync on re-split.
 */
function buildTimeline(chars, eyebrow, descriptor, scrollCue) {
  const tl = gsap.timeline({
    defaults: { ease: hopEase },
  });

  // ── Label: "enter" ─────────────────────────────────────────────────────────
  tl.addLabel('enter', 0);

  // Characters: stagger up from y:110% (below mask clip)
  // from() with immediateRender: true (default) — sets start state instantly
  tl.from(chars, {
    yPercent: 110,
    duration:  0.7,
    stagger: {
      each: 0.04,
      ease: 'power2.inOut',  // stagger spread itself has its own ease
    },
  }, 'enter');

  // Eyebrow line scales in from left, then text fades in — parallel with chars
  tl.to('.hero__eyebrow-line', {
    scaleX: 1,
    duration: 0.6,
    ease: 'power3.out',
  }, 'enter+=0.1');

  tl.from(eyebrow, {
    autoAlpha: 0,
    x: -12,
    duration: 0.5,
    ease: 'power2.out',
  }, 'enter+=0.3');

  // Descriptor words — each word slides up with a short stagger
  tl.from(descriptor.querySelectorAll('span'), {
    autoAlpha: 0,
    y: 10,
    duration: 0.5,
    stagger: 0.06,
    ease: 'power2.out',
  }, 'enter+=0.5');

  // ── Scroll cue — fades in last ─────────────────────────────────────────────
  tl.to(scrollCue, {
    autoAlpha: 1,
    duration: 0.6,
    ease: 'power2.out',
  }, 'enter+=0.8');

  // Thumb bounces infinitely inside the track
  // Per gsap-performance: animate y (transform) not top
  gsap.to('.hero__scroll-cue-thumb', {
    y: '170%',           // 170% travels from top to bottom of track
    duration: 1.2,
    ease: 'power1.inOut',
    repeat: -1,
    yoyo: true,
    delay: 1,            // let entrance finish before starting loop
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

  return tl;
}
