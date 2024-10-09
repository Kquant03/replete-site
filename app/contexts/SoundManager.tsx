'use client';

import React, { createContext, useContext, useState, useRef, useCallback, useEffect } from 'react';
import { Howl, Howler } from 'howler';

interface SoundContextType {
  isMuted: boolean;
  toggleMute: () => void;
  fadeInBackgroundMusic: (duration: number, onFadeComplete?: () => void) => void;
  fadeOutBackgroundMusic: (duration: number, onFadeComplete?: () => void) => void;
}

const SoundContext = createContext<SoundContextType | undefined>(undefined);

const BACKGROUND_MUSIC_VOLUME = 0.08;

export const SoundProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isMuted, setIsMuted] = useState(false);
  const backgroundMusicRef = useRef<Howl | null>(null);

  const createHowl = useCallback((src: string, loop: boolean = false, volume: number) => {
    return new Howl({
      src: [src],
      preload: true,
      loop,
      volume: volume,
    });
  }, []);

  useEffect(() => {
    console.log('SoundProvider: Initializing sounds');
    backgroundMusicRef.current = createHowl('/sounds/home-background.mp3', false, 0);

    return () => {
      console.log('SoundProvider: Cleaning up sounds');
      backgroundMusicRef.current?.stop();
      backgroundMusicRef.current?.unload();
    };
  }, [createHowl]);

  const toggleMute = useCallback(() => {
    setIsMuted(prev => {
      const newMuted = !prev;
      console.log('SoundProvider: Toggling mute:', newMuted);
      Howler.mute(newMuted);
      return newMuted;
    });
  }, []);

  const fadeInBackgroundMusic = useCallback((duration: number, onFadeComplete?: () => void) => {
    console.log('SoundProvider: Fading in background music');
    if (backgroundMusicRef.current) {
      backgroundMusicRef.current.play();
      backgroundMusicRef.current.fade(0, BACKGROUND_MUSIC_VOLUME, duration * 1000);
      backgroundMusicRef.current.once('fade', () => {
        if (onFadeComplete) {
          onFadeComplete();
        }
      });

      // Set up the loop
      const loopMusic = () => {
        console.log('SoundProvider: Background music ended, fading out');
        backgroundMusicRef.current?.fade(BACKGROUND_MUSIC_VOLUME, 0, duration * 1000);
        backgroundMusicRef.current?.once('fade', () => {
          console.log('SoundProvider: Background music faded out, fading in');
          backgroundMusicRef.current?.seek(0);
          backgroundMusicRef.current?.play();
          backgroundMusicRef.current?.fade(0, BACKGROUND_MUSIC_VOLUME, duration * 1000);
          backgroundMusicRef.current?.once('fade', () => {
            console.log('SoundProvider: Background music faded in, waiting for end');
          });
        });
      };

      backgroundMusicRef.current.off('end');
      backgroundMusicRef.current.on('end', loopMusic);
    }
  }, []);

  const fadeOutBackgroundMusic = useCallback((duration: number, onFadeComplete?: () => void) => {
    console.log('SoundProvider: Fading out background music');
    if (backgroundMusicRef.current && backgroundMusicRef.current.playing()) {
      backgroundMusicRef.current.fade(BACKGROUND_MUSIC_VOLUME, 0, duration * 1000);
      backgroundMusicRef.current.once('fade', () => {
        backgroundMusicRef.current?.stop();
        if (onFadeComplete) {
          onFadeComplete();
        }
      });
    } else if (onFadeComplete) {
      onFadeComplete();
    }
  }, []);

  return (
    <SoundContext.Provider value={{ 
      isMuted, 
      toggleMute,
      fadeInBackgroundMusic,
      fadeOutBackgroundMusic,
    }}>
      {children}
    </SoundContext.Provider>
  );
};

export const useSound = () => {
  const context = useContext(SoundContext);
  if (context === undefined) {
    throw new Error('useSound must be used within a SoundProvider');
  }
  return context;
};

export default SoundProvider;