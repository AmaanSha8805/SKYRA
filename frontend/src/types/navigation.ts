import { 
  LayoutDashboard, 
  FileText, 
  Briefcase, 
  Mic, 
  Search, 
  Map, 
  Mail, 
  TrendingUp, 
  Settings,
  Sparkles,
  Info
} from 'lucide-react';

export interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  disabled?: boolean;
  badge?: number;
  category?: 'main' | 'ai' | 'account';
}

export const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, category: 'main' },
  { id: 'resume', label: 'Resume', href: '/dashboard/resumes', icon: FileText, category: 'main' },
  { id: 'jobs', label: 'Job Matcher', href: '/dashboard/jobs', icon: Briefcase, category: 'ai' },
  { id: 'interview-coach', label: 'Interview Coach', href: '/dashboard/interview', icon: Mic, category: 'ai' },
  { id: 'resume-analyzer', label: 'Resume Analyzer', href: '/dashboard/resume-analyzer', icon: Search, category: 'ai' },
  { id: 'career-roadmap', label: 'Career Roadmap', href: '/dashboard/career-roadmap', icon: Map, category: 'ai' },
  { id: 'cover-letters', label: 'Cover Letters', href: '/dashboard/cover-letter', icon: Mail, category: 'ai' },
  { id: 'skill-gap', label: 'Skill Gap', href: '/dashboard/skill-gap', icon: TrendingUp, category: 'ai' },
  { id: 'about-us', label: 'About Us', href: '/dashboard/about-us', icon: Info, category: 'account' },
  { id: 'settings', label: 'Settings', href: '/dashboard/settings', icon: Settings, category: 'account' },
];
