'use client';

import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/dashboard/Card';
import { Badge } from '@/components/dashboard/Badge';
import { Button } from '@/components/ui/Button';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { 
  User, 
  Mail, 
  MapPin, 
  Code, 
  Briefcase, 
  ExternalLink, 
  GitBranch, 
  Link, 
  Globe,
  GraduationCap,
  Award,
  Zap,
  Trophy
} from 'lucide-react';

export default function AboutUsPage() {
  const profile = {
    name: 'Amaan Shaikh',
    role: 'FOUNDER & DEVELOPER',
    projectsRole: 'SKYRAA, ASTRAA, Calesthenics Pro',
    email: 'ashcreation31@gmail.com',
    email2: 'tameem0805@gmail.com',
    location: 'Maharashtra, India',
    bio: 'Software Engineer and Full-Stack Developer with hands-on experience building enterprise applications, intelligent platforms, healthcare systems, and business management solutions. My technical expertise includes Java, Spring Boot, React.js, Next.js, Python, FastAPI, PostgreSQL, and cloud technologies. With 12+ projects developed, I have gained practical experience in building scalable applications and delivering software solutions for real-world clients across healthcare, fitness, enterprise operations, and data-driven platforms. I have completed 2 professional internships, contributing to enterprise software development, mobile applications, RESTful APIs, database design, and end-to-end application delivery. I am passionate about modern software engineering and emerging technologies. My goal is to build impactful digital products, continuously expand my technical expertise, and contribute to the developer community through innovation, collaboration, and knowledge sharing.',
    skills: {
      languages: ['Java', 'JavaScript', 'TypeScript', 'Python', 'SQL'],
      frontend: ['React.js', 'Next.js', 'React Native', 'Tailwind CSS', 'HTML5', 'CSS3'],
      backend: ['Spring Boot', 'FastAPI', 'Express.js', 'REST APIs', 'JWT'],
      databases: ['PostgreSQL', 'MySQL', 'SQLite', 'SQLAlchemy', 'Prisma', 'Database Design', 'Database Normalization'],
      cloudDevOps: ['AWS', 'Jenkins', 'CI/CD', 'Cloud Deployment'],
      android: ['Android SDK', 'Android Studio', 'Firebase', 'SQLite'],
      aiLLM: ['LLMs', 'Prompt Engineering', 'RAG', 'LLM Agents', 'NLP', 'PyTorch', 'LSTM Models'],
      tools: ['GitHub', 'Postman', 'IntelliJ IDEA', 'N8N', 'Maven', 'Flyway', 'Swagger/OpenAPI', 'Cursor', 'Antigravity', 'Devin', 'Codex']
    },
    experience: [
      {
        company: 'Zidio Development',
        role: 'Java Full Stack Developer Intern',
        period: 'June 2026 – Aug 2026',
        description: 'Worked on full-stack development using Java, Spring Boot, and React.js'
      },
      {
        company: 'CerenMobile',
        role: 'Software Engineer Intern',
        period: 'Oct 2025 – Apr 2026',
        description: 'Developed mobile applications and backend APIs'
      },
      {
        company: 'Self-Employed',
        role: 'Freelance Full Stack Developer',
        period: '2024 – Present',
        description: 'Building web and mobile applications for clients'
      }
    ],
    projects: [
      {
        name: 'SKYRA',
        techStack: 'Next.js, Python, FastAPI, AI/LLM',
        link: '#'
      },
      {
        name: 'ASTRAA',
        techStack: 'React, FastAPI, PostgreSQL',
        link: 'https://astraa-flax.vercel.app'
      },
      {
        name: 'Calisthenics Pro',
        techStack: 'Next.js, Tailwind CSS, PostgreSQL',
        link: 'https://calesthenics-pro.vercel.app'
      },
      {
        name: 'KEYSTONE',
        techStack: 'React, Node.js, MongoDB',
        link: 'https://keystone-virid.app'
      },
      {
        name: 'AAMDAR Fitness Club',
        techStack: 'Next.js, Firebase, Tailwind CSS',
        link: 'https://aamdarfitnessclub.in'
      }
    ],
    socialLinks: {
      github: 'https://github.com/AmaanSha8805',
      linkedin: 'https://www.linkedin.com/in/amaan510',
      website: 'https://iamamaan.netlify.app'
    },
    achievements: [
      {
        title: '12+ Projects Developed',
        description: 'Built diverse software solutions across full-stack development, AI, healthcare, fitness, and enterprise applications.'
      },
      {
        title: '5+ Technical Sessions as a Speaker',
        description: 'Shared technical knowledge, development insights, and practical experience with aspiring developers.'
      },
      {
        title: 'Technical Workshops',
        description: 'Conducted workshops focused on programming, emerging technologies, and practical software development.'
      },
      {
        title: 'Tech Meetups',
        description: 'Participated in technology meetups, connecting with developers, exchanging ideas, and exploring emerging innovations.'
      }
    ]
  };

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6 page-enter">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">About Us</h1>
            <p className="text-white/60 mt-2">
              Learn more about the founder and the technology behind Skyra
            </p>
          </div>

          {/* Profile Card */}
          <Card variant="glass" className="card-hover">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-[#E91E8C]" />
                Profile
              </CardTitle>
              <CardDescription>Founder and Developer Information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-white/60">
                    <User className="w-4 h-4" />
                    <span>Name</span>
                  </div>
                  <p className="font-medium">{profile.name}</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-white/60">
                    <Briefcase className="w-4 h-4" />
                    <span>Role</span>
                  </div>
                  <div>
                    <p className="font-medium">{profile.role}</p>
                    <p className="text-white/80">{profile.projectsRole}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-white/60">
                    <Mail className="w-4 h-4" />
                    <span>Email</span>
                  </div>
                  <p className="font-medium">{profile.email}</p>
                  <p className="font-medium">{profile.email2}</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-white/60">
                    <MapPin className="w-4 h-4" />
                    <span>Location</span>
                  </div>
                  <p className="font-medium">{profile.location}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bio Card */}
          <Card variant="glass" className="card-hover">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-[#8b5cf6]" />
                Bio
              </CardTitle>
              <CardDescription>Professional Background</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-white/80 leading-relaxed">{profile.bio}</p>
            </CardContent>
          </Card>

          {/* Skills Card */}
          <Card variant="glass" className="card-hover">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="w-5 h-5 text-[#E91E8C]" />
                Skills & Technologies
              </CardTitle>
              <CardDescription>Technical Expertise</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-medium mb-3 text-sm text-white/60">Languages</h3>
                <div className="flex flex-wrap gap-2">
                  {profile.skills.languages.map((skill, index) => (
                    <Badge key={index} variant="default">{skill}</Badge>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="font-medium mb-3 text-sm text-white/60">Frontend</h3>
                <div className="flex flex-wrap gap-2">
                  {profile.skills.frontend.map((skill, index) => (
                    <Badge key={index} variant="default">{skill}</Badge>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="font-medium mb-3 text-sm text-white/60">Backend</h3>
                <div className="flex flex-wrap gap-2">
                  {profile.skills.backend.map((skill, index) => (
                    <Badge key={index} variant="default">{skill}</Badge>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="font-medium mb-3 text-sm text-white/60">Databases</h3>
                <div className="flex flex-wrap gap-2">
                  {profile.skills.databases.map((skill, index) => (
                    <Badge key={index} variant="default">{skill}</Badge>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="font-medium mb-3 text-sm text-white/60">Cloud & DevOps</h3>
                <div className="flex flex-wrap gap-2">
                  {profile.skills.cloudDevOps.map((skill, index) => (
                    <Badge key={index} variant="default">{skill}</Badge>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="font-medium mb-3 text-sm text-white/60">Android</h3>
                <div className="flex flex-wrap gap-2">
                  {profile.skills.android.map((skill, index) => (
                    <Badge key={index} variant="default">{skill}</Badge>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="font-medium mb-3 text-sm text-white/60">Advanced Technologies</h3>
                <div className="flex flex-wrap gap-2">
                  {profile.skills.aiLLM.map((skill, index) => (
                    <Badge key={index} variant="default">{skill}</Badge>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="font-medium mb-3 text-sm text-white/60">Tools</h3>
                <div className="flex flex-wrap gap-2">
                  {profile.skills.tools.map((skill, index) => (
                    <Badge key={index} variant="default">{skill}</Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Experience Card */}
          <Card variant="glass" className="card-hover">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-[#8b5cf6]" />
                Experience
              </CardTitle>
              <CardDescription>Professional Journey</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {profile.experience.map((exp, index) => (
                <div key={index} className="p-4 border border-white/10 rounded-lg glass">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-semibold">{exp.role}</h4>
                      <p className="text-sm text-[#E91E8C] font-medium">{exp.company}</p>
                    </div>
                    <Badge variant="secondary">{exp.period}</Badge>
                  </div>
                  <p className="text-sm text-white/70">{exp.description}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Projects Card */}
          <Card variant="glass" className="card-hover">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5 text-[#E91E8C]" />
                Projects
              </CardTitle>
              <CardDescription>Featured Work</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {profile.projects.map((project, index) => (
                <div key={index} className="p-4 border border-white/10 rounded-lg glass">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-semibold">{project.name}</h4>
                      <p className="text-sm text-white/60">{project.techStack}</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(project.link, '_blank', 'noopener,noreferrer')}
                      className="flex items-center gap-2"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Live
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Achievements Card */}
          <Card variant="glass" className="card-hover">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-[#E91E8C]" />
                Achievements & Community Contributions
              </CardTitle>
              <CardDescription>Milestones and Community Engagement</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {profile.achievements.map((achievement, index) => (
                <div key={index} className="p-4 border border-white/10 rounded-lg glass">
                  <h4 className="font-semibold text-[#E91E8C] mb-2">{achievement.title}</h4>
                  <p className="text-sm text-white/70">{achievement.description}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Social Links Card */}
          <Card variant="glass" className="card-hover">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-[#8b5cf6]" />
                Connect
              </CardTitle>
              <CardDescription>Get in touch</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                <Button
                  variant="outline"
                  onClick={() => window.open(profile.socialLinks.github, '_blank', 'noopener,noreferrer')}
                  className="flex items-center gap-2"
                >
                  <GitBranch className="w-4 h-4" />
                  GitHub
                </Button>
                <Button
                  variant="outline"
                  onClick={() => window.open(profile.socialLinks.linkedin, '_blank', 'noopener,noreferrer')}
                  className="flex items-center gap-2"
                >
                  <Link className="w-4 h-4" />
                  LinkedIn
                </Button>
                <Button
                  variant="outline"
                  onClick={() => window.open(profile.socialLinks.website, '_blank', 'noopener,noreferrer')}
                  className="flex items-center gap-2"
                >
                  <Globe className="w-4 h-4" />
                  Website
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}