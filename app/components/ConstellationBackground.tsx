import React, { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from '../styles/ConstellationBackground.module.css';

const ConstellationBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [key, setKey] = useState(0);
  const particleCount = useMemo(() => window.innerWidth < 768 ? 60 : 120, []);

  const particleColors = useMemo(() => [
    'rgb(0, 191, 255)',   // Deep Sky Blue
    'rgb(30, 144, 255)',  // Dodger Blue
    'rgb(0, 123, 255)',   // Blue
    'rgb(65, 105, 225)',  // Royal Blue
    'rgb(100, 149, 237)', // Cornflower Blue
    'rgb(138, 43, 226)',  // Blue Violet
    'rgb(147, 112, 219)', // Medium Purple
    'rgb(153, 50, 204)',  // Dark Orchid
    'rgb(186, 85, 211)',  // Medium Orchid
    'rgb(128, 0, 128)',   // Purple
  ], []);

  const lineColor = useMemo(() => 'rgba(147, 112, 219, 0.2)', []);

  class Particle {
    x: number;
    y: number;
    velocityX: number;
    velocityY: number;
    mass: number;
    baseSize: number;
    size: number;
    color: string;
    age: number;
    maxAge: number;
    opacity: number;
    active: boolean;
    maxSpeed: number;

    constructor() {
      this.x = 0;
      this.y = 0;
      this.velocityX = 0;
      this.velocityY = 0;
      this.mass = 0;
      this.baseSize = 0;
      this.size = 0;
      this.color = '';
      this.age = 0;
      this.maxAge = 0;
      this.opacity = 0;
      this.active = false;
      this.maxSpeed = 1.5;
    }

    reset(canvasWidth: number, canvasHeight: number, borderWidth: number) {
      this.x = Math.random() * (canvasWidth - 2 * borderWidth) + borderWidth;
      this.y = Math.random() * (canvasHeight - 2 * borderWidth) + borderWidth;
      this.velocityX = (Math.random() - 0.5) * 0.1;
      this.velocityY = (Math.random() - 0.5) * 0.1;
      this.baseSize = Math.random() * 1.5 + 0.5;
      this.size = 0;
      this.mass = this.baseSize * 10;
      this.color = particleColors[Math.floor(Math.random() * particleColors.length)];
      this.age = 0;
      this.maxAge = Math.random() * 30000 + 30000; // Between 30 and 60 seconds
      this.opacity = 0;
      this.active = true;
    }

    update(deltaTime: number, canvasWidth: number, canvasHeight: number, borderWidth: number) {
      if (!this.active) return;

      const frictionCoefficient = 0.99;
      this.velocityX *= frictionCoefficient;
      this.velocityY *= frictionCoefficient;

      // Add slight random motion (Brownian movement)
      this.velocityX += (Math.random() - 0.5) * 0.01;
      this.velocityY += (Math.random() - 0.5) * 0.01;

      // Cap the velocity
      const speed = Math.sqrt(this.velocityX * this.velocityX + this.velocityY * this.velocityY);
      if (speed > this.maxSpeed) {
        const factor = this.maxSpeed / speed;
        this.velocityX *= factor;
        this.velocityY *= factor;
      }

      this.x += this.velocityX * deltaTime / 16;
      this.y += this.velocityY * deltaTime / 16;
      this.age += deltaTime;

      const fadeInDuration = 2000;
      const fadeOutDuration = 3000;

      if (this.age < fadeInDuration) {
        this.opacity = this.age / fadeInDuration;
        this.size = this.baseSize * this.opacity;
      } else if (this.age > this.maxAge - fadeOutDuration) {
        this.opacity = (this.maxAge - this.age) / fadeOutDuration;
        this.size = this.baseSize * this.opacity;
      } else {
        this.opacity = 1;
        this.size = this.baseSize;
      }

      // Boundary collision
      if (this.x - this.size < borderWidth) {
        this.x = borderWidth + this.size;
        this.velocityX = Math.abs(this.velocityX) * 0.8; // Energy loss on collision
      } else if (this.x + this.size > canvasWidth - borderWidth) {
        this.x = canvasWidth - borderWidth - this.size;
        this.velocityX = -Math.abs(this.velocityX) * 0.8;
      }
      if (this.y - this.size < borderWidth) {
        this.y = borderWidth + this.size;
        this.velocityY = Math.abs(this.velocityY) * 0.8;
      } else if (this.y + this.size > canvasHeight - borderWidth) {
        this.y = canvasHeight - borderWidth - this.size;
        this.velocityY = -Math.abs(this.velocityY) * 0.8;
      }

      if (this.age > this.maxAge) {
        this.active = false;
      }
    }

    applyForce(forceX: number, forceY: number) {
      const maxForce = 0.05;
      const forceMagnitude = Math.sqrt(forceX * forceX + forceY * forceY);
      if (forceMagnitude > maxForce) {
        const factor = maxForce / forceMagnitude;
        forceX *= factor;
        forceY *= factor;
      }

      this.velocityX += forceX / this.mass;
      this.velocityY += forceY / this.mass;
    }

    draw(ctx: CanvasRenderingContext2D) {
      if (!this.active) return;

      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.globalAlpha = this.opacity * 0.7;
      ctx.fill();
      ctx.globalAlpha = 1;
    }
  }

  const restartAnimation = useCallback(() => {
    setIsVisible(false);
    setTimeout(() => {
      setKey(prevKey => prevKey + 1);
    }, 300); // Wait for fade out before restarting
  }, []);

  useEffect(() => {
    const resetInterval = setInterval(() => {
      restartAnimation();
    }, 5 * 60 * 1000); // 5 minutes in milliseconds

    return () => clearInterval(resetInterval);
  }, [restartAnimation]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        restartAnimation();
      }
    };

    const handleRouteChange = () => {
      restartAnimation();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('popstate', handleRouteChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, [restartAnimation]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let particles: Particle[] = [];
    const borderWidth = 4;
    let cursorX = window.innerWidth / 2;
    let cursorY = window.innerHeight / 2;

    let lastTime = performance.now();
    const fixedTimeStep = 1000 / 60; // 60 FPS
    let accumulatedTime = 0;
    let animationFrameId: number;

    const initParticles = () => {
      particles = [];
      for (let i = 0; i < particleCount; i++) {
        const particle = new Particle();
        particle.reset(canvas.width, canvas.height, borderWidth);
        particles.push(particle);
      }
    };

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initParticles();
    };

    const updateParticles = (deltaTime: number) => {
      const G = 0.0001; // Gravitational constant
      const maxDistance = 120;
      const cursorInfluenceRadius = 100;

      for (let i = 0; i < particles.length; i++) {
        if (particles[i].active) {
          particles[i].update(deltaTime, canvas.width, canvas.height, borderWidth);

          // Cursor repulsion
          const dxCursor = particles[i].x - cursorX;
          const dyCursor = particles[i].y - cursorY;
          const distanceToCursor = Math.sqrt(dxCursor * dxCursor + dyCursor * dyCursor);

          if (distanceToCursor < cursorInfluenceRadius) {
            const repulsionForce = 0.05 * (1 - distanceToCursor / cursorInfluenceRadius);
            particles[i].applyForce(
              (dxCursor / distanceToCursor) * repulsionForce,
              (dyCursor / distanceToCursor) * repulsionForce
            );
          }

          // Particle interactions
          for (let j = i + 1; j < particles.length; j++) {
            if (particles[j].active) {
              const dx = particles[j].x - particles[i].x;
              const dy = particles[j].y - particles[i].y;
              const distance = Math.sqrt(dx * dx + dy * dy);

              if (distance > 0 && distance < maxDistance) {
                // Gravitational attraction
                const force = G * (particles[i].mass * particles[j].mass) / (distance * distance);
                const forceX = force * dx / distance;
                const forceY = force * dy / distance;

                particles[i].applyForce(forceX, forceY);
                particles[j].applyForce(-forceX, -forceY);

                // Collision response
                const minDistance = particles[i].size + particles[j].size;
                if (distance < minDistance) {
                  const angle = Math.atan2(dy, dx);
                  const sine = Math.sin(angle);
                  const cosine = Math.cos(angle);

                  // Rotate particle velocities
                  const vxi = particles[i].velocityX * cosine + particles[i].velocityY * sine;
                  const vyi = particles[i].velocityY * cosine - particles[i].velocityX * sine;
                  const vxj = particles[j].velocityX * cosine + particles[j].velocityY * sine;
                  const vyj = particles[j].velocityY * cosine - particles[j].velocityX * sine;

                  // Collision physics
                  const swapRatio = 2 * (particles[i].mass * vxi + particles[j].mass * vxj) / (particles[i].mass + particles[j].mass);
                  const vxiNew = swapRatio - vxi;
                  const vxjNew = swapRatio - vxj;

                  // Rotate velocities back
                  particles[i].velocityX = vxiNew * cosine - vyi * sine;
                  particles[i].velocityY = vyi * cosine + vxiNew * sine;
                  particles[j].velocityX = vxjNew * cosine - vyj * sine;
                  particles[j].velocityY = vyj * cosine + vxjNew * sine;

                  // Move particles apart to prevent sticking
                  const moveRatio = (minDistance - distance) / distance;
                  particles[i].x -= dx * moveRatio * 0.5;
                  particles[i].y -= dy * moveRatio * 0.5;
                  particles[j].x += dx * moveRatio * 0.5;
                  particles[j].y += dy * moveRatio * 0.5;
                }
              }
            }
          }
        }
      }

      // Particle creation/reset logic
      const activeParticles = particles.filter(p => p.active).length;
      if (Math.random() < 0.05 * (particleCount / Math.max(activeParticles, 1))) {
        const inactiveParticles = particles.filter(p => !p.active);
        if (inactiveParticles.length > 0) {
          const particleToReset = inactiveParticles[Math.floor(Math.random() * inactiveParticles.length)];
          particleToReset.reset(canvas.width, canvas.height, borderWidth);
        }
      }
    };

    const drawParticles = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < particles.length; i++) {
        if (particles[i].active) {
          particles[i].draw(ctx);

          for (let j = i + 1; j < particles.length; j++) {
            if (particles[j].active) {
              const dx = particles[i].x - particles[j].x;
              const dy = particles[i].y - particles[j].y;
              const distance = Math.sqrt(dx * dx + dy * dy);

              if (distance < 120) {
                const lineOpacity = (1 - distance / 120) * 
                                    Math.min(particles[i].opacity, particles[j].opacity) * 0.3;
                ctx.beginPath();
                ctx.moveTo(particles[i].x, particles[i].y);
                ctx.lineTo(particles[j].x, particles[j].y);
                ctx.strokeStyle = lineColor.replace('0.2)', `${lineOpacity})`);
                ctx.lineWidth = 0.3;
                ctx.stroke();
              }
            }
          }
        }
      }
    };

    const animate = (currentTime: number) => {
      const deltaTime = currentTime - lastTime;
      lastTime = currentTime;
      accumulatedTime += deltaTime;

      while (accumulatedTime >= fixedTimeStep) {
        updateParticles(fixedTimeStep);
        accumulatedTime -= fixedTimeStep;
      }

      drawParticles();

      animationFrameId = requestAnimationFrame(animate);
    };

    // Initialize canvas size and particles
    handleResize();

    // Start the animation
    animationFrameId = requestAnimationFrame(animate);

    // Set up event listeners
    const handleMouseMove = (event: MouseEvent) => {
      cursorX = event.clientX;
      cursorY = event.clientY;
    };

    const handleTouchMove = (event: TouchEvent) => {
      cursorX = event.touches[0].clientX;
      cursorY = event.touches[0].clientY;
    };

    window.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('resize', handleResize);

    // Set isLoaded to true when the background is ready
    setIsLoaded(true);

    // Delay setting isVisible to true to ensure particles are positioned
    setTimeout(() => {
      setIsVisible(true);
    }, 100);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('resize', handleResize);
    };
  }, [particleCount, key, lineColor]);

  return (
    <AnimatePresence>
      <motion.div
        key={key}
        className={styles.backgroundContainer}
        initial={{ opacity: 0 }}
        animate={{ opacity: isLoaded && isVisible ? 1 : 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        <canvas
          ref={canvasRef}
          className={styles.constellationCanvas}
        />
      </motion.div>
    </AnimatePresence>
  );
};

export default React.memo(ConstellationBackground);