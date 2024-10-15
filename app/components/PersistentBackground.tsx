import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import ConstellationBackground from './ConstellationBackground';

const PersistentBackground: React.FC = () => {
  const [backgroundElement, setBackgroundElement] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    const element = document.createElement('div');
    element.style.position = 'fixed';
    element.style.top = '0';
    element.style.left = '0';
    element.style.width = '100%';
    element.style.height = '100%';
    element.style.zIndex = '-1';
    
    document.body.appendChild(element);
    setBackgroundElement(element);

    return () => {
      if (element && element.parentNode) {
        element.parentNode.removeChild(element);
      }
    };
  }, []);

  if (!backgroundElement) {
    return null;
  }

  return createPortal(<ConstellationBackground />, backgroundElement);
};

export default PersistentBackground;