'use client';

import { useEffect } from 'react';
import { X, GitBranch, Link as LinkIcon, Globe, ExternalLink, Award, Briefcase, Code, Zap } from 'lucide-react';

interface FounderModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Project {
  name: string;
  tech: readonly string[];
}

const founderData = {
  name: 'AMAAN SHAIKH',
  role: 'Founder & Developer',
  bio: 'Software Engineer and Full-Stack Developer with hands-on experience building enterprise applications, intelligent platforms, healthcare systems, and business management solutions. Passionate about modern software engineering and emerging technologies.',
  skills: [
    'Full-Stack Development',
    'Software Architecture & System Design',
    'AI, LLMs & Intelligent Systems',
    'Backend & API Development',
    'Modern Frontend Technologies',
    'Database Management & Optimization',
    'Machine Learning & Natural Language Processing',
    'DevOps & Intelligent Automation'
  ],
  experience: [
    { company: 'Zidio Development', role: 'Java Full Stack Developer Intern', period: 'June 2026 – Aug 2026' },
    { company: 'CerenMobile', role: 'Software Engineer Intern', period: 'Oct 2025 – Apr 2026' },
    { company: 'Freelance', role: 'Full Stack Developer', period: '2024 – Present' }
  ],
  projects: [
    { name: 'SKYRA', tech: ['Next.js', 'Python', 'FastAPI', 'AI/LLM'] },
    { name: 'ASTRAA', tech: ['React', 'FastAPI', 'PostgreSQL'] },
    { name: 'Calisthenics Pro', tech: ['Next.js', 'Tailwind CSS', 'PostgreSQL'] },
    { name: 'KEYSTONE', tech: ['React', 'Node.js', 'MongoDB'] },
    { name: 'AAMDAR Fitness Club', tech: ['Next.js', 'Firebase', 'Tailwind CSS'] },
    { name: 'Hospital Management System', tech: ['Full-Stack Development', 'Python', 'Authentication Systems', 'SQLAlchemy', 'FastAPI', 'React.js'] }
  ] as const,
  achievements: [
    '12+ Projects Developed',
    '5+ Technical Sessions as Speaker',
    'Technical Workshops & Tech Meetups'
  ],
  socialLinks: {
    github: 'https://github.com/AmaanSha8805',
    linkedin: 'https://www.linkedin.com/in/amaan510',
    website: 'https://iamamaan.netlify.app'
  }
};

export function FounderModal({ isOpen, onClose }: FounderModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Content */}
      <div
        className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-[24px] p-6 md:p-8 animate-in zoom-in-95 duration-300 slide-in-from-bottom-4"
        style={{
          background: 'rgba(13,13,31,0.98)',
          border: '0.5px solid rgba(139,92,246,0.3)',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 0 60px rgba(233,30,140,0.15), 0 0 100px rgba(139,92,246,0.1)'
        }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="founder-modal-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, #E91E8C, #8b5cf6)',
                boxShadow: '0 0 30px rgba(233,30,140,0.4)'
              }}
            >
              <Code className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2
                id="founder-modal-title"
                className="text-2xl font-bold text-white"
              >
                Developer's Corner
              </h2>
              <p className="text-sm text-white/60">Meet the Founder</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-all"
            aria-label="Close modal"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-8">
          {/* Identity Section */}
          <div className="text-center space-y-4">
            <h3 className="text-4xl font-bold text-gradient">{founderData.name}</h3>
            <p className="text-xl text-[#E91E8C] font-medium">{founderData.role}</p>
            <p className="text-white/70 max-w-2xl mx-auto leading-relaxed">
              {founderData.bio}
            </p>
          </div>

          {/* Skills Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-white/60">
              <Zap className="w-5 h-5 text-[#E91E8C]" />
              <h4 className="font-semibold">Technical Expertise</h4>
            </div>
            <div className="flex flex-wrap gap-2">
              {founderData.skills.map((skill, index) => (
                <span
                  key={index}
                  className="px-3 py-1.5 text-sm rounded-full border border-[#E91E8C]/30 bg-[#E91E8C]/10 text-[#ff6b9d] hover:bg-[#E91E8C]/20 transition-colors"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Experience Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-white/60">
              <Briefcase className="w-5 h-5 text-[#8b5cf6]" />
              <h4 className="font-semibold">Experience</h4>
            </div>
            <div className="grid gap-3">
              {founderData.experience.map((exp, index) => (
                <div
                  key={index}
                  className="p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h5 className="font-semibold text-white">{exp.role}</h5>
                      <p className="text-sm text-[#E91E8C]">{exp.company}</p>
                    </div>
                    <span className="text-xs text-white/40">{exp.period}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Projects Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-white/60">
              <Award className="w-5 h-5 text-[#E91E8C]" />
              <h4 className="font-semibold">Featured Projects</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {founderData.projects.map((project, index) => (
                <div
                  key={index}
                  className="p-4 rounded-xl border border-white/10 bg-white/5 hover:border-[#E91E8C]/30 transition-all"
                >
                  <h5 className="font-semibold text-white mb-2">{project.name}</h5>
                  <div className="flex flex-wrap gap-1.5">
                    {project.tech.map((tech, techIndex) => (
                      <span
                        key={techIndex}
                        className="px-2 py-0.5 text-xs rounded border border-[#8b5cf6]/30 bg-[#8b5cf6]/10 text-[#a78bfa]"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Achievements Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-white/60">
              <Award className="w-5 h-5 text-[#8b5cf6]" />
              <h4 className="font-semibold">Highlights</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {founderData.achievements.map((achievement, index) => (
                <div
                  key={index}
                  className="p-4 rounded-xl border border-white/10 bg-white/5 text-center"
                >
                  <p className="text-sm text-white/80">{achievement}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Connect Section */}
          <div className="pt-6 border-t border-white/10">
            <div className="flex items-center justify-center gap-4">
              <a
                href={founderData.socialLinks.github}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-white/20 hover:border-[#E91E8C]/50 hover:bg-[#E91E8C]/10 transition-all text-white/80 hover:text-white"
              >
                <GitBranch className="w-5 h-5" />
                <span>GitHub</span>
              </a>
              <a
                href={founderData.socialLinks.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-white/20 hover:border-[#E91E8C]/50 hover:bg-[#E91E8C]/10 transition-all text-white/80 hover:text-white"
              >
                <LinkIcon className="w-5 h-5" />
                <span>LinkedIn</span>
              </a>
              <a
                href={founderData.socialLinks.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-white/20 hover:border-[#E91E8C]/50 hover:bg-[#E91E8C]/10 transition-all text-white/80 hover:text-white"
              >
                <Globe className="w-5 h-5" />
                <span>Website</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
