import React, { useState } from 'react';
import Image from 'next/image';
import styles from '../styles/MDXImage.module.css';

interface MDXImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  padding?: string;
  priority?: boolean;
  title?: string;  // For the markdown title/caption
}

const MDXImage: React.FC<MDXImageProps> = ({ 
  src, 
  alt, 
  width, 
  height, 
  padding = '0',
  priority = false,
  title
}) => {
  const [isLoading, setIsLoading] = useState(true);

  // Function to parse markdown-style links in the title
  const parseTitle = (titleText: string) => {
    if (!titleText) return null;

    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    const parts: (string | JSX.Element)[] = [];
    let lastIndex = 0;
    let match;

    while ((match = linkRegex.exec(titleText)) !== null) {
      // Add text before the link
      if (match.index > lastIndex) {
        parts.push(titleText.slice(lastIndex, match.index));
      }

      // Add the link
      parts.push(
        <a 
          key={match.index} 
          href={match[2]}
          className={styles.captionLink}
          target="_blank" 
          rel="noopener noreferrer"
        >
          {match[1]}
        </a>
      );

      lastIndex = match.index + match[0].length;
    }

    // Add remaining text after the last link
    if (lastIndex < titleText.length) {
      parts.push(titleText.slice(lastIndex));
    }

    return parts;
  };

  return (
    <div style={{ padding }} className={styles.imageContainer}>
      {isLoading && (
        <div 
          className={styles.placeholder}
          style={{ width: `${width}px`, height: `${height}px` }}
        />
      )}
      <Image 
        src={src} 
        alt={alt} 
        width={width} 
        height={height}
        priority={priority}
        onLoadingComplete={() => setIsLoading(false)}
        className={`${styles.image} ${isLoading ? styles.loading : styles.loaded}`}
      />
      {title && (
        <figcaption className={styles.caption}>
          {parseTitle(title)}
        </figcaption>
      )}
    </div>
  );
};

export default MDXImage;