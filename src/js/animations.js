/**
 * animations.js
 * Global GSAP animations — hero entrance, marquee, reveal-on-scroll
 */
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * Infinite marquee scroll
 */
export function initMarquee() {
  const track = document.getElementById('marquee-track');
  if (!track) return;

  // Clone content for seamless loop
  track.innerHTML += track.innerHTML;

  gsap.to(track, {
    xPercent: -50,
    duration: 20,
    ease: 'none',
    repeat: -1,
  });
}

/**
 * Reveal-on-scroll for [data-reveal] elements
 */
export function initRevealAnimations() {
  const reveals = document.querySelectorAll('[data-reveal]');

  reveals.forEach((el) => {
    gsap.from(el, {
      y: 40,
      autoAlpha: 0,
      duration: 0.8,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 85%',
        toggleActions: 'play none none none',
      },
    });
  });
}
