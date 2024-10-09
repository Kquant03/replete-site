// app/privacy/page.tsx
import styles from './Privacy.module.css';

export default function PrivacyPolicy() {
  return (
    <div className={styles.privacyContainer}>
      <h1 className={styles.heading}>Privacy Policy</h1>
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>1. Information We Collect</h2>
        <p className={styles.sectionText}>
          We collect information you provide directly to us when you use our website, such as when you fill out a contact form or subscribe to our newsletter.
        </p>
      </section>
      {/* Add more sections for the privacy policy */}
    </div>
  );
}