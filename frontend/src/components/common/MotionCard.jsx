import { motion } from 'motion/react';
import { cn } from '../../utils/format';
import { useReducedMotion } from '../../hooks/useReducedMotion';

const motionArticle = motion.article;
const motionDiv = motion.div;
const motionSection = motion.section;

/**
 * Motion-enhanced card component with:
 * - Spring-based hover/tap animations
 * - Scroll-linked reveal (optional)
 * - Stagger support for lists
 * - Reduced motion support
 */
export default function MotionCard({
  as: Tag = 'article',
  className = '',
  children,
  // Hover/tap animations
  whileHover = { y: -6, scale: 1.01, boxShadow: '0 20px 40px -12px rgba(16, 25, 43, 0.18)' },
  whileTap = { scale: 0.99 },
  // Reveal animation
  reveal = false,
  revealDelay = 0,
  // Layout
  layout = false,
  ...rest
}) {
  const reducedMotion = useReducedMotion();

  const motionProps = reducedMotion
    ? {}
    : {
        whileHover,
        whileTap,
        layout,
      };

  const baseClassName = cn(
    'relative flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-white shadow-soft',
    className
  );

  // Select the appropriate motion component
  const MotionComponent = Tag === 'article' ? motionArticle : Tag === 'section' ? motionSection : motionDiv;

  if (reveal) {
    return (
      <MotionComponent
        className={baseClassName}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          type: 'spring',
          damping: 25,
          stiffness: 300,
          delay: revealDelay,
        }}
        {...motionProps}
        {...rest}
      >
        {children}
      </MotionComponent>
    );
  }

  return (
    <MotionComponent
      className={baseClassName}
      {...motionProps}
      {...rest}
    >
      {children}
    </MotionComponent>
  );
}

// Staggered container for lists of cards
export function MotionCardGrid({
  children,
  className = '',
  staggerDelay = 0.08,
  ...rest
}) {
  return (
    <motion.div
      className={cn('grid gap-6', className)}
      initial="hidden"
      animate="show"
      variants={{
        hidden: { opacity: 0 },
        show: {
          transition: {
            staggerChildren: staggerDelay,
          },
        },
      }}
      {...rest}
    >
      {React.Children.map(children, (child, index) =>
        React.isValidElement(child) ? React.cloneElement(child, { custom: index }) : child
      )}
    </motion.div>
  );
}