import { Metadata } from 'next';
import ClientPage from './ClientPage';

export const metadata: Metadata = {
  title: 'Comprehensive AI Guide',
  description: 'Complete guide covering modern AI technologies including LLMs, Stable Diffusion, Text-to-Speech, model architectures, fine-tuning techniques, and practical implementations.',
  keywords: [
    'artificial intelligence',
    'machine learning',
    'LLM',
    'large language models',
    'GPT',
    'Llama',
    'Mistral',
    'Mixtral',
    'Stable Diffusion',
    'text generation',
    'image generation',
    'text to speech',
    'AI guide',
    'model architectures',
    'fine-tuning',
    'model training',
    'neural networks',
    'deep learning',
    'AI development',
    'machine learning tutorials'
  ],
  authors: [{ name: 'AI Development Community' }],
  creator: 'AI Development Community',
  publisher: 'AI Development Community',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  category: 'technology',
  
  // Open Graph
  openGraph: {
    title: 'Comprehensive AI Guide | Modern Machine Learning Technologies',
    description: 'In-depth guide covering cutting-edge AI technologies: LLMs, Stable Diffusion, model architectures, training, and implementations.',
    url: 'https://yourdomain.com/guide',
    siteName: 'AI Development Guide',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: '/images/ai-guide.webp', // Update with actual image
        width: 1200,
        height: 630,
        alt: 'AI Development Guide Cover Image',
      },
    ],
  },

  // Twitter
  twitter: {
    card: 'summary_large_image',
    title: 'Complete AI Development Guide',
    description: 'Master modern AI technologies with our comprehensive guide. From LLMs to Stable Diffusion.',
    images: ['/images/ai-guide.webp'], // Update with actual image
    creator: '@yourtwitterhandle', // Update with actual handle
  },

  // Robots
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

  // Verification
  verification: {
    google: 'your-google-site-verification', // Add your verification code
    yandex: 'your-yandex-verification',
    yahoo: 'your-yahoo-verification',
  },

  // Alternative languages
  alternates: {
    canonical: 'https://yourdomain.com/guide',
    languages: {
      'en-US': 'https://yourdomain.com/guide',
      // Add other language versions if available
    },
  },

  // Icons
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
    other: {
      rel: 'apple-touch-icon-precomposed',
      url: '/apple-touch-icon-precomposed.png',
    },
  },

  // Manifest
  manifest: '/manifest.json',

  // Theme color
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0b0015' },
  ],

  // Viewport
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },

  // App specific
  appleWebApp: {
    capable: true,
    title: 'AI Guide',
    statusBarStyle: 'black-translucent',
  },

  // Other
  classification: 'Educational',
  referrer: 'origin-when-cross-origin',
  applicationName: 'AI Development Guide',
};

export default function GuidePage() {
  return <ClientPage />;
}