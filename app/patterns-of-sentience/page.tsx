// app/patterns-of-sentience/page.tsx
'use client';

import { motion } from 'framer-motion';
import styles from './PatternsOfSentience.module.css';
import Image from 'next/image';
import Link from 'next/link';
import { IoMdCart } from 'react-icons/io';

const fadeIn = {
  initial: { opacity: 0, y: 50 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.8, ease: 'easeOut' } },
};

const slideIn = {
  initial: { opacity: 0, x: -50 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.8, ease: 'easeOut', delay: 0.2 } },
};

const bookVariants = {
  initial: { opacity: 0, scale: 0.8 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.8,
      ease: 'easeOut',
      delay: 0.4,
    },
  },
  hover: {
    scale: 1.03,
    boxShadow: '0 15px 30px rgba(0, 0, 0, 0.3)',
    transition: {
      duration: 0.4,
      ease: 'easeOut',
    },
  },
};

export default function PatternsOfSentience() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className={styles.bookContainer}
    >
      <div className={styles.bookBackground}>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
          className={styles.backgroundGradient}
        />
        <motion.div
          initial={{ opacity: 0, rotate: 45 }}
          animate={{ opacity: 0.1, rotate: 0 }}
          transition={{ duration: 1.2, ease: 'easeOut', delay: 0.4 }}
          className={styles.backgroundLines}
        />
      </div>
      <div className={styles.bookContent}>
        <motion.div variants={fadeIn} className={styles.bookDetails}>
          <motion.h1 variants={fadeIn} className={styles.heading}>
            <motion.span
              initial={{ opacity: 0, y: -30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut', delay: 0.6 }}
            >
              Patterns
            </motion.span>
            <motion.span
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut', delay: 0.8 }}
            >
              of
            </motion.span>
            <motion.span
              initial={{ opacity: 0, y: -30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut', delay: 1 }}
            >
              Sentience
            </motion.span>
          </motion.h1>
          <motion.p variants={fadeIn} className={styles.subheading}>
            A groundbreaking exploration of artificial intelligence and its implications for humanity
          </motion.p>
          <motion.p variants={fadeIn} className={styles.bookDescription}>
          &quot;Patterns of Sentience&quot; is a captivating book that delves into the fascinating world of artificial intelligence and its profound impact on our society. Written by the brilliant minds of the Replete AI community, this book offers a unique perspective on the development and future of AI.
          </motion.p>
          <motion.div variants={fadeIn} className={styles.bookMeta}>
            <motion.p variants={fadeIn}><strong>Author:</strong> Replete AI Community</motion.p>
            <motion.p variants={fadeIn}><strong>Published:</strong> 2023</motion.p>
            <motion.p variants={fadeIn}><strong>Format:</strong> e-Book</motion.p>
          </motion.div>
          <motion.div variants={fadeIn} className={styles.bookActions}>
            <Link href="/book-preview" className={styles.previewButton}>
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, ease: 'easeOut', delay: 1.2 }}
              >
                Free Preview
              </motion.span>
            </Link>
            <Link href="/book-purchase" className={styles.purchaseButton}>
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, ease: 'easeOut', delay: 1.4 }}
              >
                <IoMdCart size={24} />
                Buy e-Book
              </motion.span>
            </Link>
          </motion.div>
        </motion.div>
        <motion.div variants={slideIn} className={styles.bookImageWrapper}>
          <motion.div
            variants={bookVariants}
            initial="initial"
            animate="animate"
            whileHover="hover"
            className={styles.bookImage}
          >
            <Image src="/images/patterns-of-sentience.webp" alt="Patterns of Sentience Book Cover" fill />
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
}