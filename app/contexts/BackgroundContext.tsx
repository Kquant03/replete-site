import React, { createContext, useContext, useState, useEffect } from 'react';
import ConstellationBackground from '../components/ConstellationBackground';

const BackgroundContext = createContext<{ restartBackground: () => void } | null>(null);

export const useBackground = () => {
  const context = useContext(BackgroundContext);
  if (!context) {
    throw new Error('useBackground must be used within a BackgroundProvider');
  }
  return context;
};

export const BackgroundProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [key, setKey] = useState(0);

  const restartBackground = () => {
    setKey(prev => prev + 1);
  };

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        restartBackground();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return (
    <BackgroundContext.Provider value={{ restartBackground }}>
      <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: -1 }}>
        <ConstellationBackground key={key} />
      </div>
      {children}
    </BackgroundContext.Provider>
  );
};