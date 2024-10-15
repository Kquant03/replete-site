import React, { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useSound } from '../contexts/SoundManager';
import FadeInWrapper from './FadeInWrapper';
import useIntersectionObserver from '../hooks/useIntersectionObserver';
import UserInteractionPrompt from './UserInteractionPrompt';
import styles from '../styles/HomePageSound.module.css';

interface HomePageSoundProps {
  children: React.ReactNode;
}

const HomePageSound: React.FC<HomePageSoundProps> = ({ children }) => {
  const pathname = usePathname();
  const { playBackgroundMusic, fadeOutBackgroundMusic } = useSound();
  const contentRef = useRef<HTMLDivElement>(null);
  const isContentVisible = useIntersectionObserver(contentRef, {
    threshold: 0,
    freezeOnceVisible: true,
  });
  const [showPrompt, setShowPrompt] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    if (pathname === '/' && isContentVisible) {
      const timer = setTimeout(() => setShowPrompt(true), 500);
      return () => clearTimeout(timer);
    } else {
      setShowPrompt(false);
      fadeOutBackgroundMusic(2);
    }

    return () => {
      if (pathname !== '/') {
        console.log('HomePageSound: Cleanup - fading out background music');
        fadeOutBackgroundMusic(2);
      }
    };
  }, [pathname, isContentVisible, fadeOutBackgroundMusic]);

  useEffect(() => {
    setIsTransitioning(true);
    const transitionTimer = setTimeout(() => setIsTransitioning(false), 300); // Adjust time as needed
    return () => clearTimeout(transitionTimer);
  }, [pathname]);

  const handleInteraction = (e: React.MouseEvent) => {
    if (isTransitioning) return;
    
    // Ignore clicks on interactive elements
    if ((e.target as HTMLElement).closest('a, button, input, select, textarea')) {
      return;
    }

    if (showPrompt) {
      console.log('User interaction detected');
      playBackgroundMusic(2); // 2-second fade-in
      setShowPrompt(false);
    }
  };

  return (
    <div ref={contentRef} className={styles.container} onClick={handleInteraction}>
      <UserInteractionPrompt isVisible={showPrompt} />
      <FadeInWrapper isVisible={isContentVisible}>
        {children}
      </FadeInWrapper>
    </div>
  );
};

export default HomePageSound;