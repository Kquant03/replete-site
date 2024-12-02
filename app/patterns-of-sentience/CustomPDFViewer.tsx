'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Download, X } from 'lucide-react';
import dynamic from 'next/dynamic';
import styles from './PatternsOfSentience.module.css';

// Dynamically import the PDFViewer component
const PDFViewer = dynamic(
  () => import('./PDFViewer').then((module) => module.default),
  {
    ssr: false,
    loading: () => (
      <div className={styles.loadingIndicator}>
        <div className={styles.loadingSpinner} />
        Loading PDF viewer...
      </div>
    ),
  }
);

interface CustomPDFViewerProps {
  onClose: () => void;
}

const CustomPDFViewer: React.FC<CustomPDFViewerProps> = ({ onClose }) => {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1);
  const [error, setError] = useState<string | null>(null);

  const handleError = (error: Error) => {
    console.error('PDF Error:', error);
    setError('Failed to load PDF. Please try again later.');
  };

  if (error) {
    return (
      <div className={styles.pdfViewerContainer}>
        <div className={styles.errorMessage}>{error}</div>
      </div>
    );
  }

  return (
    <div className={styles.pdfViewerContainer}>
      <div className={styles.pdfContent}>
        <div className={styles.pdfControls}>
          <div className={styles.controlGroup}>
            <button
              onClick={() => setPageNumber(prev => Math.max(1, prev - 1))}
              disabled={pageNumber <= 1}
              className={styles.pdfControlButton}
            >
              <ChevronLeft size={20} color="#e2e8f0" />
            </button>
            
            <span className={styles.pageInfo}>
              {pageNumber} / {numPages || '--'}
            </span>
            
            <button
              onClick={() => setPageNumber(prev => Math.min(numPages || prev, prev + 1))}
              disabled={pageNumber >= (numPages || 1)}
              className={styles.pdfControlButton}
            >
              <ChevronRight size={20} color="#e2e8f0" />
            </button>

            <div className={styles.zoomControls}>
              <button
                onClick={() => setScale(prev => Math.max(0.5, prev - 0.1))}
                className={styles.pdfControlButton}
              >
                -
              </button>
              <span className={styles.zoomLevel}>{Math.round(scale * 100)}%</span>
              <button
                onClick={() => setScale(prev => Math.min(2, prev + 0.1))}
                className={styles.pdfControlButton}
              >
                +
              </button>
            </div>
          </div>

          <div className={styles.controlGroup}>
            <a
              href="/Preview.pdf"
              download
              className={styles.pdfControlButton}
            >
              <Download size={20} color="#e2e8f0" />
            </a>

            <motion.button
              className={styles.pdfControlButton}
              onClick={onClose}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <X size={20} color="#e2e8f0" />
            </motion.button>
          </div>
        </div>

        <div className={styles.pdfDocument}>
          <PDFViewer
            file="/Preview.pdf"
            pageNumber={pageNumber}
            scale={scale}
            onLoadSuccess={({ numPages }) => setNumPages(numPages)}
            onError={handleError}
          />
        </div>
      </div>
    </div>
  );
};

export default CustomPDFViewer;