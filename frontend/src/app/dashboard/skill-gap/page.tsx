'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/dashboard/Card';
import { LoadingState } from '@/components/dashboard/LoadingState';
import { EmptyState } from '@/components/dashboard/EmptyState';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { skillGapClient } from '@/lib/skill-gap-client';
import { resumeClient } from '@/lib/resume-client';
import { SkillGapResponse, MissingSkill } from '@/types/skill-gap';

interface Resume {
  id: string;
  title: string;
  original_filename: string;
  created_at: string;
}

export default function SkillGapPage() {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState<string | null>(null);
  const [targetRole, setTargetRole] = useState('');
  const [isLoadingResumes, setIsLoadingResumes] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [skillGapData, setSkillGapData] = useState<SkillGapResponse | null>(null);

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

  const handleAnalyzeSkillGap = async () => {
    if (!selectedResumeId || !targetRole.trim()) {
      alert('Please select a resume and enter a target role');
      return;
    }

    try {
      setIsAnalyzing(true);
      const response = await skillGapClient.analyzeSkillGap({
        resume_id: selectedResumeId,
        target_role: targetRole.trim()
      });
      setSkillGapData(response);
      localStorage.setItem('last_skill_readiness', response.overall_readiness_percentage.toString());
    } catch (error) {
      console.error('Failed to analyze skill gap:', error);
      alert('Failed to analyze skill gap. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getReadinessColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-400';
    if (percentage >= 60) return 'text-yellow-400';
    if (percentage >= 40) return 'text-orange-400';
    return 'text-red-400';
  };

  const getReadinessBgColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-green-500/20 border-green-500/30';
    if (percentage >= 60) return 'bg-yellow-500/20 border-yellow-500/30';
    if (percentage >= 40) return 'bg-orange-500/20 border-orange-500/30';
    return 'bg-red-500/20 border-red-500/30';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500/20 border-red-500/30 text-red-400';
      case 'medium': return 'bg-yellow-500/20 border-yellow-500/30 text-yellow-400';
      case 'low': return 'bg-green-500/20 border-green-500/30 text-green-400';
      default: return 'bg-gray-500/20 border-gray-500/30 text-gray-400';
    }
  };

  const handleReset = () => {
    setSkillGapData(null);
    setTargetRole('');
    setSelectedResumeId(null);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 page-enter">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Skill Gap Analyzer</h1>
          <p className="text-white/60 mt-2">
            Analyze your current skills against target role requirements and get personalized learning recommendations
          </p>
        </div>

        {!skillGapData ? (
          <Card variant="glass" className="card-hover">
            <CardHeader>
              <CardTitle>Analyze Skill Gap</CardTitle>
              <CardDescription>Select your resume and target role to begin</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {isLoadingResumes ? (
                <LoadingState message="Loading resumes..." />
              ) : resumes.length === 0 ? (
                <EmptyState
                  title="No resumes found"
                  description="Upload a resume first to analyze skill gaps"
                />
              ) : (
                <>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Select Resume</label>
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
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Target Role</label>
                    <Input
                      type="text"
                      placeholder="e.g., Senior Software Engineer, Product Manager, Data Scientist"
                      value={targetRole}
                      onChange={(e) => setTargetRole(e.target.value)}
                      className="w-full"
                    />
                  </div>

                  <Button
                    variant="gradient"
                    onClick={handleAnalyzeSkillGap}
                    disabled={!selectedResumeId || !targetRole.trim() || isAnalyzing}
                    className="w-full button-hover"
                  >
                    {isAnalyzing ? 'Analyzing Skill Gap...' : 'Analyze Skill Gap'}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Overall Readiness */}
            <Card variant="glass" className="card-hover">
              <CardHeader>
                <CardTitle>Overall Readiness</CardTitle>
                <CardDescription>How well your skills match the target role requirements</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 rounded-lg border" style={{ background: 'linear-gradient(135deg, rgba(233,30,140,0.1), rgba(139,92,246,0.1))', border: '0.5px solid rgba(139,92,246,0.2)' }}>
                  <div className={`text-7xl font-bold text-gradient`}>
                    {skillGapData.overall_readiness_percentage}%
                  </div>
                  <p className="text-muted-foreground mt-2 font-medium">Ready for {targetRole}</p>
                </div>
              </CardContent>
            </Card>

            {/* Strong Skills */}
            {skillGapData.strong_skills.length > 0 && (
              <Card variant="glass" className="card-hover">
                <CardHeader>
                  <CardTitle>Strong Skills</CardTitle>
                  <CardDescription>Skills you have that are highly relevant to this role</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {skillGapData.strong_skills.map((skill, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-green-500/20 border border-green-500/30 text-green-400 rounded-full text-sm font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Missing Skills */}
            {skillGapData.missing_skills.length > 0 && (
              <Card variant="glass" className="card-hover">
                <CardHeader>
                  <CardTitle>Missing Skills</CardTitle>
                  <CardDescription>Skills you need to develop for this role</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {skillGapData.missing_skills.map((missingSkill, index) => (
                      <div key={index} className="p-4 border border-white/10 rounded-lg space-y-3 glass">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold text-lg">{missingSkill.skill}</h4>
                            <p className="text-sm text-muted-foreground mt-1">{missingSkill.reason}</p>
                          </div>
                          <span className={`px-2 py-1 text-xs font-medium rounded border ${getPriorityColor(missingSkill.priority)}`}>
                            {missingSkill.priority.charAt(0).toUpperCase() + missingSkill.priority.slice(1)} Priority
                          </span>
                        </div>

                        {missingSkill.learning_resources.length > 0 && (
                          <div>
                            <h5 className="text-sm font-medium mb-2">Learning Resources</h5>
                            <div className="space-y-2">
                              {missingSkill.learning_resources.map((resource, resourceIndex) => (
                                <div key={resourceIndex} className="p-3 glass rounded-lg">
                                  <div className="font-medium text-sm">{resource.title}</div>
                                  {resource.description && (
                                    <p className="text-xs text-muted-foreground mt-1">{resource.description}</p>
                                  )}
                                  {resource.url && (
                                    <a
                                      href={resource.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-xs text-primary hover:underline mt-1 block"
                                    >
                                      {resource.url}
                                    </a>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4">
              <Button onClick={handleReset} variant="outline" className="flex-1">
                Analyze Different Role
              </Button>
              <Button variant="gradient" onClick={handleAnalyzeSkillGap} disabled={isAnalyzing} className="flex-1 button-hover">
                {isAnalyzing ? 'Re-analyzing...' : 'Re-analyze'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
