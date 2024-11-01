'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Download, X } from 'lucide-react';
import { Document, Page } from 'react-pdf';
import { pdfjs } from 'react-pdf';
import styles from './PatternsOfSentience.module.css';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface CustomPDFViewerProps {
  onClose: () => void;
}

interface PDFDocumentLoadSuccess {
  numPages: number;
}

const CustomPDFViewer: React.FC<CustomPDFViewerProps> = ({ onClose }) => {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1);
  const [error, setError] = useState<string | null>(null);

  function onDocumentLoadSuccess({ numPages }: PDFDocumentLoadSuccess): void {
    setNumPages(numPages);
    setError(null);
  }

  function onDocumentLoadError(error: Error): void {
    console.error('Error loading PDF:', error);
    setError('Failed to load PDF. Please try again later.');
  }

  const pageProps = {
    pageNumber,
    scale,
    className: styles.pdfPage,
    renderTextLayer: false,
    renderAnnotationLayer: false,
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
          <Document
            file="/Preview.pdf"
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={onDocumentLoadError}
            loading={
              <div className={styles.loadingIndicator}>
                <div className={styles.loadingSpinner} />
                Loading PDF...
              </div>
            }
          >
            <Page {...pageProps} />
          </Document>
        </div>
      </div>
    </div>
  );
};

export default CustomPDFViewer;