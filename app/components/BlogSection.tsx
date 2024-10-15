import React, { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from '../styles/BlogSection.module.css';

interface BlogPost {
  title: string;
  excerpt: string;
  mobileImage: string;
  desktopImage: string;
  link: string;
}

interface BlogSectionProps {
  posts: BlogPost[];
}

const BlogSection: React.FC<BlogSectionProps> = ({ posts }) => {
  useEffect(() => {
    posts.forEach(post => {
      const mobileImg = new window.Image();
      mobileImg.src = post.mobileImage;
      const desktopImg = new window.Image();
      desktopImg.src = post.desktopImage;
    });
  }, [posts]);

  return (
    <div className={styles.blogGrid}>
      {posts.map((post, index) => (
        <div key={index} className={styles.postCard}>
          <Link href={post.link}>
            <div className={styles.postImage}>
              <Image 
                src={post.mobileImage} 
                alt={post.title} 
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className={styles.mobileImage}
              />
              <Image 
                src={post.desktopImage} 
                alt={post.title} 
                fill
                sizes="50vw"
                className={styles.desktopImage}
              />
            </div>
            <div className={styles.postContent}>
              <h3 className={styles.postTitle}>{post.title}</h3>
              <p className={styles.postExcerpt}>{post.excerpt}</p>
              <div className={styles.readMore}>Read More &rarr;</div>
            </div>
          </Link>
        </div>
      ))}
    </div>
  );
};

export default BlogSection;