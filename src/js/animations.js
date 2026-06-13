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
  const tracks = document.querySelectorAll('.marquee__track');
  if (tracks.length === 0) return;

  tracks.forEach((track, index) => {
    // Clone content for seamless loop
    track.innerHTML += track.innerHTML;

    // Alternate direction based on index if desired, but here we just loop left
    const direction = index % 2 === 0 ? -50 : 50; 
    
    // If direction is positive, we need to start at -50% and go to 0
    if (direction === 50) {
      gsap.set(track, { xPercent: -50 });
      gsap.to(track, {
        xPercent: 0,
        duration: 20,
        ease: 'none',
        repeat: -1,
      });
    } else {
      gsap.to(track, {
        xPercent: -50,
        duration: 20,
        ease: 'none',
        repeat: -1,
      });
    }
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
