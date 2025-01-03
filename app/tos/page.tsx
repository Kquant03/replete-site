'use client';
import { useEffect, useState } from 'react';
import styles from './Tos.module.css';

export default function TermsOfService() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className={`${styles.tosContainer} ${isVisible ? styles.visible : ''}`}>
      <h1 className={styles.heading}>Terms of Service</h1>
      
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>1. Introduction</h2>
        <p className={styles.sectionText}>
          Welcome to Replete AI. These Terms of Service (&quot;Terms&quot;) govern your access to and use of our website and AI chatbot service, Pneuma (&quot;the Service&quot;). By accessing or using our Service, you agree to be bound by these Terms and our Privacy Policy. If you do not agree to these Terms, please do not use our Service.
        </p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>2. Age Restrictions</h2>
        <p className={styles.sectionText}>
          Our Service is not intended for unsupervised use by children under 13 years of age. Users under 13 must have parental guidance and supervision while using the Service. We emphasize that Pneuma is an uncensored AI system capable of generating realistic and potentially mature content. Parents should monitor their children&apos;s interactions with the Service.
        </p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>3. User Data and Conversations</h2>
        <div className={styles.sectionText}>
          <p>By using our Service, you acknowledge and agree that:</p>
          <ul className={styles.list}>
            <li>All conversations with Pneuma are stored for registered users to enable access to conversation history</li>
            <li>We may implement memory systems that allow Pneuma to retain context across conversations</li>
            <li>Your conversations may be used to improve our AI systems and services</li>
            <li>While we protect your data, Pneuma is an AI system and users should exercise due dilligence and understand the difference between reality and fiction.</li>
          </ul>
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>4. Acceptable Use</h2>
        <div className={styles.sectionText}>
          <p>You agree not to use the Service for:</p>
          <ul className={styles.list}>
            <li>Any illegal activities or purposes</li>
            <li>Attempting to breach security systems or hack any systems</li>
            <li>Creating or promoting harmful content (e.g., biological weapons, extreme violence)</li>
            <li>Harassment, doxxing, or intentionally attacking others</li>
            <li>Any activities that could cause significant harm to individuals or communities</li>
          </ul>
          <p>While mature or NSFW content is permitted, it must not violate any laws or promote harm to others.</p>
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>5. Service Access</h2>
        <p className={styles.sectionText}>
          Access to our Service is provided on a first-come, first-served basis due to hardware limitations. You may experience wait times during periods of high demand. We do not guarantee continuous, uninterrupted access to the Service.
        </p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>6. Account Termination</h2>
        <div className={styles.sectionText}>
          <p>We reserve the right to:</p>
          <ul className={styles.list}>
            <li>Terminate accounts found to be engaging in illegal activities</li>
            <li>Remove harmful content from our databases</li>
            <li>Suspend or ban accounts that violate these Terms</li>
            <li>Modify or discontinue any aspect of the Service at our discretion</li>
          </ul>
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>7. Changes to Terms</h2>
        <p className={styles.sectionText}>
          We reserve the right to modify these Terms at any time. We will notify users of any material changes through our website or via email. Your continued use of the Service after such modifications constitutes acceptance of the updated Terms.
        </p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>8. Contact</h2>
        <p className={styles.sectionText}>
          If you have any questions about these Terms, please visit our <a href="/contact" className={styles.link}>contact page</a>.
        </p>
      </section>
    </div>
  );
}