import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import ConstellationBackground from './ConstellationBackground';

const PersistentBackground: React.FC = () => {
  const backgroundRef = useRef<HTMLDivElement | null>(null);
  const [isMounted, setIsMounted] = React.useState(false);

  useEffect(() => {
    backgroundRef.current = document.createElement('div');
    backgroundRef.current.style.position = 'fixed';
    backgroundRef.current.style.top = '0';
    backgroundRef.current.style.left = '0';
    backgroundRef.current.style.width = '100%';
    backgroundRef.current.style.height = '100%';
    backgroundRef.current.style.zIndex = '-1';
    
    document.body.appendChild(backgroundRef.current);
    setIsMounted(true);

    return () => {
      if (backgroundRef.current) {
        document.body.removeChild(backgroundRef.current);
      }
    };
  }, []);

  return isMounted && backgroundRef.current
    ? createPortal(<ConstellationBackground />, backgroundRef.current)
    : null;
};

export default PersistentBackground;