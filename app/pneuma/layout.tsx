'use client';

import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import 'katex/dist/katex.min.css';
import styles from './pneumaLayout.module.css';

const pageVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

const pageTransition = {
  type: 'tween',
  ease: 'anticipate',
  duration: 0.5
};

export default function PneumaLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname();
  const layoutRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scrollToTop = () => {
      window.scrollTo(0, 0);
      if (document.body) document.body.scrollTop = 0;
      if (document.documentElement) document.documentElement.scrollTop = 0;
    };

    // Scroll to top immediately
    scrollToTop();

    // Scroll to top after a short delay (to catch any delayed content loads)
    const timeoutId = setTimeout(scrollToTop, 100);

    const handleBeforeUnload = () => {
      scrollToTop();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    // Cleanup function
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      clearTimeout(timeoutId);
    };
  }, [pathname]);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        ref={layoutRef}
        key={pathname}
        initial="initial"
        animate="animate"
        exit="exit"
        variants={pageVariants}
        transition={pageTransition}
        className={styles.pneumaLayout}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}