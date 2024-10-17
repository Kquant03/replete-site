'use client';

import React from 'react';
import ClientLayout from './ClientLayout';
import PersistentBackground from './PersistentBackground';

const ClientWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <>
      <PersistentBackground />
      <ClientLayout>{children}</ClientLayout>
    </>
  );
};

export default ClientWrapper;