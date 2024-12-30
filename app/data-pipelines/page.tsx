'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { GitFork, Star, GitBranch, ArrowUpRight, Github } from 'lucide-react';
import styles from './DataPipelines.module.css';

interface RepoStats {
  repo: string;
  stars: number;
  forks: number;
}

interface Pipeline {
  name: string;
  description: string;
  repoUrl: string;
  stars: number;
  forks: number;
  tags: string[];
}

const initialPipelines: Pipeline[] = [
  {
    name: "Interactive Experience Generator",
    description: "A ShareGPT multi-turn synthetic data pipeline, for generating all different types of data utilizing few-shot prompting.",
    repoUrl: "https://github.com/Replete-AI/Interactive-Experience-Generator",
    stars: 0,
    forks: 0,
    tags: ["Python", "Prompt Engineering", "Few-shot prompting"]
  },
  {
    name: "System Prompt Generator",
    description: "A simple pipeline to generate system prompts for ShareGPT datasets.",
    repoUrl: "https://github.com/RepleteAI/text-processor",
    stars: 0,
    forks: 0,
    tags: ["Python", "Prompt-engineering"]
  }
];

const DataPipelines = () => {
  const [pipelines, setPipelines] = useState<Pipeline[]>(initialPipelines);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchGitHubStats = async () => {
      try {
        const response = await fetch('/api/github-stats');
        if (!response.ok) throw new Error('Failed to fetch GitHub stats');
        
        const data = await response.json();
        
        setPipelines(prevPipelines => 
          prevPipelines.map(pipeline => {
            const repoPath = pipeline.repoUrl.replace('https://github.com/', '');
            const repoStats = data.stats.find((stat: RepoStats) => stat.repo === repoPath);
            
            if (repoStats) {
              return {
                ...pipeline,
                stars: repoStats.stars,
                forks: repoStats.forks
              };
            }
            return pipeline;
          })
        );
      } catch (error) {
        console.error('Error fetching GitHub stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGitHubStats();
  }, []);

  return (
    <div className={styles.container}>
      <section className={styles.hero}>
        <div className={styles.heroBackdrop} />
        <div className={styles.heroGlow} />
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>Data Pipelines</h1>
          <p className={styles.heroSubtitle}>
          Pipelines to generate synthetic data for training AI. <br></br>
            Built for performance, scalability, and ease of use.
          </p>
        </div>
      </section>

      <div className={styles.mainContent}>
        <div className={styles.pipelinesGrid}>
          {pipelines.map((pipeline, index) => (
            <Link
              href={pipeline.repoUrl}
              key={index}
              className={styles.pipelineCard}
              target="_blank"
              rel="noopener noreferrer"
            >
              <div className={styles.cardIcon}>
                <GitBranch size={24} />
              </div>
              <div className={styles.cardContent}>
                <div className={styles.cardHeader}>
                  <h3 className={styles.cardTitle}>{pipeline.name}</h3>
                  <ArrowUpRight size={16} className={styles.arrowIcon} />
                </div>
                <p className={styles.cardDescription}>{pipeline.description}</p>
                <div className={styles.cardFooter}>
                  <div className={styles.stats}>
                    <span className={`${styles.stat} ${isLoading ? styles.loading : ''}`}>
                      <Star size={16} />
                      {pipeline.stars}
                    </span>
                    <span className={`${styles.stat} ${isLoading ? styles.loading : ''}`}>
                      <GitFork size={16} />
                      {pipeline.forks}
                    </span>
                  </div>
                  <div className={styles.tagList}>
                    {pipeline.tags.map((tag, idx) => (
                      <span key={idx} className={styles.tag}>
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className={styles.cta}>
          <h2 className={styles.ctaTitle}>Ready to Contribute?</h2>
          <p className={styles.ctaText}>
            Join us in building better data generation tools for the AI community.
          </p>
          <Link 
            href="https://github.com/RepleteAI"
            className={styles.ctaButton}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Github size={20} />
            <span>View on GitHub</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DataPipelines;