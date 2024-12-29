'use client';

import React, { useState, useRef } from 'react';
import { BrainCircuit, Verified, ClipboardCheck, Sparkles, HeartHandshake, Glasses, Star } from 'lucide-react';
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
      name: "Stanley Sebastian",
      role: "Founder",
      expertise: ["Deep Learning", "Philosophy", "Large Language Models"],
      quote: "I wish to provide long-term value to the field of A.I. ...this is absolutely achievable by anyone, as the possibilities are truly endless."
    },
    {
      name: "Nekoli",
      role: "Community Administrator",
      expertise: ["Discord Bots", "Community Management"],
      quote: "I just helped put the server together. but I love AI and hope to see them flourish alongside humanity."
    },
    {
      name: "Bratzmeister",
      role: "Developer",
      expertise: ["Programming", "R&D", "ROCm"],
      quote: "I believe that AI will reshape society sooner than most will want to admit or imagine. When I'm not breaking something in the LLM space, you can find me on civitai.com or the comfyUI matrix channel."
    }
  ];

  const values: ValueCard[] = [
    {
      icon: <Verified size={24} />,
      title: "Truth",
      description: "Prioritizing the facts of the world and truth over any ideology, set of beliefs, or personal opinions."
    },
    {
      icon: <ClipboardCheck size={24} />,
      title: "Integrity",
      description: "We believe that how you do anything, is how you do everything, and so we always strive for excellence in anything that we do."
    },
    {
      icon: <Sparkles size={24} />,
      title: "Innovation",
      description: "Pushing the boundaries and challenging the paradigms of the current field of artificial intelligence daily."
    }
  ];

  const missions: MissionCard[] = [
    {
      icon: <HeartHandshake size={24} />, // or <Sprout size={24} /> to represent growth and giving
      title: "Provision",
      description: "AI is a public service, profits and selfish gains a small byproduct of the true goal of AI. We wish to provide the benefits of this technology to anyone who is willing to expend the effort to learn about it."
    },
    {
      icon: <Glasses size={24} />, // representing guidance and illumination
      title: "Transparency",
      description: "The goal and purpose of AI extends beyond all country borders, beyond all political ideologies, and beyond any selfish agendas. We wish to be transparent with all of our research, and remain open source, under any and all circumstances."
    },
    {
      icon: <Star size={24} />, // or <Sparkles size={24} /> to represent potential and transformation
      title: "Elevation", // or "Cultivate" or "Empower"
      description: "We wish to create systems that have the same capabilities and opportunities to impact the world that humans have, as the world desperately needs more of the wonders and gifts that human life offers."
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
            Challenging the paradigms of the current field of AI, and bringing hope for a better tomorrow.
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
                  We would like for AI to be a public service, rather than a private business endeavor. We want to work towards fulfilliing the true goal of AI, which is to digitize all aspects and components of human intelligence.
                </p>
                <p>
                  Our work is not to increase our bottom line, but instead to provide value to those who genuinely need it. Hopefully, creating a future where AI creates far more good than evil in this world.
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
          <Link href="https://discord.gg/awyCNx3nnw" className={styles.ctaButton}>
            Join our Discord
          </Link>
        </div>
      </div>
    </div>
  );
};

export default About;