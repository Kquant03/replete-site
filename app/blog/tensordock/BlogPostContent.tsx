// app/blog/tensordock/page.tsx
'use client';

import { motion } from 'framer-motion';
import styles from './BlogPost.module.css';
import Link from 'next/link';

export default function TensorDockBlogPost() {
  return (
    <motion.article 
      className={styles.blogPost}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
    >
      <div className={styles.heroSection}>
        <motion.h1 
          className={styles.title}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          Access Affordable GPUs from TensorDock
        </motion.h1>
        <motion.div 
          className={styles.metadata}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <span>November 2024</span>
          <span>•</span>
          <span>8 min read</span>
        </motion.div>
      </div>

      <motion.div 
        className={styles.content}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.6 }}
      >
        <section className={styles.introduction}>
          <p>
            With AI development costs skyrocketing and GPU availability becoming increasingly scarce,
            finding affordable and accessible compute resources is crucial. TensorDock is revolutionizing
            AI infrastructure access by connecting developers to a global network of GPUs at
            industry-leading prices, without the traditional barriers of quotas or hidden fees.
          </p>
        </section>

        <section className={styles.section}>
          <h2>Why TensorDock?</h2>
          <div className={styles.featureGrid}>
            <div className={styles.featureCard}>
              <h3>True On-Demand Access</h3>
              <p>
                No quotas, no hidden fees, and no minimum commitments. Get instant access to GPUs
                when you need them, with transparent pricing for all customers.
              </p>
            </div>
            <div className={styles.featureCard}>
              <h3>Global Infrastructure</h3>
              <p>
                Choose from 100+ locations worldwide, with both high-end Tier 3/4 data centers
                and cost-optimized options to suit your specific needs.
              </p>
            </div>
            <div className={styles.featureCard}>
              <h3>Flexible Options</h3>
              <p>
                From converted mining rigs for maximum price-to-performance to enterprise-grade
                hardware for production workloads, find the perfect balance for your project.
              </p>
            </div>
            <div className={styles.featureCard}>
              <h3>24/7 Support</h3>
              <p>
                Access round-the-clock technical support with industry-leading response times,
                ensuring your AI workloads run smoothly.
              </p>
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <h2>Available Hardware</h2>
          <div className={styles.hardwareGrid}>
            <div className={styles.hardwareCard}>
              <h3>Enterprise Grade</h3>
              <ul className={styles.specList}>
                <li>NVIDIA A100/H100 GPUs</li>
                <li>Tier 3/4 Data Centers</li>
                <li>Maximum reliability</li>
                <li>Production workloads</li>
              </ul>
            </div>
            <div className={styles.hardwareCard}>
              <h3>Cost Optimized</h3>
              <ul className={styles.specList}>
                <li>RTX 3090/4090 GPUs</li>
                <li>Converted mining hardware</li>
                <li>Best price/performance</li>
                <li>Development & training</li>
              </ul>
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <h2>Getting Started</h2>
          <div className={styles.steps}>
            <div className={styles.step}>
              <h3>1. Sign Up</h3>
              <p>
                Create an account at TensorDock.com with just an email and password.
                No credit card required to explore options.
              </p>
            </div>
            <div className={styles.step}>
              <h3>2. Choose Your Hardware</h3>
              <p>
                Browse available GPUs by location, specifications, and price. Filter for
                your specific needs like CUDA version or driver requirements.
              </p>
            </div>
            <div className={styles.step}>
              <h3>3. Deploy Your Instance</h3>
              <p>
                Select your preferred OS image, add SSH keys, and launch your instance
                with just a few clicks. Get started in minutes.
              </p>
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <h2>Cost Optimization Tips</h2>
          <div className={styles.tipsContainer}>
            <div className={styles.tip}>
              <h3>Use Spot Instances</h3>
              <p>
                Take advantage of spot pricing for non-time-critical workloads to save
                up to 70% on compute costs.
              </p>
            </div>
            <div className={styles.tip}>
              <h3>Choose the Right Location</h3>
              <p>
                Different locations offer varying prices. Balance between cost and
                latency based on your needs.
              </p>
            </div>
            <div className={styles.tip}>
              <h3>Optimize Instance Size</h3>
              <p>
                Match your instance specifications to your workload requirements to
                avoid paying for unused capacity.
              </p>
            </div>
            <div className={styles.tip}>
              <h3>Monitor Usage</h3>
              <p>
                Use TensorDock&apos;s monitoring tools to track usage and costs in real-time,
                helping identify optimization opportunities.
              </p>
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <h2>Community Impact</h2>
          <p className={styles.communityText}>
            TensorDock is committed to democratizing AI development, supporting students and
            researchers with free infrastructure for hackathons and educational projects. They&apos;ve
            helped over 3,000 students across 1,000+ projects, sponsoring numerous events to
            foster innovation in the AI community.
          </p>
        </section>

        <section className={styles.section}>
          <h2>Start Building Today</h2>
          <p>
            Join the growing community of AI developers who are building the future with
            TensorDock&apos;s affordable and accessible GPU infrastructure.
          </p>
          <div className={styles.ctaContainer}>
            <Link 
              href="https://tensordock.com"
              className={styles.ctaButton}
              target="_blank"
              rel="noopener noreferrer"
            >
              Get Started with TensorDock
            </Link>
          </div>
        </section>
      </motion.div>
    </motion.article>
  );
}