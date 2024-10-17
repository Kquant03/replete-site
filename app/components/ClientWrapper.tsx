'use client';

import React from 'react';
import ClientLayout from './ClientLayout';
import { BackgroundProvider } from '../contexts/BackgroundContext';

const ClientWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <BackgroundProvider>
      <ClientLayout>{children}</ClientLayout>
    </BackgroundProvider>
  );
};

export default ClientWrapper;