import React from 'react';
import styles from '../styles/pneuma.module.css';

interface ThinkingIndicatorProps {
  isVisible: boolean;
  queuePosition: number | null;
}

const ThinkingIndicator: React.FC<ThinkingIndicatorProps> = ({ isVisible, queuePosition }) => (
  <div className={`${styles.thinkingIndicator} ${isVisible ? styles.visible : ''}`}>
    Pneuma is thinking
    <span className={styles.thinkingDots}>
      <span className={styles.dot}></span>
      <span className={styles.dot}></span>
      <span className={styles.dot}></span>
    </span>
    {queuePosition !== null && (
      <span className={styles.queuePosition}>
        Queue position: {queuePosition}
      </span>
    )}
  </div>
);

export default ThinkingIndicator;