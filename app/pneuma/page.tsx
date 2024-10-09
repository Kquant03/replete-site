'use client';

import React, { useEffect } from 'react';
import PneumaContent from './PneumaContent';
import styles from './pneumaPage.module.css';

export default function PneumaPage() {
  useEffect(() => {
    const scrollToTop = () => {
      window.scrollTo(0, 0);
      if (document.body) document.body.scrollTop = 0;
      if (document.documentElement) document.documentElement.scrollTop = 0;
    };

    // Scroll to top immediately
    scrollToTop();

    // Scroll to top after a short delay (to catch any delayed content loads)
    const timeoutId = setTimeout(scrollToTop, 100);

    // Attempt to scroll to top multiple times
    const intervalId = setInterval(scrollToTop, 50);
    setTimeout(() => clearInterval(intervalId), 500);

    return () => {
      clearTimeout(timeoutId);
      clearInterval(intervalId);
    };
  }, []);

  return (
    <div className={`${styles.pneumaPage} pneuma-page`}>
      <PneumaContent />
    </div>
  );
}