'use client';

import React from 'react';
import { AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { SoundProvider } from '../contexts/SoundManager';
import ClientHeader from './Header';
import PersistentBackground from './PersistentBackground';
import styles from '../styles/ClientLayout.module.css';

interface ClientLayoutProps {
  children: React.ReactNode;
}

const ClientLayout: React.FC<ClientLayoutProps> = ({ children }) => {
  const pathname = usePathname();

  return (
    <>
      <PersistentBackground />
      <SoundProvider>
        <div className={styles.contentContainer}>
          <ClientHeader />
          <AnimatePresence mode="wait" initial={false}>
            <div key={pathname}>
              {children}
            </div>
          </AnimatePresence>
        </div>
      </SoundProvider>
    </>
  );
};

export default ClientLayout;