import React from 'react';
import type { Metadata } from 'next';
import './globals.css';
import { SoundProvider } from './contexts/SoundManager';
import ClientLayout from './components/ClientLayout';

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
        <SoundProvider>
          <ClientLayout>
            {children}
          </ClientLayout>
        </SoundProvider>
      </body>
    </html>
  );
}