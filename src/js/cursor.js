/**
 * cursor.js
 * Custom cursor follower with magnetic hover effect
 */
import gsap from 'gsap';

export function initCursor() {
  const cursor = document.getElementById('cursor');
  if (!cursor || window.matchMedia('(hover: none)').matches) return;

  const dot = cursor.querySelector('.cursor__dot');
  const ring = cursor.querySelector('.cursor__ring');

  // Track mouse position
  let mouse = { x: 0, y: 0 };

  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  // Animate cursor to follow mouse
  gsap.ticker.add(() => {
    gsap.set(dot, { x: mouse.x, y: mouse.y });
    gsap.to(ring, {
      x: mouse.x,
      y: mouse.y,
      duration: 0.15,
      ease: 'power2.out',
      overwrite: 'auto',
    });
  });

  // Scale up on interactive elements
  const interactiveEls = document.querySelectorAll('a, button, [data-cursor]');
  interactiveEls.forEach((el) => {
    el.addEventListener('mouseenter', () => {
      gsap.to(ring, { scale: 2, opacity: 0.3, duration: 0.3, ease: 'power2.out' });
    });
    el.addEventListener('mouseleave', () => {
      gsap.to(ring, { scale: 1, opacity: 0.5, duration: 0.3, ease: 'power2.out' });
    });
  });
}
