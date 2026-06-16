/**
 * services.js
 *
 * Services section: Responsive sticky card stack (overlapping cards)
 * animated via GSAP ScrollTrigger, with parallax image shifts
 * and dynamic index counter updating.
 */
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function initServices() {
  const section = document.getElementById('services');
  const cardsContainer = document.querySelector('.services__cards');
  const cards = gsap.utils.toArray('.services__card');
  const counterCurrent = document.getElementById('services-counter-current');

  if (!section || !cardsContainer || cards.length === 0) return;

  const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Cards are visible by default to prevent layout collisions and anchor race conditions.

  // If prefers-reduced-motion is active, skip sticky behaviors and animations
  if (isReduced) return;

  const mm = gsap.matchMedia();

  // 2. Desktop Sticky Scroll Animation (min-width: 992px)
  mm.add('(min-width: 992px)', () => {
    cards.forEach((card, index) => {
      const serviceId = card.getAttribute('data-service-id');
      const formattedIndex = serviceId.padStart(2, '0');

      // Update active counter when the card hits the sticky trigger point
      ScrollTrigger.create({
        trigger: card,
        start: 'top 22.5rem',
        end: 'top 7.5rem',
        onEnter: () => {
          if (counterCurrent) {
            counterCurrent.textContent = formattedIndex;
          }
        },
        onLeave: () => {
          if (counterCurrent) {
            counterCurrent.textContent = formattedIndex;
          }
        },
        onLeaveBack: () => {
          if (index > 0 && counterCurrent) {
            const prevIndex = String(index).padStart(2, '0');
            counterCurrent.textContent = prevIndex;
          }
        }
      });

      // Animate card scale/opacity depth effect when the next card overlaps it
      if (index < cards.length - 1) {
        const nextCard = cards[index + 1];
        
        gsap.fromTo(card, 
          {
            scale: 1,
            opacity: 1,
            yPercent: 0
          },
          {
            scale: 0.92,
            opacity: 0, // fade out completely once next card is in place
            yPercent: -8,
            immediateRender: false,
            ease: 'none',
            scrollTrigger: {
              trigger: nextCard,
              start: 'top 27.5rem', // start animating when next card is closer to sticky top
              end: 'top 7.5rem',   // end when next card sticks
              scrub: true,
            }
          }
        );
      }

      // Parallax effect on card images during scrolling
      const img = card.querySelector('.services__card-visual img');
      if (img) {
        gsap.fromTo(img, 
          { yPercent: -12 },
          {
            yPercent: 12,
            ease: 'none',
            scrollTrigger: {
              trigger: card,
              start: 'top bottom',
              end: 'bottom top',
              scrub: true,
            }
          }
        );
      }
    });
  });

  // 3. Mobile / Tablet scroll-triggered counter update (max-width: 991px)
  mm.add('(max-width: 991px)', () => {
    cards.forEach((card) => {
      const serviceId = card.getAttribute('data-service-id');
      const formattedIndex = serviceId.padStart(2, '0');

      ScrollTrigger.create({
        trigger: card,
        start: 'top center',
        end: 'bottom center',
        onToggle: (self) => {
          if (self.isActive && counterCurrent) {
            counterCurrent.textContent = formattedIndex;
          }
        },
        onEnterBack: () => {
          if (counterCurrent) {
            counterCurrent.textContent = formattedIndex;
          }
        }
      });
    });
  });
}

