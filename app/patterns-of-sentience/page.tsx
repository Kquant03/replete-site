import type { Metadata } from 'next';
import { BookLandingPage } from './BookLandingPage';

const bookDetails = {
  title: "Patterns of Sentience",
  subtitle: "A groundbreaking exploration of artificial intelligence and its implications for humanity",
  description: `"Patterns of Sentience" delves into the fascinating world of artificial intelligence and its profound impact on our society. Written by the Replete AI community, this book offers a unique perspective on the development and future of AI, exploring the intricate patterns that emerge as we create increasingly sophisticated artificial minds.`,
  authors: ["S.L. Jackson", "Stanley Sebastian"],
  publishedDate: "2024",
  publisher: "Replete AI",
  isbn: "978-XXXXXXXXXX", // Replace with actual ISBN
  pages: 60,
  language: "English",
  price: {
    amount: 14.99,
    currency: "USD"
  },
  url: "https://replete.ai/books/patterns-of-sentience",
  coverImage: {
    url: "https://replete.ai/images/patterns-of-sentience.webp",
    width: 1200,
    height: 1800,
    alt: "Patterns of Sentience Book Cover - An artistic representation of artificial consciousness"
  }
};

// Structured data for Google Rich Results
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Book",
  name: bookDetails.title,
  description: bookDetails.description,
  author: bookDetails.authors.map(author => ({
    "@type": "Person",
    name: author
  })),
  publisher: {
    "@type": "Organization",
    name: bookDetails.publisher
  },
  isbn: bookDetails.isbn,
  numberOfPages: bookDetails.pages,
  inLanguage: bookDetails.language,
  datePublished: bookDetails.publishedDate,
  image: bookDetails.coverImage.url,
  offers: {
    "@type": "Offer",
    price: bookDetails.price.amount,
    priceCurrency: bookDetails.price.currency,
    availability: "https://schema.org/InStock",
    url: bookDetails.url
  },
  genre: ["Artificial Intelligence", "Technology", "Computer Science", "Philosophy"],
  audience: {
    "@type": "Audience",
    audienceType: ["Professional", "Academic", "General Interest"]
  },
  abstract: bookDetails.description,
  keywords: [
    "artificial intelligence",
    "machine learning",
    "AI consciousness",
    "sentience",
    "technology ethics",
    "future of AI",
    "artificial consciousness",
    "AI development",
    "machine intelligence",
    "cognitive science",
    "AI philosophy",
    "technological singularity",
    "computational intelligence",
    "neural networks",
    "deep learning"
  ]
};

export const metadata: Metadata = {
  metadataBase: new URL('https://replete.ai'),
  title: {
    default: bookDetails.title,
    template: `%s | ${bookDetails.title}`,
  },
  description: bookDetails.description,
  applicationName: 'Replete AI Books',
  authors: bookDetails.authors.map(author => ({ name: author })),
  generator: 'Next.js',
  keywords: [
    'artificial intelligence book',
    'AI consciousness',
    'machine learning',
    'technological singularity',
    'AI ethics',
    'future of AI',
    'artificial consciousness',
    'machine intelligence',
    'AI development',
    'neural networks',
    'deep learning',
    'AI philosophy',
    'cognitive science',
    'computational intelligence',
    'technology ethics'
  ],
  referrer: 'origin-when-cross-origin',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0b0015' }
  ],
  creator: bookDetails.authors.join(' & '),
  publisher: bookDetails.publisher,
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  
  openGraph: {
    type: 'book',
    title: bookDetails.title,
    description: bookDetails.description,
    siteName: 'Replete AI Books',
    locale: 'en_US',
    url: bookDetails.url,
    images: [
      {
        url: bookDetails.coverImage.url,
        width: bookDetails.coverImage.width,
        height: bookDetails.coverImage.height,
        alt: bookDetails.coverImage.alt,
      }
    ],
    authors: bookDetails.authors,
    // Remove publishedTime as it's not supported in OpenGraphBook type
    tags: ['AI', 'Technology', 'Computer Science', 'Philosophy', 'Big Tech'],
    // ISBN can be included in the structured data but not in OpenGraph for Next.js
  },

  twitter: {
    card: 'summary_large_image',
    title: bookDetails.title,
    description: bookDetails.description,
    creator: '@RepleteAI',
    images: [bookDetails.coverImage.url],
  },

  alternates: {
    canonical: bookDetails.url,
    languages: {
      'en-US': bookDetails.url,
    },
  },

  category: 'Technology',
  classification: 'Books/Technology/Artificial Intelligence',
};

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <BookLandingPage />
    </>
  );
}

// Revalidate the page every 24 hours
export const revalidate = 86400;