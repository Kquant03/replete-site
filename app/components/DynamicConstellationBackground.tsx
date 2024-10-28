import React, { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import styles from '../styles/ConstellationBackground.module.css';

interface DynamicConstellationBackgroundProps {
  pathname: string;
}

const DynamicConstellationBackground: React.FC<DynamicConstellationBackgroundProps> = ({ pathname }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isLoaded, setIsLoaded] = useState(false);
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
    const fadeInDurationRef = useRef(2000);

    // Force cleanup and reset on component mount/unmount
    useEffect(() => {
        return () => forceCleanup();
    }, []);

    // Aggressive cleanup function
    const forceCleanup = useCallback(() => {
        console.log('Forcing complete cleanup');
        
        // Cancel any pending animation frame
        if (animationRef.current !== null) {
            window.cancelAnimationFrame(animationRef.current);
            animationRef.current = null;
        }

        // Reset all refs
        isVisibleRef.current = false;
        isAnimatingRef.current = false;
        particlesRef.current = [];
        cursorRef.current = { x: 0, y: 0 };
        lastTimeRef.current = performance.now();
        accumulatedTimeRef.current = 0;

        // Clear the canvas completely
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            if (ctx) {
                // Clear any transforms and state
                ctx.setTransform(1, 0, 0, 1, 0, 0);
                ctx.globalCompositeOperation = 'source-over';
                ctx.globalAlpha = 1;
                ctx.clearRect(0, 0, canvas.width, canvas.height);
            }
            // Reset canvas dimensions
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }

        setIsLoaded(false);
    }, []);

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
            this.baseOpacity = Math.random() * 0.5 + 0.5;
            this.opacity = 0;
            this.active = true;
            this.fadeStartTime = currentTime;
        }

        update(deltaTime: number, canvasWidth: number, canvasHeight: number, currentTime: number): void {
            if (!this.active) return;

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
        console.log('Initializing fresh set of particles');
        particlesRef.current = [];
        for (let i = 0; i < particleCount; i++) {
            const particle = new Particle();
            particle.reset(canvasWidth, canvasHeight, currentTime);
            particlesRef.current.push(particle);
        }
    }, [particleCount]);

    const updateParticles = useCallback((deltaTime: number, currentTime: number) => {
        if (!isVisibleRef.current || !isAnimatingRef.current) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const particles = particlesRef.current;
        const cursorX = cursorRef.current.x;
        const cursorY = cursorRef.current.y;

        particles.forEach(particle => {
            if (particle.active) {
                particle.update(deltaTime, canvas.width, canvas.height, currentTime);

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

        const inactiveParticles = particles.filter(p => !p.active);
        if (inactiveParticles.length > 0) {
            const particleToReset = inactiveParticles[Math.floor(Math.random() * inactiveParticles.length)];
            particleToReset.reset(canvas.width, canvas.height, currentTime);
        }
    }, []);

    const drawParticles = useCallback(() => {
        if (!isVisibleRef.current || !isAnimatingRef.current) return;

        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!ctx || !canvas) return;

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

    const animate = useCallback((currentTime: number) => {
      if (!isVisibleRef.current || !isAnimatingRef.current) {
          if (animationRef.current !== null) {
              cancelAnimationFrame(animationRef.current);
              animationRef.current = null;
          }
          return;
      }

      const deltaTime = currentTime - lastTimeRef.current;
      lastTimeRef.current = currentTime;

      // Prevent large time jumps
      const maxDeltaTime = 1000 / 30; // max 33ms
      const clampedDeltaTime = Math.min(deltaTime, maxDeltaTime);
      
      accumulatedTimeRef.current += clampedDeltaTime;

      while (accumulatedTimeRef.current >= fixedTimeStep) {
          updateParticles(fixedTimeStep, currentTime);
          accumulatedTimeRef.current -= fixedTimeStep;
      }

      drawParticles();

      animationRef.current = requestAnimationFrame(animate);
  }, [updateParticles, drawParticles]);

  // Only start animation when explicitly requested
  const startAnimation = useCallback(() => {
      if (document.visibilityState === 'visible') {
          console.log('Starting fresh animation');
          
          // Force cleanup first
          forceCleanup();
          
          // Set up fresh state
          isVisibleRef.current = true;
          isAnimatingRef.current = true;
          lastTimeRef.current = performance.now();
          accumulatedTimeRef.current = 0;
          
          const canvas = canvasRef.current;
          if (canvas) {
              // Ensure fresh canvas dimensions
              canvas.width = window.innerWidth;
              canvas.height = window.innerHeight;
              
              // Initialize fresh particles
              initParticles(canvas.width, canvas.height, performance.now());
              
              // Start fresh animation loop
              setIsLoaded(true);
              animationRef.current = requestAnimationFrame(animate);
          }
      }
  }, [animate, forceCleanup, initParticles]);

  // Handle visibility changes
  useEffect(() => {
      const handleVisibilityChange = () => {
          if (document.visibilityState === 'hidden') {
              console.log('Page hidden - forcing cleanup');
              forceCleanup();
          } else if (document.visibilityState === 'visible' && pathname === '/') {
              console.log('Page visible - starting fresh animation');
              setTimeout(startAnimation, 0);
          }
      };

      // Handle page hide event separately
      const handlePageHide = () => {
          console.log('Page hide event - forcing cleanup');
          forceCleanup();
      };

      // Handle before unload
      const handleBeforeUnload = () => {
          console.log('Before unload - forcing cleanup');
          forceCleanup();
      };

      // Handle tab blur with timeout to ensure it runs
      const handleBlur = () => {
          console.log('Window blur - forcing cleanup');
          setTimeout(forceCleanup, 0);
      };

      // Handle tab focus with timeout to ensure proper startup
      const handleFocus = () => {
          if (pathname === '/') {
              console.log('Window focus - starting fresh animation');
              setTimeout(startAnimation, 0);
          }
      };

      // Add all event listeners with capture to ensure they run first
      document.addEventListener('visibilitychange', handleVisibilityChange, true);
      window.addEventListener('pagehide', handlePageHide, true);
      window.addEventListener('beforeunload', handleBeforeUnload, true);
      window.addEventListener('blur', handleBlur, true);
      window.addEventListener('focus', handleFocus, true);

      return () => {
          // Remove all event listeners
          document.removeEventListener('visibilitychange', handleVisibilityChange, true);
          window.removeEventListener('pagehide', handlePageHide, true);
          window.removeEventListener('beforeunload', handleBeforeUnload, true);
          window.removeEventListener('blur', handleBlur, true);
          window.removeEventListener('focus', handleFocus, true);
          // Force cleanup on unmount
          forceCleanup();
      };
  }, [pathname, forceCleanup, startAnimation]);

  // Handle route changes
  useEffect(() => {
      if (pathname === '/') {
          console.log('Route changed to home - starting fresh animation');
          startAnimation();
      } else {
          console.log('Route changed away from home - forcing cleanup');
          forceCleanup();
      }
  }, [pathname, startAnimation, forceCleanup]);

  // Handle resize
  useEffect(() => {
      const handleResize = () => {
          if (pathname === '/' && document.visibilityState === 'visible') {
              console.log('Window resized - restarting animation');
              startAnimation();
          }
      };

      window.addEventListener('resize', handleResize, true);

      return () => {
          window.removeEventListener('resize', handleResize, true);
      };
  }, [pathname, startAnimation]);

  // Initial setup
  useEffect(() => {
      if (typeof window === 'undefined') return;

      const canvas = canvasRef.current;
      if (!canvas) return;

      function handleMouseMove(event: MouseEvent) {
          if (isVisibleRef.current && isAnimatingRef.current) {
              cursorRef.current = { x: event.clientX, y: event.clientY };
          }
      }

      function handleTouchMove(event: TouchEvent) {
          if (isVisibleRef.current && isAnimatingRef.current && event.touches.length === 1) {
              const touch = event.touches[0];
              cursorRef.current = { x: touch.clientX, y: touch.clientY };
          }
      }

      // Set up event listeners
      window.addEventListener('mousemove', handleMouseMove, { passive: true });
      window.addEventListener('touchmove', handleTouchMove, { passive: true });

      // Start animation if we're on the home page
      if (pathname === '/' && document.visibilityState === 'visible') {
          startAnimation();
      }

      return () => {
          window.removeEventListener('mousemove', handleMouseMove);
          window.removeEventListener('touchmove', handleTouchMove);
          forceCleanup();
      };
  }, [pathname, startAnimation, forceCleanup]);

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

export default DynamicConstellationBackground;