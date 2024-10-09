// app/about/page.tsx
'use client';

import { motion } from 'framer-motion';
import styles from './About.module.css';
import Image from 'next/image';
import Link from 'next/link';
import { FiArrowRight } from 'react-icons/fi';

const fadeInVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

const staggerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.2 } },
};

export default function About() {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={staggerVariants}
      className={styles.aboutContainer}
    >
      <motion.section variants={fadeInVariants} className={styles.hero}>
        <div className={styles.heroContent}>
          <motion.h1 variants={fadeInVariants} className={styles.heading}>
            About Replete AI
          </motion.h1>
          <motion.p variants={fadeInVariants} className={styles.subheading}>
            Pioneering the Future of Artificial Intelligence
          </motion.p>
        </div>
      </motion.section>

      <motion.section variants={fadeInVariants} className={styles.mission}>
        <motion.div variants={fadeInVariants} className={styles.missionContent}>
          <motion.h2 variants={fadeInVariants} className={styles.sectionTitle}>
            Our Mission
          </motion.h2>
          <motion.p variants={fadeInVariants} className={styles.sectionText}>
            At Replete AI, our mission is to push the boundaries of artificial intelligence and create technologies that revolutionize industries and improve lives. We are dedicated to advancing the field of AI through cutting-edge research, innovative solutions, and collaborative efforts with leading experts worldwide.
          </motion.p>
        </motion.div>
        <motion.div variants={fadeInVariants} className={styles.missionImage}>
          <Image src="/images/mission.webp" alt="Our Mission" width={500} height={400} />
        </motion.div>
      </motion.section>

      <motion.section variants={fadeInVariants} className={styles.vision}>
        <motion.div variants={fadeInVariants} className={styles.visionImage}>
          <Image src="/images/vision.webp" alt="Our Vision" width={500} height={400} />
        </motion.div>
        <motion.div variants={fadeInVariants} className={styles.visionContent}>
          <motion.h2 variants={fadeInVariants} className={styles.sectionTitle}>
            Our Vision
          </motion.h2>
          <motion.p variants={fadeInVariants} className={styles.sectionText}>
            We envision a future where artificial intelligence seamlessly integrates with human intelligence, augmenting our capabilities and unlocking new possibilities. Our goal is to develop AI technologies that are ethical, transparent, and beneficial to society as a whole.
          </motion.p>
        </motion.div>
      </motion.section>

      <motion.section variants={fadeInVariants} className={styles.team}>
        <motion.h2 variants={fadeInVariants} className={styles.sectionTitle}>
          Meet Our Team
        </motion.h2>
        <motion.div variants={staggerVariants} className={styles.teamMembers}>
          {/* Add animated team member components */}
        </motion.div>
      </motion.section>

      <motion.section variants={fadeInVariants} className={styles.ctaSection}>
        <motion.h2 variants={fadeInVariants} className={styles.ctaTitle}>
          Join Us in Shaping the Future of AI
        </motion.h2>
        <motion.div variants={fadeInVariants}>
          <Link href="/contact" className={styles.ctaButton}>
            Get in Touch <FiArrowRight />
          </Link>
        </motion.div>
      </motion.section>
    </motion.div>
  );
}