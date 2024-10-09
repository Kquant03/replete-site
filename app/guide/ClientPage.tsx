'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { MDXProvider } from '@mdx-js/react';
import Image from 'next/image';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import Header from '../components/Header';
import EnhancedSidebarNavigation from '../components/EnhancedSidebarNavigation';
import styles from './GuideStyles.module.css';
import type { SyntaxHighlighterProps } from 'react-syntax-highlighter';

// Define a type for the MDX component
type MDXContentType = React.ComponentType<Record<string, never>>;

const ClientPage: React.FC = () => {
  const [MDXContent, setMDXContent] = useState<MDXContentType | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [currentPath, setCurrentPath] = useState<string>('welcome');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);
  const [contentKey, setContentKey] = useState<number>(0);

  useEffect(() => {
    const checkMobile = () => {
      const isMobileView = window.innerWidth <= 768;
      setIsMobile(isMobileView);
      setIsSidebarOpen(!isMobileView);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const fetchContent = useCallback(async (path: string) => {
    setIsTransitioning(true);
    setErrorMessage(null);
    try {
      const MDXModule = await import(`@/app/content/guide/${path}.mdx`);
      setTimeout(() => {
        setMDXContent(() => MDXModule.default as MDXContentType);
        setCurrentPath(path);
        setContentKey(prev => prev + 1);
        setIsTransitioning(false);
      }, 300);
    } catch (error) {
      console.error(`Error loading content for ${path}:`, error);
      setErrorMessage(`Failed to load content for ${path}. Please try again later.`);
      setMDXContent(null);
      setIsTransitioning(false);
    }
  }, []);

  useEffect(() => {
    fetchContent('welcome');
  }, [fetchContent]);

  const toggleSidebar = useCallback(() => {
    if (isMobile) {
      setIsSidebarOpen(prev => !prev);
    }
  }, [isMobile]);

  const handleNavigate = useCallback((path: string) => {
    if (path !== currentPath) {
      fetchContent(path);
      if (isMobile) {
        setIsSidebarOpen(false);
      }
    }
  }, [fetchContent, isMobile, currentPath]);

  const components = useMemo(() => ({
    h1: (props: React.HTMLAttributes<HTMLHeadingElement>) => <h1 className={styles.heading1} {...props} />,
    h2: (props: React.HTMLAttributes<HTMLHeadingElement>) => <h2 className={styles.heading2} {...props} />,
    h3: (props: React.HTMLAttributes<HTMLHeadingElement>) => <h3 className={styles.heading3} {...props} />,
    p: (props: React.HTMLAttributes<HTMLParagraphElement>) => <p className={styles.paragraph} {...props} />,
    a: (props: React.AnchorHTMLAttributes<HTMLAnchorElement>) => <a className={styles.link} target="_blank" rel="noopener noreferrer" {...props} />,
    ul: (props: React.HTMLAttributes<HTMLUListElement>) => <ul className={styles.unorderedList} {...props} />,
    ol: (props: React.HTMLAttributes<HTMLOListElement>) => <ol className={styles.orderedList} {...props} />,
    li: (props: React.LiHTMLAttributes<HTMLLIElement>) => <li className={styles.listItem} {...props} />,
    blockquote: (props: React.BlockquoteHTMLAttributes<HTMLQuoteElement>) => <blockquote className={styles.blockquote} {...props} />,
    code: ({ className, children, ...props }: React.HTMLAttributes<HTMLElement>) => {
      const match = /language-(\w+)/.exec(className || '');
      return match ? (
        <SyntaxHighlighter
          language={match[1]}
          style={vscDarkPlus}
          customStyle={{ backgroundColor: 'transparent' }}
          className={styles.codeBlock}
          PreTag="div"
          {...(props as SyntaxHighlighterProps)}
        >
          {String(children)}
        </SyntaxHighlighter>
      ) : (
        <code className={`${styles.inlineCode} ${className}`} {...props}>
          {children}
        </code>
      );
    },
    table: (props: React.TableHTMLAttributes<HTMLTableElement>) => <table className={styles.table} {...props} />,
    img: ({ src, alt, title }: React.ImgHTMLAttributes<HTMLImageElement>) => (
      <div className={styles.imageContainer}>
        <div className={styles.imageWrapper}>
          <Image 
            src={src || ''}
            alt={alt || ''}
            title={title}
            layout="responsive"
            width={500}
            height={300}
            sizes="100vw"
            style={{ width: '100%', height: 'auto' }}
            className={styles.image}
          />
        </div>
        {title && <p className={styles.imageCaption}>{title}</p>}
      </div>
    ),
    Title: (props: React.HTMLAttributes<HTMLHeadingElement>) => <h1 className={styles.title} {...props} />,
    Tagline: (props: React.HTMLAttributes<HTMLParagraphElement>) => <p className={styles.tagline} {...props} />,
  }), []);

  return (
    <div className={styles.guidePage}>
      <Header toggleSidebar={toggleSidebar} />
      <div className={styles.guideContent}>
        <EnhancedSidebarNavigation
          isOpen={isSidebarOpen}
          onToggle={toggleSidebar}
          onNavigate={handleNavigate}
          currentPath={currentPath}
          isMobile={isMobile}
        />
        <main
          className={`${styles.mainContent} ${
            !isMobile && isSidebarOpen ? styles.sidebarOpenDesktop : ''
          }`}
        >
          {(MDXContent || errorMessage) && (
            <div 
              key={contentKey}
              className={`${styles.contentPanel} ${isTransitioning ? styles.fadeOut : styles.fadeIn}`}
            >
              {errorMessage ? (
                <div className={styles.error}>
                  <h2>Error</h2>
                  <p>{errorMessage}</p>
                </div>
              ) : MDXContent ? (
                <MDXProvider components={components}>
                  <MDXContent />
                </MDXProvider>
              ) : null}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default ClientPage;