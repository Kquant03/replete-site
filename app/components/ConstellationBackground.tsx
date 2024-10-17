import React, { useRef, useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import styles from '../styles/ConstellationBackground.module.css';

const ConstellationBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
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

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const particles: Particle[] = [];
    const maxDistance = 120;
    const minAge = 30000;
    const maxAge = 60000;
    const fadeInDuration = 2000;
    const fadeOutDuration = 3000;
    const borderWidth = 4;

    let cursorX = window.innerWidth / 2;
    let cursorY = window.innerHeight / 2;
    let isTouching = false;

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
      }

      reset(canvasWidth: number, canvasHeight: number) {
        this.x = Math.random() * (canvasWidth - 2 * borderWidth) + borderWidth;
        this.y = Math.random() * (canvasHeight - 2 * borderWidth) + borderWidth;
        this.velocityX = (Math.random() - 0.5) * 0.3;
        this.velocityY = (Math.random() - 0.5) * 0.3;
        this.baseSize = Math.random() * 1.5 + 0.5;
        this.size = 0;
        this.mass = this.baseSize * this.baseSize;
        this.color = particleColors[Math.floor(Math.random() * particleColors.length)];
        this.age = 0;
        this.maxAge = Math.random() * (maxAge - minAge) + minAge;
        this.opacity = 0;
        this.active = true;
      }

      update(deltaTime: number, canvasWidth: number, canvasHeight: number) {
        if (!this.active) return;

        const frictionCoefficient = 0.995;
        this.velocityX *= frictionCoefficient;
        this.velocityY *= frictionCoefficient;

        this.x += this.velocityX * deltaTime / 16;
        this.y += this.velocityY * deltaTime / 16;
        this.age += deltaTime;

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

        this.size = Math.max(0, this.size);

        if (this.x - this.size < borderWidth) {
          this.x = borderWidth + this.size;
          this.velocityX *= -1;
        } else if (this.x + this.size > canvasWidth - borderWidth) {
          this.x = canvasWidth - borderWidth - this.size;
          this.velocityX *= -1;
        }
        if (this.y - this.size < borderWidth) {
          this.y = borderWidth + this.size;
          this.velocityY *= -1;
        } else if (this.y + this.size > canvasHeight - borderWidth) {
          this.y = canvasHeight - borderWidth - this.size;
          this.velocityY *= -1;
        }

        if (this.age > this.maxAge) {
          this.active = false;
        }
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

      checkCollision(other: Particle) {
        if (!this.active || !other.active) return;

        const dx = this.x - other.x;
        const dy = this.y - other.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const minDistance = this.size + other.size;

        if (distance < minDistance) {
          const angle = Math.atan2(dy, dx);
          const sine = Math.sin(angle);
          const cosine = Math.cos(angle);

          const damping = 0.8;

          const velocityX = this.velocityX * cosine + this.velocityY * sine;
          const velocityY = this.velocityY * cosine - this.velocityX * sine;

          const otherVelocityX = other.velocityX * cosine + other.velocityY * sine;
          const otherVelocityY = other.velocityY * cosine - other.velocityX * sine;

          const finalVelocityX = ((this.mass - other.mass) * velocityX + 2 * other.mass * otherVelocityX) / (this.mass + other.mass) * damping;
          const finalVelocityY = velocityY * damping;

          const otherFinalVelocityX = ((other.mass - this.mass) * otherVelocityX + 2 * this.mass * velocityX) / (this.mass + other.mass) * damping;
          const otherFinalVelocityY = otherVelocityY * damping;

          this.velocityX = finalVelocityX * cosine - finalVelocityY * sine;
          this.velocityY = finalVelocityY * cosine + finalVelocityX * sine;

          other.velocityX = otherFinalVelocityX * cosine - otherFinalVelocityY * sine;
          other.velocityY = otherFinalVelocityY * cosine + otherFinalVelocityX * sine;

          const overlap = (minDistance - distance) / 2;

          this.x += overlap * (this.x - other.x) / distance;
          this.y += overlap * (this.y - other.y) / distance;
          other.x -= overlap * (this.x - other.x) / distance;
          other.y -= overlap * (this.y - other.y) / distance;
        }
      }

      applyForce(forceX: number, forceY: number) {
        this.velocityX += forceX / this.mass;
        this.velocityY += forceY / this.mass;
      }
    }

    function initParticles(canvasWidth: number, canvasHeight: number) {
      particles.length = 0;
      for (let i = 0; i < particleCount; i++) {
        const particle = new Particle();
        particle.reset(canvasWidth, canvasHeight);
        particles.push(particle);
      }
    }

    function handleMouseMove(event: MouseEvent) {
      cursorX = event.clientX;
      cursorY = event.clientY;
    }

    function handleTouchStart(event: TouchEvent) {
      isTouching = true;
      updateTouchPosition(event);
    }

    function handleTouchMove(event: TouchEvent) {
      if (isTouching) {
        updateTouchPosition(event);
      }
    }

    function handleTouchEnd() {
      isTouching = false;
    }

    function updateTouchPosition(event: TouchEvent) {
      const touch = event.touches[0];
      cursorX = touch.clientX;
      cursorY = touch.clientY;
    }

    function handleResize() {
      if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        initParticles(canvas.width, canvas.height);
      }
    }

    let lastTime = performance.now();
    const fixedTimeStep = 1000 / 60; // 60 FPS
    let accumulatedTime = 0;
    let animationFrameId: number;

    function updateParticles(deltaTime: number) {
      if (!canvas) return;
    
      let activeParticles = 0;
    
      for (let i = 0; i < particles.length; i++) {
        if (particles[i].active) {
          activeParticles++;
          particles[i].update(deltaTime, canvas.width, canvas.height);
    
          // Apply gravity effect
          const dx = cursorX - particles[i].x;
          const dy = cursorY - particles[i].y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          const minDistance = 80;
          const maxForce = 0.03;
    
          if (distance < minDistance) {
            const force = (maxForce * (minDistance - distance)) / minDistance;
            const forceX = force * (dx / distance);
            const forceY = force * (dy / distance);
    
            particles[i].applyForce(forceX, forceY);
          }
    
          for (let j = i + 1; j < particles.length; j++) {
            if (particles[j].active) {
              const dx = particles[i].x - particles[j].x;
              const dy = particles[i].y - particles[j].y;
              const distance = Math.sqrt(dx * dx + dy * dy);
    
              if (distance < maxDistance) {
                const force = (particles[i].mass * particles[j].mass) / (distance * distance);
                const forceX = force * (dx / distance) * 0.02;
                const forceY = force * (dy / distance) * 0.02;
    
                particles[i].velocityX -= forceX / particles[i].mass;
                particles[i].velocityY -= forceY / particles[i].mass;
                particles[j].velocityX += forceX / particles[j].mass;
                particles[j].velocityY += forceY / particles[j].mass;
              }
    
              particles[i].checkCollision(particles[j]);
            }
          }
        }
      }

      // Use activeParticles count to adjust particle creation rate
      if (Math.random() < 0.05 * (particleCount / Math.max(activeParticles, 1))) {
        const inactiveParticles = particles.filter(p => !p.active);
        if (inactiveParticles.length > 0) {
          const particleToReset = inactiveParticles[Math.floor(Math.random() * inactiveParticles.length)];
          particleToReset.reset(canvas.width, canvas.height);
        }
      }
    }

    function drawParticles() {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < particles.length; i++) {
        if (particles[i].active) {
          particles[i].draw(ctx);

          for (let j = i + 1; j < particles.length; j++) {
            if (particles[j].active) {
              const dx = particles[i].x - particles[j].x;
              const dy = particles[i].y - particles[j].y;
              const distance = Math.sqrt(dx * dx + dy * dy);

              if (distance < maxDistance) {
                const lineOpacity = (1 - distance / maxDistance) * 
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
    }

    function animate(currentTime: number) {
      const deltaTime = currentTime - lastTime;
      lastTime = currentTime;
      accumulatedTime += deltaTime;

      while (accumulatedTime >= fixedTimeStep) {
        updateParticles(fixedTimeStep);
        accumulatedTime -= fixedTimeStep;
      }

      drawParticles();

      animationFrameId = requestAnimationFrame(animate);
    }

    // Initialize canvas size and particles
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    initParticles(canvas.width, canvas.height);

    // Start the animation
    animationFrameId = requestAnimationFrame(animate);

    // Set up event listeners
    window.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('touchstart', handleTouchStart, { passive: true });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: true });
    canvas.addEventListener('touchend', handleTouchEnd);
    window.addEventListener('resize', handleResize);

    // Set isLoaded to true when the background is ready
    setIsLoaded(true);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('touchmove', handleTouchMove);
      canvas.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('resize', handleResize);
    };
  }, [particleCount, lineColor, particleColors]);

  return (
    <motion.div
      className={styles.backgroundContainer}
      initial={{ opacity: 0 }}
      animate={{ opacity: isLoaded ? 1 : 0 }}
      transition={{ duration: 0.3 }}
    >
      <canvas
        ref={canvasRef}
        className={styles.constellationCanvas}
      />
    </motion.div>
  );
};

export default ConstellationBackground;