import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import styles from '../styles/OfferingSection.module.css';

interface Offering {
  title: string;
  description: string;
  image: string;
  link: string;
  ctaText: string;
}

interface OfferingSectionProps {
  offerings: Offering[];
}

const OfferingSection: React.FC<OfferingSectionProps> = ({ offerings }) => {
  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  return (
    <motion.div 
      className={styles.offeringsGrid}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {offerings.map((offering, index) => (
        <motion.div 
          key={index} 
          className={styles.offeringCard}
          variants={itemVariants}
        >
          <Link href={offering.link}>
            <div className={styles.offeringImage}>
              <Image 
                src={offering.image} 
                alt={offering.title} 
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                style={{ objectFit: 'cover' }}
              />
            </div>
            <div className={styles.offeringContent}>
              <h3 className={styles.offeringTitle}>{offering.title}</h3>
              <p className={styles.offeringDescription}>{offering.description}</p>
              <div className={styles.exploreMore}>
                {offering.ctaText} &rarr;
              </div>
            </div>
          </Link>
        </motion.div>
      ))}
    </motion.div>
  );
};

export default OfferingSection;