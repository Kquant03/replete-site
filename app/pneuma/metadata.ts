// app/pneuma/metadata.ts
import { Metadata } from 'next'

export const metadata: Metadata = {
  metadataBase: new URL('https://www.repleteai.com'),
  
  title: {
    default: 'Pneuma AI - Advanced Conversational AI Companion',
    template: '%s | Pneuma AI'
  },
  description: 'Experience deeply engaging conversations with Pneuma, an emotionally intelligent AI companion designed for meaningful dialogue and genuine interaction. Discover a new kind of AI relationship that adapts to you.',
  
  openGraph: {
    title: 'Pneuma AI - Advanced Conversational AI Companion',
    description: 'Connect with Pneuma, an emotionally intelligent AI designed for meaningful dialogue and genuine interaction. Experience conversations that feel natural, personal, and engaging.',
    url: 'https://www.repleteai.com/pneuma',
    siteName: 'Pneuma AI',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: '/images/pneuma-ai.webp',
        width: 1200,
        height: 630,
        alt: 'Pneuma AI - Advanced Conversational Interface',
        type: 'image/webp'
      }
    ]
  },
  
  twitter: {
    card: 'summary_large_image',
    title: 'Pneuma AI - Advanced Conversational Companion',
    description: 'Experience a new kind of AI conversation with emotional intelligence and genuine interaction.',
    images: [{
      url: '/images/pneuma-ai.webp',
      width: 1200,
      height: 630,
      alt: 'Pneuma AI - Advanced Conversational Interface',
      type: 'image/webp'
    }]
  },

  keywords: [
    'Pneuma AI',
    'emotional intelligence AI',
    'advanced AI companion',
    'conversational AI',
    'adaptive chat AI',
    'personal AI assistant',
    'natural dialogue system',
    'interactive AI',
    'AI personality',
    'deep learning conversation',
    'contextual AI',
    'empathetic AI',
    'intelligent chat',
    'AI companionship',
    'neural conversation'
  ],

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },

  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
    yandex: process.env.NEXT_PUBLIC_YANDEX_VERIFICATION,
  },

  category: 'technology'
}

export const pneumaJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Pneuma AI',
  applicationCategory: 'ChatApplication',
  description: 'An advanced AI companion with emotional intelligence, designed for meaningful and natural conversations that adapt to each user.',
  url: 'https://www.repleteai.com/pneuma',
  operatingSystem: 'Any',
  applicationSubCategory: 'Artificial Intelligence',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD'
  },
  author: {
    '@type': 'Organization',
    name: 'Replete AI',
    url: 'https://www.repleteai.com'
  },
  review: {
    '@type': 'Review',
    reviewRating: {
      '@type': 'Rating',
      ratingValue: '5',
      bestRating: '5'
    },
    author: {
      '@type': 'Organization',
      name: 'Replete AI'
    }
  },
  featureList: [
    'Emotional intelligence',
    'Natural conversation',
    'Contextual awareness',
    'Personalized interactions',
    'Memory and adaptation',
    'Conversation history',
    'Real-time responses',
    'User authentication'
  ],
  screenshot: {
    '@type': 'ImageObject',
    url: 'https://www.repleteai.com/images/pneuma-ai.webp',
    width: '1200',
    height: '630',
    caption: 'Pneuma AI Conversational Interface'
  }
}