/**
 * Centralized motion design system for RentLink.
 * Provides consistent animation durations, easings, and variants across the application.
 * All animations respect `prefers-reduced-motion`.
 */

// ============================================================================
// Core Animation Tokens
// ============================================================================

export const motionTokens = {
  // Durations (ms) - consistent scale
  duration: {
    instant: 100,
    fast: 150,
    normal: 250,
    slow: 350,
    slower: 500,
    entrance: 600,
    page: 400,
  },

  // Easing curves - using CSS cubic-bezier values
  ease: {
    // Standard easing for most UI animations
    standard: [0.22, 1, 0.36, 1],
    // Snappy easing for micro-interactions (buttons, toggles)
    snappy: [0.34, 1.56, 0.64, 1],
    // Smooth easing for entrances/exits
    smooth: [0.25, 0.46, 0.45, 0.94],
    // Gentle spring-like easing
    gentle: [0.16, 1, 0.3, 1],
    // Linear for continuous animations (spinners, progress)
    linear: 'linear',
    // Ease out for exits
    easeOut: [0, 0.55, 0.45, 1],
    // Ease in for entrances
    easeIn: [0.55, 0, 1, 0.45],
  },

  // Spring configurations for Framer Motion
  spring: {
    gentle: { type: 'spring', damping: 25, stiffness: 300 },
    snappy: { type: 'spring', damping: 20, stiffness: 400 },
    bouncy: { type: 'spring', damping: 15, stiffness: 500 },
    stiff: { type: 'spring', damping: 30, stiffness: 600 },
  },

  // Stagger delays for lists
  stagger: {
    item: 50,
    itemFast: 30,
    itemSlow: 80,
    section: 120,
  },
};

// ============================================================================
// Reusable Animation Variants
// ============================================================================

export const variants = {
  // Page-level transitions
  page: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: motionTokens.duration.page / 1000, ease: motionTokens.ease.standard },
  },

  // Fade up entrance (for sections, cards, headings)
  fadeUp: {
    initial: { opacity: 0, y: 24 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -16 },
    transition: { duration: motionTokens.duration.entrance / 1000, ease: motionTokens.ease.standard },
  },

  // Fade in (for overlays, modals, tooltips)
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: motionTokens.duration.normal / 1000, ease: motionTokens.ease.easeOut },
  },

  // Scale + fade (for popovers, dropdowns, small modals)
  pop: {
    initial: { opacity: 0, scale: 0.92 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.92 },
    transition: { duration: motionTokens.duration.normal / 1000, ease: motionTokens.ease.snappy },
  },

  // Slide from right (for drawers, sidebars)
  slideRight: {
    initial: { opacity: 0, x: 40 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 40 },
    transition: { duration: motionTokens.duration.slow / 1000, ease: motionTokens.ease.standard },
  },

  // Slide from left (for mobile drawers)
  slideLeft: {
    initial: { opacity: 0, x: -40 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -40 },
    transition: { duration: motionTokens.duration.slow / 1000, ease: motionTokens.ease.standard },
  },

  // Slide up (for bottom sheets)
  slideUp: {
    initial: { opacity: 0, y: 40 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 40 },
    transition: { duration: motionTokens.duration.slow / 1000, ease: motionTokens.ease.standard },
  },

  // Slide down (for dropdowns, notifications)
  slideDown: {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: motionTokens.duration.fast / 1000, ease: motionTokens.ease.standard },
  },

  // Scale for buttons, cards on hover/tap
  tap: { scale: 0.97 },
  hover: { scale: 1.02 },
  hoverLift: { y: -4, boxShadow: '0 12px 32px -8px rgba(16, 25, 43, 0.18)' },

  // Heart/favorite pop
  heartPop: {
    initial: { scale: 1 },
    animate: { scale: [1, 1.35, 1] },
    transition: { duration: 0.4, ease: motionTokens.ease.snappy },
  },

  // Staggered children
  staggerContainer: {
    animate: {
      transition: {
        staggerChildren: motionTokens.stagger.item / 1000,
        delayChildren: motionTokens.duration.fast / 1000,
      },
    },
  },

  // List item
  staggerItem: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: motionTokens.duration.normal / 1000, ease: motionTokens.ease.standard },
  },

  // Chart drawing
  chartLine: {
    initial: { pathLength: 0 },
    animate: { pathLength: 1, transition: { duration: 1.2, ease: motionTokens.ease.standard } },
  },

  chartBar: {
    initial: { scaleY: 0, originY: 1 },
    animate: { scaleY: 1, transition: { duration: 0.6, ease: motionTokens.ease.standard } },
  },

  // Counter animation
  counter: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
  },

  // Shimmer for loading states
  shimmer: {
    animate: {
      backgroundPosition: ['-200%', '200%'],
      transition: { duration: 1.6, ease: motionTokens.ease.linear, repeat: Infinity },
    },
  },

  // Pulse for live indicators
  pulse: {
    animate: {
      opacity: [0.5, 1, 0.5],
      transition: { duration: 2, ease: motionTokens.ease.linear, repeat: Infinity },
    },
  },

  // Floating animation for decorative elements
  float: {
    animate: {
      y: [0, -12, 0],
      transition: { duration: 7, ease: motionTokens.ease.linear, repeat: Infinity },
    },
  },

  // Ken burns for hero images
  kenBurns: {
    animate: {
      scale: [1, 1.08],
      x: ['0%', '-1.5%'],
      y: ['0%', '-1%'],
      transition: { duration: 26, ease: motionTokens.ease.linear, repeat: Infinity, repeatType: 'reverse' },
    },
  },
};

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Creates a delayed variant for staggered entrances.
 * @param {number} index - Item index
 * @param {number} baseDelay - Base delay in ms
 * @param {number} step - Delay step in ms
 */
export function createStaggerDelay(index, baseDelay = 0, step = motionTokens.stagger.item) {
  return baseDelay + index * step;
}

/**
 * Creates transition config with optional delay.
 */
export function createTransition(baseTransition = {}, delay = 0) {
  return {
    ...baseTransition,
    delay: delay / 1000,
  };
}

/**
 * Returns reduced-motion safe variants.
 * When reduced motion is preferred, animations complete instantly.
 */
export function getReducedMotionVariants(fullVariants, prefersReducedMotion) {
  if (!prefersReducedMotion) return fullVariants;

  return {
    initial: fullVariants.animate || fullVariants.initial,
    animate: fullVariants.animate || fullVariants.initial,
    exit: fullVariants.animate || fullVariants.initial,
    transition: { duration: 0.01 },
  };
}

/**
 * Spring config for consistent feel across components.
 */
export const defaultSpring = motionTokens.spring.gentle;

/**
 * Quick spring for micro-interactions.
 */
export const quickSpring = motionTokens.spring.snappy;