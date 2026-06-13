/**
 * contact.js
 *
 * Contact/Footer section logic:
 * - Massive SplitText reveal on scroll with custom "hop" ease.
 * - Staggered entrance for email, info grid, and bottom credits.
 * - Magnetic effect for interactive elements [data-magnetic] using "hop" ease.
 * - Live-updating timezone clock for Ahmedabad, India (GMT+5:30).
 */
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CustomEase } from 'gsap/CustomEase';
import SplitType from 'split-type';

gsap.registerPlugin(ScrollTrigger, CustomEase);

export function initContact() {
  const contactSection = document.getElementById('contact');
  if (!contactSection) return;

  const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouch = window.matchMedia('(hover: none)').matches;

  // Create CustomEase "hop" ease
  const hop = CustomEase.create('contact-hop', '0.9, 0, 0.1, 1');

  // 1. Live Timezone Clock
  function initClock() {
    const timeElement = document.getElementById('contact-time');
    if (!timeElement) return;

    function updateAhmedabadTime() {
      const options = {
        timeZone: 'Asia/Kolkata',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      };
      try {
        const formatter = new Intl.DateTimeFormat('en-US', options);
        const timeString = formatter.format(new Date());
        timeElement.textContent = `${timeString} (GMT+5:30)`;
      } catch (err) {
        // Fallback calculation for GMT+5.5
        const d = new Date();
        const utc = d.getTime() + (d.getTimezoneOffset() * 60000);
        const nd = new Date(utc + (3600000 * 5.5));
        const pad = (n) => String(n).padStart(2, '0');
        timeElement.textContent = `${pad(nd.getHours())}:${pad(nd.getMinutes())}:${pad(nd.getSeconds())} (GMT+5:30)`;
      }
    }

    updateAhmedabadTime();
    setInterval(updateAhmedabadTime, 1000);
  }

  initClock();

  // 2. SplitText reveal for massive title
  const title = document.getElementById('contact-title');
  let titleChars = [];
  const accentDot = title ? title.querySelector('.accent') : null;

  if (title) {
    const titleTexts = title.querySelectorAll('.contact__title-text');
    if (isReduced) {
      if (titleTexts.length > 0) gsap.set(titleTexts, { yPercent: 0, rotationZ: 0, autoAlpha: 1 });
      if (accentDot) gsap.set(accentDot, { scale: 1, autoAlpha: 1 });
    } else {
      const splits = Array.from(titleTexts).map(el => new SplitType(el, { types: 'chars' }));
      titleChars = splits.flatMap(s => s.chars);
      // Set initial state
      gsap.set(titleChars, { yPercent: 120, rotationZ: 10, autoAlpha: 0 });
      if (accentDot) {
        gsap.set(accentDot, { scale: 0, autoAlpha: 0, transformOrigin: 'center center' });
      }
    }
  }

  // Stagger items
  const emailWrapper = document.querySelector('.contact__email-wrapper');
  const grid = document.querySelector('.contact__grid');
  const bottom = document.querySelector('.contact__bottom');

  if (isReduced) {
    if (emailWrapper) gsap.set(emailWrapper, { y: 0, autoAlpha: 1 });
    if (grid) gsap.set(grid, { y: 0, autoAlpha: 1 });
    if (bottom) gsap.set(bottom, { y: 0, autoAlpha: 1 });
    return; // Skip magnetic physics & animations
  }

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: contactSection,
      start: 'top 85%',
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
      ease: hop,
    });
  }

  // Animate accent dot
  if (accentDot) {
    tl.to(accentDot, {
      scale: 1,
      autoAlpha: 1,
      duration: 0.8,
      ease: 'back.out(1.7)',
    }, '-=0.4');
  }

  // Animate email button
  if (emailWrapper) {
    tl.from(emailWrapper, {
      y: 45,
      autoAlpha: 0,
      duration: 1.0,
      ease: hop,
    }, '-=0.8');
  }

  // Animate contact grid
  if (grid) {
    tl.from(grid, {
      y: 35,
      autoAlpha: 0,
      duration: 1.0,
      ease: hop,
    }, '-=0.7');
  }

  // Stagger bottom socials and credits
  if (bottom) {
    tl.from(bottom, {
      y: 25,
      autoAlpha: 0,
      duration: 0.8,
      ease: hop,
    }, '-=0.6');
  }

  // 3. Magnetic Hover Physics
  const magnetics = document.querySelectorAll('[data-magnetic]');
  
  if (!isTouch && !isReduced && magnetics.length > 0) {
    magnetics.forEach((el) => {
      // Create quickTo instances using CustomEase "hop"
      const xTo = gsap.quickTo(el, 'x', { duration: 0.4, ease: hop });
      const yTo = gsap.quickTo(el, 'y', { duration: 0.4, ease: hop });

      el.addEventListener('mousemove', (e) => {
        const rect = el.getBoundingClientRect();
        const relX = e.clientX - rect.left;
        const relY = e.clientY - rect.top;
        
        // Slightly stronger bounds for the massive email button
        const isEmailBtn = el.classList.contains('contact__email');
        const intensityX = isEmailBtn ? 50 : 35;
        const intensityY = isEmailBtn ? 35 : 25;
        
        const x = ((relX / rect.width) - 0.5) * intensityX;
        const y = ((relY / rect.height) - 0.5) * intensityY;
        
        xTo(x);
        yTo(y);
      });

      el.addEventListener('mouseleave', () => {
        xTo(0);
        yTo(0);
      });
    });
  }
}
