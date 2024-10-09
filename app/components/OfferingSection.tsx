import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from '../styles/OfferingSection.module.css';

interface Offering {
  title: string;
  description: string;
  image: string;
  link: string;
  ctaText?: string; // New optional property for custom call-to-action text
}

interface OfferingSectionProps {
  offerings: Offering[];
}

const OfferingSection: React.FC<OfferingSectionProps> = ({ offerings }) => {
  return (
    <div className={styles.offeringsGrid}>
      {offerings.map((offering, index) => (
        <div key={index} className={styles.offeringCard}>
          <Link href={offering.link}>
            <div className={styles.offeringImage}>
              <Image src={offering.image} alt={offering.title} layout="fill" objectFit="cover" />
            </div>
            <div className={styles.offeringContent}>
              <h3 className={styles.offeringTitle}>{offering.title}</h3>
              <p className={styles.offeringDescription}>{offering.description}</p>
              <div className={styles.exploreMore}>
                {offering.ctaText || 'Explore More'} &rarr;
              </div>
            </div>
          </Link>
        </div>
      ))}
    </div>
  );
};

export default OfferingSection;