import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface FadeInWrapperProps {
  children: React.ReactNode;
  isVisible: boolean;
}

const FadeInWrapper: React.FC<FadeInWrapperProps> = ({ children, isVisible }) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FadeInWrapper;