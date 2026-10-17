'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface Particle {
  left: string;
  top: string;
  delay: string;
  duration: string;
}

export function SplashScreen() {
  const [mounted, setMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [animationPhase, setAnimationPhase] = useState(0);
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    setMounted(true);
    
    // Generate particles client-side only
    const newParticles = Array.from({ length: 20 }, () => ({
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      delay: `${Math.random() * 2}s`,
      duration: `${2 + Math.random() * 2}s`,
    }));
    setParticles(newParticles);

    // Check if this is the first visit in this session
    const hasVisited = sessionStorage.getItem('skyra_has_visited');
    
    if (hasVisited) {
      setIsVisible(false);
      return;
    }
    
    // Animation phases
    // Phase 1: Initial small scale with glow (0-1.5s)
    const phase1Timer = setTimeout(() => {
      setAnimationPhase(1);
    }, 1500);

    // Phase 2: Scale up with intensifying glow (1.5-3.5s)
    const phase2Timer = setTimeout(() => {
      setAnimationPhase(2);
    }, 3500);

    // Phase 3: Logo settles, start fade out (3.5-5s)
    const fadeOutTimer = setTimeout(() => {
      setIsFadingOut(true);
    }, 4500);

    // Completely remove after fade out animation
    const removeTimer = setTimeout(() => {
      setIsVisible(false);
      sessionStorage.setItem('skyra_has_visited', 'true');
    }, 5000);

    return () => {
      clearTimeout(phase1Timer);
      clearTimeout(phase2Timer);
      clearTimeout(fadeOutTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  // Don't render anything on server
  if (!mounted || !isVisible) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-[#080818] transition-opacity duration-500 ${
        isFadingOut ? 'opacity-0' : 'opacity-100'
      }`}
    >
      {/* Premium gradient mesh background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] gradient-mesh opacity-40 rounded-full blur-[200px] animate-[gradientPulse_5s_ease-in-out]" />
      </div>

      {/* Particle effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map((particle, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white/30 rounded-full animate-[particleFloat_3s_ease-in-out_infinite"
            style={{
              left: particle.left,
              top: particle.top,
              animationDelay: particle.delay,
              animationDuration: particle.duration
            }}
          />
        ))}
      </div>

      <div className="flex flex-col items-center space-y-6 relative z-10">
        {/* Logo with premium animation */}
        <div 
          className={`relative transition-all duration-[2000ms] ease-out ${
            animationPhase >= 1 ? 'scale-100' : 'scale-50'
          }`}
          style={{
            transform: animationPhase >= 1 ? 'scale(1) rotate(0deg)' : 'scale(0.5) rotate(-5deg)',
            transition: 'transform 2s cubic-bezier(0.34, 1.56, 0.64, 1)'
          }}
        >
          <div className={`relative transition-all duration-[2000ms] ${
            animationPhase >= 2 ? 'drop-shadow-[0_0_100px_rgba(233,30,140,0.8)]' : 'drop-shadow-[0_0_30px_rgba(233,30,140,0.5)]'
          }`}>
            <Image
              src="/skyra-logo.png"
              alt="SKYRA Logo"
              width={200}
              height={200}
              className={`transition-all duration-[2000ms] ${
                animationPhase >= 1 ? 'animate-logoFloat' : ''
              }`}
            />
          </div>
        </div>
        
        {/* Tagline with slide-up animation */}
        <p 
          className={`text-white/40 text-[11px] tracking-[3px] transition-all duration-[1000ms] ${
            animationPhase >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
          style={{
            transitionDelay: animationPhase >= 1 ? '0.5s' : '0s'
          }}
        >
          AI-POWERED CAREER INTELLIGENCE
        </p>
      </div>

      <style jsx>{`
        @keyframes gradientPulse {
          0%, 100% {
            opacity: 0.3;
            transform: translate(-50%, -50%) scale(1);
          }
          50% {
            opacity: 0.5;
            transform: translate(-50%, -50%) scale(1.1);
          }
        }

        @keyframes particleFloat {
          0%, 100% {
            opacity: 0;
            transform: translateY(0) scale(0);
          }
          50% {
            opacity: 0.6;
            transform: translateY(-50px) scale(1);
          }
        }

        @keyframes logoFloat {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        .animate-logoFloat {
          animation: logoFloat 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
