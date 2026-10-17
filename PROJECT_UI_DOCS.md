# SKYRA Frontend Project Documentation

## 1. PROJECT OVERVIEW

**Project Name:** SKYRA - AI-Powered Career Intelligence Platform

**Purpose:** A comprehensive career intelligence platform that provides AI-powered resume analysis, job matching, interview coaching, skill gap analysis, and career roadmapping to help users make informed career decisions.

**Tech Stack:**
- Next.js 16.1.0 (React 19.0.0)
- TypeScript 5.5.4
- Tailwind CSS 3.4.7

**UI Framework:** Custom CSS with Tailwind CSS utility classes

---

## 2. FOLDER STRUCTURE

```
D:\MY PROJECTS\SKYRA\frontend\src
├── app
│   ├── dashboard
│   │   ├── career-roadmap
│   │   │   └── page.tsx
│   │   ├── cover-letter
│   │   │   └── page.tsx
│   │   ├── interview
│   │   │   └── page.tsx
│   │   ├── jobs
│   │   │   └── page.tsx
│   │   ├── resume-analyzer
│   │   │   └── page.tsx
│   │   ├── resumes
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx
│   │   ├── settings
│   │   │   └── page.tsx
│   │   ├── skill-gap
│   │   │   └── page.tsx
│   │   └── page.tsx
│   ├── login
│   │   └── page.tsx
│   ├── register
│   │   └── page.tsx
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components
│   ├── dashboard
│   │   ├── Badge.tsx
│   │   ├── Card.tsx
│   │   ├── DashboardLayout.tsx
│   │   ├── EmptyState.tsx
│   │   ├── Header.tsx
│   │   ├── LoadingState.tsx
│   │   ├── MobileNav.tsx
│   │   ├── ProgressBar.tsx
│   │   └── Sidebar.tsx
│   ├── forms
│   │   └── FormField.tsx
│   ├── resumes
│   │   ├── ResumeAnalysisResults.tsx
│   │   ├── ResumeDetail.tsx
│   │   ├── ResumeList.tsx
│   │   └── ResumeUpload.tsx
│   ├── ui
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   └── Textarea.tsx
│   ├── ProtectedRoute.tsx
│   ├── PublicRoute.tsx
│   └── SplashScreen.tsx
├── contexts
│   └── AuthContext.tsx
├── lib
│   ├── auth-client.ts
│   ├── career-roadmap-client.ts
│   ├── cover-letter-client.ts
│   ├── interview-client.ts
│   ├── jobs-client.ts
│   ├── pdf-client.ts
│   ├── resume-builder-client.ts
│   ├── resume-client.ts
│   ├── skill-gap-client.ts
│   └── utils.ts
└── types
    ├── auth.ts
    ├── career-roadmap.ts
    ├── cover-letter.ts
    ├── index.ts
    ├── interview.ts
    ├── jobs.ts
    ├── navigation.ts
    ├── resume.ts
    └── skill-gap.ts
```

---

## 3. DEPENDENCIES

### package.json
```json
{
  "name": "skyra-frontend",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "clsx": "^2.1.1",
    "lucide-react": "^1.38.0",
    "next": "16.1.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "tailwind-merge": "^2.4.0"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "^6.4.8",
    "@testing-library/react": "^16.0.0",
    "@types/node": "^22.0.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "@vitejs/plugin-react": "^4.3.1",
    "autoprefixer": "^10.4.19",
    "eslint": "^9.0.0",
    "eslint-config-next": "16.1.0",
    "postcss": "^8.4.40",
    "prettier": "^3.3.3",
    "prettier-plugin-tailwindcss": "^0.6.5",
    "tailwindcss": "^3.4.7",
    "tailwindcss-animate": "^1.0.7",
    "typescript": "^5.5.4",
    "vitest": "^2.0.5"
  }
}
```

### Main Dependencies:
- **next**: 16.1.0 - React framework
- **react**: 19.0.0 - UI library
- **react-dom**: 19.0.0 - React DOM renderer
- **lucide-react**: 1.38.0 - Icon library
- **clsx**: 2.1.1 - Utility for conditional class names
- **tailwind-merge**: 2.4.0 - Merge Tailwind CSS classes

---

## 4. STYLING CONFIGURATION

### tailwind.config.ts
```typescript
import type { Config } from "tailwindcss"

const config = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        skyra: {
          pink: "#E91E8C",
          "pink-light": "#ff6b9d",
          "pink-dark": "#c41876",
          blue: "#6366f1",
          "blue-light": "#818cf8",
          purple: "#a855f7",
          dark: "#0f0f1a",
          surface: "#0a0a12",
          "surface-elevated": "#12121c",
          background: "#050508",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xl: "1.25rem",
        "2xl": "1.5rem",
      },
      boxShadow: {
        "sm": "var(--shadow-sm)",
        DEFAULT: "var(--shadow)",
        "md": "var(--shadow-md)",
        "lg": "var(--shadow-lg)",
        "xl": "var(--shadow-xl)",
        "glow": "var(--shadow-glow)",
        "glow-strong": "var(--shadow-glow-strong)",
      },
      spacing: {
        "18": "4.5rem",
        "88": "22rem",
        "128": "32rem",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "slide-in-from-bottom": {
          from: { transform: "translateY(10px)" },
          to: { transform: "translateY(0)" },
        },
        "slide-in-from-top": {
          from: { transform: "translateY(-10px)" },
          to: { transform: "translateY(0)" },
        },
        "slide-in-from-left": {
          from: { transform: "translateX(-10px)" },
          to: { transform: "translateX(0)" },
        },
        "slide-in-from-right": {
          from: { transform: "translateX(10px)" },
          to: { transform: "translateX(0)" },
        },
        "scale-in": {
          from: { transform: "scale(0.95)", opacity: "0" },
          to: { transform: "scale(1)", opacity: "1" },
        },
        "bounce-subtle": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-5px)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.3s ease-out",
        "slide-in-from-bottom": "slide-in-from-bottom 0.4s ease-out",
        "slide-in-from-top": "slide-in-from-top 0.3s ease-out",
        "slide-in-from-left": "slide-in-from-left 0.3s ease-out",
        "slide-in-from-right": "slide-in-from-right 0.3s ease-out",
        "scale-in": "scale-in 0.2s ease-out",
        "bounce-subtle": "bounce-subtle 2s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config

export default config
```

### globals.css
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    /* SKYRA Premium Design System - Cosmic Dark + Purple/Pink Gradient Theme */
    --bg-primary: #080818;
    --bg-secondary: #0d0d1f;
    --bg-card: #0d0d1f;
    --accent-pink: #E91E8C;
    --accent-purple: #8b5cf6;
    --accent-pink-light: #ff6b9d;
    --accent-purple-light: #a78bfa;
    --text-primary: #ffffff;
    --text-secondary: rgba(255,255,255,0.5);
    --text-muted: rgba(255,255,255,0.3);
    --border: rgba(139,92,246,0.15);
    --border-pink: rgba(233,30,140,0.2);
    
    /* Score Colors */
    --score-high: #10b981;
    --score-medium: #f59e0b;
    --score-low: #E91E8C;
    
    /* Premium Shadows */
    --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.3);
    --shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -2px rgba(0, 0, 0, 0.3);
    --shadow-md: 0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -4px rgba(0, 0, 0, 0.3);
    --shadow-lg: 0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.4);
    --shadow-xl: 0 25px 50px -12px rgba(0, 0, 0, 0.6);
    --shadow-glow: 0 0 20px rgba(233, 30, 140, 0.15);
    --shadow-glow-strong: 0 0 30px rgba(233, 30, 140, 0.25);
  }
}

@layer base {
  * {
    @apply border-border;
  }
  
  body {
    @apply text-white;
    background-color: var(--bg-primary);
    font-feature-settings: "rlig" 1, "calt" 1;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
  
  /* Premium scrollbar styling */
  ::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }
  
  ::-webkit-scrollbar-track {
    background: var(--bg-secondary);
    border-radius: 3px;
  }
  
  ::-webkit-scrollbar-thumb {
    background: var(--accent-purple);
    border-radius: 3px;
    transition: background 0.2s ease;
  }
  
  ::-webkit-scrollbar-thumb:hover {
    background: var(--accent-pink);
  }
  
  /* Selection color */
  ::selection {
    background-color: var(--accent-pink);
    color: white;
  }
  
  /* Smooth iOS-like transitions */
  * {
    transition-property: color, background-color, border-color, transform, opacity, box-shadow;
    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
    transition-duration: 150ms;
  }
  
  /* Focus styles */
  *:focus-visible {
    outline: 2px solid var(--accent-pink);
    outline-offset: 2px;
  }
}

@layer utilities {
  /* Premium Glassmorphism */
  .glass {
    background: rgba(13, 13, 31, 0.85);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.08);
  }
  
  .glass-strong {
    background: rgba(13, 13, 31, 0.95);
    backdrop-filter: blur(30px);
    -webkit-backdrop-filter: blur(30px);
    border: 1px solid rgba(255, 255, 255, 0.12);
  }
  
  /* Premium Gradients */
  .gradient-pink {
    background: linear-gradient(135deg, var(--accent-pink), var(--accent-purple));
  }
  
  .gradient-blue {
    background: linear-gradient(135deg, var(--accent-purple), var(--accent-purple-light));
  }
  
  .gradient-purple {
    background: linear-gradient(135deg, var(--accent-purple), var(--accent-pink-light));
  }
  
  .gradient-mesh {
    background: 
      radial-gradient(at 40% 20%, var(--accent-pink) 0px, transparent 50%),
      radial-gradient(at 80% 0%, var(--accent-purple) 0px, transparent 50%),
      radial-gradient(at 0% 50%, var(--accent-purple-light) 0px, transparent 50%),
      radial-gradient(at 80% 50%, var(--accent-pink-light) 0px, transparent 50%),
      radial-gradient(at 0% 100%, var(--accent-purple-light) 0px, transparent 50%);
  }
  
  /* Text Gradient */
  .text-gradient {
    background: linear-gradient(135deg, var(--accent-pink), var(--accent-pink-light));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  
  .text-gradient-blue {
    background: linear-gradient(135deg, var(--accent-purple), var(--accent-purple-light));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  
  /* Premium Glow Effects */
  .glow-pink {
    box-shadow: var(--shadow-glow);
  }
  
  .glow-pink-strong {
    box-shadow: var(--shadow-glow-strong);
  }
  
  .glow-blue {
    box-shadow: 0 0 20px rgba(139, 92, 246, 0.15);
  }
  
  /* Premium Page Transitions */
  .page-enter {
    animation: pageEnter 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  }
  
  @keyframes pageEnter {
    from {
      opacity: 0;
      transform: translateY(16px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  /* Staggered animations */
  .stagger-1 { animation-delay: 0.1s; }
  .stagger-2 { animation-delay: 0.2s; }
  .stagger-3 { animation-delay: 0.3s; }
  .stagger-4 { animation-delay: 0.4s; }
  .stagger-5 { animation-delay: 0.5s; }
  
  /* Premium Card Hover */
  .card-hover {
    transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1), 
                box-shadow 0.2s cubic-bezier(0.4, 0, 0.2, 1),
                border-color 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  }
  
  .card-hover:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-lg), var(--shadow-glow);
    border-color: rgba(233, 30, 140, 0.25);
  }
  
  /* Premium Button Press */
  .button-press {
    transition: transform 0.1s cubic-bezier(0.4, 0, 0.2, 1), 
                box-shadow 0.1s cubic-bezier(0.4, 0, 0.2, 1);
  }
  
  .button-press:active {
    transform: scale(0.97);
  }
  
  /* Button Hover */
  .button-hover {
    transition: transform 0.15s cubic-bezier(0.4, 0, 0.2, 1), 
                box-shadow 0.15s cubic-bezier(0.4, 0, 0.2, 1),
                opacity 0.15s cubic-bezier(0.4, 0, 0.2, 1);
  }
  
  .button-hover:hover {
    transform: scale(1.02);
    box-shadow: 0 8px 25px rgba(233, 30, 140, 0.3);
    opacity: 0.9;
  }
  
  /* Skeleton Loading */
  .skeleton {
    background: linear-gradient(90deg, 
      var(--bg-secondary) 25%, 
      var(--bg-card) 50%, 
      var(--bg-secondary) 75%);
    background-size: 200% 100%;
    animation: skeleton 1.5s ease-in-out infinite;
  }
  
  @keyframes skeleton {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }
  
  /* Scale animation on hover */
  .scale-hover {
    transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  }
  
  .scale-hover:hover {
    transform: scale(1.05);
  }
  
  /* Fade in animation */
  .fade-in {
    animation: fadeIn 0.3s ease-out;
  }
  
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  /* Slide up animation */
  .slide-up {
    animation: slideUp 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  }
  
  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  /* Pulse animation */
  .pulse {
    animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  }
  
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
  
  /* Bounce animation */
  .bounce {
    animation: bounce 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  }
  
  @keyframes bounce {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
  }
  
  /* Sidebar nav items transition */
  .sidebar-nav-item {
    transition: background 0.15s, color 0.15s;
  }
}
```

### Theme/Color Configuration

**Primary Color System:**
- Background Primary: `#080818` (Cosmic Dark)
- Background Secondary: `#0d0d1f` (Darker purple-tinted dark)
- Card Background: `#0d0d1f`
- Accent Pink: `#E91E8C`
- Accent Purple: `#8b5cf6`
- Accent Pink Light: `#ff6b9d`
- Accent Purple Light: `#a78bfa`

**Text Colors:**
- Primary Text: `#ffffff`
- Secondary Text: `rgba(255,255,255,0.5)`
- Muted Text: `rgba(255,255,255,0.3)`

**Border Colors:**
- Border: `rgba(139,92,246,0.15)`
- Border Pink: `rgba(233,30,140,0.2)`

**Score Colors:**
- High Score (>=80): `#10b981` (Green)
- Medium Score (>=60): `#f59e0b` (Amber)
- Low Score (<60): `#E91E8C` (Pink)

---

## 5. ALL UI FILES

### Filename: src/app/layout.tsx
```tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { SplashScreen } from "@/components/SplashScreen";

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "SKYRA - AI-Powered Career Intelligence",
  description: "Understand your resume, analyze jobs, identify skill gaps, and make better career decisions.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans antialiased">
        <SplashScreen />
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
```

### Filename: src/app/page.tsx
```tsx
'use client';

import { useEffect } from 'react';
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
  CheckCircle
} from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

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
      description: 'AI-powered resume analysis with ATS scoring and optimization recommendations'
    },
    {
      icon: <Briefcase className="w-6 h-6" />,
      title: 'Smart Job Matching',
      description: 'Find jobs that match your skills and experience with intelligent matching'
    },
    {
      icon: <Mic className="w-6 h-6" />,
      title: 'Interview Coach',
      description: 'Practice with AI-powered interview questions and personalized feedback'
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
      title: 'AI-Powered Insights',
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
              <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white">
                AI-Powered
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
                <span>AI-powered insights</span>
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
                Comprehensive tools powered by AI to help you land your dream job
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                  Join thousands of professionals who have accelerated their careers with SKYRA's AI-powered insights
                </p>
                <Link href="/register">
                  <Button size="lg" className="bg-white text-[#E91E8C] hover:bg-white/90 font-medium px-8 py-6 text-lg button-hover shadow-xl">
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
            <p>© 2024 SKYRA. AI-Powered Career Intelligence Platform.</p>
          </div>
        </footer>
      </div>
    </main>
  );
}
```

### Filename: src/components/SplashScreen.tsx
```tsx
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

export function SplashScreen() {
  const [isVisible, setIsVisible] = useState(true);
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    // Check if this is the first visit in this session
    const hasVisited = sessionStorage.getItem('skyra_has_visited');
    
    if (hasVisited) {
      setIsVisible(false);
      return;
    }
    
    // Start fade out after 2.5 seconds
    const fadeOutTimer = setTimeout(() => {
      setIsFadingOut(true);
    }, 2500);

    // Completely remove after fade out animation
    const removeTimer = setTimeout(() => {
      setIsVisible(false);
      sessionStorage.setItem('skyra_has_visited', 'true');
    }, 3000);

    return () => {
      clearTimeout(fadeOutTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-[#080818] transition-opacity duration-500 ${
        isFadingOut ? 'opacity-0' : 'opacity-100'
      }`}
    >
      <div className="flex flex-col items-center space-y-4">
        {/* Logo with animation */}
        <div className="relative animate-[fadeInScale_2s_ease-out]">
          <Image
            src="/skyra-logo.png"
            alt="SKYRA Logo"
            width={200}
            height={200}
            className="drop-shadow-[0_0_30px_rgba(233,30,140,0.5)]"
          />
        </div>
        
        {/* Tagline with delay */}
        <p className="text-white/40 text-[11px] tracking-[3px] animate-[fadeIn_1s_ease-out_1s_both]">
          AI-POWERED CAREER INTELLIGENCE
        </p>
      </div>

      <style jsx>{`
        @keyframes fadeInScale {
          0% {
            opacity: 0;
            transform: scale(0.8);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes fadeIn {
          0% {
            opacity: 0;
            transform: translateY(20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
```

### Filename: src/components/ProtectedRoute.tsx
```tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [showSpinner, setShowSpinner] = useState(true);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSpinner(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading && showSpinner) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
```

### Filename: src/components/PublicRoute.tsx
```tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
```

### Filename: src/contexts/AuthContext.tsx
```tsx
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authClient } from '@/lib/auth-client';
import { AuthResponse } from '@/types/auth';

interface AuthContextType {
  user: AuthResponse['user'] | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, full_name: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthResponse['user'] | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    if (authClient.isAuthenticated()) {
      try {
        const userData = await authClient.getCurrentUser();
        setUser(userData as AuthResponse['user']);
      } catch (error) {
        authClient.logout();
      }
    }
    setIsLoading(false);
  };

  const login = async (email: string, password: string) => {
    const response = await authClient.login({ email, password });
    setUser(response.user);
    setIsLoading(false);
  };

  const register = async (email: string, password: string, full_name: string) => {
    const response = await authClient.register({ email, password, full_name });
    setUser(response.user);
    setIsLoading(false);
  };

  const logout = () => {
    authClient.logout();
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const userData = await authClient.getCurrentUser();
      setUser(userData as AuthResponse['user']);
    } catch (error) {
      authClient.logout();
      setUser(null);
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    await authClient.changePassword({
      current_password: currentPassword,
      new_password: newPassword,
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        refreshUser,
        changePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
```

### Filename: src/components/dashboard/DashboardLayout.tsx
```tsx
'use client';

import { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { MobileNav } from './MobileNav';
import { cn } from '@/lib/utils';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#080818]">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <Sidebar
          isCollapsed={isSidebarCollapsed}
          onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />
      </div>

      {/* Mobile Navigation */}
      <MobileNav
        isOpen={isMobileNavOpen}
        onClose={() => setIsMobileNavOpen(false)}
      />

      {/* Main Content */}
      <div
        className={cn(
          'transition-all duration-300',
          'md:ml-64',
          isSidebarCollapsed && 'md:ml-16'
        )}
      >
        <Header onMobileMenuToggle={() => setIsMobileNavOpen(true)} />
        <main className="p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
```

### Filename: src/components/dashboard/Card.tsx
```tsx
import React from 'react';
import { cn } from '@/lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'outline' | 'elevated' | 'glass' | 'glass-strong';
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'rounded-[14px] border text-white transition-all duration-200 card-hover',
          {
            'border-[rgba(139,92,246,0.15)] bg-[#0d0d1f] shadow-md': variant === 'default',
            'border-[rgba(139,92,246,0.15)] bg-transparent': variant === 'outline',
            'border-[rgba(139,92,246,0.15)] bg-[#0d0d1f] shadow-lg': variant === 'elevated',
            'glass': variant === 'glass',
            'glass-strong': variant === 'glass-strong',
          },
          className
        )}
        {...props}
      />
    );
  }
);

Card.displayName = 'Card';

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-col space-y-1.5 p-6', className)}
    {...props}
  />
));

CardHeader.displayName = 'CardHeader';

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn('text-lg font-semibold leading-none tracking-tight text-white', className)}
    {...props}
  />
));

CardTitle.displayName = 'CardTitle';

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-sm text-white/60', className)}
    {...props}
  />
));

CardDescription.displayName = 'CardDescription';

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('p-6 pt-0', className)} {...props} />
));

CardContent.displayName = 'CardContent';

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex items-center p-6 pt-0', className)}
    {...props}
  />
));

CardFooter.displayName = 'CardFooter';

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };
```

### Filename: src/components/ui/Button.tsx
```tsx
import React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link' | 'gradient' | 'glass';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    return (
      <button
        className={cn(
          'inline-flex items-center justify-center text-sm font-medium',
          'ring-offset-background transition-all duration-150',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E91E8C] focus-visible:ring-offset-2',
          'disabled:pointer-events-none disabled:opacity-50',
          'button-press',
          {
            'bg-[linear-gradient(135deg,#E91E8C,#8b5cf6)] text-white shadow-lg hover:shadow-xl button-hover': variant === 'default',
            'bg-red-500 text-white hover:bg-red-500/90 shadow-lg': variant === 'destructive',
            'border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)] text-[rgba(255,255,255,0.7)] hover:text-white': variant === 'outline',
            'bg-[rgba(255,255,255,0.05)] text-white hover:bg-[rgba(255,255,255,0.1)]': variant === 'secondary',
            'hover:bg-[rgba(255,255,255,0.05)] hover:text-white': variant === 'ghost',
            'text-[#E91E8C] underline-offset-4 hover:underline': variant === 'link',
            'bg-[linear-gradient(135deg,#E91E8C,#8b5cf6)] text-white shadow-lg hover:shadow-xl button-hover': variant === 'gradient',
            'glass text-white hover:bg-white/5 border-white/10': variant === 'glass',
          },
          {
            'h-10 px-4 py-2 rounded-[10px]': size === 'default',
            'h-9 rounded-lg px-3': size === 'sm',
            'h-12 px-8 rounded-[10px]': size === 'lg',
            'h-10 w-10 rounded-lg': size === 'icon',
          },
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';

export { Button };
```

### Filename: src/components/ui/Input.tsx
```tsx
import React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-10 w-full rounded-[10px] border px-3 py-2 text-sm text-white ring-offset-background',
          'file:border-0 file:bg-transparent file:text-sm file:font-medium',
          'placeholder:text-[rgba(255,255,255,0.25)]',
          'focus-visible:outline-none focus-visible:ring-0 focus-visible:border-[rgba(233,30,140,0.4)]',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'transition-all duration-150',
          'bg-[rgba(255,255,255,0.04)] border-[rgba(139,92,246,0.2)]',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';

export { Input };
```

### Filename: src/app/login/page.tsx
```tsx
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

        <div className="w-full max-w-md space-y-8 relative z-10 page-enter">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <Image
              src="/skyra-logo.png"
              alt="SKYRA Logo"
              width={48}
              height={48}
              className="drop-shadow-[0_0_30px_rgba(233,30,140,0.6)]"
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
```

### Filename: src/app/register/page.tsx
```tsx
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
          <div className="flex justify-center mb-6">
            <Image
              src="/skyra-logo.png"
              alt="SKYRA Logo"
              width={48}
              height={48}
              className="drop-shadow-[0_0_30px_rgba(233,30,140,0.6)]"
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
```

### Filename: src/app/dashboard/page.tsx
```tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/dashboard/Card';
import { Badge } from '@/components/dashboard/Badge';
import { ProgressBar } from '@/components/dashboard/ProgressBar';
import { EmptyState } from '@/components/dashboard/EmptyState';
import { LoadingState } from '@/components/dashboard/LoadingState';
import { Button } from '@/components/ui/Button';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { resumeClient } from '@/lib/resume-client';
import { 
  FileText, 
  Search, 
  Briefcase, 
  Mic, 
  Map, 
  Mail, 
  TrendingUp, 
  Settings,
  Sparkles,
  Target,
  Activity
} from 'lucide-react';

function DashboardContent() {
  const { user } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [totalResumes, setTotalResumes] = useState(0);
  const [latestAtsScore, setLatestAtsScore] = useState<number | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      const resumesResponse = await resumeClient.listResumes();
      setTotalResumes(resumesResponse.total);

      // Get latest ATS score from the most recent resume
      if (resumesResponse.resumes.length > 0) {
        const latestResume = resumesResponse.resumes[0];
        try {
          const analysis = await resumeClient.getResumeAnalysis(latestResume.id);
          setLatestAtsScore(analysis.overall_score);
        } catch (error) {
          // No analysis available yet
          setLatestAtsScore(null);
        }
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const quickActions = [
    { id: 'upload-resume', label: 'Upload Resume', icon: FileText, href: '/dashboard/resumes' },
    { id: 'analyze-resume', label: 'Analyze Resume', icon: Search, href: '/dashboard/resume-analyzer' },
    { id: 'find-jobs', label: 'Find Jobs', icon: Briefcase, href: '/dashboard/jobs' },
    { id: 'interview-coach', label: 'Interview Coach', icon: Mic, href: '/dashboard/interview' },
    { id: 'career-roadmap', label: 'Career Roadmap', icon: Map, href: '/dashboard/career-roadmap' },
    { id: 'cover-letters', label: 'Cover Letters', icon: Mail, href: '/dashboard/cover-letter' },
    { id: 'skill-gap', label: 'Skill Gap', icon: TrendingUp, href: '/dashboard/skill-gap' },
    { id: 'settings', label: 'Settings', icon: Settings, href: '/dashboard/settings' },
  ];

  return (
    <div className="space-y-6 page-enter">
      {/* Welcome Section with Gradient Background */}
      <Card 
        className="overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, rgba(233,30,140,0.1), rgba(139,92,246,0.1))',
          borderColor: 'rgba(139,92,246,0.2)'
        }}
      >
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl md:text-3xl text-white">
            Welcome back, {user?.full_name || user?.email?.split('@')[0]}
          </CardTitle>
          <CardDescription className="text-white/80">
            Here's an overview of your career intelligence journey
          </CardDescription>
        </CardHeader>
      </Card>

      {isLoading ? (
        <LoadingState message="Loading your dashboard..." />
      ) : (
        <>
          {/* Stats Grid with Glassmorphism */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card variant="glass" className="card-hover stagger-1">
              <CardHeader className="pb-3">
                <CardDescription>Total Resumes</CardDescription>
                <CardTitle 
                  className="text-2xl"
                  style={{
                    color: totalResumes > 0 ? '#a78bfa' : 'inherit'
                  }}
                >
                  {totalResumes}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Badge variant={totalResumes > 0 ? "default" : "outline"}>
                  {totalResumes > 0 ? "Uploaded" : "No resumes"}
                </Badge>
              </CardContent>
            </Card>

            <Card variant="glass" className="card-hover stagger-2">
              <CardHeader className="pb-3">
                <CardDescription>Latest ATS Score</CardDescription>
                <CardTitle 
                  className="text-2xl"
                  style={{
                    color: latestAtsScore !== null 
                      ? (latestAtsScore >= 80 ? '#10b981' : latestAtsScore >= 60 ? '#f59e0b' : '#E91E8C')
                      : 'inherit'
                  }}
                >
                  {latestAtsScore !== null ? `${latestAtsScore}%` : '--'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Badge variant={latestAtsScore !== null ? "default" : "outline"}>
                  {latestAtsScore !== null ? "Analyzed" : "Not analyzed"}
                </Badge>
              </CardContent>
            </Card>

            <Card variant="glass" className="card-hover stagger-3">
              <CardHeader className="pb-3">
                <CardDescription>Job Matches</CardDescription>
                <CardTitle className="text-2xl">--</CardTitle>
              </CardHeader>
              <CardContent>
                <Badge variant="outline">No matches</Badge>
              </CardContent>
            </Card>

            <Card variant="glass" className="card-hover stagger-4">
              <CardHeader className="pb-3">
                <CardDescription>Skill Gaps</CardDescription>
                <CardTitle className="text-2xl">--</CardTitle>
              </CardHeader>
              <CardContent>
                <Badge variant="outline">Not analyzed</Badge>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card variant="glass" className="card-hover stagger-5">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Get started with these common tasks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {quickActions.map((action) => {
                  const Icon = action.icon;
                  return (
                    <Button
                      key={action.id}
                      variant="gradient"
                      className="h-auto flex-col gap-2 py-4 button-hover"
                      onClick={() => router.push(action.href)}
                    >
                      <Icon className="w-6 h-6" />
                      <span className="text-sm">{action.label}</span>
                    </Button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card variant="glass" className="card-hover">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your latest actions and updates</CardDescription>
            </CardHeader>
            <CardContent>
              <EmptyState
                title="No recent activity"
                description="Start by uploading your resume or exploring job matches to see your activity here."
              />
            </CardContent>
          </Card>

          {/* Skill Gap Analysis */}
          <Card variant="glass" className="card-hover">
            <CardHeader>
              <CardTitle>Skill Gap Analysis</CardTitle>
              <CardDescription>Identify and bridge your skill gaps</CardDescription>
            </CardHeader>
            <CardContent>
              <EmptyState
                icon={<TrendingUp className="w-12 h-12 text-white/20" />}
                title="Skill analysis not available"
                description="Upload your resume to get personalized skill gap recommendations."
              />
            </CardContent>
          </Card>

          {/* Job Match Insights */}
          <Card variant="glass" className="card-hover">
            <CardHeader>
              <CardTitle>Job Match Insights</CardTitle>
              <CardDescription>Discover jobs that match your profile</CardDescription>
            </CardHeader>
            <CardContent>
              <EmptyState
                icon={<Target className="w-12 h-12 text-white/20" />}
                title="No job matches yet"
                description="Complete your profile and upload your resume to start finding matching opportunities."
              />
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <DashboardContent />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
```

### Filename: src/components/dashboard/Sidebar.tsx
```tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { ChevronLeft, ChevronRight, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { navItems, NavItem } from '@/types/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface SidebarProps {
  isCollapsed?: boolean;
  onToggle?: () => void;
}

export function Sidebar({ isCollapsed = false, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const { user } = useAuth();

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 h-screen border-r bg-[#0d0d1f] transition-all duration-300',
        isCollapsed ? 'w-16' : 'w-64'
      )}
      style={{ borderColor: 'rgba(139,92,246,0.15)' }}
    >
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center px-4">
          <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
            <Image
              src="/skyra-logo.png"
              alt="SKYRA Logo"
              width={28}
              height={28}
              className="drop-shadow-[0_0_10px_rgba(233,30,140,0.5)]"
            />
            {!isCollapsed && <span className="text-white tracking-[2px]">SKYRA</span>}
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4">
          <ul className="space-y-6">
            <li>
              <div className="text-[9px] uppercase tracking-[1.5px] text-white/20 mb-2">
                Main
              </div>
              <ul className="space-y-1">
                {navItems.filter(item => !item.category || item.category === 'main').map((item) => (
                  <li key={item.id}>
                    <SidebarItem
                      item={item}
                      isActive={pathname === item.href}
                      isCollapsed={isCollapsed}
                    />
                  </li>
                ))}
              </ul>
            </li>
            <li>
              <div className="text-[9px] uppercase tracking-[1.5px] text-white/20 mb-2">
                AI Tools
              </div>
              <ul className="space-y-1">
                {navItems.filter(item => item.category === 'ai').map((item) => (
                  <li key={item.id}>
                    <SidebarItem
                      item={item}
                      isActive={pathname === item.href}
                      isCollapsed={isCollapsed}
                    />
                  </li>
                ))}
              </ul>
            </li>
            <li>
              <div className="text-[9px] uppercase tracking-[1.5px] text-white/20 mb-2">
                Account
              </div>
              <ul className="space-y-1">
                {navItems.filter(item => item.category === 'account').map((item) => (
                  <li key={item.id}>
                    <SidebarItem
                      item={item}
                      isActive={pathname === item.href}
                      isCollapsed={isCollapsed}
                    />
                  </li>
                ))}
              </ul>
            </li>
          </ul>
        </nav>

        {/* User Avatar */}
        <div className="p-4 border-t border-[rgba(139,92,246,0.15)]">
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, #E91E8C, #8b5cf6)',
                border: '2px solid rgba(139,92,246,0.3)'
              }}
            >
              <User className="w-5 h-5 text-white" />
            </div>
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {user?.full_name || user?.email?.split('@')[0]}
                </p>
                <p className="text-xs text-white/40 truncate">
                  {user?.email}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Toggle Button */}
        <button
          onClick={onToggle}
          className="flex h-12 items-center justify-center hover:bg-[#080818] transition-colors text-white/60 hover:text-white"
          aria-label="Toggle sidebar"
        >
          {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>
      </div>
    </aside>
  );
}

interface SidebarItemProps {
  item: NavItem;
  isActive: boolean;
  isCollapsed: boolean;
}

function SidebarItem({ item, isActive, isCollapsed }: SidebarItemProps) {
  const Icon = item.icon;
  
  const content = (
    <>
      <Icon className={cn("w-5 h-5", isActive && "text-[#E91E8C]")} />
      {!isCollapsed && (
        <span className="flex-1 text-sm font-medium">{item.label}</span>
      )}
      {!isCollapsed && item.badge && (
        <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-xs text-[#a78bfa] border border-[rgba(139,92,246,0.3)]">
          {item.badge}
        </span>
      )}
    </>
  );

  if (item.disabled) {
    return (
      <div
        className={cn(
          'flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-white/35 opacity-50 cursor-not-allowed',
          isCollapsed && 'justify-center'
        )}
      >
        {content}
      </div>
    );
  }

  return (
    <Link
      href={item.href}
      className={cn(
        'flex items-center gap-3 rounded-lg px-3 py-2 text-sm',
        'hover:text-white/60',
        isActive && 'bg-[rgba(139,92,246,0.15)] text-white border-l-2 border-[#8b5cf6] rounded-r-[10px] rounded-l-none',
        !isActive && 'text-white/35',
        isCollapsed && 'justify-center'
      )}
      style={{
        transition: 'background 0.15s, color 0.15s'
      }}
    >
      {content}
    </Link>
  );
}
```

---

## 6. CURRENT UI SCREENSHOT

**Note:** The current UI features a cosmic dark theme with purple/pink gradient accents. The main landing page shows:

- Dark background (#080818) with subtle gradient mesh effects
- SKYRA logo with pink glow effect
- Hero section with "AI-Powered Career Intelligence" headline
- Feature cards with glassmorphism styling
- Call-to-action buttons with gradient backgrounds
- Trust indicators at the bottom

The login/register pages feature:
- Centered glassmorphism cards with backdrop blur
- Purple/pink gradient borders
- Styled input fields with focus states
- Gradient submit buttons

The dashboard features:
- Sidebar with navigation sections (Main, AI Tools, Account)
- User avatar with gradient border
- Glassmorphism cards for stats and quick actions
- Score-based color coding (green for high, amber for medium, pink for low)

---

## 7. ROUTING STRUCTURE

### Public Routes:
- `/` - Landing page (src/app/page.tsx)
- `/login` - Login page (src/app/login/page.tsx)
- `/register` - Registration page (src/app/register/page.tsx)

### Protected Routes (Require Authentication):
- `/dashboard` - Main dashboard (src/app/dashboard/page.tsx)
- `/dashboard/resumes` - Resume management (src/app/dashboard/resumes/page.tsx)
- `/dashboard/resume-analyzer` - Resume analysis tool (src/app/dashboard/resume-analyzer/page.tsx)
- `/dashboard/jobs` - Job matching (src/app/dashboard/jobs/page.tsx)
- `/dashboard/interview` - Interview coach (src/app/dashboard/interview/page.tsx)
- `/dashboard/career-roadmap` - Career roadmap (src/app/dashboard/career-roadmap/page.tsx)
- `/dashboard/cover-letter` - Cover letter generator (src/app/dashboard/cover-letter/page.tsx)
- `/dashboard/skill-gap` - Skill gap analysis (src/app/dashboard/skill-gap/page.tsx)
- `/dashboard/settings` - User settings (src/app/dashboard/settings/page.tsx)

### Route Protection:
- **PublicRoute** component wraps public pages and redirects authenticated users to dashboard
- **ProtectedRoute** component wraps protected pages and redirects unauthenticated users to login

---

## 8. STATE MANAGEMENT

**State Management Approach:** React Context API

### Authentication State (AuthContext.tsx):
The application uses React Context API for authentication state management:

- **Provider:** `AuthProvider` wraps the entire application
- **State:**
  - `user`: Current user object or null
  - `isLoading`: Loading state for auth operations
  - `isAuthenticated`: Boolean derived from user state
- **Methods:**
  - `login(email, password)`: Authenticate user
  - `register(email, password, full_name)`: Register new user
  - `logout()`: Clear authentication state
  - `refreshUser()`: Fetch current user data
  - `changePassword(currentPassword, newPassword)`: Update user password

### Component-Level State:
Most components use React's built-in `useState` and `useEffect` hooks for local state management:
- Form inputs (email, password, etc.)
- Loading states for async operations
- UI states (sidebar collapse, mobile menu, etc.)

### No Global State Library:
The project does not use Redux, Zustand, or any other global state management library. All state is managed through:
1. React Context API for authentication
2. React hooks for component-level state
3. API client libraries for data fetching

---

## ADDITIONAL NOTES

### Client Libraries:
The project includes several API client files in `src/lib/`:
- `auth-client.ts` - Authentication API calls
- `resume-client.ts` - Resume operations
- `jobs-client.ts` - Job matching
- `interview-client.ts` - Interview coaching
- `cover-letter-client.ts` - Cover letter generation
- `career-roadmap-client.ts` - Career roadmap
- `skill-gap-client.ts` - Skill gap analysis
- `pdf-client.ts` - PDF generation
- `resume-builder-client.ts` - Resume building

### Type Definitions:
TypeScript types are defined in `src/types/`:
- `auth.ts` - Authentication types
- `resume.ts` - Resume types
- `jobs.ts` - Job types
- `interview.ts` - Interview types
- `cover-letter.ts` - Cover letter types
- `career-roadmap.ts` - Career roadmap types
- `skill-gap.ts` - Skill gap types
- `navigation.ts` - Navigation item types

### Utility Functions:
- `src/lib/utils.ts` - Common utility functions including `cn()` for class name merging

---

**End of Documentation**
