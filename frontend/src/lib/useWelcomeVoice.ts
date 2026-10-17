'use client';

import { useEffect, useRef, useState } from 'react';

interface UseWelcomeVoiceOptions {
  userEmail?: string;
  enabled?: boolean;
}

const ADMIN_EMAILS = ['ashcreation31@gmail.com', 'tameem0805@gmail.com'];

export function useWelcomeVoice({ userEmail, enabled = true }: UseWelcomeVoiceOptions) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const synthesisRef = useRef<SpeechSynthesisUtterance | null>(null);
  const hasAttemptedPlayRef = useRef(false);

  // Load mute state from localStorage
  useEffect(() => {
    const savedMuteState = localStorage.getItem('voice_welcome_muted');
    if (savedMuteState !== null) {
      setIsMuted(JSON.parse(savedMuteState));
    }
  }, []);

  // Save mute state to localStorage
  useEffect(() => {
    localStorage.setItem('voice_welcome_muted', JSON.stringify(isMuted));
  }, [isMuted]);

  const getWelcomeMessage = (): string => {
    if (ADMIN_EMAILS.includes(userEmail || '')) {
      return 'Welcome back, Boss. I\'m Your Skyra.';
    }
    return 'Welcome to Skyra. I\'m your intelligence partner.';
  };

  const selectFemaleVoice = (): SpeechSynthesisVoice | null => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return null;
    }

    const voices = window.speechSynthesis.getVoices();
    
    // Preferred female voice names in order of preference
    const preferredVoices = [
      'Microsoft Zira',
      'Microsoft Jenny', 
      'Google UK English Female',
      'Google US English',
      'Samantha',
      'Karen',
      'Victoria',
      'Microsoft Aria',
      'Microsoft Huihui',
      'Fiona',
      'Moira',
      'Tessa',
      'Veena',
      'Alex',
      'Google español'
    ];

    // Try to find preferred voices
    for (const preferredName of preferredVoices) {
      const voice = voices.find(v => 
        v.name.toLowerCase().includes(preferredName.toLowerCase()) ||
        v.name.includes('Female') ||
        v.name.includes('female')
      );
      if (voice && voice.lang.startsWith('en')) {
        if (process.env.NODE_ENV === 'development') {
          console.debug('Selected voice:', voice.name, voice.lang);
        }
        return voice;
      }
    }

    // Fallback to any English female voice
    const femaleVoice = voices.find(v => 
      v.lang.startsWith('en') && 
      (v.name.toLowerCase().includes('female') || 
       v.name.toLowerCase().includes('zira') ||
       v.name.toLowerCase().includes('jenny') ||
       v.name.toLowerCase().includes('samantha') ||
       v.name.toLowerCase().includes('karen') ||
       v.name.toLowerCase().includes('victoria'))
    );

    if (femaleVoice) {
      if (process.env.NODE_ENV === 'development') {
        console.debug('Selected fallback female voice:', femaleVoice.name, femaleVoice.lang);
      }
      return femaleVoice;
    }

    // Final fallback to any English voice
    const englishVoice = voices.find(v => v.lang.startsWith('en'));
    if (englishVoice && process.env.NODE_ENV === 'development') {
      console.debug('Selected fallback English voice:', englishVoice.name, englishVoice.lang);
    }
    return englishVoice || null;
  };

  const speak = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return;
    }

    if (isMuted || hasAttemptedPlayRef.current) {
      return;
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const message = getWelcomeMessage();
    const utterance = new SpeechSynthesisUtterance(message);

    // Configure soft voice settings
    utterance.lang = 'en-US';
    utterance.rate = 0.92; // Slightly slower for softer delivery
    utterance.pitch = 1.2; // Higher pitch for female voice
    utterance.volume = 0.9; // Slightly softer volume

    // Select female voice
    const selectedVoice = selectFemaleVoice();
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }

    utterance.onstart = () => {
      setIsSpeaking(true);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      synthesisRef.current = null;
    };

    utterance.onerror = (event) => {
      setIsSpeaking(false);
      synthesisRef.current = null;
      // Silent error handling - no console errors in production
      if (process.env.NODE_ENV === 'development') {
        console.debug('Speech synthesis error (development only):', event.error);
      }
    };

    synthesisRef.current = utterance;
    hasAttemptedPlayRef.current = true;

    try {
      window.speechSynthesis.speak(utterance);
    } catch (error) {
      // Silent error handling
      if (process.env.NODE_ENV === 'development') {
        console.debug('Speech synthesis speak error (development only):', error);
      }
    }
  };

  const toggleMute = () => {
    setIsMuted(prev => !prev);
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  // Auto-play on mount with voice loading
  useEffect(() => {
    if (!enabled || isMuted) {
      return;
    }

    const attemptPlay = () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        // Load voices first
        window.speechSynthesis.getVoices();
        
        // Small delay to ensure voices are loaded
        const timer = setTimeout(() => {
          speak();
        }, 300);

        return () => clearTimeout(timer);
      }
    };

    // Initial attempt
    const cleanup = attemptPlay();

    // Also try when voices change (for Chrome)
    const handleVoicesChanged = () => {
      if (!hasAttemptedPlayRef.current) {
        speak();
      }
    };

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = handleVoicesChanged;
    }

    return () => {
      if (cleanup) cleanup();
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.onvoiceschanged = null;
      }
      if (synthesisRef.current) {
        window.speechSynthesis.cancel();
      }
    };
  }, [enabled, isMuted, userEmail]);

  return {
    isSpeaking,
    isMuted,
    toggleMute,
    isSupported: typeof window !== 'undefined' && 'speechSynthesis' in window
  };
}
