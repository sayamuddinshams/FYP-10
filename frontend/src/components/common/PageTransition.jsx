import { AnimatePresence, motion } from 'motion/react';
import { useLocation } from 'react-router-dom';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { variants } from '../../utils/motion';

/**
 * Wrapper for route-level page transitions.
 * Place at the root of your routes (inside BrowserRouter).
 */
export default function PageTransition({ children }) {
  const location = useLocation();
  const prefersReducedMotion = useReducedMotion();

  const pageVariants = prefersReducedMotion
    ? {
        initial: variants.page.animate,
        animate: variants.page.animate,
        exit: variants.page.animate,
        transition: { duration: 0.01 },
      }
    : variants.page;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial="initial"
        animate="animate"
        exit="exit"
        variants={pageVariants}
        className="w-full"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}