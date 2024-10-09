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
}

const MDXImage: React.FC<MDXImageProps> = ({ 
  src, 
  alt, 
  width, 
  height, 
  padding = '0',
  priority = false
}) => {
  const [isLoading, setIsLoading] = useState(true);

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
    </div>
  );
};

export default MDXImage;