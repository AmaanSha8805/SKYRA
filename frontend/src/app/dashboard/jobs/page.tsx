'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/dashboard/Card';
import { LoadingState } from '@/components/dashboard/LoadingState';
import { EmptyState } from '@/components/dashboard/EmptyState';
import { Button } from '@/components/ui/Button';
import { jobsClient } from '@/lib/jobs-client';
import { resumeClient } from '@/lib/resume-client';
import { MatchedJob } from '@/types/jobs';

interface Resume {
  id: string;
  title: string;
  original_filename: string;
  created_at: string;
}

export default function JobsPage() {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState<string | null>(null);
  const [isLoadingResumes, setIsLoadingResumes] = useState(true);
  const [isMatching, setIsMatching] = useState(false);
  const [matchedJobs, setMatchedJobs] = useState<MatchedJob[]>([]);

  useEffect(() => {
    loadResumes();
  }, []);

  const loadResumes = async () => {
    try {
      setIsLoadingResumes(true);
      const response = await resumeClient.listResumes();
      setResumes(response.resumes.map(resume => ({
        id: resume.id,
        title: resume.title,
        original_filename: resume.original_filename,
        created_at: resume.created_at
      })));
    } catch (error) {
      console.error('Failed to load resumes:', error);
    } finally {
      setIsLoadingResumes(false);
    }
  };

  const handleMatchJobs = async () => {
    if (!selectedResumeId) {
      alert('Please select a resume first');
      return;
    }

    try {
      setIsMatching(true);
      setMatchedJobs([]);
      const response = await jobsClient.matchJobs({ resume_id: selectedResumeId });
      setMatchedJobs(response.matched_jobs);
      localStorage.setItem('last_job_match_count', response.matched_jobs.length.toString());
    } catch (error) {
      console.error('Failed to match jobs:', error);
      alert('Failed to match jobs. Please try again.');
    } finally {
      setIsMatching(false);
    }
  };

  const getMatchColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-400';
    if (percentage >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getMatchBgColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-green-500/20 border-green-500/30';
    if (percentage >= 60) return 'bg-yellow-500/20 border-yellow-500/30';
    return 'bg-red-500/20 border-red-500/30';
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 page-enter">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Job Matcher</h1>
          <p className="text-white/60 mt-2">
            Find the best job opportunities matched to your resume
          </p>
        </div>

        {/* Resume Selection */}
        <Card variant="glass" className="card-hover">
          <CardHeader>
            <CardTitle>Select Your Resume</CardTitle>
            <CardDescription>Choose a resume to find matching jobs</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingResumes ? (
              <LoadingState message="Loading resumes..." />
            ) : resumes.length === 0 ? (
              <EmptyState
                title="No resumes found"
                description="Upload a resume first to use job matching"
              />
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {resumes.map((resume) => (
                    <div
                      key={resume.id}
                      onClick={() => setSelectedResumeId(resume.id)}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        selectedResumeId === resume.id
                          ? 'border-[#E91E8C] bg-[#E91E8C]/10 glow-pink'
                          : 'border-white/10 hover:border-[#E91E8C]/50'
                      }`}
                    >
                      <h3 className="font-medium">{resume.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {resume.original_filename}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        Uploaded {new Date(resume.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
                <Button
                  variant="gradient"
                  onClick={handleMatchJobs}
                  disabled={!selectedResumeId || isMatching}
                  className="w-full button-hover"
                >
                  {isMatching ? 'Finding Matches...' : 'Find Matching Jobs'}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Matched Jobs Results */}
        {matchedJobs.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">Top {matchedJobs.length} Matched Jobs</h2>
            <div className="space-y-4">
              {matchedJobs.map((job) => (
                <Card key={job.rank} variant="glass" className="card-hover">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full gradient-pink text-white font-bold">
                          {job.rank}
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold">{job.job_title}</h3>
                          <p className="text-sm text-muted-foreground">{job.company_type}</p>
                        </div>
                      </div>
                      <div className={`text-right`}>
                        <div className={`text-3xl font-bold text-gradient`}>
                          {job.match_percentage}%
                        </div>
                        <div className={`text-xs px-2 py-1 rounded-full border ${getMatchBgColor(job.match_percentage)} ${getMatchColor(job.match_percentage)}`}>
                          Match
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <h4 className="text-sm font-medium mb-2">Matched Skills</h4>
                        <div className="flex flex-wrap gap-2">
                          {job.matched_skills.map((skill, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 text-xs rounded-full bg-green-500/20 border-green-500/30 text-green-400"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium mb-2">Missing Skills</h4>
                        <div className="flex flex-wrap gap-2">
                          {job.missing_skills.map((skill, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 text-xs rounded-full bg-red-500/20 border-red-500/30 text-red-400"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="mb-4">
                      <h4 className="text-sm font-medium mb-1">Why This Match</h4>
                      <p className="text-sm text-muted-foreground">{job.reason}</p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <h4 className="text-sm font-medium mb-1">Salary Range</h4>
                        <p className="text-sm font-medium text-primary">{job.salary_range}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium mb-1">Location Type</h4>
                        <p className="text-sm text-muted-foreground">{job.location_type}</p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(job.apply_links.linkedin, '_blank')}
                        className="flex-1"
                        style={{ 
                          background: 'rgba(10,102,194,0.15)', 
                          color: '#60a5fa', 
                          border: '0.5px solid rgba(10,102,194,0.3)',
                          borderRadius: '20px',
                          padding: '6px 16px',
                          fontSize: '12px',
                          fontWeight: '500'
                        }}
                      >
                        LinkedIn
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(job.apply_links.naukri, '_blank')}
                        className="flex-1"
                        style={{ 
                          background: 'rgba(233,30,140,0.15)', 
                          color: '#ff6b9d', 
                          border: '0.5px solid rgba(233,30,140,0.3)',
                          borderRadius: '20px',
                          padding: '6px 16px',
                          fontSize: '12px',
                          fontWeight: '500'
                        }}
                      >
                        Naukri
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(job.apply_links.indeed, '_blank')}
                        className="flex-1"
                        style={{ 
                          background: 'rgba(139,92,246,0.15)', 
                          color: '#a78bfa', 
                          border: '0.5px solid rgba(139,92,246,0.3)',
                          borderRadius: '20px',
                          padding: '6px 16px',
                          fontSize: '12px',
                          fontWeight: '500'
                        }}
                      >
                        Indeed
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {isMatching && (
          <LoadingState message="AI is analyzing your resume and finding the best matches..." />
        )}
      </div>
    </DashboardLayout>
  );
}