'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/dashboard/Card';
import { LoadingState } from '@/components/dashboard/LoadingState';
import { EmptyState } from '@/components/dashboard/EmptyState';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { careerRoadmapClient } from '@/lib/career-roadmap-client';
import { resumeClient } from '@/lib/resume-client';
import { pdfClient } from '@/lib/pdf-client';
import { CareerRoadmapResponse } from '@/types/career-roadmap';
import CareerRoadmapTree from '@/components/dashboard/CareerRoadmapTree';

interface Resume {
  id: string;
  title: string;
  original_filename: string;
  created_at: string;
}

export default function CareerRoadmapPage() {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState<string | null>(null);
  const [targetRole, setTargetRole] = useState('');
  const [timelineMonths, setTimelineMonths] = useState<number>(12);
  const [isLoadingResumes, setIsLoadingResumes] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [roadmapData, setRoadmapData] = useState<CareerRoadmapResponse | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

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

  const handleGenerateRoadmap = async () => {
    if (!selectedResumeId || !targetRole.trim()) {
      alert('Please select a resume and enter a target role');
      return;
    }

    try {
      setIsGenerating(true);
      const response = await careerRoadmapClient.generateCareerRoadmap({
        resume_id: selectedResumeId,
        target_role: targetRole.trim(),
        timeline_months: timelineMonths
      });
      setRoadmapData(response);
    } catch (error) {
      console.error('Failed to generate career roadmap:', error);
      alert('Failed to generate career roadmap. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleReset = () => {
    setRoadmapData(null);
    setTargetRole('');
    setSelectedResumeId(null);
    setTimelineMonths(12);
  };

  const handleDownloadPDF = async () => {
    if (!roadmapData) return;
    
    try {
      setIsDownloading(true);
      // Create a formatted content string for the PDF
      let content = `Career Roadmap: ${roadmapData.target_role}\n\n`;
      content += `Overall Strategy:\n${roadmapData.overall_strategy}\n\n`;
      content += `Timeline: ${roadmapData.timeline_months} months\n\n`;
      
      roadmapData.phases.forEach((phase, index) => {
        content += `Phase ${phase.phase_number}: ${phase.title}\n`;
        content += `Duration: ${phase.duration}\n\n`;
        content += `Goals:\n${phase.goals.map(goal => `• ${goal}`).join('\n')}\n\n`;
        content += `Skills to Learn:\n${phase.skills_to_learn.join(', ')}\n\n`;
        content += `Milestones:\n${phase.milestones.map(milestone => `✓ ${milestone}`).join('\n')}\n\n`;
        content += `---\n\n`;
      });
      
      const filename = `career_roadmap_${targetRole.replace(/\s+/g, '_')}`;
      await pdfClient.downloadPDF(content, filename, 'roadmap');
    } catch (error) {
      console.error('Failed to download PDF:', error);
      alert('Failed to download PDF. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 page-enter">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Career Roadmap Generator</h1>
          <p className="text-white/60 mt-2">
            Generate a personalized career roadmap to help you achieve your target role
          </p>
        </div>

        {!roadmapData ? (
          <Card variant="glass" className="card-hover">
            <CardHeader>
              <CardTitle>Generate Career Roadmap</CardTitle>
              <CardDescription>Select your resume, target role, and timeline to begin</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {isLoadingResumes ? (
                <LoadingState message="Loading resumes..." />
              ) : resumes.length === 0 ? (
                <EmptyState
                  title="No resumes found"
                  description="Upload a resume first to generate a career roadmap"
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

                  <div>
                    <label className="text-sm font-medium mb-2 block">Timeline</label>
                    <div className="grid grid-cols-3 gap-4">
                      {[6, 12, 24].map((months) => (
                        <div
                          key={months}
                          onClick={() => setTimelineMonths(months)}
                          className={`p-4 rounded-lg border-2 cursor-pointer transition-all text-center ${
                            timelineMonths === months
                              ? 'border-[#E91E8C] bg-[#E91E8C]/10'
                              : 'border-white/10 hover:border-[#E91E8C]/50'
                          }`}
                        >
                          <div className="font-semibold">{months} Months</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Button
                    variant="gradient"
                    onClick={handleGenerateRoadmap}
                    disabled={!selectedResumeId || !targetRole.trim() || isGenerating}
                    className="w-full button-hover"
                  >
                    {isGenerating ? 'Generating Roadmap...' : 'Generate Roadmap'}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Overall Strategy */}
            <Card variant="glass" className="card-hover">
              <CardHeader>
                <CardTitle>Overall Strategy</CardTitle>
                <CardDescription>Your comprehensive approach to becoming a {roadmapData.target_role}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed">{roadmapData.overall_strategy}</p>
              </CardContent>
            </Card>

            {/* Interactive Tree Visualization */}
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold">Career Roadmap Visualization</h2>
              <Card variant="glass" className="card-hover">
                <CardContent className="p-6">
                  <CareerRoadmapTree roadmapData={roadmapData} />
                </CardContent>
              </Card>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <Button onClick={handleReset} variant="outline" className="flex-1">
                Generate Different Roadmap
              </Button>
              <Button onClick={handleDownloadPDF} variant="outline" disabled={isDownloading} className="flex-1">
                {isDownloading ? 'Downloading...' : 'Download PDF'}
              </Button>
              <Button variant="gradient" onClick={handleGenerateRoadmap} disabled={isGenerating} className="flex-1 button-hover">
                {isGenerating ? 'Regenerating...' : 'Regenerate'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
