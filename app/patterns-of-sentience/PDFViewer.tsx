'use client';

import React, { useEffect, useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import styles from './PatternsOfSentience.module.css';

// Configure worker - using dynamic import path
if (typeof window !== 'undefined') {
  pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
}

interface PDFViewerProps {
  file: string;
  pageNumber: number;
  scale: number;
  onLoadSuccess: (data: { numPages: number }) => void;
  onError: (error: Error) => void;
}

const PDFViewer: React.FC<PDFViewerProps> = ({
  file,
  pageNumber,
  scale,
  onLoadSuccess,
  onError,
}) => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className={styles.loadingIndicator}>
        <div className={styles.loadingSpinner} />
        Initializing PDF viewer...
      </div>
    );
  }

  return (
    <Document
      file={file}
      onLoadSuccess={onLoadSuccess}
      onLoadError={(error: Error) => {
        console.error('Document load error:', error);
        onError(error);
      }}
      loading={
        <div className={styles.loadingIndicator}>
          <div className={styles.loadingSpinner} />
          Loading PDF...
        </div>
      }
    >
      <Page
        pageNumber={pageNumber}
        scale={scale}
        className={styles.pdfPage}
        renderTextLayer={false}
        renderAnnotationLayer={false}
      />
    </Document>
  );
};

export default PDFViewer;