/**
 * header.js
 * Sticky header scroll-state + burger toggle
 */
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function initHeader() {
  const header = document.getElementById('header');
  if (!header) return;

  // Add .is-scrolled after scrolling past 80px
  ScrollTrigger.create({
    start: 'top -80',
    onUpdate: (self) => {
      header.classList.toggle('is-scrolled', self.progress > 0);
    },
  });

  // Burger toggle (mobile)
  const burger = document.getElementById('nav-burger');
  const links = document.getElementById('nav-links');
  if (burger && links) {
    burger.addEventListener('click', () => {
      links.classList.toggle('is-open');
      burger.classList.toggle('is-active');
    });
  }
}
