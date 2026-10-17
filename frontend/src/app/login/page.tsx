'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { FormField } from '@/components/forms/FormField';
import { PublicRoute } from '@/components/PublicRoute';
import { ArrowLeft } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await login(email, password);
      
      // Prime SpeechSynthesis to unlock audio context before redirect
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        // Initialize speech synthesis to unlock audio context
        window.speechSynthesis.getVoices();
        // Create and immediately cancel a silent utterance to prime the API
        const silentUtterance = new SpeechSynthesisUtterance('');
        silentUtterance.volume = 0;
        window.speechSynthesis.speak(silentUtterance);
        window.speechSynthesis.cancel();
      }
      
      window.location.href = '/dashboard';
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PublicRoute>
      <div className="flex min-h-screen items-center justify-center bg-[#080818] relative overflow-hidden px-4">
        {/* Premium gradient mesh background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] gradient-mesh opacity-30 rounded-full blur-[150px]" />
        </div>

        {/* Back to Home Button */}
        <Link
          href="/"
          className="absolute top-6 left-6 z-20 flex items-center gap-2 text-white/60 hover:text-white transition-all duration-200 group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-medium">Back to Home</span>
        </Link>

        <div className="w-full max-w-md space-y-8 relative z-10 page-enter">
          {/* Logo */}
          <div className="flex justify-center mb-10">
            <Image
              src="/skyra-logo.png"
              alt="SKYRA Logo"
              width={80}
              height={80}
              className="drop-shadow-[0_0_50px_rgba(233,30,140,0.7)]"
            />
          </div>

          <div className="text-center space-y-2">
            <h1 className="text-[22px] font-semibold tracking-tight text-white">Welcome to SKYRA</h1>
            <p className="text-[13px] text-white/40">Sign in to continue</p>
          </div>

          {/* Premium Glassmorphism Card */}
          <div 
            className="rounded-[20px] p-10 space-y-6 backdrop-blur-[20px]"
            style={{
              background: 'rgba(13,13,31,0.8)',
              border: '0.5px solid rgba(139,92,246,0.2)'
            }}
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              <FormField label="Email" error={error ? '' : undefined} required>
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isSubmitting}
                  autoComplete="email"
                  className="bg-[rgba(255,255,255,0.05)] border-[rgba(139,92,246,0.2)] focus:border-[rgba(233,30,140,0.5)]"
                />
              </FormField>

              <FormField label="Password" error={error ? '' : undefined} required>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isSubmitting}
                  autoComplete="current-password"
                  className="bg-[rgba(255,255,255,0.05)] border-[rgba(139,92,246,0.2)] focus:border-[rgba(233,30,140,0.5)]"
                />
              </FormField>

              {error && (
                <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400 animate-in fade-in slide-in-from-top-2">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                className="w-full text-white font-semibold rounded-[10px] button-hover"
                style={{
                  background: 'linear-gradient(135deg, #E91E8C, #8b5cf6)'
                }}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Signing in...
                  </span>
                ) : (
                  'Sign in'
                )}
              </Button>
            </form>
          </div>

          <div className="text-center text-sm">
            <span className="text-white/60">Don't have an account? </span>
            <Link
              href="/register"
              className="font-medium text-[#E91E8C] hover:text-[#ff6b9d] transition-all"
            >
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </PublicRoute>
  );
}
