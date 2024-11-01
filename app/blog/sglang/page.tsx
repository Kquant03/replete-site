// app/blog/sglang/page.tsx
'use client';

import { motion } from 'framer-motion';
import styles from './BlogPost.module.css';
import Link from 'next/link';

export default function SGLangBlogPost() {
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
          Develop AI Applications with SGLang
        </motion.h1>
        <motion.div 
          className={styles.metadata}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <span>April 2024</span>
          <span>•</span>
          <span>10 min read</span>
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
            As Large Language Models evolve, developers face increasing complexity in building applications
            that require multiple model calls, advanced prompting techniques, and structured outputs.
            SGLang addresses these challenges by providing an efficient framework for both programming
            and executing complex LLM workflows.
          </p>
        </section>

        <section className={styles.section}>
          <h2>Why SGLang?</h2>
          <div className={styles.featureGrid}>
            <div className={styles.featureCard}>
              <h3>Efficient Execution</h3>
              <p>
                Achieve up to 6.4× higher throughput with RadixAttention&apos;s intelligent KV cache reuse
                and optimized parallel execution.
              </p>
            </div>
            <div className={styles.featureCard}>
              <h3>Structured Output</h3>
              <p>
                Generate reliable, well-formatted outputs using compressed finite state machines
                for fast constrained decoding.
              </p>
            </div>
            <div className={styles.featureCard}>
              <h3>API Integration</h3>
              <p>
                Seamlessly work with both open-weight models and API-only services like GPT-4,
                with built-in speculative execution optimization.
              </p>
            </div>
            <div className={styles.featureCard}>
              <h3>Developer Experience</h3>
              <p>
                Write clear, maintainable code with Python-native syntax and powerful primitives
                for generation and parallelism control.
              </p>
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <h2>Core Optimizations</h2>
          
          <div className={styles.optimization}>
            <h3>RadixAttention</h3>
            <p>
              RadixAttention revolutionizes KV cache management by treating it as a tree-based LRU cache.
              This enables automatic reuse of computed results across multiple calls, significantly
              reducing redundant computations and memory usage.
            </p>
            <div className={styles.codeBlock}>
              <pre>
                <code>{`# Example of KV cache reuse in a chat context
@function
def chat_session(s, messages):
    s += system("You are a helpful AI assistant.")
    
    # The system message KV cache is automatically reused
    for msg in messages:
        s += user(msg["user"])
        s += assistant(gen("response"))
        
    return s["response"]`}</code>
              </pre>
            </div>
          </div>

          <div className={styles.optimization}>
            <h3>Compressed Finite State Machines</h3>
            <p>
              SGLang accelerates structured output generation by using compressed FSMs to decode
              multiple tokens simultaneously while maintaining format constraints.
            </p>
            <div className={styles.codeBlock}>
              <pre>
                <code>{`# Example of constrained JSON generation
s += gen("output", regex=r'\\{"name": "[\\w\\s]+", "age": \\d+\\}')`}</code>
              </pre>
            </div>
          </div>
          
          <div className={styles.optimization}>
            <h3>API Speculative Execution</h3>
            <p>
              For API-based models, SGLang optimizes multi-call patterns by speculatively
              generating additional tokens and matching them with subsequent primitives.
            </p>
            <div className={styles.codeBlock}>
              <pre>
                <code>{`# Example of speculative execution
s += context + "name:" + gen("name", stop="\\n")
         + "job:" + gen("job", stop="\\n")
# May complete in a single API call`}</code>
              </pre>
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <h2>Real-World Applications</h2>
          <p>
            SGLang excels in complex LLM applications requiring multiple model calls,
            structured outputs, and parallel processing:
          </p>
          <ul className={styles.applicationList}>
            <li>Autonomous AI Agents</li>
            <li>Tree/Chain-of-Thought Reasoning</li>
            <li>Multi-Modal Processing (Images & Video)</li>
            <li>Retrieval-Augmented Generation</li>
            <li>Complex JSON Generation</li>
            <li>Multi-Turn Chat Applications</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2>Getting Started</h2>
          <p>
            Start building with SGLang today:
          </p>
          <div className={styles.codeBlock}>
            <pre>
              <code>{`pip install sglang`}</code>
            </pre>
          </div>
          <p>
            Visit their documentation for comprehensive guides and examples:
          </p>
          <div className={styles.ctaContainer}>
            <Link 
              href="https://github.com/sgl-project/sglang" 
              className={styles.ctaButton}
              target="_blank"
              rel="noopener noreferrer"
            >
              Explore SGLang Documentation
            </Link>
          </div>
        </section>
      </motion.div>
    </motion.article>
  );
}