// app/blog/sglang/page.tsx
import { Metadata } from 'next';
import BlogPostContent from './BlogPostContent';

export const metadata: Metadata = {
  title: 'Develop AI Applications with SGLang | Replete Blog',
  description: 'Learn how SGLang revolutionizes LLM programming with 6.4× higher throughput, efficient KV cache reuse, and streamlined development. Discover optimal practices for building complex AI applications.',
  
  openGraph: {
    title: 'Develop AI Applications with SGLang',
    description: 'Build faster, more efficient AI applications with SGLang optimized framework for LLM development.',
    type: 'article',
    publishedTime: '2024-11-01T07:42:00.000Z',
    authors: ['Stanley Sebastian'],
    images: [
      {
        url: '/images/sglang-desktop.webp',
        width: 1200,
        height: 630,
        alt: 'SGLang - Efficient LLM Programming Framework'
      }
    ]
  },

  twitter: {
    card: 'summary_large_image',
    title: 'Develop AI Applications with SGLang',
    description: 'Learn how SGLang revolutionizes LLM programming with 6.4× higher throughput.',
    images: ['/images/sglang-desktop.webp']
  },

  alternates: {
    canonical: 'https://repleteai.com/blog/sglang'
  },

  keywords: [
    'SGLang',
    'LLM programming',
    'AI development',
    'RadixAttention',
    'KV cache optimization',
    'machine learning',
    'artificial intelligence',
    'language models',
    'AI engineering',
    'model inference'
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
      'AI Development',
      'Machine Learning',
      'Programming',
      'Technology',
      'Software Engineering'
    ],
    'article:published_time': '2024-11-01T00:00:00.000Z',
    'article:author': 'https://repleteai.com/about',
    'article:section': 'Technology'
  }
};

export default function SGLangBlogPost() {
  return <BlogPostContent />;
}