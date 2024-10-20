'use client';

import React, { useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { SoundProvider } from '../contexts/SoundManager';
import ClientHeader from './Header';
import PersistentBackground from './DynamicConstellationBackground';
import styles from '../styles/ClientLayout.module.css';

interface ClientLayoutProps {
  children: React.ReactNode;
}

const ClientLayout: React.FC<ClientLayoutProps> = ({ children }) => {
  console.log('ClientLayout rendered');
  const pathname = usePathname();
  console.log('Current pathname in ClientLayout:', pathname);

  useEffect(() => {
    console.log('ClientLayout mounted');
    return () => {
      console.log('ClientLayout unmounted');
    };
  }, []);

  useEffect(() => {
    console.log('Pathname changed in ClientLayout:', pathname);
  }, [pathname]);

  return (
    <SoundProvider>
      {pathname === '/' && <PersistentBackground pathname={pathname} />}
      <div className={styles.contentContainer} style={{ position: 'relative', zIndex: 1 }}>
        <ClientHeader />
        <AnimatePresence mode="wait" initial={false}>
          <div key={pathname}>
            {children}
          </div>
        </AnimatePresence>
      </div>
    </SoundProvider>
  );
};

export default ClientLayout;