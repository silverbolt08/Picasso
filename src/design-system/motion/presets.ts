// ─── Motion Presets (V2 — Theme DNA) ─────────────────────────────────────────
// Dynamic motion factories that read from ThemeMotion DNA.
// Components call these factories with the current theme's motion tokens.
// Static exports preserved for backward compat but deprecated.
// ─────────────────────────────────────────────────────────────────────────────

import type { Variants, Transition } from 'framer-motion';
import type { ThemeMotion } from '../../theme/themeTypes';

// ─── Dynamic Factories ───────────────────────────────────────────────────────

/**
 * Build a reflow spring transition from ThemeMotion DNA.
 */
export function buildReflowSpring(motion: ThemeMotion): Transition {
  return {
    type: 'spring' as const,
    stiffness: motion.springStiffness ?? 220,
    damping: motion.springDamping ?? 28,
    mass: 1,
  };
}

/**
 * Build card entrance variants for a given placement tier.
 * Reads spring config, entrance style, and stagger from Theme DNA.
 */
export function buildCardVariants(
  motion: ThemeMotion,
  tier: 'hero' | 'primary' | 'supporting' | 'secondary'
): Variants {
  const entrance = motion.sectionEntrance ?? 'slide';
  const stiffness = motion.springStiffness ?? 180;
  const damping = motion.springDamping ?? 24;

  // No animation
  if (entrance === 'none' || (motion.transitionSpeed === '0ms')) {
    return {
      initial: {},
      animate: {},
    };
  }

  // Y offset and scale by tier
  const tierConfig = {
    hero:       { y: 32, scale: 0.96, stiffnessAdj: -20, dampingAdj: -2, mass: 0.9 },
    primary:    { y: 24, scale: 0.97, stiffnessAdj: 0,   dampingAdj: 0,  mass: 1 },
    supporting: { y: 12, scale: 0.98, stiffnessAdj: 20,  dampingAdj: 2,  mass: 1 },
    secondary:  { y: 16, scale: 0.98, stiffnessAdj: 20,  dampingAdj: 2,  mass: 1 },
  };

  const tc = tierConfig[tier];

  // Build initial state based on entrance type
  let initial: Record<string, number> = {};
  switch (entrance) {
    case 'fade':
      initial = { opacity: 0 };
      break;
    case 'slide':
      initial = { opacity: 0, y: tc.y };
      break;
    case 'scale':
      initial = { opacity: 0, scale: tc.scale, y: tc.y * 0.5 };
      break;
    case 'stagger':
      initial = { opacity: 0, scale: tc.scale, y: tc.y };
      break;
    default:
      initial = { opacity: 0, y: tc.y };
  }

  return {
    initial,
    animate: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: stiffness + tc.stiffnessAdj,
        damping: damping + tc.dampingAdj,
        mass: tc.mass,
      },
    },
  };
}

/**
 * Build stagger container variants from Theme DNA.
 */
export function buildStaggerContainer(motion: ThemeMotion): Variants {
  const delay = (motion.staggerDelay ?? 80) / 1000;
  return {
    initial: {},
    animate: {
      transition: {
        staggerChildren: delay,
      },
    },
  };
}

// ─── Static Fallback Exports (Backward Compat) ──────────────────────────────
// These use hardcoded values matching the default dark theme.
// Prefer buildCardVariants(theme.motion, tier) in new code.

export const reflowSpring: Transition = {
  type: 'spring' as const,
  stiffness: 220,
  damping: 28,
  mass: 1,
};

export const fadeReveal = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -16 },
  transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] as const },
};

export const hoverLift = {
  whileHover: {
    y: -6,
    transition: {
      duration: 0.3,
      ease: [0.16, 1, 0.3, 1] as const,
    },
  },
};

export const staggerReveal = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.12,
    },
  },
};

export const dashboardReflow = {
  layout: true,
  transition: reflowSpring,
};

export const glowPulse = {
  animate: {
    opacity: [0.3, 0.6, 0.3],
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

export const ambientBreath = {
  animate: {
    scale: [1, 1.06, 0.96, 1],
    rotate: [0, 90, 180, 270, 360],
    opacity: [0.18, 0.28, 0.18],
    transition: {
      duration: 40,
      repeat: Infinity,
      ease: 'linear' as const,
    },
  },
};

export const sectionEntrance = {
  initial: { opacity: 0, scale: 0.97, y: 24 },
  animate: { opacity: 1, scale: 1, y: 0 },
  transition: {
    duration: 0.5,
    ease: [0.16, 1, 0.3, 1] as const,
  },
};

// Legacy static variants — kept for any residual imports
export const heroCardVariants: Variants = {
  initial: { opacity: 0, scale: 0.96, y: 32 },
  animate: {
    opacity: 1, scale: 1, y: 0,
    transition: { type: 'spring', stiffness: 160, damping: 22, mass: 0.9 },
  },
};

export const primaryCardVariants: Variants = {
  initial: { opacity: 0, scale: 0.97, y: 24 },
  animate: {
    opacity: 1, scale: 1, y: 0,
    transition: { type: 'spring', stiffness: 180, damping: 24 },
  },
};

export const secondaryCardVariants: Variants = {
  initial: { opacity: 0, scale: 0.98, y: 16 },
  animate: {
    opacity: 1, scale: 1, y: 0,
    transition: { type: 'spring', stiffness: 200, damping: 26 },
  },
};

export const supportingCardVariants: Variants = {
  initial: { opacity: 0, scale: 0.98, y: 12 },
  animate: {
    opacity: 1, scale: 1, y: 0,
    transition: { type: 'spring', stiffness: 220, damping: 28 },
  },
};
