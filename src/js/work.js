/**
 * work.js
 *
 * Work/Projects section: Cursor-following preview images with CSS clip-path distortion,
 * and magnetic typography hover effects.
 *
 * Performance (gsap-performance skill):
 *   ✅ gsap.quickTo() used for continuous mouse tracking (magnetic + preview container)
 *   ✅ Images animate transform (scale) and clip-path (compositor friendly in modern browsers)
 *   ✅ Container uses fixed positioning to avoid layout thrashing on move
 */

import gsap from 'gsap';

export function initWork() {
  const workItems = document.querySelectorAll('.work__item');
  const previewsContainer = document.getElementById('work-previews');

  if (workItems.length === 0 || !previewsContainer) return;

  // ── Cursor Following Image Container ──────────────────────────────────────
  // Move the entire fixed wrapper instead of individual images.
  // The container is centered, so we offset by viewport half.
  const xTo = gsap.quickTo(previewsContainer, 'x', { duration: 0.6, ease: 'power3' });
  const yTo = gsap.quickTo(previewsContainer, 'y', { duration: 0.6, ease: 'power3' });

  // Only track mouse when in the work section to save resources
  const workSection = document.getElementById('work');
  if (workSection) {
    workSection.addEventListener('mousemove', (e) => {
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
        const rect = magneticWrap.getBoundingClientRect();
        // Normalized relative position: -0.5 to 0.5
        const relX = (e.clientX - rect.left) / rect.width - 0.5;
        const relY = (e.clientY - rect.top) / rect.height - 0.5;
        
        // Attract target towards cursor (max 40px)
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
      // Reveal wrapper with wipe effect
      gsap.to(previewImg, {
        autoAlpha: 1,
        clipPath: 'inset(0% 0% 0% 0%)',
        duration: 0.6,
        ease: 'power4.out',
        overwrite: 'auto'
      });
      // Scale down image inside for parallax feel
      gsap.to(imgInside, {
        scale: 1,
        duration: 0.6,
        ease: 'power4.out',
        overwrite: 'auto'
      });
    });

    item.addEventListener('mouseleave', () => {
      // Hide wrapper wiping down
      gsap.to(previewImg, {
        autoAlpha: 0,
        clipPath: 'inset(100% 0% 0% 0%)',
        duration: 0.4,
        ease: 'power3.in',
        overwrite: 'auto'
      });
      // Scale up image slightly for next reveal
      gsap.to(imgInside, {
        scale: 1.2,
        duration: 0.4,
        ease: 'power3.in',
        overwrite: 'auto'
      });
    });
  });
}
