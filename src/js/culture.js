/**
 * culture.js
 *
 * Team/Culture section: Scroll-triggered grayscale-to-color + scale reveals.
 */
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function initCulture() {
  const cards = document.querySelectorAll('.culture__card');
  const infoCard = document.querySelector('.culture__info-card');

  if (cards.length === 0) return;

  const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (isReduced) {
    cards.forEach((card) => {
      gsap.set(card, { autoAlpha: 1, scale: 1 });
      const img = card.querySelector('.culture__img');
      if (img) gsap.set(img, { filter: 'grayscale(40%)', scale: 1 });
    });
    if (infoCard) gsap.set(infoCard, { autoAlpha: 1, scale: 1 });
    return;
  }

  cards.forEach((card) => {
    const img = card.querySelector('.culture__img');

    // Create a unified timeline for each card's scroll reveal
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: card,
        start: 'top 85%',
        toggleActions: 'play none none none',
      },
    });

    // 1. Reveal card wrapper (fade-in + scale up)
    tl.fromTo(card, 
      {
        autoAlpha: 0,
        scale: 0.92,
      },
      {
        autoAlpha: 1,
        scale: 1.0,
        duration: 1.0,
        ease: 'power3.out',
      },
      0
    );

    // 2. Animate image (grayscale-to-color transition + scale-down reveal)
    if (img) {
      tl.fromTo(img,
        {
          filter: 'grayscale(100%)',
          scale: 1.2,
        },
        {
          filter: 'grayscale(40%)', // base state: slightly desaturated to match dark mode palette
          scale: 1.0,
          duration: 1.2,
          ease: 'power3.out',
        },
        0
      );
    }
  });

  // Reveal the info card on scroll
  if (infoCard) {
    gsap.fromTo(infoCard,
      {
        autoAlpha: 0,
        scale: 0.92,
      },
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
}
