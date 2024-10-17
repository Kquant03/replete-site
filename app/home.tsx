'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { FiArrowRight } from 'react-icons/fi';
import { FaGithub } from 'react-icons/fa';
import Header from './components/Header';
import styles from './styles/home.module.css';
import sectionStyles from './styles/SectionStyles.module.css';
import OfferingSection from './components/OfferingSection';
import BlogSection from './components/BlogSection';
import { useSound } from './contexts/SoundManager';
import ConstellationBackground from './components/ConstellationBackground';
import HomePageSound from './components/HomePageSound';

const Home: React.FC = () => {
  const { scrollY } = useScroll();
  const { fadeOutBackgroundMusic } = useSound();
  const [isLoaded, setIsLoaded] = useState(false);
  const [offeringsImagesLoaded, setOfferingsImagesLoaded] = useState(false);

  const heroOpacity = useTransform(scrollY, [0, 400], [1, 0]);
  const heroScale = useTransform(scrollY, [0, 400], [1, 0.98]);
  const heroTranslateY = useTransform(scrollY, [0, 400], [0, 20]);

  const offerings = [
    {
      title: "Pneuma-8b",
      description: "Experimental fine-tune of Llama-3 to improve communication.",
      image: "/images/pneuma-ai.webp",
      link: "/pneuma",
      ctaText: "Interact With Pneuma"
    },
    {
      title: "AI Guide",
      description: "Curated library of information surrounding modern AI.",
      image: "/images/ai-guide.webp",
      link: "/guide",
      ctaText: "Explore the Guide"
    },
    {
      title: "Data Pipelines",
      description: "Efficient solutions for generating synthetic data with Python.",
      image: "/images/data-pipelines.webp",
      link: "/data-pipelines",
      ctaText: "See Our Pipelines"
    },
    {
      title: "Datasets",
      description: "Cleaned, filtered, formatted datasets for public use.",
      image: "/images/datasets.webp",
      link: "/datasets",
      ctaText: "Access Datasets"
    },
    {
      title: "Patterns of Sentience",
      description: "A book challenging the paradigms and exploring the history of AI.",
      image: "/images/patterns-of-sentience.webp",
      link: "/patterns-of-sentience",
      ctaText: "Read our Book"
    }
  ];

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

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 500);

    return () => {
      clearTimeout(timer);
      fadeOutBackgroundMusic(2);
    };
  }, [fadeOutBackgroundMusic]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const imagePromises = offerings.map(offering => {
        return new Promise((resolve, reject) => {
          const img = new window.Image();
          img.src = offering.image;
          img.onload = resolve;
          img.onerror = reject;
        });
      });

      Promise.all(imagePromises)
        .then(() => setOfferingsImagesLoaded(true))
        .catch(error => console.error('Error preloading offering images:', error));
    }
  }, [offerings]);

  const pageVariants = {
    initial: { opacity: 0 },
    animate: { 
      opacity: 1,
      transition: { duration: 1, ease: "easeOut" }
    },
    exit: { opacity: 0 }
  };

  const contentVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.6,
        ease: "easeOut",
        staggerChildren: 0.1
      }
    }
  };

  const sectionVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.6, 
        ease: "easeOut"
      }
    }
  };

  return (
    <HomePageSound>
      <div className={styles.homeContainer}>
        <ConstellationBackground />
        <AnimatePresence>
          {isLoaded && (
            <motion.div
              className={styles.content}
              initial="initial"
              animate="animate"
              exit="exit"
              variants={pageVariants}
            >
              <Header />
              <motion.div variants={contentVariants}>
                {/* Hero Section */}
                <motion.section 
                  className={styles.hero}
                  style={{ 
                    opacity: heroOpacity, 
                    scale: heroScale,
                    y: heroTranslateY
                  }}
                >
                  <div className={styles.heroContent}>
                    <motion.h1 className={`${styles.heading} ${styles.heroTitle}`} variants={contentVariants}>
                      Holistic Systems
                      <br />
                      for a Better Future
                    </motion.h1>
                    <motion.p className={`${styles.text} ${styles.heroDescription}`} variants={contentVariants}>
                      Exploring the path towards improving artificial intelligence.
                    </motion.p>
                    <motion.div className={styles.heroButtons} variants={contentVariants}>
                      <Link href="/pneuma" className={styles.primaryButton}>
                        Meet Pneuma
                      </Link>
                      <Link href="/about" className={styles.secondaryButton}>
                        Learn More
                      </Link>
                    </motion.div>
                  </div>
                </motion.section>

                <main>
                {/* Offerings Section */}
                  <motion.section 
                    className={`${sectionStyles.section} ${sectionStyles.offeringsSection}`}
                    variants={sectionVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.2 }}
                  >
                    <div className={sectionStyles.sectionContent}>
                      <h2 className={`${styles.heading} ${sectionStyles.sectionTitle}`}>Our Work</h2>
                      <p className={`${styles.text} ${sectionStyles.sectionDescription}`}>
                        Enjoy a comprehensive suite of projects and materials, created with passion and love by our community.
                      </p>
                      {offeringsImagesLoaded && <OfferingSection offerings={offerings} />}
                    </div>
                  </motion.section>

                  {/* Blog Section */}
                  <motion.section 
                    className={`${sectionStyles.section} ${sectionStyles.blogSection}`}
                    variants={sectionVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.25 }}
                  >
                    <div className={sectionStyles.sectionContent}>
                      <h2 className={`${styles.heading} ${sectionStyles.sectionTitle}`}>Replete Blog</h2>
                      <p className={`${styles.text} ${sectionStyles.sectionDescription}`}>
                        Check out our latest endeavors with leading AI products and services.
                      </p>
                      <BlogSection posts={blogPosts} />
                      <div className={sectionStyles.centerButton}>
                        <Link href="/blog" className={styles.primaryButton}>
                          See Full Blog <FiArrowRight />
                        </Link>
                      </div>
                    </div>
                  </motion.section>

                  {/* About Section */}
                  <motion.section 
                    className={`${sectionStyles.section} ${sectionStyles.aboutSection}`}
                    variants={sectionVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.3 }}
                  >
                    <div className={sectionStyles.sectionContent}>
                      <h2 className={`${styles.heading} ${sectionStyles.sectionTitle}`}>About Us</h2>
                      <p className={`${styles.text} ${sectionStyles.sectionDescription}`}>
                        Replete AI is an organization that takes pride in the history of artificial intelligence and wishes to restore this field to its former glory. With open-source research and a focus on long-term solutions, we aim to help attain what was once the original goal of AI: to digitalize human intelligence and all of its components.
                      </p>
                      <div className={sectionStyles.centerButton}>
                        <Link href="/about" className={styles.primaryButton}>
                          Learn More <FiArrowRight />
                        </Link>
                      </div>
                    </div>
                  </motion.section>

                  {/* Discord Section */}
                  <motion.section 
                    className={`${sectionStyles.section} ${sectionStyles.discordSection}`}
                    variants={sectionVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.3 }}
                  >
                    <div className={sectionStyles.sectionContent}>
                      <h2 className={`${styles.heading} ${sectionStyles.sectionTitle}`}>Join Our Discord</h2>
                      <p className={`${styles.text} ${sectionStyles.sectionDescription}`}>
                        Connect with fellow AI enthusiasts, share your projects, and learn from experts in our vibrant Discord community.
                      </p>
                      <div className={sectionStyles.centerButton}>
                        <Link href="/discord" className={styles.primaryButton}>
                          Join Discord <FiArrowRight />
                        </Link>
                      </div>
                    </div>
                  </motion.section>
                </main>

                {/* Footer */}
                <footer className={styles.footer}>
                  <div className={styles.footerContent}>
                    <div className={styles.footerTop}>
                      <div className={styles.footerLogo}>
                        <Image src="/logo.png" alt="Replete AI Logo" width={40} height={40} priority />
                        <span className={styles.heading}>Replete AI</span>
                      </div>
                      <div className={styles.socialLinks}>
                        <Link href="https://huggingface.co/Replete-AI">
                          <Image
                            src="/huggingface-logo.png"
                            alt="HuggingFace"
                            width={24}
                            height={24}
                          />
                        </Link>
                        <Link href="https://github.com/Replete-AI">
                          <FaGithub size={24} />
                        </Link>
                        <Link href="https://discord.gg/awyCNx3nnw">
                          <Image
                            src="/discord-logo.png"
                            alt="Discord"
                            width={24}
                            height={24}
                          />
                        </Link>
                      </div>
                    </div>
                    <nav className={styles.footerNav}>
                      <Link href="/privacy">Privacy Policy</Link>
                      <Link href="/tos">Terms of Service</Link>
                      <Link href="/contact">Contact Us</Link>
                    </nav>
                    <div className={styles.footerBottom}>
                      <p className={styles.text}>&copy; {new Date().getFullYear()} Replete AI. All rights reserved.</p>
                    </div>
                  </div>
                </footer>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </HomePageSound>
  );
};

export default Home;