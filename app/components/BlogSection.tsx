import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
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
  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  return (
    <motion.div 
      className={styles.blogGrid}
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
    >
      {posts.map((post, index) => (
        <motion.div 
          key={index} 
          className={styles.postCard}
          variants={itemVariants}
        >
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
        </motion.div>
      ))}
    </motion.div>
  );
};

export default BlogSection;