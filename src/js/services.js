/**
 * services.js
 *
 * Services section: Scroll-triggered staggered reveal of list items.
 */
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function initServices() {
  const list = document.querySelector('.services__list');
  const items = document.querySelectorAll('.services__item');

  if (!list || items.length === 0) return;

  // Reveal list items sequentially with a stagger when list enters viewport
  gsap.from(items, {
    y: 60,
    autoAlpha: 0,
    duration: 1.0,
    stagger: {
      each: 0.15,
      ease: 'power2.out',
    },
    ease: 'power4.out',
    scrollTrigger: {
      trigger: list,
      start: 'top 85%',
      toggleActions: 'play none none none',
    },
  });
}
