'use client';

import React from 'react';
import Link from 'next/link';
import { ExternalLink, Database, ArrowUpRight } from 'lucide-react';
import styles from './Datasets.module.css';

interface Dataset {
  name: string;
  description: string;
  link: string;
  size: string;
  category: string;
}

const datasets: Dataset[] = [
  {
    name: "Sandevistan",
    description: "A dataset for supervised fine-tuning of base models on a less inhibited synthetic character, challenging the paradigms of the field while still improving model ability across the board.",
    link: "https://huggingface.co/datasets/Replete-AI/Sandevistan",
    size: "1.95GB",
    category: "General Intelligence"
  },
  {
    name: "Apocrypha",
    description: "A roleplaying dataset based on an original character developed by the community. Aimed to remove the limitations of models and allow them to freely generate text.",
    link: "https://huggingface.co/datasets/Replete-AI/Apocrypha",
    size: "829MB",
    category: "Natural Human Language"
  },
  {
    name: "Code Bagel Hermes 2.5",
    description: "A large coding dataset regularized by Open Hermes 2.5 in order to help the model generalize while also improving at coding during a supervised fine-tune.",
    link: "https://huggingface.co/datasets/Replete-AI/code_bagel_hermes-2.5",
    size: "2.4GB",
    category: "Coding and General Use"
  },
  {
    name: "Code Bagel",
    description: "A huge selection of coding data, inspired by the Bagel dataset that was created by Jon Durbin.",
    link: "https://huggingface.co/datasets/Replete-AI/code_bagel",
    size: "2.3GB",
    category: "Coding"
  },
  // Add more datasets as needed
];

const Datasets = () => {
  return (
    <div className={styles.container}>
      <section className={styles.hero}>
        <div className={styles.heroBackdrop} />
        <div className={styles.heroGlow} />
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>Open Datasets</h1>
          <p className={styles.heroSubtitle}>
            High-quality, curated datasets for advancing language model research and development.
            All datasets are freely available on Hugging Face.
          </p>
        </div>
      </section>

      <div className={styles.mainContent}>
        <div className={styles.datasetsGrid}>
          {datasets.map((dataset, index) => (
            <Link 
              href={dataset.link}
              key={index}
              className={styles.datasetCard}
              target="_blank"
              rel="noopener noreferrer"
            >
              <div className={styles.cardIcon}>
                <Database size={24} />
              </div>
              <div className={styles.cardContent}>
                <div className={styles.cardHeader}>
                  <h3 className={styles.cardTitle}>{dataset.name}</h3>
                  <ArrowUpRight size={16} className={styles.arrowIcon} />
                </div>
                <p className={styles.cardDescription}>{dataset.description}</p>
                <div className={styles.cardMeta}>
                  <span className={styles.tag}>{dataset.category}</span>
                  <span className={styles.tag}>{dataset.size}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className={styles.cta}>
          <h2 className={styles.ctaTitle}>Want to See More?</h2>
          <Link 
            href="https://github.com/RepleteAI/datasets"
            className={styles.ctaButton}
            target="_blank"
            rel="noopener noreferrer"
          >
            <span>Check us out on HuggingFace</span>
            <ExternalLink size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Datasets;