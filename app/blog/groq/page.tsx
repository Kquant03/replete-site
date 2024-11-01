// app/blog/groq/page.tsx
import { Metadata } from 'next';
import BlogPostContent from './BlogPostContent';

export const metadata: Metadata = {
  title: 'Free and Fast LLMs with Groq® | Replete Blog',
  description: 'Explore how Groq LPU™ technology delivers unprecedented 1-2ms token inference speeds for LLMs. Learn to implement fast, free AI with Python examples and best practices.',
  
  openGraph: {
    title: 'Free and Fast LLMs with Groq®',
    description: 'Experience blazing-fast 1-2ms per token inference with Groq LPU™ technology. Get started with free API access.',
    type: 'article',
    publishedTime: '2024-11-01T06:43:00.000Z',
    authors: ['Stanley Sebastian'],
    images: [
      {
        url: '/images/groq-og.webp',
        width: 1200,
        height: 630,
        alt: 'Groq LPU Technology - Ultra-fast LLM Inference'
      }
    ]
  },

  twitter: {
    card: 'summary_large_image',
    title: 'Free and Fast LLMs with Groq®',
    description: 'Experience 1-2ms per token inference with Groq LPU™. Free API access available.',
    images: ['/images/groq-og.webp']
  },

  alternates: {
    canonical: 'https://repleteai.com/blog/groq'
  },

  keywords: [
    'Groq',
    'LPU technology',
    'Language Processing Unit',
    'fast inference',
    'AI acceleration',
    'LLM API',
    'Mixtral',
    'Llama models',
    'machine learning',
    'AI development',
    'inference optimization',
    'free API',
    'streaming inference',
    'token latency',
    'Python API',
    'real-time AI'
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
      'AI Infrastructure',
      'Machine Learning',
      'API Development',
      'Performance Optimization',
      'Cloud Computing',
      'Developer Tools',
      'Language Models'
    ],
    'article:published_time': '2024-11-01T00:00:00.000Z',
    'article:author': 'https://repleteai.com/about',
    'article:section': 'Technology',
    'og:price:amount': '0',
    'og:price:currency': 'USD',
    'product:availability': 'in stock',
    'product:condition': 'new',
    'product:price:amount': '0',
    'product:price:currency': 'USD',
    'tech:specification:inference_speed': '1-2ms per token',
    'tech:specification:supported_models': 'Mixtral, Llama',
    'tech:specification:technology': 'LPU (Language Processing Unit)'
  }
};

export default function GroqBlogPost() {
  return <BlogPostContent />;
}