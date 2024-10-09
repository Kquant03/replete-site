// app/tos/page.tsx
'use client';

import { motion } from 'framer-motion';
import styles from './Tos.module.css';

const fadeInVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

const staggerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.2 } },
};

export default function TermsOfService() {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={staggerVariants}
      className={styles.tosContainer}
    >
      <motion.h1 variants={fadeInVariants} className={styles.heading}>
        Terms of Service
      </motion.h1>
      <motion.section variants={fadeInVariants} className={styles.section}>
        <h2 className={styles.sectionTitle}>1. Introduction</h2>
        <p className={styles.sectionText}>
          Welcome to Replete AI. By accessing or using our website, you agree to be bound by these Terms of Service and our Privacy Policy. If you disagree with any part of these terms, please do not use our website.
        </p>
      </motion.section>
      {/* Add more sections for the terms of service */}
    </motion.div>
  );
}