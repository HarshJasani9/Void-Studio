/**
 * loader.js
 * Intro loader animation — fades out the loader overlay after page load
 */
import gsap from 'gsap';

export function initLoader() {
  const loader = document.getElementById('loader');
  if (!loader) return;

  const tl = gsap.timeline({
    onComplete: () => {
      loader.style.display = 'none';
      document.body.classList.add('is-loaded');
    },
  });

  tl.to('.loader__text', {
    yPercent: -100,
    opacity: 0,
    duration: 0.6,
    ease: 'power3.inOut',
    delay: 0.8,
  })
  .to(loader, {
    yPercent: -100,
    duration: 0.8,
    ease: 'power4.inOut',
  }, '-=0.2');

  return tl;
}
