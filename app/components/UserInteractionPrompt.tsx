import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from '../styles/UserInteractionPrompt.module.css';

interface UserInteractionPromptProps {
  isVisible: boolean;
}

const UserInteractionPrompt: React.FC<UserInteractionPromptProps> = ({ isVisible }) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: {
        duration: 0.5,
      }
    },
    exit: { opacity: 0, transition: { duration: 0.3 } }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div 
          className={styles.promptContainer}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          <div className={styles.promptText}>
            Enhance your experience
            <br />
            Click anywhere
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default UserInteractionPrompt;