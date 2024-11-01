// app/blog/groq/page.tsx
'use client';

import { motion } from 'framer-motion';
import styles from './BlogPost.module.css';
import Link from 'next/link';

export default function GroqBlogPost() {
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
          Free and Fast LLMs with Groq®
        </motion.h1>
        <motion.div 
          className={styles.metadata}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <span>November 2024</span>
          <span>•</span>
          <span>5 min read</span>
        </motion.div>
      </div>

      <motion.div 
        className={styles.content}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.6 }}
      >
        <p className={styles.intro}>
          In the rapidly evolving landscape of AI, speed and cost are crucial factors for developers. 
          Groq&apos;s LPU™ (Language Processing Unit) technology is revolutionizing how we interact with 
          large language models, offering blazingly fast inference times at no cost through their 
          public API.
        </p>

        <section className={styles.section}>
          <h2>Why Groq?</h2>
          <ul className={styles.features}>
            <motion.li 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 }}
            >
              <strong>Speed:</strong> Response times as low as 1-2ms per token
            </motion.li>
            <motion.li
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.9 }}
            >
              <strong>Free Tier:</strong> Generous API access at no cost
            </motion.li>
            <motion.li
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.0 }}
            >
              <strong>Model Support:</strong> Access to Mixtral, Llama, and more
            </motion.li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2>Getting Started</h2>
          <p>
            Let&apos;s implement a simple chat interface using Groq&apos;s API. First, you&apos;ll need to:
          </p>
          <ol className={styles.steps}>
            <li>Sign up for a free account at console.groq.com</li>
            <li>Generate an API key</li>
            <li>Install the Groq Python package</li>
          </ol>

          <div className={styles.codeBlock}>
            <code>pip install groq</code>
          </div>
        </section>

        <section className={styles.section}>
          <h2>Implementation Example</h2>
          <div className={styles.codeBlock}>
            <pre>{`import os
from groq import Groq

# Initialize the Groq client
client = Groq(
    api_key=os.environ["GROQ_API_KEY"],
)

def generate_response(prompt: str):
    # Create a chat completion
    chat_completion = client.chat.completions.create(
        messages=[
            {
                "role": "user",
                "content": prompt,
            }
        ],
        model="mixtral-8x7b-32768",
        temperature=0.7,
        max_tokens=1024,
        stream=True,  # Enable streaming
    )

    # Process the streaming response
    for chunk in chat_completion:
        # Print each chunk as it arrives
        if chunk.choices[0].delta.content is not None:
            print(chunk.choices[0].delta.content, end="")

# Example usage
prompt = "Explain the benefits of using Groqs LPU technology"
generate_response(prompt)`}</pre>
          </div>
        </section>

        <section className={styles.section}>
          <h2>Performance Comparison</h2>
          <div className={styles.performanceGrid}>
            <div className={styles.perfCard}>
              <h3>Groq LPU™</h3>
              <p>1-2ms/token</p>
            </div>
            <div className={styles.perfCard}>
              <h3>Traditional GPU</h3>
              <p>50-100ms/token</p>
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <h2>Best Practices</h2>
          <ul className={styles.bestPractices}>
            <li>Use streaming for real-time responses</li>
            <li>Implement proper error handling</li>
            <li>Monitor rate limits</li>
            <li>Cache responses when appropriate</li>
          </ul>
        </section>

        <div className={styles.callToAction}>
          <Link href="https://console.groq.com/login" className={styles.ctaButton}>
            Get Started with Groq
          </Link>
        </div>
      </motion.div>
    </motion.article>
  );
}