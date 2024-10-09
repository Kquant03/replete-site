'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useSound } from '../contexts/SoundManager';
import FadeInWrapper from './FadeInWrapper';
import useIntersectionObserver from '../hooks/useIntersectionObserver';

interface HomePageSoundProps {
  children: React.ReactNode;
}

const HomePageSound: React.FC<HomePageSoundProps> = ({ children }) => {
  const pathname = usePathname();
  const { fadeInBackgroundMusic, fadeOutBackgroundMusic } = useSound();
  const prevPathname = useRef(pathname);
  const contentRef = useRef<HTMLDivElement>(null);
  const isContentVisible = useIntersectionObserver(contentRef, {
    threshold: 0,
    freezeOnceVisible: true,
  });

  useEffect(() => {
    if (pathname === '/' && isContentVisible) {
      fadeInBackgroundMusic(2);
    } else if (prevPathname.current === '/' && pathname !== '/') {
      fadeOutBackgroundMusic(2);
    }

    prevPathname.current = pathname;

    return () => {
      if (pathname !== '/') {
        console.log('HomePageSound: Cleanup - fading out background music');
        fadeOutBackgroundMusic(2);
      }
    };
  }, [pathname, isContentVisible, fadeInBackgroundMusic, fadeOutBackgroundMusic]);

  return (
    <div ref={contentRef}>
      <FadeInWrapper isVisible={isContentVisible}>
        {children}
      </FadeInWrapper>
    </div>
  );
};

export default HomePageSound;