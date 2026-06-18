/**
 * cursor.js
 *
 * Custom cursor: 8px dot (snaps, always white) + 40px ring (lags, mix-blend-mode: difference).
 *
 * Why two separate elements (not one wrapper)?
 *   mix-blend-mode: difference on a wrapper affects ALL children including the dot.
 *   On a near-black background: white - black ≈ white → invisible dot.
 *   Solution: ring has the blend mode, dot does not — dot is always visibly white.
 *
 * gsap.quickTo() — per gsap-performance skill:
 *   "Use quickTo() for frequently updated properties (e.g. mouse-follower x/y).
 *    It reuses a single tween instead of creating new tweens on each update."
 *   dot: duration 0  → immediate snap to pointer
 *   ring: duration 0.5, power3.out → weighted, organic lag
 *
 * Skill reference: gsap-performance › gsap.quickTo()
 */

import gsap from 'gsap';

export function initCursor() {
  const dot  = document.getElementById('cursor-dot');
  const ring = document.getElementById('cursor-ring');
  if (!dot || !ring) return;

  // ── Reduced motion check ──────────────────────────────────────────────────
  const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (isReduced) {
    dot.style.display = 'none';
    ring.style.display = 'none';
    document.documentElement.style.cursor = 'auto';
    return;
  }

  // ── Touch / coarse-pointer guard ─────────────────────────────────────────
  const isTouch =
    window.matchMedia('(hover: none)').matches ||
    window.matchMedia('(pointer: coarse)').matches;
  if (isTouch) return;

  // ── quickTo — one reusable function per property ─────────────────────────
  const ringX = gsap.quickTo(ring, 'x', { duration: 0.5, ease: 'power3.out' });
  const ringY = gsap.quickTo(ring, 'y', { duration: 0.5, ease: 'power3.out' });

  // ── mousemove — update quickTo targets ───────────────────────────────────
  window.addEventListener('mousemove', (e) => {
    gsap.set(dot, { x: e.clientX, y: e.clientY });
    ringX(e.clientX);
    ringY(e.clientY);
  });

  // ── Fade in on first move ─────────────────────────────────────────────────
  window.addEventListener('mousemove', fadeIn, { once: true });
  function fadeIn() {
    gsap.to([dot, ring], { autoAlpha: 1, duration: 0.4, ease: 'power2.out', stagger: 0.05 });
  }

  // ── Hover states via event delegation ────────────────────────────────────
  const INTERACTIVE = 'a, button, [data-cursor-hover], input, label, select, p, h1, h2, h3, h4, h5, h6, li, span';
  const labelEl = document.getElementById('cursor-label');

  document.addEventListener('mouseover', (e) => {
    const labelTarget = e.target.closest('[data-cursor-label]');
    const interactiveTarget = e.target.closest(INTERACTIVE);

    if (labelTarget) {
      const labelText = labelTarget.getAttribute('data-cursor-label');
      if (labelEl) {
        labelEl.textContent = labelText;
        gsap.to(labelEl, { opacity: 1, duration: 0.2, overwrite: 'auto' });
      }
      gsap.to(ring, { 
        backgroundColor: '#ffffff', 
        borderColor: 'transparent', 
        scale: 2.2, 
        opacity: 1, 
        duration: 0.35, 
        ease: 'power2.out', 
        overwrite: 'auto' 
      });
      gsap.to(dot,  { scale: 0,               duration: 0.2,  ease: 'power2.in',  overwrite: 'auto' });
    } else if (interactiveTarget) {
      if (labelEl) {
        gsap.to(labelEl, { opacity: 0, duration: 0.1, overwrite: 'auto' });
      }
      gsap.to(ring, { 
        backgroundColor: '#ffffff', 
        borderColor: 'transparent', 
        scale: 1, 
        opacity: 1, 
        duration: 0.35, 
        ease: 'power2.out', 
        overwrite: 'auto' 
      });
      gsap.to(dot,  { scale: 0,               duration: 0.2,  ease: 'power2.in',  overwrite: 'auto' });
    }
  });

  document.addEventListener('mouseout', (e) => {
    // Check if the element we are moving into is also interactive
    const toLabel = e.relatedTarget ? e.relatedTarget.closest('[data-cursor-label]') : null;
    const toInteractive = e.relatedTarget ? e.relatedTarget.closest(INTERACTIVE) : null;

    // Only reset the cursor to normal if we are moving completely out of interactive elements
    if (!toLabel && !toInteractive) {
      if (labelEl) {
        gsap.to(labelEl, { opacity: 0, duration: 0.2, overwrite: 'auto' });
      }
      gsap.to(ring, { 
        backgroundColor: 'transparent', 
        borderColor: '#ffffff', 
        scale: 1, 
        opacity: 1, 
        duration: 0.4, 
        ease: 'power3.out', 
        overwrite: 'auto' 
      });
      gsap.to(dot,  { scale: 1,             duration: 0.3, ease: 'back.out(2)', overwrite: 'auto' });
    }
  });

  // ── Click micro-interaction ───────────────────────────────────────────────
  document.addEventListener('mousedown', () => {
    gsap.to(ring, { scale: 0.75, duration: 0.1, ease: 'power3.in',  overwrite: 'auto' });
    gsap.to(dot,  { scale: 1.8,  duration: 0.1, ease: 'power3.in',  overwrite: 'auto' });
  });
  document.addEventListener('mouseup', (e) => {
    const labelTarget = e.target.closest('[data-cursor-label]');
    const interactiveTarget = e.target.closest(INTERACTIVE);
    
    if (labelTarget) {
      gsap.to(ring, { 
        backgroundColor: '#ffffff', 
        borderColor: 'transparent', 
        scale: 2.2, 
        duration: 0.4, 
        ease: 'power3.out', 
        overwrite: 'auto' 
      });
      gsap.to(dot,  { scale: 0, duration: 0.3, ease: 'power2.in', overwrite: 'auto' });
    } else if (interactiveTarget) {
      gsap.to(ring, { 
        backgroundColor: '#ffffff', 
        borderColor: 'transparent', 
        scale: 1, 
        duration: 0.4, 
        ease: 'power3.out', 
        overwrite: 'auto' 
      });
      gsap.to(dot,  { scale: 0, duration: 0.3, ease: 'power2.in', overwrite: 'auto' });
    } else {
      gsap.to(ring, { 
        backgroundColor: 'transparent', 
        borderColor: '#ffffff', 
        scale: 1, 
        duration: 0.5, 
        ease: 'elastic.out(1, 0.4)', 
        overwrite: 'auto' 
      });
      gsap.to(dot,  { scale: 1, duration: 0.3, ease: 'back.out(2)',          overwrite: 'auto' });
    }
  });
}
