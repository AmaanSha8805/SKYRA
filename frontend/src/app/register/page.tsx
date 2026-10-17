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

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      await register(email, password, fullName);
      window.location.href = '/dashboard';
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
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

        <div className="w-full max-w-md space-y-8 relative z-10 page-enter">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <Image
              src="/skyra-logo.png"
              alt="SKYRA Logo"
              width={72}
              height={72}
              className="drop-shadow-[0_0_40px_rgba(233,30,140,0.6)]"
            />
          </div>

          <div className="text-center space-y-2">
            <h1 className="text-[22px] font-semibold tracking-tight text-white">Welcome to SKYRA</h1>
            <p className="text-[13px] text-white/40">Create your account</p>
          </div>

          {/* Premium Glassmorphism Card */}
          <div 
            className="rounded-[20px] p-10 space-y-5 backdrop-blur-[20px]"
            style={{
              background: 'rgba(13,13,31,0.8)',
              border: '0.5px solid rgba(139,92,246,0.2)'
            }}
          >
            <form onSubmit={handleSubmit} className="space-y-5">
              <FormField label="Full Name" error={error ? '' : undefined} required>
                <Input
                  type="text"
                  placeholder="John Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  disabled={isSubmitting}
                  autoComplete="name"
                  className="bg-[rgba(255,255,255,0.05)] border-[rgba(139,92,246,0.2)] focus:border-[rgba(233,30,140,0.5)]"
                />
              </FormField>

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
                  autoComplete="new-password"
                  className="bg-[rgba(255,255,255,0.05)] border-[rgba(139,92,246,0.2)] focus:border-[rgba(233,30,140,0.5)]"
                />
              </FormField>

              <FormField label="Confirm Password" error={error ? '' : undefined} required>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={isSubmitting}
                  autoComplete="new-password"
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
                    Creating account...
                  </span>
                ) : (
                  'Create account'
                )}
              </Button>
            </form>
          </div>

          <div className="text-center text-sm">
            <span className="text-white/60">Already have an account? </span>
            <Link
              href="/login"
              className="font-medium text-[#E91E8C] hover:text-[#ff6b9d] transition-all"
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </PublicRoute>
  );
}
