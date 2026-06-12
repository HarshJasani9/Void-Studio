/**
 * animations.js
 * Global GSAP animations — hero entrance, marquee, reveal-on-scroll
 */
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * Hero entrance sequence
 */
export function initHeroAnimations() {
  const tl = gsap.timeline({ delay: 1.6 });

  tl.from('.hero__label', {
    y: 30,
    autoAlpha: 0,
    duration: 0.8,
    ease: 'power3.out',
  })
  .from('.hero__title', {
    y: 60,
    autoAlpha: 0,
    duration: 1,
    ease: 'power3.out',
  }, '-=0.5')
  .from('.hero__subtitle', {
    y: 20,
    autoAlpha: 0,
    duration: 0.6,
    ease: 'power3.out',
  }, '-=0.4')
  .from('.hero__scroll', {
    autoAlpha: 0,
    duration: 0.6,
    ease: 'power2.out',
  }, '-=0.2');

  return tl;
}

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
