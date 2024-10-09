// app/blog/page.tsx
import styles from './Blog.module.css';
import Link from 'next/link';
import Image from 'next/image';

const blogPosts = [
  {
    id: 1,
    title: 'The Future of AI: Trends and Predictions',
    excerpt: 'Explore the latest trends and predictions in the field of artificial intelligence...',
    slug: 'future-of-ai',
    image: '/images/blog/future-of-ai.webp',
  },
  {
    id: 2,
    title: 'How AI is Revolutionizing Healthcare',
    excerpt: 'Discover how artificial intelligence is transforming the healthcare industry...',
    slug: 'ai-in-healthcare',
    image: '/images/blog/ai-in-healthcare.webp',
  },
  // Add more blog posts here
];

export default function Blog() {
  return (
    <div className={styles.blogContainer}>
      <div className={styles.blogHeader}>
        <h1 className={styles.heading}>Replete AI Blog</h1>
        <p className={styles.subheading}>Stay at the forefront of artificial intelligence</p>
      </div>
      <div className={styles.postsGrid}>
        {blogPosts.map((post) => (
          <div key={post.id} className={styles.postCard}>
            <Link href={`/blog/${post.slug}`}>
              <div className={styles.postImageWrapper}>
                <Image src={post.image} alt={post.title} fill className={styles.postImage} />
              </div>
              <div className={styles.postContent}>
                <h2 className={styles.postTitle}>{post.title}</h2>
                <p className={styles.postExcerpt}>{post.excerpt}</p>
                <div className={styles.readMore}>Read More &rarr;</div>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}