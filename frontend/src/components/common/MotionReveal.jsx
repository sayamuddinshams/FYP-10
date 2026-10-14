import React, { useRef, useMemo } from 'react';
import { motion, useInView, useScroll, useTransform } from 'motion/react';
import { cn } from '../../utils/format';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { variants, createTransition } from '../../utils/motion';

// Create motion components for common HTML elements
const motionDiv = motion.div;
const motionSection = motion.section;
const motionArticle = motion.article;
const motionSpan = motion.span;

/**
 * Framer Motion powered reveal component with scroll-linked animations,
 * stagger support, spring physics, and reduced-motion respect.
 * Uses centralized motion design system for consistency.
 */
export default function MotionReveal({
  as: Tag = 'div',
  delay = 0,
  stagger = 0,
  className = '',
  children,
  // Animation variants (use centralized variants or override)
  variant = 'fadeUp',
  initial,
  animate,
  exit,
  transition,
  // Scroll-linked options
  scrollLinked = false,
  scrollOffset = ['0%', '100%'],
  scrollTransform = { opacity: [0, 1], y: [50, 0] },
  // Viewport options
  once = true,
  margin = '0px 0px -10% 0px',
  amount = 0.15,
  // Layout
  layout = false,
  // Children stagger
  staggerChildren = 0,
  ...rest
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once, margin, amount });
  const prefersReducedMotion = useReducedMotion();

  // Scroll-linked animation values
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: scrollOffset,
  });

  const scrollStyles = useMemo(() => {
    if (!scrollLinked) return {};
    return {
      opacity: useTransform(scrollYProgress, [0, 1], [scrollTransform.opacity?.[0] ?? 0, scrollTransform.opacity?.[1] ?? 1]),
      y: useTransform(scrollYProgress, [0, 1], [scrollTransform.y?.[0] ?? 50, scrollTransform.y?.[1] ?? 0]),
    };
  }, [scrollLinked, scrollYProgress, scrollTransform]);

  // Select variant from centralized system or use custom
  const selectedVariant = useMemo(() => {
    if (initial !== undefined || animate !== undefined) {
      return { initial, animate, exit };
    }
    return variants[variant] || variants.fadeUp;
  }, [variant, initial, animate, exit]);

  // Apply reduced motion
  const finalVariants = useMemo(() => {
    if (!prefersReducedMotion) return selectedVariant;
    return {
      initial: selectedVariant.animate,
      animate: selectedVariant.animate,
      exit: selectedVariant.animate,
      transition: { duration: 0.01 },
    };
  }, [selectedVariant, prefersReducedMotion]);

  const baseTransition = useMemo(() => {
    const defaultTransition = selectedVariant.transition || { duration: 0.6, ease: [0.22, 1, 0.36, 1] };
    return createTransition(defaultTransition, delay + stagger);
  }, [selectedVariant.transition, delay, stagger]);

  // Select the appropriate motion component
  const MotionComponent = Tag === 'section' ? motionSection : Tag === 'article' ? motionArticle : Tag === 'span' ? motionSpan : motionDiv;

  return (
    <MotionComponent
      ref={ref}
      className={cn(className)}
      initial={finalVariants.initial}
      animate={isInView ? finalVariants.animate : finalVariants.initial}
      exit={finalVariants.exit}
      transition={transition ? createTransition(transition, delay + stagger) : baseTransition}
      style={scrollStyles}
      layout={layout}
      {...rest}
    >
      {staggerChildren > 0 && React.Children.count(children) > 1 ? (
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            visible: {
              transition: {
                staggerChildren: staggerChildren / 1000,
                delayChildren: delay / 1000,
              },
            },
          }}
        >
          {React.Children.map(children, (child, index) =>
            React.isValidElement(child) ? React.cloneElement(child, { custom: index }) : child
          )}
        </motion.div>
      ) : (
        children
      )}
    </MotionComponent>
  );
}