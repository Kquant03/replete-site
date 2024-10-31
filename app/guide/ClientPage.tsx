'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef, ReactNode } from 'react';
import { MDXProvider } from '@mdx-js/react';
import Image from 'next/image';
import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import Header from '../components/Header';
import EnhancedSidebarNavigation from '../components/EnhancedSidebarNavigation';
import styles from './GuideStyles.module.css';
import { Copy, Check } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import ImageLightbox from './ImageLightbox'

// Import all languages
import javascript from 'react-syntax-highlighter/dist/esm/languages/prism/javascript';
import typescript from 'react-syntax-highlighter/dist/esm/languages/prism/typescript';
import python from 'react-syntax-highlighter/dist/esm/languages/prism/python';
import java from 'react-syntax-highlighter/dist/esm/languages/prism/java';
import csharp from 'react-syntax-highlighter/dist/esm/languages/prism/csharp';
import cpp from 'react-syntax-highlighter/dist/esm/languages/prism/cpp';
import go from 'react-syntax-highlighter/dist/esm/languages/prism/go';
import rust from 'react-syntax-highlighter/dist/esm/languages/prism/rust';
import swift from 'react-syntax-highlighter/dist/esm/languages/prism/swift';
import kotlin from 'react-syntax-highlighter/dist/esm/languages/prism/kotlin';
import scala from 'react-syntax-highlighter/dist/esm/languages/prism/scala';
import ruby from 'react-syntax-highlighter/dist/esm/languages/prism/ruby';
import php from 'react-syntax-highlighter/dist/esm/languages/prism/php';
import dart from 'react-syntax-highlighter/dist/esm/languages/prism/dart';
import html from 'react-syntax-highlighter/dist/esm/languages/prism/markup';
import xml from 'react-syntax-highlighter/dist/esm/languages/prism/markup';
import css from 'react-syntax-highlighter/dist/esm/languages/prism/css';
import scss from 'react-syntax-highlighter/dist/esm/languages/prism/scss';
import sql from 'react-syntax-highlighter/dist/esm/languages/prism/sql';
import bash from 'react-syntax-highlighter/dist/esm/languages/prism/bash';
import shell from 'react-syntax-highlighter/dist/esm/languages/prism/shell-session';
import powershell from 'react-syntax-highlighter/dist/esm/languages/prism/powershell';
import json from 'react-syntax-highlighter/dist/esm/languages/prism/json';
import yaml from 'react-syntax-highlighter/dist/esm/languages/prism/yaml';
import markdown from 'react-syntax-highlighter/dist/esm/languages/prism/markdown';
import graphql from 'react-syntax-highlighter/dist/esm/languages/prism/graphql';

// Import welcome page MDX
import WelcomeMDX from '@/app/content/guide/welcome.mdx';

// Register all languages
SyntaxHighlighter.registerLanguage('javascript', javascript);
SyntaxHighlighter.registerLanguage('js', javascript);
SyntaxHighlighter.registerLanguage('typescript', typescript);
SyntaxHighlighter.registerLanguage('ts', typescript);
SyntaxHighlighter.registerLanguage('python', python);
SyntaxHighlighter.registerLanguage('py', python);
SyntaxHighlighter.registerLanguage('java', java);
SyntaxHighlighter.registerLanguage('csharp', csharp);
SyntaxHighlighter.registerLanguage('cs', csharp);
SyntaxHighlighter.registerLanguage('cpp', cpp);
SyntaxHighlighter.registerLanguage('c++', cpp);
SyntaxHighlighter.registerLanguage('go', go);
SyntaxHighlighter.registerLanguage('golang', go);
SyntaxHighlighter.registerLanguage('rust', rust);
SyntaxHighlighter.registerLanguage('rs', rust);
SyntaxHighlighter.registerLanguage('swift', swift);
SyntaxHighlighter.registerLanguage('kotlin', kotlin);
SyntaxHighlighter.registerLanguage('kt', kotlin);
SyntaxHighlighter.registerLanguage('scala', scala);
SyntaxHighlighter.registerLanguage('ruby', ruby);
SyntaxHighlighter.registerLanguage('rb', ruby);
SyntaxHighlighter.registerLanguage('php', php);
SyntaxHighlighter.registerLanguage('dart', dart);
SyntaxHighlighter.registerLanguage('html', html);
SyntaxHighlighter.registerLanguage('xml', xml);
SyntaxHighlighter.registerLanguage('css', css);
SyntaxHighlighter.registerLanguage('scss', scss);
SyntaxHighlighter.registerLanguage('sql', sql);
SyntaxHighlighter.registerLanguage('bash', bash);
SyntaxHighlighter.registerLanguage('shell', shell);
SyntaxHighlighter.registerLanguage('sh', bash);
SyntaxHighlighter.registerLanguage('powershell', powershell);
SyntaxHighlighter.registerLanguage('ps', powershell);
SyntaxHighlighter.registerLanguage('json', json);
SyntaxHighlighter.registerLanguage('yaml', yaml);
SyntaxHighlighter.registerLanguage('yml', yaml);
SyntaxHighlighter.registerLanguage('markdown', markdown);
SyntaxHighlighter.registerLanguage('md', markdown);
SyntaxHighlighter.registerLanguage('graphql', graphql);
SyntaxHighlighter.registerLanguage('gql', graphql);

type MDXContentType = React.ComponentType<Record<string, never>>;

const MDXImage: React.FC<{ src?: string; alt?: string; title?: string }> = ({ src, alt, title }) => {
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const imageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    if (src) {
      const imgElement = document.createElement('img');
      imgElement.onload = () => {
        setDimensions({
          width: imgElement.naturalWidth,
          height: imgElement.naturalHeight
        });
      };
      imgElement.src = src;
    }
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [src]);

  return (
    <div className={styles.imageContainer}>
      <div 
        ref={imageRef}
        className={`${styles.imageWrapper} ${isMobile ? styles.clickable : ''}`}
        onClick={() => isMobile && setIsLightboxOpen(true)}
      >
        <Image 
          src={src || ''}
          alt={alt || ''}
          title={title}
          width={dimensions.width || 800}
          height={dimensions.height || 600}
          className={styles.image}
        />
        {isMobile && (
          <div className={styles.tapHint}>
            Tap to view
          </div>
        )}
      </div>
      {title && <p className={styles.imageCaption}>{title}</p>}
      
      {isMobile && (
        <ImageLightbox
          src={src || ''}
          alt={alt || ''}
          originalWidth={dimensions.width || 800}
          originalHeight={dimensions.height || 600}
          isOpen={isLightboxOpen}
          onClose={() => setIsLightboxOpen(false)}
        />
      )}
    </div>
  );
};

// Enhanced animation variants
const pageTransitionVariants = {
  initial: { 
    opacity: 0,
    y: 20,
  },
  animate: { 
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: [0.2, 0.65, 0.3, 0.9],
    }
  },
  exit: { 
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.25,
      ease: [0.2, 0.65, 0.3, 0.9]
    }
  }
};

const mdxContentVariants = {
  initial: { opacity: 0 },
  animate: { 
    opacity: 1,
    transition: { duration: 0.3, delay: 0.1 }
  }
};

interface CodeBlockProps {
  language: string;
  value: string;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ language, value }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  }, [value]);

  const displayLanguage = useMemo(() => {
    const langMap: { [key: string]: string } = {
      js: 'JavaScript',
      javascript: 'JavaScript',
      ts: 'TypeScript',
      typescript: 'TypeScript',
      py: 'Python',
      python: 'Python',
      rb: 'Ruby',
      ruby: 'Ruby',
      rs: 'Rust',
      rust: 'Rust',
      go: 'Go',
      golang: 'Go',
      cs: 'C#',
      csharp: 'C#',
      cpp: 'C++',
      'c++': 'C++',
      kt: 'Kotlin',
      kotlin: 'Kotlin',
      sh: 'Shell',
      bash: 'Bash',
      ps: 'PowerShell',
      powershell: 'PowerShell',
      yml: 'YAML',
      yaml: 'YAML',
      md: 'Markdown',
      markdown: 'Markdown',
      gql: 'GraphQL',
      graphql: 'GraphQL',
      text: 'Plain Text',
      plaintext: 'Plain Text'
    };

    return langMap[language.toLowerCase()] || language.toUpperCase();
  }, [language]);

  return (
    <div className={styles.codeBlockWrapper}>
      <div className={styles.codeBlockHeader}>
        <span className={styles.codeBlockLanguage}>{displayLanguage}</span>
        <button
          onClick={handleCopy}
          className={styles.codeBlockCopyBtn}
          aria-label="Copy code"
        >
          <motion.div
            initial={{ scale: 1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          </motion.div>
        </button>
      </div>
      <div className={styles.codeBlockContent}>
        <SyntaxHighlighter
          language={language || 'text'}
          style={vscDarkPlus}
          customStyle={{
            margin: 0,
            padding: '1rem',
            fontSize: '0.875rem',
            lineHeight: 1.5,
            borderRadius: '0 0 0.5rem 0.5rem',
          }}
          wrapLongLines={true}
        >
          {value}
        </SyntaxHighlighter>
      </div>
      <AnimatePresence>
        {copied && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className={styles.codeBlockCopiedIndicator}
          >
            Copied!
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const ClientPage: React.FC = () => {
  const [MDXContent, setMDXContent] = useState<MDXContentType>(() => WelcomeMDX);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [currentPath, setCurrentPath] = useState<string>('welcome');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      setIsSidebarOpen(!mobile);
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Enhanced content fetching with smooth transitions
  const fetchContent = useCallback(async (path: string) => {
    if (path === currentPath || isLoading) return;
    
    setIsLoading(true);
    setErrorMessage(null);
    
    try {
      const MDXModule = await import(`@/app/content/guide/${path}.mdx`);
      setMDXContent(() => MDXModule.default);
      setCurrentPath(path);
      
      if (isMobile) {
        setIsSidebarOpen(false);
      }
    } catch (error) {
      console.error(`Error loading content for ${path}:`, error);
      setErrorMessage(`Failed to load content for ${path}`);
    } finally {
      setIsLoading(false);
    }
  }, [currentPath, isMobile, isLoading]);

  // Navigation handlers with improved transitions
  const toggleSidebar = useCallback(() => {
    if (isMobile) {
      setIsSidebarOpen(prev => !prev);
    }
  }, [isMobile]);

  // MDX components configuration
  const components = useMemo(() => ({
    pre: ({ children }: { children: ReactNode }) => {
      if (React.isValidElement(children) && 
          (children.type === 'code' || children.props?.mdxType === 'code')) {
        return children;
      }
      return <pre>{children}</pre>;
    },
    
    code: ({ className, children, ...props }: { className?: string; children: ReactNode }) => {
      const match = /language-(\w+)/.exec(className || '');
      const value = String(children).replace(/\n$/, '');
      
      // Check if this is inline code
      const isInline = !className && !match && !value.includes('\n');
      
      if (isInline) {
        return <code className={styles.inlineCode} {...props}>{value}</code>;
      }

      const language = match ? match[1] : 'text';
      
      return (
        <CodeBlock
          language={language}
          value={value.trim()}
        />
      );
    },
    
    p: ({ children }: { children: ReactNode }) => {
      if (typeof children === 'string') {
        return (
          <p className={styles.paragraph}>
            {children.split(/(`[^`]+`)/).map((part, index) => {
              if (part.startsWith('`') && part.endsWith('`')) {
                const code = part.slice(1, -1);
                return (
                  <code key={index} className={styles.inlineCode}>
                    {code}
                  </code>
                );
              }
              return part;
            })}
          </p>
        );
      }
      return <p className={styles.paragraph}>{children}</p>;
    },
    
    h1: ({ children }: { children: ReactNode }) => 
      <h1 className={styles.heading1}>{children}</h1>,
    h2: ({ children }: { children: ReactNode }) => 
      <h2 className={styles.heading2}>{children}</h2>,
    h3: ({ children }: { children: ReactNode }) => 
      <h3 className={styles.heading3}>{children}</h3>,
    a: ({ href, children }: { href?: string; children: ReactNode }) => (
      <a href={href} className={styles.link} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    ),
    ul: ({ children }: { children: ReactNode }) => 
      <ul className={styles.unorderedList}>{children}</ul>,
    ol: ({ children }: { children: ReactNode }) => 
      <ol className={styles.orderedList}>{children}</ol>,
    li: ({ children }: { children: ReactNode }) => 
      <li className={styles.listItem}>{children}</li>,
    blockquote: ({ children }: { children: ReactNode }) => (
      <blockquote className={styles.blockquote}>{children}</blockquote>
    ),
    table: ({ children }: { children: ReactNode }) => 
      <table className={styles.table}>{children}</table>,
    img: (props: { src?: string; alt?: string; title?: string }) => (
      <MDXImage {...props} />
    ),
    Title: ({ children }: { children: ReactNode }) => 
      <h1 className={styles.title}>{children}</h1>,
    Tagline: ({ children }: { children: ReactNode }) => 
      <p className={styles.tagline}>{children}</p>,
  }), []);

  return (
    <div className={styles.guidePage}>
      <Header toggleSidebar={toggleSidebar} />
      <div className={styles.guideContent}>
        <EnhancedSidebarNavigation
          isOpen={isSidebarOpen}
          onToggle={toggleSidebar}
          onNavigate={fetchContent}
          currentPath={currentPath}
          isMobile={isMobile}
        />
        
        <motion.main
          className={styles.mainContent}
          animate={{ 
            marginLeft: !isMobile && isSidebarOpen ? '300px' : '0px'
          }}
          transition={{ 
            duration: 0.3,
            ease: [0.2, 0.65, 0.3, 0.9]
          }}
        >
          <AnimatePresence mode="wait">
            <motion.div 
              key={currentPath}
              className={styles.contentPanel}
              variants={pageTransitionVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              {errorMessage ? (
                <div className={styles.error}>
                  {errorMessage}
                </div>
              ) : (
                <motion.div 
                  variants={mdxContentVariants}
                  initial="initial"
                  animate="animate"
                  className={styles.mdxContent}
                >
                  <MDXProvider components={components}>
                    <MDXContent />
                  </MDXProvider>
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>
        </motion.main>
      </div>
    </div>
  );
};

export default ClientPage;