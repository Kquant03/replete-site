'use client';

import React, { useState, useRef } from 'react';
import { BrainCircuit, Target, Scale, Sparkles, Rocket, Shield, Globe } from 'lucide-react';
import Link from 'next/link';
import styles from './About.module.css';

type SectionType = 'vision' | 'mission' | 'values' | 'team';

interface TeamMember {
  name: string;
  role: string;
  expertise: string[];
  quote: string;
}

interface ValueCard {
  icon: React.ReactNode;
  title: string;
  description: string;
}

interface MissionCard extends ValueCard {}

const About = () => {
  const [activeSection, setActiveSection] = useState<SectionType>('vision');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const teamMembers: TeamMember[] = [
    {
      name: "Dr. Sarah Chen",
      role: "Chief AI Researcher",
      expertise: ["Deep Learning", "Neural Architecture", "Computer Vision"],
      quote: "I've always believed that the true potential of AI lies not just in its computational power, but in its ability to enhance human creativity and understanding."
    },
    {
      name: "Alex Rodriguez",
      role: "AI Ethics Director",
      expertise: ["AI Ethics", "Policy Development", "Responsible AI"],
      quote: "Ethics in AI isn't just about preventing harm—it's about actively creating systems that embody our highest values and aspirations."
    }
  ];

  const values: ValueCard[] = [
    {
      icon: <Target size={24} />,
      title: "Excellence",
      description: "Pursuing the highest standards in AI research and development."
    },
    {
      icon: <Scale size={24} />,
      title: "Responsibility",
      description: "Ensuring our innovations benefit humanity while minimizing risks."
    },
    {
      icon: <Sparkles size={24} />,
      title: "Innovation",
      description: "Pushing boundaries while maintaining ethical considerations."
    }
  ];

  const missions: MissionCard[] = [
    {
      icon: <Rocket size={24} />,
      title: "Innovation",
      description: "Pushing the boundaries of AI technology through groundbreaking research and development."
    },
    {
      icon: <Shield size={24} />,
      title: "Ethics",
      description: "Ensuring responsible AI development that prioritizes human values and societal benefit."
    },
    {
      icon: <Globe size={24} />,
      title: "Impact",
      description: "Creating AI solutions that solve real-world problems and improve lives globally."
    }
  ];

  const handleSectionChange = (section: SectionType) => {
    if (section === activeSection || isTransitioning) return;
    
    setIsTransitioning(true);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setActiveSection(section);
      timeoutRef.current = setTimeout(() => {
        setIsTransitioning(false);
      }, 50);
    }, 300);
  };

  const getSectionClass = (sectionName: SectionType) => {
    return `${styles.section} ${
      activeSection === sectionName ? styles.sectionVisible : styles.sectionHidden
    }`;
  };

  return (
    <div className={styles.container}>
      <section className={styles.hero}>
        <div className={styles.heroBackdrop} />
        <div className={styles.heroGlow} />
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>Replete AI</h1>
          <p className={styles.heroSubtitle}>
            Pioneering the next generation of artificial intelligence, where innovation 
            meets responsibility in shaping tomorrow&apos;s possibilities.
          </p>
        </div>
      </section>

      <div className={styles.mainContent}>
        <nav className={styles.nav}>
          {(['vision', 'mission', 'values', 'team'] as const).map((section) => (
            <button
              key={section}
              onClick={() => handleSectionChange(section)}
              className={`${styles.navButton} ${
                activeSection === section ? styles.navButtonActive : ''
              }`}
              disabled={isTransitioning}
            >
              {section.charAt(0).toUpperCase() + section.slice(1)}
            </button>
          ))}
        </nav>

        <div style={{ position: 'relative' }}>
          <div className={getSectionClass('vision')}>
            <div className={styles.visionGrid}>
              <div className={styles.visionContent}>
                <h2 className={styles.sectionTitle}>Our Vision</h2>
                <p>
                  We envision a future where artificial intelligence seamlessly enhances human potential,
                  creating a harmonious partnership between human intuition and machine capability.
                </p>
                <p>
                  Through groundbreaking research and ethical innovation, we&apos;re building AI systems
                  that are not just powerful, but also transparent, fair, and beneficial to society.
                </p>
              </div>
              <div className={styles.visionImage}>
                <BrainCircuit size={96} className={styles.cardIcon} />
              </div>
            </div>
          </div>

          <div className={getSectionClass('mission')}>
            <h2 className={styles.sectionTitle}>Our Mission</h2>
            <div className={styles.cardsGrid}>
              {missions.map((mission, index) => (
                <div 
                  key={index} 
                  className={styles.card}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className={styles.cardIcon}>{mission.icon}</div>
                  <h3 className={styles.cardTitle}>{mission.title}</h3>
                  <p className={styles.cardText}>{mission.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className={getSectionClass('values')}>
            <h2 className={styles.sectionTitle}>Our Values</h2>
            <div className={styles.cardsGrid}>
              {values.map((value, index) => (
                <div 
                  key={index} 
                  className={styles.card}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className={styles.cardIcon}>{value.icon}</div>
                  <h3 className={styles.cardTitle}>{value.title}</h3>
                  <p className={styles.cardText}>{value.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className={getSectionClass('team')}>
            <h2 className={styles.sectionTitle}>Our Team</h2>
            <div className={styles.teamGrid}>
              {teamMembers.map((member, index) => (
                <div 
                  key={index} 
                  className={styles.teamCard}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <h3 className={styles.teamName}>{member.name}</h3>
                  <p className={styles.teamRole}>{member.role}</p>
                  <blockquote className={styles.teamQuote}>
                    {member.quote}
                  </blockquote>
                  <div className={styles.tagList}>
                    {member.expertise.map((skill, idx) => (
                      <span key={idx} className={styles.tag}>
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className={styles.cta}>
          <h2 className={styles.ctaTitle}>Ready to Shape the Future?</h2>
          <Link href="/contact" className={styles.ctaButton}>
            Get in Touch
          </Link>
        </div>
      </div>
    </div>
  );
};

export default About;