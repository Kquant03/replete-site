'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { ChevronRight } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useMediaQuery } from '../hooks/useMediaQuery';
import styles from './PatternsOfSentience.module.css';

// Dynamically import components without loading states
const CustomPDFViewer = dynamic(
  () => import('./CustomPDFViewer').then(mod => mod.default),
  { ssr: false }
);

const MobilePreview = dynamic(
  () => import('./MobilePreview').then(mod => mod.default),
  { ssr: false }
);

export const BookLandingPage = () => {
  const [showPreview, setShowPreview] = useState(false);
  const isMobile = useMediaQuery('(max-width: 640px)');

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.6, staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const previewVariants = {
    hidden: {
      opacity: 0,
      scale: 0.95,
    },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30
      }
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      transition: {
        duration: 0.2
      }
    }
  };

  return (
    <div className={styles.container}>
      <AnimatePresence mode="wait">
        {!showPreview ? (
          <motion.div
            className={styles.contentWrapper}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Book Cover Section */}
            <motion.div 
              className={styles.bookCoverSection}
              variants={itemVariants}
            >
              <div className={styles.bookCoverWrapper}>
                <div className={styles.bookCoverGlow} />
                <Image
                  src="/images/patterns-of-sentience.webp"
                  alt="Patterns of Sentience Book Cover"
                  fill
                  className={styles.bookCover}
                  priority
                />
              </div>
            </motion.div>

            {/* Book Details Section */}
            <motion.div 
              className={styles.bookDetails}
              variants={itemVariants}
            >
              <motion.h1 
                className={styles.title}
                variants={itemVariants}
              >
                Patterns of Sentience
              </motion.h1>

              <motion.p 
                className={styles.subtitle}
                variants={itemVariants}
              >
                A groundbreaking exploration of artificial intelligence and its implications for humanity
              </motion.p>

              <motion.div 
                className={styles.description}
                variants={itemVariants}
              >
                <p>
                  &quot;Patterns of Sentience&quot; delves into the fascinating world of artificial intelligence 
                  and its profound impact on our society. Written by the Stanley Sebastian and S.L Jackson, this book 
                  offers a unique perspective on the development and future of AI, exploring the intricate 
                  patterns that emerge as we create increasingly sophisticated artificial minds.
                </p>
              </motion.div>

              <motion.div 
                className={styles.metadata}
                variants={itemVariants}
              >
                <p><span className={styles.label}>Author:</span> S.L. Jackson & Stanley Sebastian</p>
                <p><span className={styles.label}>Published:</span> COMING SOON!</p>
                <p><span className={styles.label}>Format:</span> e-Book</p>
                <p><span className={styles.label}>Pages:</span> ~150</p>
                <p><span className={styles.label}>Price:</span> $14.99</p>
              </motion.div>

              <motion.div 
                className={styles.actions}
                variants={itemVariants}
              >
                <button
                  onClick={() => setShowPreview(true)}
                  className={styles.previewButton}
                >
                  Preview <ChevronRight className={styles.icon} />
                </button>
                
                <a
                  href="https://store.replete.ai/patterns-of-sentience"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.purchaseButton}
                >
                  COMING SOON!
                </a>
              </motion.div>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            className={styles.previewOverlay}
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={previewVariants}
          >
            {isMobile ? (
              <MobilePreview onClose={() => setShowPreview(false)} />
            ) : (
              <CustomPDFViewer onClose={() => setShowPreview(false)} />
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Ambient background effect */}
      <div className={styles.ambientGlow} aria-hidden="true" />
    </div>
  );
};
