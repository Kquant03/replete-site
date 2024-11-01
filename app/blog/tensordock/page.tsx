// app/blog/tensordock/page.tsx
import { Metadata } from 'next';
import BlogPostContent from './BlogPostContent';

export const metadata: Metadata = {
  title: 'Access Affordable GPUs from TensorDock',
  description: 'Discover how TensorDock democratizes AI development with affordable GPU access across 100+ global locations. Learn about flexible hardware options, from enterprise-grade to cost-optimized solutions.',
  
  openGraph: {
    title: 'Access Affordable GPUs from TensorDock',
    description: 'Get instant access to cost-effective GPU computing with global availability and no hidden fees.',
    type: 'article',
    publishedTime: '2024-11-01T08:22:00.000Z',
    authors: ['Stanley Sebastian'],
    images: [
      {
        url: '/images/tensordock-desktop.webp',
        width: 1200,
        height: 630,
        alt: 'TensorDock - Affordable GPU Infrastructure for AI'
      }
    ]
  },

  twitter: {
    card: 'summary_large_image',
    title: 'Access Affordable GPUs from TensorDock',
    description: 'Get instant access to cost-effective GPU computing with global availability and no hidden fees.',
    images: ['/images/tensordock-desktop.webp']
  },

  alternates: {
    canonical: 'https://repleteai.com/blog/tensordock'
  },

  keywords: [
    'TensorDock',
    'GPU computing',
    'AI infrastructure',
    'cloud computing',
    'machine learning',
    'deep learning',
    'GPU hosting',
    'AI development',
    'affordable GPUs',
    'cloud GPU',
    'NVIDIA GPUs',
    'AI training',
    'GPU instances',
    'cost optimization',
    'cloud infrastructure'
  ],

  category: 'Technology',
  creator: 'Stanley Sebastian',
  publisher: 'Replete Blog',
  
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large'
    }
  },

  other: {
    'article:tag': [
      'Cloud Computing',
      'GPU Infrastructure',
      'Machine Learning',
      'AI Development',
      'Technology',
      'Cloud Optimization',
      'Developer Tools'
    ],
    'article:published_time': '2024-11-01T00:00:00.000Z',
    'article:author': 'https://repleteai.com/about',
    'article:section': 'Technology',
    'og:price:amount': '0',
    'og:price:currency': 'USD',
    'og:availability': 'instock'
  }
};

export default function TensorDockBlogPost() {
  return <BlogPostContent />;
}