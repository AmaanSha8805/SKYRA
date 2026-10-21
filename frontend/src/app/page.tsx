'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import Image from 'next/image';
import {
  Sparkles,
  Target,
  TrendingUp,
  FileText,
  Briefcase,
  Mic,
  ArrowRight,
  CheckCircle,
  Code
} from 'lucide-react';
import { FounderModal } from '@/components/landing/FounderModal';

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const [isFounderModalOpen, setIsFounderModalOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#080818]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#E91E8C] border-t-transparent" />
      </div>
    );
  }

  if (isAuthenticated) {
    return null;
  }

  const features = [
    {
      icon: <FileText className="w-6 h-6" />,
      title: 'Resume Intelligence',
      description: 'Intelligent resume analysis with ATS scoring and optimization recommendations'
    },
    {
      icon: <Briefcase className="w-6 h-6" />,
      title: 'Smart Job Matching',
      description: 'Find jobs that match your skills and experience with intelligent matching'
    },
    {
      icon: <Mic className="w-6 h-6" />,
      title: 'Interview Coach',
      description: 'Practice with intelligent interview questions and personalized feedback'
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: 'Skill Gap Analysis',
      description: 'Identify and bridge skill gaps to advance your career'
    },
    {
      icon: <Target className="w-6 h-6" />,
      title: 'Career Roadmap',
      description: 'Get personalized career paths and growth recommendations'
    },
    {
      icon: <Sparkles className="w-6 h-6" />,
      title: 'Intelligent Insights',
      description: 'Data-driven career intelligence to make informed decisions'
    }
  ];

  return (
    <main className="min-h-screen bg-[#080818] relative overflow-hidden">
      {/* Premium gradient mesh background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] gradient-mesh opacity-20 rounded-full blur-[200px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] gradient-mesh opacity-15 rounded-full blur-[180px]" />
      </div>

      <div className="relative z-10">
        {/* Developer's Corner Button - Top Corner */}
        <div className="absolute top-6 right-6 z-20">
          <button
            onClick={() => setIsFounderModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#E91E8C]/40 bg-[#E91E8C]/10 hover:bg-[#E91E8C]/20 transition-all duration-300 group"
            style={{
              boxShadow: '0 0 20px rgba(233,30,140,0.2)'
            }}
          >
            <Code className="w-5 h-5 text-[#E91E8C] group-hover:scale-110 transition-transform" />
            <span className="text-sm font-semibold text-[#ff6b9d] group-hover:text-white transition-colors">
              Developer's Corner
            </span>
          </button>
        </div>

        {/* Hero Section */}
        <section className="min-h-screen flex items-center justify-center px-4 py-20">
          <div className="max-w-6xl mx-auto text-center space-y-12 page-enter">
            {/* Logo */}
            <div className="flex justify-center mb-8">
              <div className="relative">
                <Image
                  src="/skyra-logo.png"
                  alt="SKYRA Logo"
                  width={120}
                  height={120}
                  className="drop-shadow-[0_0_40px_rgba(233,30,140,0.7)]"
                />
                <div className="absolute -top-3 -right-3 w-10 h-10 gradient-pink rounded-full flex items-center justify-center animate-bounce-subtle">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
              </div>
            </div>

            {/* Headline */}
            <div className="space-y-6">
              <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white leading-[1.15]">
                SKYRA
                <span className="block text-gradient mt-2">Career Intelligence</span>
              </h1>
              <p className="text-xl md:text-2xl text-white/60 max-w-3xl mx-auto">
                Transform your career with intelligent resume analysis, job matching, and personalized growth insights
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/register">
                <Button size="lg" className="gradient-pink text-white font-medium px-8 py-6 text-lg button-hover shadow-xl">
                  Get Started Free
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="glass text-white font-medium px-8 py-6 text-lg border-white/20 hover:border-skyra-pink/50">
                  Sign In
                </Button>
              </Link>
            </div>

            {/* Trust indicators */}
            <div className="flex flex-wrap justify-center gap-8 text-white/40 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-[#E91E8C]" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-[#E91E8C]" />
                <span>Free resume analysis</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-[#E91E8C]" />
                <span>Intelligent insights</span>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16 space-y-4">
              <h2 className="text-3xl md:text-5xl font-bold text-white">
                Everything you need to
                <span className="text-gradient"> accelerate your career</span>
              </h2>
              <p className="text-lg text-white/60 max-w-2xl mx-auto">
                Comprehensive tools to help you land your dream job
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="glass rounded-[14px] p-6 card-hover space-y-4 stagger-1"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-white"
                    style={{
                      background: 'linear-gradient(135deg, #E91E8C, #8b5cf6)'
                    }}
                  >
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                    <p className="text-white/60 text-sm">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4">
          <div className="max-w-4xl mx-auto">
            <div 
              className="rounded-3xl p-12 text-center space-y-6 relative overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, #E91E8C, #8b5cf6)'
              }}
            >
              <div className="absolute inset-0 gradient-mesh opacity-30" />
              <div className="relative z-10">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                  Ready to transform your career?
                </h2>
                <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
                  Join thousands of professionals who have accelerated their careers with SKYRA's intelligent insights
                </p>
                <Link href="/register">
                  <Button size="lg" className="bg-gradient-to-r from-[#E91E8C] to-[#8b5cf6] text-white hover:scale-[1.02] font-semibold px-8 py-6 text-lg button-hover shadow-xl hover:shadow-2xl transition-all duration-300 rounded-[10px]">
                    Start Your Journey
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-8 px-4 border-t border-white/10">
          <div className="max-w-6xl mx-auto text-center text-white/40 text-sm">
            <p>© 2024 SKYRA. Career Intelligence Platform.</p>
          </div>
        </footer>
      </div>

      {/* Founder Modal */}
      <FounderModal
        isOpen={isFounderModalOpen}
        onClose={() => setIsFounderModalOpen(false)}
      />
    </main>
  );
}
