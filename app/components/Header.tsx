'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { FaGithub, FaVolumeMute, FaVolumeUp, FaBook } from 'react-icons/fa';
import { useSound } from '../contexts/SoundManager';
import styles from '../styles/Header.module.css';

interface HeaderProps {
  toggleSidebar?: () => void;
}

const Header: React.FC<HeaderProps> = ({ toggleSidebar = () => {} }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isMuted, toggleMute } = useSound();
  const pathname = usePathname();
  const router = useRouter();
  const [isHomePage, setIsHomePage] = useState(false);
  const [isGuidePage, setIsGuidePage] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const toggleMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsMenuOpen(prev => !prev);
  }, []);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
    setIsHomePage(pathname === '/');
    setIsGuidePage(pathname === '/guide');
  }, [pathname]);

  const handleNavigation = (href: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    setIsMenuOpen(false);
    router.push(href);
  };

  const navItems = [
    { name: 'Pneuma', href: '/pneuma' },
    { name: 'Guide', href: '/guide' },
    { name: 'Book', href: '/patterns-of-sentience' },
    { name: 'Blog', href: '/blog' },
    { name: 'About', href: '/about' }
  ];

  const socialLinks = [
    { href: "https://huggingface.co/Replete-AI", src: "/huggingface-logo.png", alt: "HuggingFace" },
    { href: "https://github.com/Replete-AI", icon: FaGithub },
    { href: "https://discord.gg/awyCNx3nnw", src: "/discord-logo.png", alt: "Discord" }
  ];

  return (
    <header className={styles.header}>
      <div className={styles.headerContent}>
        <div className={styles.logoContainer}>
          <Link href="/" onClick={handleNavigation("/")} className={styles.logo}>
            <Image src="/logo.png" alt="Replete AI Logo" width={40} height={40} />
            <span className={styles.heading}>Replete AI</span>
          </Link>
          {isGuidePage && isMobile && (
            <button 
              className={styles.guideButton}
              onClick={toggleSidebar}
            >
              <FaBook />
            </button>
          )}
          {isHomePage && (
            <button onClick={toggleMute} className={styles.muteButton} aria-label="Toggle sound">
              {isMuted ? <FaVolumeMute /> : <FaVolumeUp />}
            </button>
          )}
        </div>
        <nav className={styles.nav}>
          {navItems.map((item) => (
            <div key={item.name}>
              <Link href={item.href} onClick={handleNavigation(item.href)}>{item.name}</Link>
            </div>
          ))}
        </nav>
        <div className={styles.rightSection}>
          <div className={styles.socialLinks}>
            {socialLinks.map((link, index) => (
              <div key={index}>
                <Link href={link.href} onClick={handleNavigation(link.href)}>
                  {link.icon ? <link.icon /> : 
                    <Image src={link.src!} alt={link.alt!} width={24} height={24} />
                  }
                </Link>
              </div>
            ))}
          </div>
          <button 
            className={`${styles.menuToggle} ${isMenuOpen ? styles.menuOpen : ''}`}
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            <span></span>
          </button>
        </div>
      </div>
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            className={styles.mobileNav}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            {navItems.map((item) => (
              <motion.div key={item.name} whileTap={{ scale: 0.95 }}>
                <Link href={item.href} onClick={handleNavigation(item.href)}>{item.name}</Link>
              </motion.div>
            ))}
            <div className={styles.mobileOnlyLinks}>
              <div className={styles.socialLinks}>
                {socialLinks.map((link, index) => (
                  <motion.div key={index} whileTap={{ scale: 0.95 }}>
                    <Link href={link.href} onClick={handleNavigation(link.href)}>
                      {link.icon ? <link.icon /> : 
                        <Image src={link.src!} alt={link.alt!} width={24} height={24} />
                      }
                    </Link>
                  </motion.div>
                ))}
              </div>
              {isHomePage && (
                <motion.button 
                  whileTap={{ scale: 0.95 }}
                  onClick={toggleMute} 
                  className={`${styles.muteButton} ${styles.mobileMuteButton}`} 
                  aria-label="Toggle sound"
                >
                  {isMuted ? <FaVolumeMute /> : <FaVolumeUp />}
                </motion.button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;