'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import dynamic from 'next/dynamic';

const DynamicConstellationBackground = dynamic(
  () => import('./DynamicConstellationBackground'),
  { ssr: false }
);

const ConstellationBackground: React.FC = () => {
  const pathname = usePathname();

  return <DynamicConstellationBackground key={pathname} pathname={pathname} />;
};

export default ConstellationBackground;