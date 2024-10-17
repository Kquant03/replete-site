import React from 'react';
import dynamic from 'next/dynamic';

const DynamicConstellationBackground = dynamic(
  () => import('./DynamicConstellationBackground'),
  { ssr: false }
);

const ConstellationBackground: React.FC = () => {
  return <DynamicConstellationBackground />;
};

export default ConstellationBackground;