import React, { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import styles from '../styles/ConstellationBackground.module.css';

interface DynamicConstellationBackgroundProps {
  pathname: string;
}

const DynamicConstellationBackground: React.FC<DynamicConstellationBackgroundProps> = ({ pathname }) => {
    console.log('DynamicConstellationBackground function called');
    console.log('Current pathname:', pathname);

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [fps, setFps] = useState(60);
    const particleCount = useMemo(() => typeof window !== 'undefined' ? (window.innerWidth < 768 ? 60 : 120) : 120, []);
    const animationRef = useRef<number | null>(null);
    const isVisibleRef = useRef(true);
    const isAnimatingRef = useRef(false);
    const particlesRef = useRef<Particle[]>([]);
    const cursorRef = useRef({ x: 0, y: 0 });

    const particleColors = useMemo(() => [
      'rgb(0, 191, 255)', 'rgb(30, 144, 255)', 'rgb(0, 123, 255)',
      'rgb(65, 105, 225)', 'rgb(100, 149, 237)', 'rgb(138, 43, 226)',
      'rgb(147, 112, 219)', 'rgb(153, 50, 204)', 'rgb(186, 85, 211)',
      'rgb(128, 0, 128)',
    ], []);

    const lineColor = useMemo(() => 'rgba(147, 112, 219, 0.2)', []);

    const maxDistance = 120;
    const minAge = 30000;
    const maxAge = 60000;
    const fadeOutDuration = 3000;
    const borderWidth = 4;

    const lastTimeRef = useRef(performance.now());
    const accumulatedTimeRef = useRef(0);
    const fixedTimeStep = 1000 / 60;
    const frameCountRef = useRef(0);
    const lastFpsUpdateTimeRef = useRef(performance.now());
    const fadeInDurationRef = useRef(2000); // 2 second fade-in duration

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
    baseOpacity: number;
    active: boolean;
    fadeStartTime: number;

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
      this.baseOpacity = 1;
      this.active = false;
      this.fadeStartTime = 0;
    }

    reset(canvasWidth: number, canvasHeight: number, currentTime: number): void {
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
      this.baseOpacity = Math.random() * 0.5 + 0.5; // Random opacity between 0.5 and 1
      this.opacity = 0;
      this.active = true;
      this.fadeStartTime = currentTime;
    }

    update(deltaTime: number, canvasWidth: number, canvasHeight: number, currentTime: number): void {
      if (!this.active) return;

      // Calculate fade-in progress
      const fadeProgress = Math.min(1, (currentTime - this.fadeStartTime) / fadeInDurationRef.current);
      this.opacity = this.baseOpacity * fadeProgress;

      const frictionCoefficient = 0.995;
      this.velocityX *= frictionCoefficient;
      this.velocityY *= frictionCoefficient;

      this.x += this.velocityX * deltaTime / 16;
      this.y += this.velocityY * deltaTime / 16;
      this.age += deltaTime;

      if (this.age > this.maxAge - fadeOutDuration) {
        this.opacity *= (this.maxAge - this.age) / fadeOutDuration;
      }

      this.size = this.baseSize * this.opacity;

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

    applyForce(forceX: number, forceY: number): void {
      this.velocityX += forceX / this.mass;
      this.velocityY += forceY / this.mass;
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
  }

  const initParticles = useCallback((canvasWidth: number, canvasHeight: number, currentTime: number) => {
    console.log('Initializing particles');
    particlesRef.current = [];
    for (let i = 0; i < particleCount; i++) {
      const particle = new Particle();
      particle.reset(canvasWidth, canvasHeight, currentTime);
      particlesRef.current.push(particle);
    }
    console.log('Particles initialized:', particlesRef.current.length);
  }, [particleCount]);

  const updateParticles = useCallback((deltaTime: number, currentTime: number) => {
    const canvas = canvasRef.current;
    if (!canvas) {
      console.error('Canvas ref is null in updateParticles');
      return;
    }

    const particles = particlesRef.current;
    const cursorX = cursorRef.current.x;
    const cursorY = cursorRef.current.y;

    particles.forEach(particle => {
      if (particle.active) {
        particle.update(deltaTime, canvas.width, canvas.height, currentTime);

        // Apply mouse gravity effect
        const dx = cursorX - particle.x;
        const dy = cursorY - particle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const minDistance = 80;
        const maxForce = 0.03;

        if (distance < minDistance) {
          const force = (maxForce * (minDistance - distance)) / minDistance;
          const forceX = force * (dx / distance);
          const forceY = force * (dy / distance);
          particle.applyForce(forceX, forceY);
        }

        // Apply inter-particle gravity and check for collisions
        particles.forEach(otherParticle => {
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
    const inactiveParticles = particles.filter(p => !p.active);
    if (inactiveParticles.length > 0) {
      const particleToReset = inactiveParticles[Math.floor(Math.random() * inactiveParticles.length)];
      particleToReset.reset(canvas.width, canvas.height, currentTime);
    }
  }, []);

  const drawParticles = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas) {
      console.error('Unable to get 2D context or canvas in drawParticles');
      return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const particles = particlesRef.current;

    particles.forEach(particle => {
      if (particle.active) {
        particle.draw(ctx);

        particles.forEach(otherParticle => {
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
              ctx.strokeStyle = lineColor.replace('0.2)', `${lineOpacity})`);
              ctx.lineWidth = 0.3;
              ctx.stroke();
            }
          }
        });
      }
    });
  }, [lineColor]);

  const updateFps = useCallback((currentTime: number) => {
    frameCountRef.current++;
    if (currentTime - lastFpsUpdateTimeRef.current > 1000) {
      const newFps = Math.round((frameCountRef.current * 1000) / (currentTime - lastFpsUpdateTimeRef.current));
      setFps(newFps);
      console.log('FPS:', newFps);
      frameCountRef.current = 0;
      lastFpsUpdateTimeRef.current = currentTime;
    }
  }, []);

  const animate = useCallback((currentTime: number) => {
    if (!isVisibleRef.current || !isAnimatingRef.current) {
      console.log('Animation stopped: visible =', isVisibleRef.current, 'animating =', isAnimatingRef.current);
      animationRef.current = null;
      return;
    }

    const deltaTime = currentTime - lastTimeRef.current;
    lastTimeRef.current = currentTime;
    accumulatedTimeRef.current += deltaTime;

    while (accumulatedTimeRef.current >= fixedTimeStep) {
      updateParticles(fixedTimeStep, currentTime);
      accumulatedTimeRef.current -= fixedTimeStep;
    }

    drawParticles();
    updateFps(currentTime);

    animationRef.current = requestAnimationFrame(animate);
  }, [updateParticles, drawParticles, updateFps]);

  const pauseAnimation = useCallback(() => {
    console.log('Pausing animation');
    isAnimatingRef.current = false;
  }, []);

  const resumeAnimation = useCallback(() => {
    console.log('Resuming animation');
    if (!isAnimatingRef.current) {
      isAnimatingRef.current = true;
      lastTimeRef.current = performance.now();
      animationRef.current = requestAnimationFrame(animate);
    }
  }, [animate]);

  const resetAnimation = useCallback(() => {
    console.log('Resetting animation');
    pauseAnimation();
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
      initParticles(canvas.width, canvas.height, performance.now());
      setIsLoaded(true);
      resumeAnimation();
    } else {
      console.error('Canvas ref is null in resetAnimation');
    }
  }, [pauseAnimation, resumeAnimation, initParticles]);

  useEffect(() => {
      const handleVisibilityChange = () => {
        if (document.visibilityState === 'visible') {
          console.log('Page became visible, resetting animation');
          resetAnimation();
        } else {
          console.log('Page became hidden, pausing animation');
          pauseAnimation();
        }
      };

      const handlePopstate = () => {
        console.log('Popstate event triggered, resetting animation');
        resetAnimation();
      };

      window.addEventListener('visibilitychange', handleVisibilityChange);
      window.addEventListener('popstate', handlePopstate);

      return () => {
        window.removeEventListener('visibilitychange', handleVisibilityChange);
        window.removeEventListener('popstate', handlePopstate);
      };
    }, [pauseAnimation, resetAnimation]);

  useEffect(() => {
    console.log('Route changed, new pathname:', pathname);
    if (pathname === '/') {
      console.log('Resetting animation for home page');
      resetAnimation();
    } else {
      console.log('Pausing animation for non-home page');
      pauseAnimation();
    }
  }, [pathname, pauseAnimation, resetAnimation]);

  useEffect(() => {
    console.log('Main useEffect starting');
    if (typeof window === 'undefined') {
      console.log('Window is undefined, returning early');
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) {
      console.error('Canvas ref is null');
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.error('Unable to get 2D context from canvas');
      return;
    }

    console.log('Canvas initialized, width:', canvas.width, 'height:', canvas.height);

    function handleResize() {
      console.log('Window resized');
      if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        console.log('Canvas resized, width:', canvas.width, 'height:', canvas.height);
      }
    }

    function handleMouseMove(event: MouseEvent) {
      cursorRef.current = { x: event.clientX, y: event.clientY };
    }

    function handleTouchMove(event: TouchEvent) {
      if (event.touches.length === 1) {
        const touch = event.touches[0];
        cursorRef.current = { x: touch.clientX, y: touch.clientY };
      }
    }

    // Initialize canvas size and particles
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    console.log('Canvas size set to window dimensions');
    initParticles(canvas.width, canvas.height, performance.now());

    // Set isLoaded to true after particles are initialized
    setIsLoaded(true);

    // Set up event listeners
    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove, { passive: true });

    // Start animation
    resumeAnimation();

    return () => {
      console.log('Main useEffect cleanup');
      pauseAnimation();
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, [initParticles, pauseAnimation, resumeAnimation]);

  console.log('DynamicConstellationBackground about to return JSX');
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
      {process.env.NODE_ENV === 'development' && (
        <div style={{ position: 'fixed', top: 10, left: 10, color: 'white', backgroundColor: 'rgba(0,0,0,0.5)', padding: '5px' }}>
          FPS: {fps}
        </div>
      )}
    </motion.div>
  );
};

export default DynamicConstellationBackground;