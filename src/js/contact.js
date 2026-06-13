/**
 * contact.js
 *
 * Contact/Footer section logic:
 * - Massive SplitText reveal on scroll.
 * - Staggered entrance for social links and copyright.
 * - Magnetic effect for interactive elements [data-magnetic].
 */
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import SplitType from 'split-type';

gsap.registerPlugin(ScrollTrigger);

export function initContact() {
  const contactSection = document.getElementById('contact');
  if (!contactSection) return;

  // 1. SplitText reveal for massive title
  const title = document.getElementById('contact-title');
  let titleChars = [];
  if (title) {
    const splitTitle = new SplitType(title, { types: 'chars' });
    titleChars = splitTitle.chars;
    // Set initial state
    gsap.set(titleChars, { yPercent: 120, rotationZ: 10, autoAlpha: 0 });
  }

  // 2. Elements to stagger in
  const emailWrapper = document.querySelector('.contact__email-wrapper');
  const socials = document.querySelectorAll('.contact__social-link');
  const credits = document.querySelector('.contact__credits');

  // Create reveal timeline
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: contactSection,
      start: 'top 75%',
      toggleActions: 'play none none none',
    },
  });

  // Animate title characters
  if (titleChars.length > 0) {
    tl.to(titleChars, {
      yPercent: 0,
      rotationZ: 0,
      autoAlpha: 1,
      duration: 1.2,
      stagger: 0.04,
      ease: 'power4.out',
    });
  }

  // Animate email
  if (emailWrapper) {
    tl.from(emailWrapper, {
      y: 40,
      autoAlpha: 0,
      duration: 1.0,
      ease: 'power3.out',
    }, '-=0.8');
  }

  // Stagger socials
  if (socials.length > 0) {
    tl.from(socials, {
      y: 20,
      autoAlpha: 0,
      duration: 0.8,
      stagger: 0.1,
      ease: 'power3.out',
    }, '-=0.6');
  }

  // Fade credits
  if (credits) {
    tl.from(credits, {
      autoAlpha: 0,
      duration: 1.0,
      ease: 'power2.out',
    }, '-=0.4');
  }

  // 3. Magnetic Hover Physics
  const magnetics = document.querySelectorAll('[data-magnetic]');
  
  // Guard for touch devices
  const isTouch = window.matchMedia('(hover: none)').matches;
  
  if (!isTouch && magnetics.length > 0) {
    magnetics.forEach((el) => {
      // Create quickTo instances for performance
      const xTo = gsap.quickTo(el, 'x', { duration: 0.6, ease: 'power3.out' });
      const yTo = gsap.quickTo(el, 'y', { duration: 0.6, ease: 'power3.out' });

      el.addEventListener('mousemove', (e) => {
        const rect = el.getBoundingClientRect();
        const relX = e.clientX - rect.left;
        const relY = e.clientY - rect.top;
        
        // Calculate offset from center (-0.5 to 0.5) and multiply by intensity
        const intensityX = 40; // Max pixel pull X
        const intensityY = 30; // Max pixel pull Y
        
        const x = ((relX / rect.width) - 0.5) * intensityX;
        const y = ((relY / rect.height) - 0.5) * intensityY;
        
        xTo(x);
        yTo(y);
      });

      el.addEventListener('mouseleave', () => {
        // Snap back to origin
        xTo(0);
        yTo(0);
      });
    });
  }
}
