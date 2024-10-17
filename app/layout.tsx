import React from 'react';
import type { Metadata } from 'next';
import './globals.css';
import ClientWrapper from './components/ClientWrapper';

export const metadata: Metadata = {
  title: 'Replete AI',
  description: 'Exploring the path towards improving artificial intelligence.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <ClientWrapper>
          {children}
        </ClientWrapper>
      </body>
    </html>
  );
}