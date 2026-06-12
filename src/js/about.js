/**
 * about.js
 *
 * About/Manifesto section: Pinned scroll section, line-by-line blur-to-sharp
 * reveal, and parallax background shapes.
 *
 * Plugins used (gsap-plugins skill):
 *   - ScrollTrigger — pin the section and scrub the timeline
 *   - SplitText     — type: 'lines', autoSplit: true for responsive wrapping
 *
 * Performance (gsap-performance skill):
 *   ✅ Parallax shapes animate y (transform), not top
 *   ✅ Filter (blur) and opacity are hardware-accelerated
 *   ✅ will-change: opacity, transform, filter is set in CSS
 */

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';

// Register plugins
gsap.registerPlugin(ScrollTrigger, SplitText);

export function initAbout() {
  const section = document.getElementById('about');
  const manifesto = document.getElementById('about-manifesto');
  const shape1 = document.getElementById('about-shape-1');
  const shape2 = document.getElementById('about-shape-2');

  if (!section || !manifesto) return;

  // ── SplitText — split into lines ──────────────────────────────────────────
  SplitText.create(manifesto, {
    type: 'lines',
    linesClass: 'line',
    autoSplit: true,
    onSplit(self) {
      // ── Timeline with ScrollTrigger ───────────────────────────────────────
      // We return the timeline so SplitText can clean it up and sync progress
      // when a window resize causes a re-split.
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: '+=150%',    // pin for 1.5x viewport height
          pin: true,
          scrub: 1,         // 1-second lag for smooth momentum scrub
        },
      });

      // ── 1. Text Reveal (blur to sharp) ────────────────────────────────────
      // Lines stagger in as user scrolls
      tl.from(self.lines, {
        opacity: 0,
        y: 40,
        filter: 'blur(12px)',
        stagger: 0.1,
        duration: 1,
        ease: 'power2.out',
      }, 0); // start at absolute 0

      // Calculate total duration of text stagger to sync shapes
      const textDuration = 1 + (self.lines.length * 0.1);

      // ── 2. Parallax Shapes ────────────────────────────────────────────────
      // Shapes drift in opposite directions while the section is pinned
      
      // Shape 1 (Violet) drifts down and right
      tl.to(shape1, {
        y: '20vh',
        x: '10vw',
        duration: textDuration,
        ease: 'none', // none is best for parallax scrub
      }, 0);

      // Shape 2 (Lime) drifts up and left
      tl.to(shape2, {
        y: '-20vh',
        x: '-10vw',
        duration: textDuration,
        ease: 'none',
      }, 0);

      return tl;
    },
  });
}
