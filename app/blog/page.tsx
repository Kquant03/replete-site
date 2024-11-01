'use client';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './Blog.module.css';
import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';

const blogPosts = [
  {
    title: "Free and Fast LLMs with Groq®",
    excerpt: "Implement frontier LLMs at speed using GroqCloud's free API.",
    mobileImage: "/images/groq-mobile.webp",
    desktopImage: "/images/groq-desktop.webp",
    link: "/blog/groq"
  },
  {
    title: "Develop AI Applications with SGLang",
    excerpt: "A fast serving framework for large language models and vision language models.",
    mobileImage: "/images/sglang-mobile.webp",
    desktopImage: "/images/sglang-desktop.webp",
    link: "/blog/sglang"
  },
  {
    title: "Access Affordable GPUs from TensorDock",
    excerpt: "A wide selection of GPUs at a fraction of the cost.",
    mobileImage: "/images/tensordock-mobile.webp",
    desktopImage: "/images/tensordock-desktop.webp",
    link: "/blog/tensordock"
  }
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.3,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      staggerChildren: 0.1,
      staggerDirection: -1,
      when: "afterChildren",
    },
  },
};

const headerVariants = {
  hidden: { 
    y: -100,
    opacity: 0,
    rotateX: 45,
  },
  visible: {
    y: 0,
    opacity: 1,
    rotateX: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15,
      duration: 0.8,
    },
  },
  exit: {
    y: -100,
    opacity: 0,
    rotateX: 45,
    transition: {
      duration: 0.5,
    },
  },
};

const cardVariants = {
  hidden: (index: number) => ({
    x: index % 2 === 0 ? -100 : 100,
    y: 50,
    opacity: 0,
    rotateY: index % 2 === 0 ? -15 : 15,
  }),
  visible: {
    x: 0,
    y: 0,
    opacity: 1,
    rotateY: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15,
      duration: 0.8,
    },
  },
  exit: (index: number) => ({
    x: index % 2 === 0 ? -100 : 100,
    y: 50,
    opacity: 0,
    rotateY: index % 2 === 0 ? -15 : 15,
    transition: {
      duration: 0.5,
    },
  }),
  hover: {
    y: -12,
    scale: 1.02,
    rotateY: 0,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 10,
    },
  },
};

const backgroundGridVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 1.2,
      ease: "easeOut",
    },
  },
  exit: {
    opacity: 0,
    scale: 1.2,
    transition: {
      duration: 0.5,
    },
  },
};

export default function Blog() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <AnimatePresence mode="wait">
      <motion.div 
        className={styles.blogContainer}
        initial="hidden"
        animate="visible"
        exit="exit"
        variants={containerVariants}
      >
        <motion.div 
          className={styles.backgroundGrid}
          variants={backgroundGridVariants}
        />
        
        <motion.div 
          className={styles.blogHeader}
          variants={headerVariants}
        >
          <motion.h1 
            className={styles.heading}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
          >
            AI Engineering Blog
          </motion.h1>
          <motion.p 
            className={styles.subheading}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            Practical guides for implementing AI solutions
          </motion.p>
        </motion.div>

        <motion.div 
          className={styles.postsGrid}
          variants={containerVariants}
        >
          {blogPosts.map((post, index) => (
            <motion.div
              key={post.link}
              className={styles.postCard}
              custom={index}
              variants={cardVariants}
              whileHover="hover"
              layoutId={`post-${index}`}
            >
              <Link href={post.link}>
                <div className={styles.postImageWrapper}>
                  <Image 
                    src={isMobile ? post.mobileImage : post.desktopImage}
                    alt={post.title}
                    fill 
                    className={styles.postImage}
                    priority={index < 2}
                  />
                </div>
                <motion.div 
                  className={styles.postContent}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <h2 className={styles.postTitle}>{post.title}</h2>
                  <p className={styles.postExcerpt}>{post.excerpt}</p>
                  <motion.div 
                    className={styles.readMore}
                    whileHover={{ x: 10 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    Read Article →
                  </motion.div>
                </motion.div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}