'use client';

import React from 'react';
import { AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { SoundProvider } from '../contexts/SoundManager';
import ClientHeader from './Header';

interface ClientLayoutProps {
  children: React.ReactNode;
}

const ClientLayout: React.FC<ClientLayoutProps> = ({ children }) => {
  const pathname = usePathname();

  return (
    <SoundProvider>
      <ClientHeader />
      <AnimatePresence mode="wait" initial={false}>
        <div key={pathname}>
          {children}
        </div>
      </AnimatePresence>
    </SoundProvider>
  );
};

export default ClientLayout;