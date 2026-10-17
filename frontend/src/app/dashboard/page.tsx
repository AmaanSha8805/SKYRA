'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/dashboard/Card';
import { Badge } from '@/components/dashboard/Badge';
import { LoadingState } from '@/components/dashboard/LoadingState';
import { EmptyState } from '@/components/dashboard/EmptyState';
import { Button } from '@/components/ui/Button';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Modal } from '@/components/dashboard/Modal';
import { resumeClient } from '@/lib/resume-client';
import { jobsClient } from '@/lib/jobs-client';
import { skillGapClient } from '@/lib/skill-gap-client';
import { useWelcomeVoice } from '@/lib/useWelcomeVoice';
import { Resume, ResumeAnalysis } from '@/types/resume';
import { MatchedJob } from '@/types/jobs';
import { SkillGapResponse } from '@/types/skill-gap';
import { 
  FileText, 
  Search, 
  Briefcase, 
  Mic, 
  Map, 
  Mail, 
  TrendingUp, 
  Settings
} from 'lucide-react';

const SmallAtsGauge = ({ score }: { score: number | null }) => {
  if (score === null) return null;

  const circumference = 2 * Math.PI * 34;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const getScoreColor = () => {
    if (score >= 80) return '#10b981';
    if (score >= 60) return '#f59e0b';
    return '#E91E8C';
  };

  const scoreColor = getScoreColor();

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative w-16 h-16">
        <svg width="64" height="64" viewBox="0 0 90 90" className="transform -rotate-90">
          <defs>
            <linearGradient id="smallGaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#E91E8C" />
              <stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>
          </defs>
          <circle
            cx="45"
            cy="45"
            r="34"
            fill="none"
            stroke="rgba(139,92,246,0.2)"
            strokeWidth="5.5"
          />
          <circle
            cx="45"
            cy="45"
            r="34"
            fill="none"
            stroke="url(#smallGaugeGradient)"
            strokeWidth="5.5"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-base font-bold" style={{ color: scoreColor }}>
            {score}
          </span>
        </div>
      </div>
    </div>
  );
};

function DashboardContent() {
  const { user } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [totalResumes, setTotalResumes] = useState(0);
  const [latestAtsScore, setLatestAtsScore] = useState<number | null>(null);
  const [jobMatchCount, setJobMatchCount] = useState<number | null>(null);
  const [skillReadiness, setSkillReadiness] = useState<number | null>(null);

  // Modal states
  const [activeModal, setActiveModal] = useState<'resumes' | 'ats' | 'jobs' | 'skillgap' | null>(null);

  // Modal data states
  const [resumesList, setResumesList] = useState<Resume[]>([]);
  const [atsAnalysis, setAtsAnalysis] = useState<ResumeAnalysis | null>(null);
  const [matchedJobs, setMatchedJobs] = useState<MatchedJob[]>([]);
  const [skillGapData, setSkillGapData] = useState<SkillGapResponse | null>(null);

  // Modal loading states
  const [isModalLoading, setIsModalLoading] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  // Welcome voice hook - auto-plays on mount
  useWelcomeVoice({
    userEmail: user?.email,
    enabled: true
  });

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

      // Read job match count from localStorage
      const lastJobMatchCount = localStorage.getItem('last_job_match_count');
      if (lastJobMatchCount) {
        setJobMatchCount(parseInt(lastJobMatchCount, 10));
      }

      // Read skill readiness from localStorage
      const lastSkillReadiness = localStorage.getItem('last_skill_readiness');
      if (lastSkillReadiness) {
        setSkillReadiness(parseInt(lastSkillReadiness, 10));
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadResumesModalData = async () => {
    try {
      setIsModalLoading(true);
      setModalError(null);
      const response = await resumeClient.listResumes();
      setResumesList(response.resumes);
    } catch (error) {
      setModalError('Failed to load resumes');
      console.error('Failed to load resumes:', error);
    } finally {
      setIsModalLoading(false);
    }
  };

  const loadAtsModalData = async () => {
    try {
      setIsModalLoading(true);
      setModalError(null);
      const resumesResponse = await resumeClient.listResumes();
      if (resumesResponse.resumes.length > 0) {
        const latestResume = resumesResponse.resumes[0];
        const analysis = await resumeClient.getResumeAnalysis(latestResume.id);
        setAtsAnalysis(analysis);
      } else {
        setModalError('No resumes found to analyze');
      }
    } catch (error) {
      setModalError('Failed to load ATS analysis');
      console.error('Failed to load ATS analysis:', error);
    } finally {
      setIsModalLoading(false);
    }
  };

  const loadJobsModalData = async () => {
    try {
      setIsModalLoading(true);
      setModalError(null);
      const resumesResponse = await resumeClient.listResumes();
      if (resumesResponse.resumes.length > 0) {
        const latestResume = resumesResponse.resumes[0];
        const response = await jobsClient.matchJobs({ resume_id: latestResume.id });
        setMatchedJobs(response.matched_jobs);
      } else {
        setModalError('No resumes found to match jobs');
      }
    } catch (error) {
      setModalError('Failed to load job matches');
      console.error('Failed to load job matches:', error);
    } finally {
      setIsModalLoading(false);
    }
  };

  const loadSkillGapModalData = async () => {
    try {
      setIsModalLoading(true);
      setModalError(null);
      const resumesResponse = await resumeClient.listResumes();
      if (resumesResponse.resumes.length > 0) {
        const latestResume = resumesResponse.resumes[0];
        // Use a default target role if not specified
        const response = await skillGapClient.analyzeSkillGap({
          resume_id: latestResume.id,
          target_role: 'Software Engineer'
        });
        setSkillGapData(response);
      } else {
        setModalError('No resumes found to analyze skill gap');
      }
    } catch (error) {
      setModalError('Failed to load skill gap analysis');
      console.error('Failed to load skill gap analysis:', error);
    } finally {
      setIsModalLoading(false);
    }
  };

  const handleCardClick = (cardType: 'resumes' | 'ats' | 'jobs' | 'skillgap') => {
    setActiveModal(cardType);
    if (cardType === 'resumes') {
      loadResumesModalData();
    } else if (cardType === 'ats') {
      loadAtsModalData();
    } else if (cardType === 'jobs') {
      loadJobsModalData();
    } else if (cardType === 'skillgap') {
      loadSkillGapModalData();
    }
  };

  const closeModal = () => {
    setActiveModal(null);
    setModalError(null);
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
            <Card
              variant="glass"
              className="card-hover stagger-1 cursor-pointer"
              onClick={() => handleCardClick('resumes')}
            >
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

            <Card
              variant="glass"
              className="card-hover stagger-2 cursor-pointer"
              onClick={() => handleCardClick('ats')}
            >
              <CardHeader className="pb-3">
                <CardDescription>Latest ATS Score</CardDescription>
                <div className="flex items-center justify-center py-2">
                  <SmallAtsGauge score={latestAtsScore} />
                </div>
              </CardHeader>
              <CardContent>
                <Badge variant={latestAtsScore !== null ? "default" : "outline"}>
                  {latestAtsScore !== null ? "Analyzed" : "Not analyzed"}
                </Badge>
              </CardContent>
            </Card>

            <Card
              variant="glass"
              className="card-hover stagger-3 cursor-pointer"
              onClick={() => handleCardClick('jobs')}
            >
              <CardHeader className="pb-3">
                <CardDescription>Job Matches</CardDescription>
                <CardTitle
                  className="text-2xl"
                  style={{
                    color: jobMatchCount !== null && jobMatchCount > 0 ? '#a78bfa' : 'inherit'
                  }}
                >
                  {jobMatchCount !== null ? jobMatchCount : '--'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Badge variant={jobMatchCount !== null && jobMatchCount > 0 ? "default" : "outline"}>
                  {jobMatchCount !== null && jobMatchCount > 0 ? "Found" : "No matches"}
                </Badge>
              </CardContent>
            </Card>

            <Card
              variant="glass"
              className="card-hover stagger-4 cursor-pointer"
              onClick={() => handleCardClick('skillgap')}
            >
              <CardHeader className="pb-3">
                <CardDescription>Skill Gaps</CardDescription>
                <CardTitle
                  className="text-2xl"
                  style={{
                    color: skillReadiness !== null
                      ? (skillReadiness >= 80 ? '#10b981' : skillReadiness >= 60 ? '#f59e0b' : '#E91E8C')
                      : 'inherit'
                  }}
                >
                  {skillReadiness !== null ? `${skillReadiness}%` : '--'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Badge variant={skillReadiness !== null ? "default" : "outline"}>
                  {skillReadiness !== null ? "Analyzed" : "Not analyzed"}
                </Badge>
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
              <div className="grid gap-3 grid-cols-2 md:grid-cols-4">
                {quickActions.slice(0, 4).map((action) => {
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
        </>
      )}

      {/* Resumes Modal */}
      <Modal
        isOpen={activeModal === 'resumes'}
        onClose={closeModal}
        title="Uploaded Resumes"
      >
        {isModalLoading ? (
          <LoadingState message="Loading resumes..." />
        ) : modalError ? (
          <div className="text-red-400">{modalError}</div>
        ) : resumesList.length === 0 ? (
          <EmptyState
            title="No resumes found"
            description="Upload a resume to get started"
          />
        ) : (
          <div className="space-y-4">
            {resumesList.map((resume) => (
              <div
                key={resume.id}
                className="p-4 rounded-lg border border-white/10 hover:border-[#E91E8C]/50 transition-all"
              >
                <h3 className="font-medium text-lg">{resume.title}</h3>
                <p className="text-sm text-white/60 mt-1">{resume.original_filename}</p>
                <div className="flex gap-4 mt-2 text-xs text-white/40">
                  <span>Uploaded: {new Date(resume.created_at).toLocaleDateString()}</span>
                  <span>Status: {resume.is_active ? 'Active' : 'Inactive'}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Modal>

      {/* ATS Score Modal */}
      <Modal
        isOpen={activeModal === 'ats'}
        onClose={closeModal}
        title="Latest ATS Analysis"
      >
        {isModalLoading ? (
          <LoadingState message="Loading analysis..." />
        ) : modalError ? (
          <div className="text-red-400">{modalError}</div>
        ) : !atsAnalysis ? (
          <EmptyState
            title="No analysis available"
            description="Analyze your resume to see ATS score details"
          />
        ) : (
          <div className="space-y-6">
            <div className="text-center">
              <div className="text-5xl font-bold text-gradient mb-2">
                {atsAnalysis.overall_score}
              </div>
              <div className="text-white/60">Overall Score</div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg border border-white/10">
                <div className="text-sm text-white/60">ATS Score</div>
                <div className="text-2xl font-bold">{atsAnalysis.ats_score}</div>
              </div>
              <div className="p-4 rounded-lg border border-white/10">
                <div className="text-sm text-white/60">Content Score</div>
                <div className="text-2xl font-bold">{atsAnalysis.content_score}</div>
              </div>
              <div className="p-4 rounded-lg border border-white/10">
                <div className="text-sm text-white/60">Skills Score</div>
                <div className="text-2xl font-bold">{atsAnalysis.skills_score}</div>
              </div>
              <div className="p-4 rounded-lg border border-white/10">
                <div className="text-sm text-white/60">Experience Score</div>
                <div className="text-2xl font-bold">{atsAnalysis.experience_score}</div>
              </div>
              <div className="p-4 rounded-lg border border-white/10">
                <div className="text-sm text-white/60">Formatting Score</div>
                <div className="text-2xl font-bold">{atsAnalysis.formatting_score}</div>
              </div>
              <div className="p-4 rounded-lg border border-white/10">
                <div className="text-sm text-white/60">Keyword Score</div>
                <div className="text-2xl font-bold">{atsAnalysis.keyword_score}</div>
              </div>
            </div>

            {atsAnalysis.strengths && atsAnalysis.strengths.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3 text-green-400">Strengths</h3>
                <ul className="space-y-2">
                  {atsAnalysis.strengths.map((strength, index) => (
                    <li key={index} className="text-sm text-white/80">• {strength}</li>
                  ))}
                </ul>
              </div>
            )}

            {atsAnalysis.weaknesses && atsAnalysis.weaknesses.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3 text-red-400">Weaknesses</h3>
                <ul className="space-y-2">
                  {atsAnalysis.weaknesses.map((weakness, index) => (
                    <li key={index} className="text-sm text-white/80">• {weakness}</li>
                  ))}
                </ul>
              </div>
            )}

            {atsAnalysis.recommendations && atsAnalysis.recommendations.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3 text-[#E91E8C]">Recommendations</h3>
                <ul className="space-y-2">
                  {atsAnalysis.recommendations.map((rec, index) => (
                    <li key={index} className="text-sm text-white/80">• {rec}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Job Matches Modal */}
      <Modal
        isOpen={activeModal === 'jobs'}
        onClose={closeModal}
        title="Matched Jobs"
      >
        {isModalLoading ? (
          <LoadingState message="Finding job matches..." />
        ) : modalError ? (
          <div className="text-red-400">{modalError}</div>
        ) : matchedJobs.length === 0 ? (
          <EmptyState
            title="No job matches found"
            description="Try matching jobs with your resume"
          />
        ) : (
          <div className="space-y-4">
            {matchedJobs.map((job) => (
              <div
                key={job.rank}
                className="p-4 rounded-lg border border-white/10 hover:border-[#E91E8C]/50 transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-lg">{job.job_title}</h3>
                    <p className="text-sm text-white/60">{job.company_type}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gradient">{job.match_percentage}%</div>
                    <div className="text-xs text-white/60">Match</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-3 text-sm">
                  <div>
                    <span className="text-white/60">Salary: </span>
                    <span className="text-white">{job.salary_range}</span>
                  </div>
                  <div>
                    <span className="text-white/60">Location: </span>
                    <span className="text-white">{job.location_type}</span>
                  </div>
                </div>

                <div className="mb-3">
                  <div className="text-sm text-white/60 mb-1">Why This Match</div>
                  <p className="text-sm text-white/80">{job.reason}</p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {job.matched_skills.slice(0, 5).map((skill, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 text-xs rounded-full bg-green-500/20 border-green-500/30 text-green-400"
                    >
                      {skill}
                    </span>
                  ))}
                  {job.matched_skills.length > 5 && (
                    <span className="px-2 py-1 text-xs rounded-full bg-white/10 text-white/60">
                      +{job.matched_skills.length - 5} more
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Modal>

      {/* Skill Gap Modal */}
      <Modal
        isOpen={activeModal === 'skillgap'}
        onClose={closeModal}
        title="Skill Gap Analysis"
      >
        {isModalLoading ? (
          <LoadingState message="Analyzing skill gap..." />
        ) : modalError ? (
          <div className="text-red-400">{modalError}</div>
        ) : !skillGapData ? (
          <EmptyState
            title="No skill gap analysis available"
            description="Analyze your resume to see skill gap details"
          />
        ) : (
          <div className="space-y-6">
            <div className="text-center">
              <div className="text-5xl font-bold text-gradient mb-2">
                {skillGapData.overall_readiness_percentage}%
              </div>
              <div className="text-white/60">Overall Readiness</div>
            </div>

            {skillGapData.missing_skills && skillGapData.missing_skills.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3 text-red-400">Missing Skills</h3>
                <div className="space-y-3">
                  {skillGapData.missing_skills.map((item, index) => (
                    <div
                      key={index}
                      className="p-3 rounded-lg border border-white/10"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{item.skill}</span>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          item.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                          item.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-green-500/20 text-green-400'
                        }`}>
                          {item.priority}
                        </span>
                      </div>
                      <p className="text-sm text-white/60 mb-2">{item.reason}</p>
                      {item.learning_resources && item.learning_resources.length > 0 && (
                        <div className="text-xs text-white/40">
                          <span className="font-medium">Resources: </span>
                          {item.learning_resources.map((res, idx) => (
                            <span key={idx}>
                              {res.url ? (
                                <a
                                  href={res.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[#E91E8C] hover:underline"
                                >
                                  {res.title}
                                </a>
                              ) : (
                                <span>{res.title}</span>
                              )}
                              {idx < item.learning_resources.length - 1 && ', '}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {skillGapData.strong_skills && skillGapData.strong_skills.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3 text-green-400">Strong Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {skillGapData.strong_skills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 text-sm rounded-full bg-green-500/20 border-green-500/30 text-green-400"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {skillGapData.current_skills && skillGapData.current_skills.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3 text-[#a78bfa]">Current Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {skillGapData.current_skills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 text-sm rounded-full bg-[#a78bfa]/20 border-[#a78bfa]/30 text-[#a78bfa]"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
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
