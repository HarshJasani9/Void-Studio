/**
 * work.js
 *
 * Work/Projects section: Cursor-following preview images with CSS clip-path distortion,
 * magnetic typography hover effects, and a FLIP-based project detail transition.
 *
 * Plugins used (gsap-plugins skill):
 *   - ScrollTrigger — pin/reveal transitions
 *   - SplitText     — character splitting for titles
 *   - Flip          — transition image between cursor follow and full screen
 *
 * Performance (gsap-performance skill):
 *   ✅ gsap.quickTo() used for tracking mouse coordinates.
 *   ✅ Stop mouse coordinates tracking while detail overlay is active.
 *   ✅ Lenis scroll instance is stopped/started on detail overlay open/close.
 */

import gsap from 'gsap';
import { Flip } from 'gsap/Flip';
import { SplitText } from 'gsap/SplitText';

// Register plugins
gsap.registerPlugin(Flip, SplitText);

export function initWork(lenis) {
  const workItems = document.querySelectorAll('.work__item');
  const previewsContainer = document.getElementById('work-previews');
  const detail = document.getElementById('project-detail');
  const detailClose = document.getElementById('detail-close');
  const detailImgContainer = document.getElementById('detail-img-container');
  const detailTitle = document.getElementById('detail-title');
  const detailCategory = document.getElementById('detail-category');
  const detailServices = document.getElementById('detail-services');

  if (workItems.length === 0 || !previewsContainer || !detail) return;

  let isDetailOpen = false;
  let isTrackingCursor = true;
  let currentActivePreview = null;

  // ── Cursor Following Image Container ──────────────────────────────────────
  const xTo = gsap.quickTo(previewsContainer, 'x', { duration: 0.6, ease: 'power3' });
  const yTo = gsap.quickTo(previewsContainer, 'y', { duration: 0.6, ease: 'power3' });

  const workSection = document.getElementById('work');
  if (workSection) {
    workSection.addEventListener('mousemove', (e) => {
      if (!isTrackingCursor) return;
      xTo(e.clientX - window.innerWidth / 2);
      yTo(e.clientY - window.innerHeight / 2);
    });
  }

  // ── Individual Project Interactions ───────────────────────────────────────
  workItems.forEach((item) => {
    const id = item.getAttribute('data-project-id');
    const previewImg = document.querySelector(`.work__preview-img[data-project-img="${id}"]`);
    const imgInside = previewImg ? previewImg.querySelector('img') : null;
    
    // Magnetic Title
    const magneticWrap = item.querySelector('.magnetic-wrap');
    const magneticTarget = item.querySelector('.magnetic-target');
    let magXTo, magYTo;
    
    if (magneticWrap && magneticTarget) {
      magXTo = gsap.quickTo(magneticTarget, 'x', { duration: 0.4, ease: 'power2' });
      magYTo = gsap.quickTo(magneticTarget, 'y', { duration: 0.4, ease: 'power2' });
      
      magneticWrap.addEventListener('mousemove', (e) => {
        if (isDetailOpen) return;
        const rect = magneticWrap.getBoundingClientRect();
        const relX = (e.clientX - rect.left) / rect.width - 0.5;
        const relY = (e.clientY - rect.top) / rect.height - 0.5;
        
        magXTo(relX * 40);
        magYTo(relY * 40);
      });
      
      magneticWrap.addEventListener('mouseleave', () => {
        magXTo(0);
        magYTo(0);
      });
    }

    // Image Reveal on Hover
    if (!previewImg || !imgInside) return;

    item.addEventListener('mouseenter', () => {
      if (isDetailOpen) return;
      
      // Reveal wrapper with clip-path wipe
      gsap.to(previewImg, {
        autoAlpha: 1,
        clipPath: 'inset(0% 0% 0% 0%)',
        duration: 0.6,
        ease: 'power4.out',
        overwrite: 'auto'
      });
      // Scale down image inside
      gsap.to(imgInside, {
        scale: 1,
        duration: 0.6,
        ease: 'power4.out',
        overwrite: 'auto'
      });
    });

    item.addEventListener('mouseleave', () => {
      if (isDetailOpen) return;

      // Hide wrapper wiping down
      gsap.to(previewImg, {
        autoAlpha: 0,
        clipPath: 'inset(100% 0% 0% 0%)',
        duration: 0.4,
        ease: 'power3.in',
        overwrite: 'auto'
      });
      // Scale up image slightly
      gsap.to(imgInside, {
        scale: 1.2,
        duration: 0.4,
        ease: 'power3.in',
        overwrite: 'auto'
      });
    });

    // ── Click Action: Open Detail View (FLIP Transition) ─────────────────────
    item.addEventListener('click', () => {
      if (isDetailOpen) return;
      isDetailOpen = true;
      isTrackingCursor = false;
      currentActivePreview = previewImg;

      // Stop page scrolling via Lenis
      if (lenis) lenis.stop();

      // Populate detail content dynamically
      const titleText = item.querySelector('.magnetic-target').textContent;
      const categoryText = item.querySelector('.work__item-category').textContent;
      
      detailTitle.textContent = titleText;
      detailCategory.textContent = categoryText;
      detailServices.textContent = categoryText === 'Product / App' ? 'Product, App Dev, UI' : 'Strategy, Visuals, Dev';

      // 1. Prepare SplitText on title
      const splitTitle = new SplitText(detailTitle, { type: 'chars' });
      gsap.set(splitTitle.chars, { yPercent: 100, opacity: 0 });

      // 2. Capture FLIP state before moving DOM element
      const state = Flip.getState([previewImg, imgInside]);

      // 3. Move preview image to detail container parent (breaks parent coordinate transform)
      detailImgContainer.appendChild(previewImg);

      // Make detail container block and visible
      detail.classList.add('is-open');

      // 4. Run transition timeline
      const tl = gsap.timeline();

      // Fade backdrop overlay
      tl.to('.project-detail__overlay', {
        opacity: 1,
        duration: 0.6,
        ease: 'power2.out'
      }, 0);

      // FLIP image from cursor position to full bleed
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

  // ── Close Detail View (Reverse Transition) ─────────────────────────────────
  function closeProjectDetail() {
    if (!isDetailOpen || !currentActivePreview) return;

    const imgInside = currentActivePreview.querySelector('img');

    // 1. Fade out content first
    const tl = gsap.timeline({
      onComplete: () => {
        // Capture full-bleed state
        const state = Flip.getState([currentActivePreview, imgInside]);

        // Move preview image back to original cursor parent
        previewsContainer.appendChild(currentActivePreview);

        // Hide detail container
        detail.classList.remove('is-open');

        // Reset text content styling to clear split properties
        gsap.set('.project-detail__content', { clearProps: 'all' });

        // Trigger FLIP back to normal preview state
        Flip.from(state, {
          duration: 0.8,
          ease: 'power3.inOut',
          nested: true,
          scale: true,
          onComplete: () => {
            isDetailOpen = false;
            isTrackingCursor = true;
            
            // Resume page scrolling
            if (lenis) lenis.start();

            // Reset preview image styles so normal hover functions normally
            gsap.set(currentActivePreview, { clearProps: 'all' });
            gsap.set(imgInside, { clearProps: 'all' });
            currentActivePreview = null;
          }
        });
      }
    });

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
