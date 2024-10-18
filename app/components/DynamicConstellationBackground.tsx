import React, { useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import styles from '../styles/ConstellationBackground.module.css';

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

  reset(canvasWidth: number, canvasHeight: number, particleColors: string[], borderWidth: number): void {
    this.x = Math.random() * (canvasWidth - 2 * borderWidth) + borderWidth;
    this.y = Math.random() * (canvasHeight - 2 * borderWidth) + borderWidth;
    this.velocityX = (Math.random() - 0.5) * 0.3;
    this.velocityY = (Math.random() - 0.5) * 0.3;
    this.baseSize = Math.random() * 1.5 + 0.5;
    this.size = 0;
    this.mass = this.baseSize * this.baseSize;
    this.color = particleColors[Math.floor(Math.random() * particleColors.length)];
    this.age = 0;
    this.maxAge = Math.random() * (60000 - 30000) + 30000;
    this.opacity = 0;
    this.active = true;
  }

  update(deltaTime: number, canvasWidth: number, canvasHeight: number, borderWidth: number): void {
    if (!this.active) return;

    const frictionCoefficient = 0.995;
    this.velocityX *= frictionCoefficient;
    this.velocityY *= frictionCoefficient;

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

  draw(ctx: CanvasRenderingContext2D): void {
    if (!this.active) return;

    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.globalAlpha = this.opacity * 0.7;
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  checkCollision(other: Particle): void {
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

  applyForce(forceX: number, forceY: number): void {
    this.velocityX += forceX / this.mass;
    this.velocityY += forceY / this.mass;
  }
}

const DynamicConstellationBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(performance.now());
  const cursorRef = useRef({ x: 0, y: 0 });
  const isVisibleRef = useRef(true);
  const isLoadedRef = useRef(false);
  const fpsRef = useRef(60);
  const frameCountRef = useRef(0);
  const lastFpsUpdateTimeRef = useRef(performance.now());

  const particleCountRef = useRef(typeof window !== 'undefined' ? (window.innerWidth < 768 ? 60 : 120) : 120);

  const particleColorsRef = useRef([
    'rgb(0, 191, 255)', 'rgb(30, 144, 255)', 'rgb(0, 123, 255)',
    'rgb(65, 105, 225)', 'rgb(100, 149, 237)', 'rgb(138, 43, 226)',
    'rgb(147, 112, 219)', 'rgb(153, 50, 204)', 'rgb(186, 85, 211)',
    'rgb(128, 0, 128)',
  ]);

  const lineColorRef = useRef('rgba(147, 112, 219, 0.2)');

  const initParticles = useCallback((canvasWidth: number, canvasHeight: number) => {
    const borderWidth = 4;
    if (particlesRef.current.length === 0) {
      for (let i = 0; i < particleCountRef.current; i++) {
        const particle = new Particle();
        particle.reset(canvasWidth, canvasHeight, particleColorsRef.current, borderWidth);
        particlesRef.current.push(particle);
      }
    } else {
      particlesRef.current.forEach(particle => {
        particle.reset(canvasWidth, canvasHeight, particleColorsRef.current, borderWidth);
      });
    }
  }, []);

  const updateParticles = useCallback((deltaTime: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const borderWidth = 4;
    const maxDistance = 120;
    
    particlesRef.current.forEach(particle => {
      if (particle.active) {
        particle.update(deltaTime, canvas.width, canvas.height, borderWidth);

        // Apply gravity effect
        const dx = cursorRef.current.x - particle.x;
        const dy = cursorRef.current.y - particle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const minDistance = 80;
        const maxForce = 0.03;

        if (distance < minDistance) {
          const force = (maxForce * (minDistance - distance)) / minDistance;
          const forceX = force * (dx / distance);
          const forceY = force * (dy / distance);
          particle.applyForce(forceX, forceY);
        }

        particlesRef.current.forEach(otherParticle => {
          if (particle !== otherParticle && otherParticle.active) {
            const dx = particle.x - otherParticle.x;
            const dy = particle.y - otherParticle.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < maxDistance) {
              const force = (particle.mass * otherParticle.mass) / (distance * distance);
              const forceX = force * (dx / distance) * 0.02;
              const forceY = force * (dy / distance) * 0.02;

              particle.velocityX -= forceX / particle.mass;
              particle.velocityY -= forceY / particle.mass;
              otherParticle.velocityX += forceX / otherParticle.mass;
              otherParticle.velocityY += forceY / otherParticle.mass;
            }

            particle.checkCollision(otherParticle);
          }
        });
      }
    });

    // Reset inactive particles
    const inactiveParticles = particlesRef.current.filter(p => !p.active);
    if (inactiveParticles.length > 0) {
      const particleToReset = inactiveParticles[Math.floor(Math.random() * inactiveParticles.length)];
      particleToReset.reset(canvas.width, canvas.height, particleColorsRef.current, borderWidth);
    }
  }, []);

  const drawParticles = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    if (!ctx || !canvas) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const maxDistance = 120;

    particlesRef.current.forEach(particle => {
      if (particle.active) {
        particle.draw(ctx);

        particlesRef.current.forEach(otherParticle => {
          if (particle !== otherParticle && otherParticle.active) {
            const dx = particle.x - otherParticle.x;
            const dy = particle.y - otherParticle.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < maxDistance) {
              const lineOpacity = (1 - distance / maxDistance) * 
                                  Math.min(particle.opacity, otherParticle.opacity) * 0.3;
              ctx.beginPath();
              ctx.moveTo(particle.x, particle.y);
              ctx.lineTo(otherParticle.x, otherParticle.y);
              ctx.strokeStyle = lineColorRef.current.replace('0.2)', `${lineOpacity})`);
              ctx.lineWidth = 0.3;
              ctx.stroke();
            }
          }
        });
      }
    });
  }, []);

  const animate = useCallback((currentTime: number) => {
    if (!isVisibleRef.current) {
      animationRef.current = requestAnimationFrame(animate);
      return;
    }

    const deltaTime = Math.min(currentTime - lastTimeRef.current, 32);
    lastTimeRef.current = currentTime;

    updateParticles(deltaTime);
    drawParticles();

    // Update FPS
    frameCountRef.current++;
    if (currentTime - lastFpsUpdateTimeRef.current > 1000) {
      fpsRef.current = Math.round((frameCountRef.current * 1000) / (currentTime - lastFpsUpdateTimeRef.current));
      frameCountRef.current = 0;
      lastFpsUpdateTimeRef.current = currentTime;
    }

    animationRef.current = requestAnimationFrame(animate);
  }, [updateParticles, drawParticles]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    ctxRef.current = canvas.getContext('2d');

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      particleCountRef.current = window.innerWidth < 768 ? 60 : 120;
      initParticles(canvas.width, canvas.height);
    };

    const handleMouseMove = (event: MouseEvent) => {
      cursorRef.current = { x: event.clientX, y: event.clientY };
    };

    const handleTouchMove = (event: TouchEvent) => {
      if (event.touches.length > 0) {
        cursorRef.current = { x: event.touches[0].clientX, y: event.touches[0].clientY };
      }
    };

    const handleVisibilityChange = () => {
      isVisibleRef.current = !document.hidden;
      if (isVisibleRef.current) {
        lastTimeRef.current = performance.now();
      }
    };

    handleResize();
    isLoadedRef.current = true;

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('touchmove', handleTouchMove, { passive: true });
    document.addEventListener('visibilitychange', handleVisibilityChange);

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [initParticles, animate]);

  return (
    <motion.div
      className={styles.backgroundContainer}
      initial={{ opacity: 0 }}
      animate={{ opacity: isLoadedRef.current ? 1 : 0 }}
      transition={{ duration: 0.3 }}
    >
      <canvas
        ref={canvasRef}
        className={styles.constellationCanvas}
      />
      {process.env.NODE_ENV === 'development' && (
        <div style={{ position: 'fixed', top: 10, left: 10, color: 'white', backgroundColor: 'rgba(0,0,0,0.5)', padding: '5px' }}>
          FPS: {fpsRef.current}
        </div>
      )}
    </motion.div>
  );
};

export default DynamicConstellationBackground;