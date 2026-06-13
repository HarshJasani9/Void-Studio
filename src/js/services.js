/**
 * services.js
 *
 * Services section: Redesigned row hover micro-interactions, cursor-following 
 * image previews, and a dynamic viewport-aware active section counter.
 */
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CustomEase } from 'gsap/CustomEase';

gsap.registerPlugin(ScrollTrigger, CustomEase);

export function initServices() {
  const section = document.getElementById('services');
  const list = document.querySelector('.services__list');
  const items = document.querySelectorAll('.services__item');
  const counterCurrent = document.getElementById('services-counter-current');
  const previewsContainer = document.getElementById('services-previews');

  if (!section || !list || items.length === 0) return;

  const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouch = window.matchMedia('(hover: none)').matches;

  // Register CustomEase "hop" ease (duration 0.35s as specified)
  const hop = CustomEase.create('services-hop', '0.9, 0, 0.1, 1');

  let isHoveringList = false;

  // Dynamic index counter updater
  function updateCounter(indexStr) {
    if (counterCurrent) {
      counterCurrent.textContent = indexStr;
    }
  }

  // 1. Initial Staggered Reveal Scroll Animation
  if (isReduced) {
    gsap.set(items, { y: 0, autoAlpha: 1 });
  } else {
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

  // 2. Cursor-following floating image previews (disabled on touch / reduced motion)
  if (!isTouch && !isReduced && previewsContainer) {
    const xTo = gsap.quickTo(previewsContainer, 'x', { duration: 0.4, ease: 'power3' });
    const yTo = gsap.quickTo(previewsContainer, 'y', { duration: 0.4, ease: 'power3' });

    section.addEventListener('mousemove', (e) => {
      xTo(e.clientX - window.innerWidth / 2);
      yTo(e.clientY - window.innerHeight / 2);
    });
  }

  // 3. ScrollTrigger instance tracking for dynamic viewport counting
  const triggers = [];
  if (counterCurrent) {
    items.forEach((item) => {
      const serviceId = item.getAttribute('data-service-id');
      const formattedIndex = serviceId.padStart(2, '0');

      const trigger = ScrollTrigger.create({
        trigger: item,
        start: 'top center+=10%',
        end: 'bottom center+=10%',
        onToggle: (self) => {
          if (self.isActive && !isHoveringList) {
            updateCounter(formattedIndex);
          }
        },
      });
      triggers.push({ trigger, index: formattedIndex });
    });
  }

  // 4. Hover animation binding for each service row
  items.forEach((item) => {
    const serviceId = item.getAttribute('data-service-id');
    const formattedIndex = serviceId.padStart(2, '0');
    const title = item.querySelector('.services__item-title');
    const index = item.querySelector('.services__item-index');
    const desc = item.querySelector('.services__item-desc');
    const underline = item.querySelector('.services__item-underline');
    const previewImg = previewsContainer ? previewsContainer.querySelector(`.services__preview-img[data-service-img="${serviceId}"]`) : null;
    const imgInside = previewImg ? previewImg.querySelector('img') : null;

    let hoverTl = gsap.timeline({ paused: true });

    if (!isReduced) {
      // Scale row title slightly
      hoverTl.to(title, {
        scale: 1.05,
        transformOrigin: 'left center',
        duration: 0.35,
        ease: hop
      }, 0);

      // Blow up index, switch to transparent/stroke outlined design, place behind title
      hoverTl.to(index, {
        scale: 5.5,
        xPercent: 120,
        yPercent: -10,
        color: 'transparent',
        webkitTextStroke: '1.5px rgba(255, 255, 255, 0.15)',
        opacity: 0.15,
        duration: 0.35,
        ease: hop
      }, 0);

      // Animate line color transition and width scaling (left to right draw)
      hoverTl.fromTo(underline,
        { scaleX: 0 },
        {
          scaleX: 1,
          backgroundColor: '#c8ff00',
          height: 2,
          duration: 0.35,
          ease: hop
        }, 0
      );

      // Shift description text left and fade up opacity
      hoverTl.to(desc, {
        opacity: 1,
        x: -15,
        duration: 0.35,
        ease: hop
      }, 0);

      // Reveal cursor-following preview image
      if (previewImg && !isTouch) {
        hoverTl.to(previewImg, {
          autoAlpha: 1,
          scale: 1,
          duration: 0.35,
          ease: hop
        }, 0);

        if (imgInside) {
          hoverTl.fromTo(imgInside,
            { scale: 1.2 },
            { scale: 1.0, duration: 0.35, ease: hop },
            0
          );
        }
      }
    }

    item.addEventListener('mouseenter', () => {
      isHoveringList = true;
      updateCounter(formattedIndex);
      if (!isReduced) {
        hoverTl.play();
      }
    });

    item.addEventListener('mouseleave', () => {
      isHoveringList = false;
      if (!isReduced) {
        hoverTl.reverse();
      }

      // Revert counter to whatever section is active in viewport center
      const active = triggers.find(t => t.trigger.isActive);
      if (active) {
        updateCounter(active.index);
      }
    });
  });
}
