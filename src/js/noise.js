/**
 * noise.js
 *
 * Animates the #noise overlay element with a slow, organic positional drift
 * using GSAP transforms (translate X / Y) — NOT background-position.
 *
 * Why transforms, not background-position?
 *   Per gsap-performance skill: only transform + opacity are compositor-only.
 *   Animating background-position triggers repaint every frame → jank.
 *   Instead we oversize the element (110vw × 110vh) and drift its position
 *   within those bleed margins — zero paint, 60fps on any device.
 *
 * Why gsap.matchMedia() with prefers-reduced-motion?
 *   Per gsap-core skill: use matchMedia so animations created inside are
 *   automatically reverted when the media query stops matching. Users who
 *   prefer reduced motion get a static noise layer — no movement at all.
 *
 * Skill references:
 *   - gsap-core   › gsap.matchMedia(), gsap.to(), ease
 *   - gsap-performance › prefer transforms, will-change
 */

import gsap from 'gsap';

export function initNoise() {
  const el = document.getElementById('noise');
  if (!el) return;

  // ── gsap.matchMedia — dual-condition handler ──────────────────────────────
  // Conditions object syntax: handler receives context.conditions booleans.
  // When reduceMotion matches, all animations created inside are auto-reverted
  // and only the static layer remains.
  const mm = gsap.matchMedia();

  mm.add(
    {
      motion:      '(prefers-reduced-motion: no-preference)',
      reduceMotion: '(prefers-reduced-motion: reduce)',
    },
    (context) => {
      const { motion } = context.conditions;

      if (!motion) {
        // User prefers reduced motion — keep static, no animation
        return;
      }

      // ── Slow drift animation ────────────────────────────────────────────
      // Two overlapping yoyo loops on X and Y with slightly different
      // durations → Lissajous-like organic drift that never repeats exactly.
      //
      // Values stay within ±3% — well inside the 5% bleed zone of the
      // CSS inset: -5%, so edges are never visible.
      //
      // ease: "sine.inOut" — smooth, continuous — no snapping at reversal.
      // yoyo: true + repeat: -1 — infinite back-and-forth with no jumps.

      gsap.to(el, {
        x: '2%',
        duration: 8,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
      });

      gsap.to(el, {
        y: '3%',
        duration: 11,          // different period → non-repeating pattern
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
      });

      // Optional cleanup when matchMedia reverts (tab hidden, media changes)
      return () => {
        gsap.set(el, { x: 0, y: 0 }); // snap back to origin cleanly
      };
    }
  );

  return mm; // expose so caller can mm.revert() if needed
}
