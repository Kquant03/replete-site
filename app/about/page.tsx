'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef, useCallback } from 'react';
import styles from './About.module.css';
import Image from 'next/image';
import Link from 'next/link';
import { FiArrowRight, FiX } from 'react-icons/fi';

interface TeamMember {
  id: number;
  name: string;
  role: string;
  image: string;
  bio: string;
  expertise: string[];
}

const teamMembers: TeamMember[] = [
  {
    id: 1,
    name: "Dr. Sarah Chen",
    role: "Chief AI Researcher",
    image: "/images/team/sarah.webp",
    bio: "Leading our breakthrough research in neural networks and deep learning architectures.",
    expertise: ["Deep Learning", "Neural Architecture", "Computer Vision"]
  },
  {
    id: 2,
    name: "Alex Rodriguez",
    role: "AI Ethics Director",
    image: "/images/team/alex.webp",
    bio: "Ensuring our AI development aligns with ethical principles and societal benefits.",
    expertise: ["AI Ethics", "Policy Development", "Responsible AI"]
  }
];

const sectionVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.8, ease: [0.6, 0.05, 0.01, 0.9] }
  }
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.3
    }
  }
};

const HeroSection = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Optimize for retina displays
    const dpr = window.devicePixelRatio || 1;
    const updateCanvasSize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };

    updateCanvasSize();
    const resizeObserver = new ResizeObserver(() => {
      updateCanvasSize();
    });
    resizeObserver.observe(canvas);

    let animationId: number;
    const startTime = performance.now();

    const draw = (currentTime: number) => {
      const elapsed = (currentTime - startTime) * 0.001; // Convert to seconds
      
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);
      ctx.fillStyle = '#0b0015';
      ctx.fillRect(0, 0, canvas.width / dpr, canvas.height / dpr);

      // Draw waves with improved parameters
      const drawWave = (offset: number, color: string, amplitude: number, frequency: number, speed: number) => {
        ctx.beginPath();
        ctx.moveTo(0, canvas.height / dpr * 0.5);
        
        for (let x = 0; x <= canvas.width / dpr; x += 2) {
          const y = (canvas.height / dpr * 0.5) + 
                   Math.sin(x * frequency + elapsed * speed + offset) * amplitude + 
                   Math.sin(x * frequency * 0.5 + elapsed * speed * 0.5) * amplitude * 0.5;
          
          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.stroke();
      };

      // Draw multiple waves with different parameters
      drawWave(0, 'rgba(127, 90, 240, 0.15)', 30, 0.02, 1);
      drawWave(Math.PI / 3, 'rgba(76, 201, 240, 0.15)', 25, 0.015, 0.8);
      drawWave(Math.PI / 1.5, 'rgba(127, 90, 240, 0.1)', 35, 0.01, 0.6);

      animationId = requestAnimationFrame(draw);
    };

    animationId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animationId);
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <section className={styles.hero}>
      <canvas
        ref={canvasRef}
        className={styles.canvas}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
        }}
      />
      
      <div className={styles.gridOverlay} />
      
      <div className={styles.heroContent}>
        <motion.h1
          className={styles.heroTitle}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.19, 1, 0.22, 1] }}
        >
          Replete AI
        </motion.h1>
        
        <motion.p
          className={styles.heroSubtitle}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          Pioneering the Future of Intelligence
        </motion.p>
      </div>
      
      <div className={styles.vignetteOverlay} />
    </section>
  );
};

// Rest of the file remains the same...
export default function About() {
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [scrollY, setScrollY] = useState(0);
  const parallaxRef = useRef<HTMLDivElement>(null);

  // Scroll handler
  const handleScroll = useCallback(() => {
    const ticking = false;
    if (!ticking) {
      window.requestAnimationFrame(() => {
        setScrollY(window.scrollY);
        if (parallaxRef.current) {
          const elements = parallaxRef.current.querySelectorAll('[data-speed]');
          elements.forEach((element) => {
            const speed = parseFloat(element.getAttribute('data-speed') || '0');
            const yPos = -(scrollY * speed);
            (element as HTMLElement).style.transform = `translateY(${yPos}px)`;
          });
        }
      });
    }
  }, [scrollY]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  return (
    <motion.div
      ref={parallaxRef}
      className={styles.aboutContainer}
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <HeroSection />

      <motion.section 
        className={styles.mission}
        variants={sectionVariants}
      >
        <div className={styles.sectionContent}>
          <h2 className={styles.sectionTitle}>Our Mission</h2>
          <div className={styles.missionGrid}>
            {[
              {
                title: "Innovation",
                description: "Pushing the boundaries of AI technology through groundbreaking research and development."
              },
              {
                title: "Ethics",
                description: "Ensuring responsible AI development that prioritizes human values and societal benefit."
              },
              {
                title: "Impact",
                description: "Creating AI solutions that solve real-world problems and improve lives globally."
              }
            ].map((item, index) => (
              <motion.div
                key={item.title}
                className={styles.missionCard}
                variants={sectionVariants}
                custom={index}
              >
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      <motion.section 
        className={styles.vision}
        variants={sectionVariants}
      >
        <div className={styles.visionContent}>
          <h2 className={styles.sectionTitle}>Our Vision</h2>
          <div className={styles.visionWrapper}>
            <div className={styles.visionCard}>
              <div className={styles.visionHighlight}>
                <h3>Future-Forward Thinking</h3>
                <p>We envision a world where AI and human intelligence work in perfect harmony, enhancing our collective capabilities and driving innovation across all sectors.</p>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      <motion.section 
        className={styles.values}
        variants={sectionVariants}
      >
        <h2 className={styles.sectionTitle}>Our Values</h2>
        <div className={styles.valuesGrid}>
          {[
            {
              title: "Excellence",
              description: "Striving for the highest standards in everything we do."
            },
            {
              title: "Transparency",
              description: "Operating with complete openness and accountability."
            },
            {
              title: "Collaboration",
              description: "Working together to achieve breakthrough results."
            }
          ].map((value, index) => (
            <motion.div
              key={value.title}
              className={styles.valueCard}
              variants={sectionVariants}
              custom={index}
            >
              <h3>{value.title}</h3>
              <p>{value.description}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      <motion.section 
        className={styles.team}
        variants={sectionVariants}
      >
        <h2 className={styles.sectionTitle}>Our Team</h2>
        <div className={styles.teamGrid}>
          {teamMembers.map((member) => (
            <motion.div
              key={member.id}
              className={styles.teamCard}
              variants={sectionVariants}
              onClick={() => setSelectedMember(member)}
            >
              <div className={styles.teamMemberImage}>
                <Image
                  src={member.image}
                  alt={member.name}
                  width={300}
                  height={300}
                  loading="lazy"
                />
              </div>
              <h3>{member.name}</h3>
              <p>{member.role}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      <AnimatePresence>
        {selectedMember && (
          <motion.div
            className={styles.memberOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className={styles.memberPanel}
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            >
              <button
                className={styles.closeButton}
                onClick={() => setSelectedMember(null)}
              >
                <FiX />
              </button>
              <div className={styles.memberContent}>
                <Image
                  src={selectedMember.image}
                  alt={selectedMember.name}
                  width={400}
                  height={400}
                  className={styles.memberDetailImage}
                  loading="lazy"
                />
                <h2>{selectedMember.name}</h2>
                <h3>{selectedMember.role}</h3>
                <p>{selectedMember.bio}</p>
                <div className={styles.expertise}>
                  <h4>Expertise</h4>
                  <div className={styles.tags}>
                    {selectedMember.expertise.map((skill, index) => (
                      <span key={index} className={styles.tag}>
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.section 
        className={styles.cta}
        variants={sectionVariants}
      >
        <h2 className={styles.ctaTitle}>
          Join Us in Shaping the Future
        </h2>
        <div className={styles.ctaWrapper}>
          <Link href="/contact" className={styles.ctaButton}>
            Get in Touch <FiArrowRight />
          </Link>
        </div>
      </motion.section>
    </motion.div>
  );
}