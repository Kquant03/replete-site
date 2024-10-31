import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import styles from './ImageLightbox.module.css';

interface ImageLightboxProps {
  src: string;
  alt: string;
  originalWidth: number;
  originalHeight: number;
  isOpen: boolean;
  onClose: () => void;
}

const ImageLightbox: React.FC<ImageLightboxProps> = ({
  src,
  alt,
  originalWidth,
  originalHeight,
  isOpen,
  onClose
}) => {
  const [isZoomed, setIsZoomed] = useState(false);
  const [lastTap, setLastTap] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const imageRef = useRef<HTMLDivElement>(null);

  // Reset zoom state when closing
  useEffect(() => {
    if (!isOpen) {
      setIsZoomed(false);
    }
  }, [isOpen]);

  // Handle body scroll lock
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }

    return () => {
      document.body.classList.remove('modal-open');
    };
  }, [isOpen]);

  const handleClose = () => {
    if (!isDragging) {
      setIsZoomed(false);
      onClose();
    }
  };

  const handleImageClick = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    const now = Date.now();
    // Increased time window for double tap (from 300ms to 500ms)
    if (now - lastTap < 500 && !isDragging) {
      setIsZoomed(!isZoomed);
    }
    setLastTap(now);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    handleImageClick(e);
  };

  const getDragConstraints = () => {
    if (!imageRef.current) return { top: 0, left: 0, right: 0, bottom: 0 };
    
    const rect = imageRef.current.getBoundingClientRect();
    return {
      top: -rect.height,
      left: -rect.width,
      right: rect.width,
      bottom: rect.height
    };
  };

  const modal = (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          className={styles.modalOverlay}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          onClick={handleClose}
        >
          <motion.div
            className={styles.modalPanel}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ 
              type: 'spring',
              damping: 25,
              stiffness: 300,
              duration: 0.15
            }}
            onClick={e => e.stopPropagation()}
          >
            <motion.div
              ref={imageRef}
              className={`${styles.imageContainer} ${isZoomed ? styles.zoomed : ''}`}
              animate={{ scale: isZoomed ? 2 : 1 }}
              drag={isZoomed}
              dragConstraints={getDragConstraints()}
              dragElastic={0.05}
              dragMomentum={false}
              onDragStart={() => setIsDragging(true)}
              onDragEnd={() => {
                setIsDragging(false);
              }}
              onClick={handleImageClick}
              onTouchStart={handleTouchStart}
            >
              <Image
                src={src}
                alt={alt}
                width={Math.min(originalWidth, window.innerWidth * 0.85)}
                height={Math.min(originalHeight, window.innerHeight * 0.6)}
                className={styles.image}
                priority
                draggable={false}
                style={{ objectFit: 'contain' }}
              />
            </motion.div>
          </motion.div>

          <div className={styles.instructions}>
            {isZoomed ? 'Drag to pan • Tap to unzoom' : 'Tap image to zoom • Tap outside to close'}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return typeof window !== 'undefined' 
    ? createPortal(modal, document.body) 
    : null;
};

export default ImageLightbox;