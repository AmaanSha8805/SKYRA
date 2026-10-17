'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/dashboard/Card';
import { LoadingState } from '@/components/dashboard/LoadingState';
import { EmptyState } from '@/components/dashboard/EmptyState';
import { Button } from '@/components/ui/Button';
import { resumeClient } from '@/lib/resume-client';
import { ResumeAnalysis } from '@/types/resume';

interface Resume {
  id: string;
  title: string;
  original_filename: string;
  created_at: string;
}

export default function ResumeAnalyzerPage() {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState<string | null>(null);
  const [isLoadingResumes, setIsLoadingResumes] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisData, setAnalysisData] = useState<ResumeAnalysis | null>(null);

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

  const handleAnalyzeResume = async () => {
    if (!selectedResumeId) {
      alert('Please select a resume');
      return;
    }

    try {
      setIsAnalyzing(true);
      const response = await resumeClient.analyzeResume(selectedResumeId);
      setAnalysisData(response);
    } catch (error) {
      console.error('Failed to analyze resume:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to analyze resume';
      alert(`Analysis failed: ${errorMessage}. Please ensure the resume has been parsed and try again.`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setAnalysisData(null);
    setSelectedResumeId(null);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const ProgressBar = ({ score, label }: { score: number; label: string }) => (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="font-medium">{label}</span>
        <span className={getScoreColor(score)}>{score}%</span>
      </div>
      <div className="h-2 bg-secondary rounded-full overflow-hidden">
        <div
          className={`h-full ${getScoreBgColor(score)} transition-all duration-500`}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );

  const AtsScoreGauge = ({ score, total = 100 }: { score: number; total?: number }) => {
    const [animatedScore, setAnimatedScore] = useState(0);

    useEffect(() => {
      const duration = 1500;
      const steps = 60;
      const increment = score / steps;
      let current = 0;
      const timer = setInterval(() => {
        current += increment;
        if (current >= score) {
          setAnimatedScore(score);
          clearInterval(timer);
        } else {
          setAnimatedScore(Math.round(current));
        }
      }, duration / steps);
      return () => clearInterval(timer);
    }, [score]);

    const percentage = (score / total) * 100;
    const circumference = 2 * Math.PI * 80;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    const getLabel = () => {
      if (score >= 80) return { text: '🌟 Excellent', color: '#10b981', bgColor: 'rgba(16, 185, 129, 0.1)' };
      if (score >= 60) return { text: '📈 Good', color: '#f59e0b', bgColor: 'rgba(245, 158, 11, 0.1)' };
      return { text: '📊 Needs Improvement', color: '#E91E8C', bgColor: 'rgba(233, 30, 140, 0.1)' };
    };

    const label = getLabel();

    const getScoreColor = () => {
      if (score >= 80) return '#10b981';
      if (score >= 60) return '#f59e0b';
      return '#E91E8C';
    };

    const scoreColor = getScoreColor();

    return (
      <div className="flex flex-col items-center justify-center py-8">
        <div className="relative">
          <svg width="200" height="200" className="transform -rotate-90">
            <defs>
              <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#E91E8C" />
                <stop offset="100%" stopColor="#8b5cf6" />
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            <circle
              cx="100"
              cy="100"
              r="80"
              fill="none"
              stroke="#e5e7eb"
              strokeWidth="12"
            />
            <circle
              cx="100"
              cy="100"
              r="80"
              fill="none"
              stroke="url(#gaugeGradient)"
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-1000 ease-out"
              filter="url(#glow)"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div
              className="text-5xl font-bold"
              style={{
                color: '#ffffff',
                textShadow: '0 0 40px rgba(233,30,140,0.4), 0 0 20px rgba(139,92,246,0.3)'
              }}
            >
              {animatedScore}
            </div>
            <div className="text-sm text-gray-300 mt-1" style={{ textShadow: '0 0 10px rgba(0,0,0,0.3)' }}>
              out of {total}
            </div>
          </div>
        </div>
        <div
          className="mt-4 px-6 py-2 rounded-full text-lg font-medium"
          style={{
            color: label.color,
            backgroundColor: label.bgColor,
            textShadow: '0 0 20px rgba(233,30,140,0.3)',
            boxShadow: `0 0 30px ${label.bgColor}`
          }}
        >
          {label.text}
        </div>
      </div>
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 page-enter">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Resume Analyzer</h1>
          <p className="text-muted-foreground mt-2">
            Analyze your resume to get insights on ATS compatibility, content quality, and improvement recommendations
          </p>
        </div>

        {!analysisData ? (
          <Card>
            <CardHeader>
              <CardTitle>Analyze Resume</CardTitle>
              <CardDescription>Select a resume to analyze its content and ATS compatibility</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {isLoadingResumes ? (
                <LoadingState message="Loading resumes..." />
              ) : resumes.length === 0 ? (
                <EmptyState
                  title="No resumes found"
                  description="Upload a resume first to analyze it"
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
                              ? 'border-primary bg-primary/5'
                              : 'border-border hover:border-primary/50'
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

                  <Button
                    onClick={handleAnalyzeResume}
                    disabled={!selectedResumeId || isAnalyzing}
                    className="w-full text-white font-semibold rounded-[10px] py-2.5 px-6 button-hover shadow-lg"
                    style={{
                      background: 'linear-gradient(135deg, #E91E8C, #8b5cf6)',
                      transition: 'all 0.15s cubic-bezier(0.4, 0, 0.2, 1)'
                    }}
                  >
                    {isAnalyzing ? 'Analyzing Resume...' : 'Analyze Resume'}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Overall Score */}
            <Card>
              <CardHeader>
                <CardTitle>Overall ATS Score</CardTitle>
                <CardDescription>Your resume's compatibility with ATS systems</CardDescription>
              </CardHeader>
              <CardContent>
                <AtsScoreGauge score={analysisData.overall_score} />
              </CardContent>
            </Card>

            {/* Score Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Score Breakdown</CardTitle>
                <CardDescription>Detailed analysis across different categories</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ProgressBar score={analysisData.ats_score} label="ATS Score" />
                <ProgressBar score={analysisData.content_score} label="Content Score" />
                <ProgressBar score={analysisData.skills_score} label="Skills Score" />
                <ProgressBar score={analysisData.experience_score} label="Experience Score" />
                <ProgressBar score={analysisData.formatting_score} label="Formatting Score" />
                <ProgressBar score={analysisData.keyword_score} label="Keyword Score" />
              </CardContent>
            </Card>

            {/* Strengths */}
            {analysisData.strengths && analysisData.strengths.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-green-600">Strengths</CardTitle>
                  <CardDescription>What your resume does well</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {analysisData.strengths.map((strength, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-green-600 mt-1">✓</span>
                        <span className="text-sm">{strength}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Weaknesses */}
            {analysisData.weaknesses && analysisData.weaknesses.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-red-600">Weaknesses</CardTitle>
                  <CardDescription>Areas that need improvement</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {analysisData.weaknesses.map((weakness, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-red-600 mt-1">✗</span>
                        <span className="text-sm">{weakness}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Recommendations */}
            {analysisData.recommendations && analysisData.recommendations.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-blue-600">Recommendations</CardTitle>
                  <CardDescription>Actionable suggestions to improve your resume</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {analysisData.recommendations.map((recommendation, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-blue-600 mt-1">→</span>
                        <span className="text-sm">{recommendation}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Missing Keywords */}
            {analysisData.missing_keywords && analysisData.missing_keywords.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Missing Keywords</CardTitle>
                  <CardDescription>Important keywords not found in your resume</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {analysisData.missing_keywords.map((keyword, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-orange-50 text-orange-700 rounded-full text-sm font-medium border border-orange-200"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Detected Skills */}
            {analysisData.detected_skills && analysisData.detected_skills.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Detected Skills</CardTitle>
                  <CardDescription>Skills identified in your resume</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {analysisData.detected_skills.map((skill, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm font-medium border border-green-200"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4">
              <Button onClick={handleReset} variant="outline" className="flex-1">
                Analyze Different Resume
              </Button>
              <Button
                onClick={handleAnalyzeResume}
                disabled={isAnalyzing}
                className="flex-1 text-white font-semibold rounded-[10px] py-2.5 px-6 button-hover shadow-lg"
                style={{
                  background: 'linear-gradient(135deg, #E91E8C, #8b5cf6)',
                  transition: 'all 0.15s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
              >
                {isAnalyzing ? 'Reanalyzing...' : 'Reanalyze'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
