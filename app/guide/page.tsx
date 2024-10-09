import { Metadata } from 'next';
import ClientPage from './ClientPage';

export const metadata: Metadata = {
  title: 'AI Guide',
  description: 'Comprehensive guide for AI technologies and applications',
};

export default function GuidePage() {
  return <ClientPage />;
}