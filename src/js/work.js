/**
 * work.js
 *
 * Work/Projects section: Horizontal scroll showcase pinned via GSAP ScrollTrigger.
 * Includes card hovers, smooth parallax shifts, and FLIP-based fullscreen detail views.
 */

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Flip } from 'gsap/Flip';
import { SplitText } from 'gsap/SplitText';

// Register plugins
gsap.registerPlugin(ScrollTrigger, Flip, SplitText);

export function initWork(lenis) {
  const section = document.getElementById('work');
  const track = document.getElementById('work-track');
  const cards = document.querySelectorAll('.work__card');
  const detail = document.getElementById('project-detail');
  const detailClose = document.getElementById('detail-close');
  const detailImgContainer = document.getElementById('detail-img-container');
  const detailTitle = document.getElementById('detail-title');
  const detailCategory = document.getElementById('detail-category');
  const detailServices = document.getElementById('detail-services');
  const detailDesc = document.getElementById('detail-desc');

  if (!section || !track || cards.length === 0 || !detail) return;

  const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isMobile = window.matchMedia('(max-width: 768px)').matches;

  let isDetailOpen = false;
  let currentActiveCard = null;
  let currentImgContainer = null;
  let originalParent = null;

  // ── 1. Horizontal Scroll Animation via ScrollTrigger ──────────────────────
  let scrollTween = null;

  if (!isMobile && !isReduced) {
    // Scroll track horizontal slide
    scrollTween = gsap.to(track, {
      x: () => -(track.scrollWidth - window.innerWidth),
      ease: 'none',
      scrollTrigger: {
        trigger: section,
        pin: true,
        scrub: 1.0,
        start: 'top top',
        end: () => `+=${track.scrollWidth - window.innerWidth}`,
        invalidateOnRefresh: true,
      }
    });

    // Parallax effect on images during horizontal scrolling
    cards.forEach((card) => {
      const img = card.querySelector('.work__img-container img');
      if (img) {
        gsap.fromTo(img,
          { x: '-8%' },
          {
            x: '8%',
            ease: 'none',
            scrollTrigger: {
              trigger: card,
              containerAnimation: scrollTween,
              start: 'left right',
              end: 'right left',
              scrub: true,
            }
          }
        );
      }
    });
  }

  // ── 2. Click Action: Open Detail View (FLIP Transition) ─────────────────────
  cards.forEach((card) => {
    card.addEventListener('click', () => {
      if (isDetailOpen) return;
      isDetailOpen = true;
      currentActiveCard = card;

      // Stop page scrolling via Lenis
      if (lenis) lenis.stop();

      const imgContainer = card.querySelector('.work__img-container');
      const imgInside = imgContainer ? imgContainer.querySelector('img') : null;
      currentImgContainer = imgContainer;
      originalParent = imgContainer.parentNode;

      // Populate detail content dynamically from card
      const titleText = card.querySelector('.work__card-title').textContent;
      const categoryText = card.querySelector('.work__card-category').textContent;
      const descText = card.querySelector('.work__card-desc').textContent;
      
      detailTitle.textContent = titleText;
      detailCategory.textContent = categoryText;
      detailDesc.textContent = descText;
      detailServices.textContent = categoryText.includes('Visual') ? 'WebGL, Custom Shaders, Math' :
                                   categoryText.includes('Luxury') ? 'Branding, Shopify, UI/UX' :
                                   categoryText.includes('Digital') ? 'Telemetry, GSAP, Audio Reactive' :
                                   categoryText.includes('Identity') ? 'Graphic Design, Stationery, Motion' :
                                   'Svelte, API, SVG Renderers';

      // 1. Prepare SplitText on title
      const splitTitle = new SplitText(detailTitle, { type: 'chars' });
      
      if (isReduced) {
        gsap.set(splitTitle.chars, { yPercent: 0, opacity: 1 });
      } else {
        gsap.set(splitTitle.chars, { yPercent: 100, opacity: 0 });
      }

      // 2. Capture FLIP state before moving DOM element
      const state = Flip.getState([imgContainer, imgInside]);

      // 3. Move image container to detail container parent
      detailImgContainer.appendChild(imgContainer);

      // Make detail container block and visible
      detail.classList.add('is-open');

      // 4. Run transition timeline
      const tl = gsap.timeline();
      if (isReduced) tl.timeScale(1000);

      // Fade backdrop overlay
      tl.to('.project-detail__overlay', {
        opacity: 1,
        duration: 0.6,
        ease: 'power2.out'
      }, 0);

      // FLIP image from card track position to fullscreen
      tl.add(
        Flip.from(state, {
          duration: 0.8,
          ease: 'power3.inOut',
          nested: true,
          scale: true
        }),
        0
      );

      // Slide + Fade content in
      tl.to('.project-detail__content', {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: 'power2.out'
      }, '-=0.4');

      // Stagger title split-text reveal
      tl.to(splitTitle.chars, {
        yPercent: 0,
        opacity: 1,
        stagger: 0.03,
        duration: 0.6,
        ease: 'power3.out'
      }, '-=0.4');

      // Reveal close button
      tl.to(detailClose, {
        opacity: 1,
        y: 0,
        duration: 0.4,
        ease: 'power2.out'
      }, '-=0.3');
    });
  });

  // ── 3. Close Detail View (Reverse Transition) ─────────────────────────────────
  function closeProjectDetail() {
    if (!isDetailOpen || !currentImgContainer || !originalParent) return;

    const imgInside = currentImgContainer.querySelector('img');

    // 1. Fade out content first
    const tl = gsap.timeline({
      onComplete: () => {
        // Capture fullscreen state
        const state = Flip.getState([currentImgContainer, imgInside]);

        // Move image container back to its original card element
        originalParent.insertBefore(currentImgContainer, originalParent.firstChild);

        // Hide detail container
        detail.classList.remove('is-open');

        // Reset text content styling to clear split properties
        gsap.set('.project-detail__content', { clearProps: 'all' });

        // Trigger FLIP back to card state
        Flip.from(state, {
          duration: isReduced ? 0 : 0.8,
          ease: 'power3.inOut',
          nested: true,
          scale: true,
          onComplete: () => {
            isDetailOpen = false;
            
            // Resume page scrolling
            if (lenis) lenis.start();

            // Reset preview image styles so normal hover functions normally
            gsap.set(currentImgContainer, { clearProps: 'all' });
            gsap.set(imgInside, { clearProps: 'all' });
            currentImgContainer = null;
            originalParent = null;
            currentActiveCard = null;
          }
        });
      }
    });
    if (isReduced) tl.timeScale(1000);

    tl.to(detailClose, {
      opacity: 0,
      y: -20,
      duration: 0.3,
      ease: 'power2.in'
    }, 0);

    tl.to('.project-detail__content', {
      opacity: 0,
      y: 20,
      duration: 0.3,
      ease: 'power2.in'
    }, 0);

    tl.to('.project-detail__overlay', {
      opacity: 0,
      duration: 0.4,
      ease: 'power2.in'
    }, 0);
  }

  detailClose.addEventListener('click', closeProjectDetail);
}
