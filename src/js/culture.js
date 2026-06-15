/**
 * culture.js
 *
 * Team/Culture section:
 *   1. Scroll-triggered entrance animations (revealing cards and backgrounds).
 *   2. Interactive 3D Parallax Tilt Response on cards.
 *   3. Background glowing shape scroll parallax.
 *   4. Real-time Studio vitals dashboard simulation ticking loop.
 */
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function initCulture() {
  const section = document.getElementById('culture');
  const cards = document.querySelectorAll('.culture__card');
  const infoCard = document.querySelector('.culture__info-card');
  const shape1 = document.getElementById('culture-shape-1');
  const shape2 = document.getElementById('culture-shape-2');

  if (!section || cards.length === 0) return;

  const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ── 1. Reduced Motion Fallbacks ───────────────────────────────────────────
  if (isReduced) {
    cards.forEach((card) => {
      gsap.set(card, { autoAlpha: 1, scale: 1 });
      const img = card.querySelector('.culture__img');
      if (img) gsap.set(img, { filter: 'grayscale(40%)', scale: 1 });
    });
    if (infoCard) gsap.set(infoCard, { autoAlpha: 1, scale: 1 });
    return;
  }

  // ── 2. Entrance Scroll Animations ─────────────────────────────────────────
  cards.forEach((card) => {
    const img = card.querySelector('.culture__img');
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: card,
        start: 'top 85%',
        toggleActions: 'play none none none',
      },
    });

    tl.fromTo(card,
      { autoAlpha: 0, scale: 0.92 },
      { autoAlpha: 1, scale: 1.0, duration: 1.0, ease: 'power3.out' },
      0
    );

    if (img) {
      tl.fromTo(img,
        { filter: 'grayscale(100%)', scale: 1.15 },
        { filter: 'grayscale(40%)', scale: 1.0, duration: 1.2, ease: 'power3.out' },
        0
      );
    }
  });

  if (infoCard) {
    gsap.fromTo(infoCard,
      { autoAlpha: 0, scale: 0.92 },
      {
        autoAlpha: 1,
        scale: 1.0,
        duration: 1.0,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: infoCard,
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
      }
    );
  }

  // ── 3. Background Parallax Shapes ─────────────────────────────────────────
  if (shape1 && shape2) {
    gsap.to(shape1, {
      y: '12vh',
      x: '-4vw',
      ease: 'none',
      scrollTrigger: {
        trigger: section,
        start: 'top bottom',
        end: 'bottom top',
        scrub: 1.2,
      }
    });

    gsap.to(shape2, {
      y: '-12vh',
      x: '4vw',
      ease: 'none',
      scrollTrigger: {
        trigger: section,
        start: 'top bottom',
        end: 'bottom top',
        scrub: 1.2,
      }
    });
  }

  // ── 4. Interactive 3D Parallax Tilt ───────────────────────────────────────
  cards.forEach((card) => {
    const img = card.querySelector('.culture__img');

    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const px = (x / rect.width) - 0.5;
      const py = (y / rect.height) - 0.5;

      // Subtle 3D rotation based on mouse coordinates
      const rotateX = -py * 10;
      const rotateY = px * 10;

      // Parallax shift for inner image in opposite direction
      const shiftX = px * 15;
      const shiftY = py * 15;

      gsap.to(card, {
        rotationX: rotateX,
        rotationY: rotateY,
        transformPerspective: 1000,
        duration: 0.4,
        ease: 'power2.out',
        overwrite: 'auto',
      });

      if (img) {
        gsap.to(img, {
          x: shiftX,
          y: shiftY,
          scale: 1.08,
          duration: 0.4,
          ease: 'power2.out',
          overwrite: 'auto',
        });
      }
    });

    card.addEventListener('mouseleave', () => {
      gsap.to(card, {
        rotationX: 0,
        rotationY: 0,
        duration: 0.6,
        ease: 'power3.out',
        overwrite: 'auto',
      });

      if (img) {
        gsap.to(img, {
          x: 0,
          y: 0,
          scale: 1.0,
          duration: 0.6,
          ease: 'power3.out',
          overwrite: 'auto',
        });
      }
    });
  });

  // ── 5. Real-time Studio Vitals ticking loop ───────────────────────────────
  const tempoVal = document.getElementById('vital-tempo');
  const latencyVal = document.getElementById('vital-latency');
  const healthVal = document.getElementById('vital-health');

  if (tempoVal || latencyVal || healthVal) {
    const vitalsInterval = setInterval(() => {
      // Check if element is still in DOM (prevents leaks if page refreshes/removes elements)
      if (!document.getElementById('culture')) {
        clearInterval(vitalsInterval);
        return;
      }

      // Slightly fluctuate Tempo: 118-124 BPM
      if (tempoVal) {
        const randTempo = Math.floor(Math.random() * (124 - 118 + 1)) + 118;
        tempoVal.textContent = `${randTempo} BPM`;
      }

      // Slightly fluctuate Latency: 11-16 MS
      if (latencyVal) {
        const randLatency = Math.floor(Math.random() * (16 - 11 + 1)) + 11;
        latencyVal.textContent = `${randLatency} MS`;
      }

      // Slightly fluctuate Health: 98.1% - 99.8%
      if (healthVal) {
        const randHealth = (98.1 + Math.random() * (99.8 - 98.1)).toFixed(1);
        healthVal.textContent = `${randHealth}%`;
      }
    }, 2000);
  }
}
