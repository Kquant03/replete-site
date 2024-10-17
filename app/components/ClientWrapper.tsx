'use client';

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import ClientLayout from './ClientLayout';

const ClientWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();
  const [key, setKey] = useState(0);

  useEffect(() => {
    setKey(prev => prev + 1);
  }, [pathname]);

  return <ClientLayout key={key}>{children}</ClientLayout>;
};

export default ClientWrapper;