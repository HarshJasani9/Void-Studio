/**
 * about.js
 *
 * About/Manifesto: Pinned scrub section, line-by-line blur reveal.
 *
 * Post-reveal (scrub progress >= 0.95):
 *   Slow, independent opacity breathe on each typed span.
 *   Each line fades between 0.65 → 1.0 at its own pace (no synced pulse) —
 *   soothing, barely perceptible, like text quietly breathing.
 *   No DOM manipulation. No movement. Just light.
 *
 * Plugins:
 *   - ScrollTrigger — pin + scrub reveal
 *   - SplitText     — lines only, for the scroll reveal
 */

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';

gsap.registerPlugin(ScrollTrigger, SplitText);

export function initAbout() {
  const section   = document.getElementById('about');
  const manifesto = document.getElementById('about-manifesto');
  const shape1    = document.getElementById('about-shape-1');
  const shape2    = document.getElementById('about-shape-2');
  const ghost     = document.querySelector('.about__ghost');
  const stats     = document.getElementById('about-stats');

  if (!section || !manifesto) return;

  const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (isReduced) {
    gsap.set(manifesto, { opacity: 1, filter: 'none', y: 0 });
    return;
  }

  let breatheTweens = [];
  let isRevealed    = false;

  // ── activateBreathe — fires once when scrub >= 95% ───────────────────────
  function activateBreathe() {
    const kicker = section.querySelector('.about__line--kicker');
    if (kicker) kicker.classList.add('is-revealed');

    // Kill any previous tweens (safe on resize re-trigger)
    breatheTweens.forEach(t => t.kill());
    breatheTweens = [];

    // Each typed span breathes at a slightly different duration so they
    // are never perfectly in sync — the effect reads as organic, not mechanical.
    const targets = [
      { el: '.about__line--bold',   duration: 4.2, delay: 0 },
      { el: '.about__line--body',   duration: 5.8, delay: 1.1 },
      { el: '.about__line--kicker', duration: 3.6, delay: 2.0 },
    ];

    targets.forEach(({ el, duration, delay }) => {
      const els = [...section.querySelectorAll(el)];
      if (!els.length) return;

      // Each element in the same tier also starts slightly offset from its sibling
      els.forEach((node, i) => {
        const tween = gsap.to(node, {
          opacity: 0.55,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          duration,
          delay: delay + i * 0.6, // sibling offset within same tier
        });
        breatheTweens.push(tween);
      });
    });
  }

  // ── SplitText — split <p> into lines for scroll reveal ────────────────────
  SplitText.create(manifesto, {
    type: 'lines',
    linesClass: 'line',
    autoSplit: true,
    onSplit(self) {
      // Re-apply on window resize after reveal
      if (isRevealed) requestAnimationFrame(activateBreathe);

      const eyebrow = section.querySelector('.about__eyebrow');

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start:   'top top',
          end:     '+=150%',
          pin:     true,
          scrub:   1,
          onUpdate(st) {
            if (!isRevealed && st.progress >= 0.95) {
              isRevealed = true;
              activateBreathe();
            }
          },
        },
      });

      // ── 1. Eyebrow reveal ─────────────────────────────────────────────────
      if (eyebrow) {
        tl.fromTo(eyebrow,
          { opacity: 0, y: 24 },
          { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' },
          0
        );
      }

      // ── 2. Line-by-line blur → sharp reveal ───────────────────────────────
      tl.from(self.lines, {
        opacity: 0,
        y: 40,
        filter: 'blur(14px)',
        stagger: 0.1,
        duration: 1,
        ease: 'power2.out',
      }, 0.1);

      // ── 3. Ghost wordmark + Stats strip ───────────────────────────────────
      const textDuration = 1.1 + (self.lines.length * 0.1);

      if (ghost) {
        tl.fromTo(ghost,
          { opacity: 0, scale: 0.92 },
          { opacity: 1, scale: 1, duration: textDuration * 0.8, ease: 'power2.out' },
          0
        );
      }

      if (stats) {
        tl.fromTo(stats,
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out' },
          textDuration * 0.7   // appears as the last text lines reveal
        );
      }

      // ── 4. Parallax background shapes ─────────────────────────────────────
      if (shape1) tl.to(shape1, { y: '18vh', x:   '8vw', duration: textDuration, ease: 'none' }, 0);
      if (shape2) tl.to(shape2, { y: '-18vh', x: '-8vw', duration: textDuration, ease: 'none' }, 0);

      return tl;
    },
  });
}
