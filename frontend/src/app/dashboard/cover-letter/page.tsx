'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/dashboard/Card';
import { LoadingState } from '@/components/dashboard/LoadingState';
import { EmptyState } from '@/components/dashboard/EmptyState';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { coverLetterClient } from '@/lib/cover-letter-client';
import { resumeClient } from '@/lib/resume-client';
import { pdfClient } from '@/lib/pdf-client';

interface Resume {
  id: string;
  title: string;
  original_filename: string;
  created_at: string;
}

export default function CoverLetterPage() {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState<string | null>(null);
  const [jobTitle, setJobTitle] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [isLoadingResumes, setIsLoadingResumes] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCoverLetter, setGeneratedCoverLetter] = useState<string | null>(null);
  const [wordCount, setWordCount] = useState<number>(0);
  const [copySuccess, setCopySuccess] = useState(false);
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

  const handleGenerateCoverLetter = async () => {
    if (!selectedResumeId || !jobTitle.trim() || !companyName.trim()) {
      alert('Please select a resume, enter a job title, and enter a company name');
      return;
    }

    try {
      setIsGenerating(true);
      const response = await coverLetterClient.generateCoverLetter({
        resume_id: selectedResumeId,
        job_title: jobTitle.trim(),
        company_name: companyName.trim(),
        job_description: jobDescription.trim() || undefined
      });
      setGeneratedCoverLetter(response.cover_letter);
      setWordCount(response.word_count);
    } catch (error) {
      console.error('Failed to generate cover letter:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate cover letter';
      alert(`Cover letter generation failed: ${errorMessage}. Please ensure the resume has been parsed and try again.`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyToClipboard = async () => {
    if (generatedCoverLetter) {
      try {
        await navigator.clipboard.writeText(generatedCoverLetter);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      } catch (error) {
        console.error('Failed to copy:', error);
        alert('Failed to copy to clipboard');
      }
    }
  };

  const handleRegenerate = () => {
    setGeneratedCoverLetter(null);
    setWordCount(0);
  };

  const handleDownloadPDF = async () => {
    if (!generatedCoverLetter) return;
    
    try {
      setIsDownloading(true);
      const filename = `cover_letter_${companyName.replace(/\s+/g, '_')}_${jobTitle.replace(/\s+/g, '_')}`;
      await pdfClient.downloadPDF(generatedCoverLetter, filename, 'cover_letter');
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
          <h1 className="text-3xl font-semibold tracking-tight">Cover Letter Generator</h1>
          <p className="text-white/60 mt-2">
            Generate professional cover letters tailored to your resume and job requirements
          </p>
        </div>

        <Card variant="glass" className="card-hover">
          <CardHeader>
            <CardTitle>Generate Cover Letter</CardTitle>
            <CardDescription>Select your resume and provide job details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {isLoadingResumes ? (
              <LoadingState message="Loading resumes..." />
            ) : resumes.length === 0 ? (
              <EmptyState
                title="No resumes found"
                description="Upload a resume first to generate cover letters"
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
                  <label className="text-sm font-medium mb-2 block">Job Title</label>
                  <Input
                    type="text"
                    placeholder="e.g., Senior Software Engineer"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Company Name</label>
                  <Input
                    type="text"
                    placeholder="e.g., Google, Microsoft, Startup Inc."
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Job Description (Optional)</label>
                  <Textarea
                    placeholder="Paste the job description here to get a more tailored cover letter..."
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    className="w-full min-h-[120px]"
                  />
                </div>

                <Button
                  variant="gradient"
                  onClick={handleGenerateCoverLetter}
                  disabled={!selectedResumeId || !jobTitle.trim() || !companyName.trim() || isGenerating}
                  className="w-full button-hover"
                >
                  {isGenerating ? 'Generating Cover Letter...' : 'Generate Cover Letter'}
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        {generatedCoverLetter && (
          <Card variant="glass" className="card-hover">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Generated Cover Letter</CardTitle>
                  <CardDescription>Word count: {wordCount}</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={handleCopyToClipboard}
                    variant="outline"
                    size="sm"
                  >
                    {copySuccess ? 'Copied!' : 'Copy to Clipboard'}
                  </Button>
                  <Button
                    onClick={handleDownloadPDF}
                    variant="outline"
                    size="sm"
                    disabled={isDownloading}
                  >
                    {isDownloading ? 'Downloading...' : 'Download PDF'}
                  </Button>
                  <Button
                    variant="gradient"
                    onClick={handleRegenerate}
                    size="sm"
                    className="button-hover"
                  >
                    Regenerate
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="p-6 glass rounded-lg whitespace-pre-wrap">
                {generatedCoverLetter}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
