// app/privacy/page.tsx
'use client';
import { useEffect, useState } from 'react';
import styles from './Privacy.module.css';

export default function PrivacyPolicy() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className={`${styles.privacyContainer} ${isVisible ? styles.visible : ''}`}>
      <h1 className={styles.heading}>Privacy Policy</h1>
      
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Introduction</h2>
        <p className={styles.sectionText}>
          Welcome to Replete AI ("we," "our," or "us"). This Privacy Policy explains how we collect, use, disclose, 
          and safeguard your information when you use our website and AI chatbot service, Pneuma ("the Service").
        </p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Information We Collect</h2>
        <h3 className={styles.subsectionTitle}>Account Information</h3>
        <ul className={styles.list}>
          <li>Username and password (stored securely using industry-standard hashing algorithms)</li>
          <li>Email address (for account management and communication purposes)</li>
        </ul>

        <h3 className={styles.subsectionTitle}>Conversation Data</h3>
        <ul className={styles.list}>
          <li>All interactions between users and our AI chatbot, Pneuma</li>
          <li>System prompts generated from user interactions</li>
          <li>Future implementations may include cross-conversation memory features</li>
        </ul>

        <h3 className={styles.subsectionTitle}>Technical Data</h3>
        <ul className={styles.list}>
          <li>Mouse position data for interactive particle animations</li>
          <li>Audio interaction preferences</li>
          <li>Navigation patterns through our AI guide</li>
          <li>Contact form submissions</li>
          <li>Browser type and version</li>
          <li>Device information</li>
          <li>IP address</li>
          <li>Access timestamps</li>
        </ul>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>How We Use Your Information</h2>
        <h3 className={styles.subsectionTitle}>Primary Uses</h3>
        <ul className={styles.list}>
          <li>Providing and maintaining the Service</li>
          <li>Enabling user authentication and account management</li>
          <li>Powering interactive website features</li>
          <li>Processing and responding to contact form submissions</li>
          <li>Improving user experience through interface customization</li>
        </ul>

        <h3 className={styles.subsectionTitle}>AI Development and Research</h3>
        <ul className={styles.list}>
          <li>Analysis of conversations to improve Pneuma's responses</li>
          <li>Creation of training datasets for model improvement</li>
          <li>Development of AI memory and context retention systems</li>
          <li>Generation and refinement of system prompts</li>
        </ul>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Data Sharing and Disclosure</h2>
        <p className={styles.sectionText}>
          We currently do not share your personal information with third parties. However, we may in the future:
        </p>
        <ul className={styles.list}>
          <li>Create and release anonymized public datasets derived from user interactions</li>
          <li>Share aggregated, non-personally identifiable information for research purposes</li>
        </ul>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Contact Us</h2>
        <p className={styles.sectionText}>
          If you have any questions about this Privacy Policy, please visit our <a href="/contact" className={styles.link}>contact page</a>.
        </p>
      </section>
    </div>
  );
}