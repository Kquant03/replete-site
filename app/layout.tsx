import React from 'react';
import type { Metadata } from 'next';
import './globals.css';
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
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}