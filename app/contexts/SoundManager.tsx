
"use client";
import React, { createContext, useContext, useState, useRef, useCallback, useEffect } from 'react';
import { Howl, Howler } from 'howler';

interface SoundContextType {
  isMuted: boolean;
  toggleMute: () => void;
  playBackgroundMusic: (fadeDuration: number) => void;
  fadeOutBackgroundMusic: (duration: number) => void;
}

const SoundContext = createContext<SoundContextType | undefined>(undefined);

const BACKGROUND_MUSIC_VOLUME = 0.08;

export const SoundProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isMuted, setIsMuted] = useState(false);
  const backgroundMusicRef = useRef<Howl | null>(null);

  const createHowl = useCallback((src: string, loop: boolean = true, volume: number) => {
    return new Howl({
      src: [src],
      loop,
      volume,
    });
  }, []);

  useEffect(() => {
    console.log('SoundProvider: Initializing sounds');
    backgroundMusicRef.current = createHowl('/sounds/home-background.mp3', true, 0);
  }, [createHowl]);

  const toggleMute = useCallback(() => {
    setIsMuted(prev => {
      const newMuted = !prev;
      console.log('SoundProvider: Toggling mute:', newMuted);
      Howler.mute(newMuted);
      return newMuted;
    });
  }, []);

  const playBackgroundMusic = useCallback((fadeDuration: number) => {
    console.log('SoundProvider: Playing background music with fade-in');
    if (backgroundMusicRef.current) {
      backgroundMusicRef.current.volume(0);
      backgroundMusicRef.current.play();
      backgroundMusicRef.current.fade(0, BACKGROUND_MUSIC_VOLUME, fadeDuration * 1000);
    } else {
      console.error('Background music not initialized');
    }
  }, []);

  const fadeOutBackgroundMusic = useCallback((duration: number) => {
    console.log('SoundProvider: Fading out background music');
    if (backgroundMusicRef.current && backgroundMusicRef.current.playing()) {
      backgroundMusicRef.current.fade(BACKGROUND_MUSIC_VOLUME, 0, duration * 1000);
      backgroundMusicRef.current.once('fade', () => {
        backgroundMusicRef.current?.stop();
      });
    }
  }, []);

  return (
    <SoundContext.Provider value={{ 
      isMuted, 
      toggleMute,
      playBackgroundMusic,
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