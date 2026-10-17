'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { ResumeUpload } from '@/components/resumes/ResumeUpload';
import { ResumeList } from '@/components/resumes/ResumeList';
import { ResumeDetail } from '@/components/resumes/ResumeDetail';
import { ResumeAnalysisResults } from '@/components/resumes/ResumeAnalysisResults';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/dashboard/Card';
import { LoadingState } from '@/components/dashboard/LoadingState';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { resumeClient } from '@/lib/resume-client';
import { resumeBuilderClient } from '@/lib/resume-builder-client';
import { pdfClient } from '@/lib/pdf-client';
import { Resume, ResumeAnalysis } from '@/types/resume';
import { TemplateSelector, Template } from '@/components/resumes/TemplateSelector';

export default function ResumesPage() {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [parsingId, setParsingId] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizingId, setOptimizingId] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [isRegeneratingTemplate, setIsRegeneratingTemplate] = useState(false);
  const [regeneratingTemplateId, setRegeneratingTemplateId] = useState<string | null>(null);
  const [selectedResume, setSelectedResume] = useState<Resume | null>(null);
  const [parsedData, setParsedData] = useState<any>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [analysisData, setAnalysisData] = useState<ResumeAnalysis | null>(null);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [activeTab, setActiveTab] = useState<'upload' | 'create'>('upload');
  
  // Resume builder form state
  const [currentStep, setCurrentStep] = useState(1);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [isCreatingResume, setIsCreatingResume] = useState(false);
  const [isDownloadingPreview, setIsDownloadingPreview] = useState(false);
  const [isGeneratingExperience, setIsGeneratingExperience] = useState(false);
  const [generatingExperienceIndex, setGeneratingExperienceIndex] = useState<number | null>(null);
  const [isGeneratingProject, setIsGeneratingProject] = useState(false);
  const [generatingProjectIndex, setGeneratingProjectIndex] = useState<number | null>(null);
  const [showDownloadButton, setShowDownloadButton] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('classic');
  const [availableTemplates, setAvailableTemplates] = useState<Template[]>([]);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);
  const [formData, setFormData] = useState({
    personal_info: {
      full_name: '',
      email: '',
      phone: '',
      location: '',
      linkedin: '',
      github: '',
      website: ''
    },
    summary: '',
    experience: [] as Array<{
      company: string;
      title: string;
      location: string;
      start_date: string;
      end_date: string;
      is_current: boolean;
      description: string;
    }>,
    education: [] as Array<{
      institution: string;
      degree: string;
      field_of_study: string;
      start_date: string;
      end_date: string;
      grade: string;
    }>,
    skills: [] as string[],
    projects: [] as Array<{
      name: string;
      description: string;
      url: string;
      technologies: string[];
    }>
  });

  useEffect(() => {
    loadResumes();
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      setIsLoadingTemplates(true);
      const templates = await resumeBuilderClient.getTemplates();
      setAvailableTemplates(templates);
    } catch (error) {
      console.error('Failed to load templates:', error);
    } finally {
      setIsLoadingTemplates(false);
    }
  };

  const loadResumes = async () => {
    try {
      setIsLoading(true);
      const response = await resumeClient.listResumes();
      setResumes(response.resumes);
    } catch (error) {
      console.error('Failed to load resumes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpload = async (file: File, title?: string) => {
    try {
      setIsUploading(true);
      await resumeClient.uploadResume({ file, title });
      await loadResumes();
    } catch (error) {
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (resumeId: string) => {
    try {
      setIsDeleting(true);
      setDeletingId(resumeId);
      await resumeClient.deleteResume(resumeId);
      await loadResumes();
    } catch (error) {
      console.error('Failed to delete resume:', error);
    } finally {
      setIsDeleting(false);
      setDeletingId(null);
    }
  };

  const handleParse = async (resumeId: string) => {
    try {
      setIsParsing(true);
      setParsingId(resumeId);
      const response = await resumeClient.parseResume(resumeId);
      setParsedData(response.parsed_data);
      setSelectedResume(resumes.find(r => r.id === resumeId) || null);
      setShowDetail(true);
      await loadResumes();
    } catch (error) {
      console.error('Failed to parse resume:', error);
      alert('Failed to parse resume. Please try again.');
    } finally {
      setIsParsing(false);
      setParsingId(null);
    }
  };

  const handleAnalyze = async (resumeId: string) => {
    try {
      setIsAnalyzing(true);
      setAnalyzingId(resumeId);
      const response = await resumeClient.analyzeResume(resumeId);
      setAnalysisData(response);
      setSelectedResume(resumes.find(r => r.id === resumeId) || null);
      setShowAnalysis(true);
      await loadResumes();
    } catch (error) {
      console.error('Failed to analyze resume:', error);
      alert('Failed to analyze resume. Please try again.');
    } finally {
      setIsAnalyzing(false);
      setAnalyzingId(null);
    }
  };

  const handleOptimize = async (resumeId: string) => {
    try {
      setIsOptimizing(true);
      setOptimizingId(resumeId);
      const optimizedResume = await resumeBuilderClient.optimizeResume(resumeId);
      await loadResumes();
      // Auto-analyze the optimized resume
      await handleAnalyze(optimizedResume.id);
    } catch (error) {
      console.error('Failed to optimize resume:', error);
      alert('Failed to optimize resume. Please try again.');
    } finally {
      setIsOptimizing(false);
      setOptimizingId(null);
    }
  };

  const handleDownload = async (resume: Resume) => {
    try {
      setIsDownloading(true);
      setDownloadingId(resume.id);
      // Create a formatted content string for the PDF
      let content = `${resume.title}\n\n`;
      content += `Uploaded: ${new Date(resume.created_at).toLocaleDateString()}\n\n`;
      
      const filename = resume.title.replace(/\s+/g, '_');
      await pdfClient.downloadPDF(content, filename, 'resume');
    } catch (error) {
      console.error('Failed to download PDF:', error);
      alert('Failed to download PDF. Please try again.');
    } finally {
      setIsDownloading(false);
      setDownloadingId(null);
    }
  };

  const handleRegenerateTemplate = async (resumeId: string, currentTemplate: string) => {
    // Simple template selection - for demo purposes, cycle through templates
    const templates = ['classic', 'modern', 'minimal', 'professional'];
    const currentIndex = templates.indexOf(currentTemplate);
    const nextTemplate = templates[(currentIndex + 1) % templates.length];
    
    try {
      setIsRegeneratingTemplate(true);
      setRegeneratingTemplateId(resumeId);
      await resumeBuilderClient.regeneratePDF(resumeId, nextTemplate);
      await loadResumes();
    } catch (error) {
      console.error('Failed to regenerate template:', error);
      alert('Failed to regenerate template. Please try again.');
    } finally {
      setIsRegeneratingTemplate(false);
      setRegeneratingTemplateId(null);
    }
  };

  const handleGenerateSummary = async () => {
    try {
      setIsGeneratingSummary(true);
      const response = await resumeBuilderClient.generateSummary(formData);
      setFormData({ ...formData, summary: response.summary });
    } catch (error) {
      console.error('Failed to generate summary:', error);
      alert('Failed to generate summary. Please try again.');
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  const handleCreateResume = async () => {
    try {
      setIsCreatingResume(true);
      await resumeBuilderClient.createResumeFromForm(formData, selectedTemplate);
      await loadResumes();
      setShowDownloadButton(true);
      // Don't switch to upload tab, stay on Step 7 to show download button
    } catch (error) {
      console.error('Failed to create resume:', error);
      alert('Failed to create resume. Please try again.');
    } finally {
      setIsCreatingResume(false);
    }
  };

  const handleDownloadPreviewPDF = async () => {
    try {
      setIsDownloadingPreview(true);
      // Create a formatted content string for the PDF
      let content = `${formData.personal_info.full_name || 'Your Name'}\n\n`;
      content += `${formData.personal_info.email || ''}${formData.personal_info.email && formData.personal_info.phone ? ' • ' : ''}${formData.personal_info.phone || ''}${(formData.personal_info.email || formData.personal_info.phone) && formData.personal_info.location ? ' • ' : ''}${formData.personal_info.location || ''}\n\n`;
      
      if (formData.personal_info.linkedin || formData.personal_info.github || formData.personal_info.website) {
        content += `${formData.personal_info.linkedin || ''}${formData.personal_info.linkedin && (formData.personal_info.github || formData.personal_info.website) ? ' • ' : ''}${formData.personal_info.github || ''}${(formData.personal_info.linkedin || formData.personal_info.github) && formData.personal_info.website ? ' • ' : ''}${formData.personal_info.website || ''}\n\n`;
      }
      
      if (formData.summary) {
        content += `Professional Summary\n${formData.summary}\n\n`;
      }
      
      if (formData.experience.length > 0) {
        content += `Experience\n\n`;
        formData.experience.forEach(exp => {
          content += `${exp.title} - ${exp.company}${exp.location ? `, ${exp.location}` : ''}\n`;
          content += `${exp.start_date} - ${exp.is_current ? 'Present' : exp.end_date}\n`;
          if (exp.description) {
            content += `${exp.description}\n`;
          }
          content += `\n`;
        });
      }
      
      if (formData.education.length > 0) {
        content += `Education\n\n`;
        formData.education.forEach(edu => {
          content += `${edu.institution}${edu.degree ? ` - ${edu.degree}` : ''}${edu.field_of_study ? ` in ${edu.field_of_study}` : ''}\n`;
          content += `${edu.start_date} - ${edu.end_date}\n`;
          if (edu.grade) {
            content += `Grade: ${edu.grade}\n`;
          }
          content += `\n`;
        });
      }
      
      if (formData.skills.length > 0) {
        content += `Skills\n${formData.skills.join(', ')}\n\n`;
      }
      
      if (formData.projects.length > 0) {
        content += `Projects\n\n`;
        formData.projects.forEach(proj => {
          content += `${proj.name}\n`;
          if (proj.description) {
            content += `${proj.description}\n`;
          }
          if (proj.url) {
            content += `URL: ${proj.url}\n`;
          }
          if (proj.technologies.length > 0) {
            content += `Technologies: ${proj.technologies.join(', ')}\n`;
          }
          content += `\n`;
        });
      }
      
      const filename = `${formData.personal_info.full_name.replace(/\s+/g, '_') || 'Your_Name'}_Resume`;
      await pdfClient.downloadPDF(content, filename, 'resume');
    } catch (error) {
      console.error('Failed to download PDF:', error);
      alert('Failed to download PDF. Please try again.');
    } finally {
      setIsDownloadingPreview(false);
    }
  };

  const handleGenerateExperienceDescription = async (index: number) => {
    const exp = formData.experience[index];
    if (!exp.title || !exp.company) {
      alert('Please enter job title and company first');
      return;
    }
    
    try {
      setIsGeneratingExperience(true);
      setGeneratingExperienceIndex(index);
      const response = await resumeBuilderClient.generateExperienceDescription(
        exp.title,
        exp.company,
        formData.skills
      );
      
      const updatedExperience = [...formData.experience];
      updatedExperience[index] = { ...updatedExperience[index], description: response.description };
      setFormData({ ...formData, experience: updatedExperience });
    } catch (error) {
      console.error('Failed to generate experience description:', error);
      alert('Failed to generate experience description. Please try again.');
    } finally {
      setIsGeneratingExperience(false);
      setGeneratingExperienceIndex(null);
    }
  };

  const handleGenerateProjectDescription = async (index: number) => {
    const proj = formData.projects[index];
    if (!proj.name) {
      alert('Please enter project name first');
      return;
    }
    
    try {
      setIsGeneratingProject(true);
      setGeneratingProjectIndex(index);
      const response = await resumeBuilderClient.generateProjectDescription(
        proj.name,
        proj.technologies
      );
      
      const updatedProjects = [...formData.projects];
      updatedProjects[index] = { ...updatedProjects[index], description: response.description };
      setFormData({ ...formData, projects: updatedProjects });
    } catch (error) {
      console.error('Failed to generate project description:', error);
      alert('Failed to generate project description. Please try again.');
    } finally {
      setIsGeneratingProject(false);
      setGeneratingProjectIndex(null);
    }
  };

  const addExperience = () => {
    setFormData({
      ...formData,
      experience: [
        ...formData.experience,
        {
          company: '',
          title: '',
          location: '',
          start_date: '',
          end_date: '',
          is_current: false,
          description: ''
        }
      ]
    });
  };

  const updateExperience = (index: number, field: string, value: any) => {
    const updatedExperience = [...formData.experience];
    updatedExperience[index] = { ...updatedExperience[index], [field]: value };
    setFormData({ ...formData, experience: updatedExperience });
  };

  const removeExperience = (index: number) => {
    setFormData({
      ...formData,
      experience: formData.experience.filter((_, i) => i !== index)
    });
  };

  const addEducation = () => {
    setFormData({
      ...formData,
      education: [
        ...formData.education,
        {
          institution: '',
          degree: '',
          field_of_study: '',
          start_date: '',
          end_date: '',
          grade: ''
        }
      ]
    });
  };

  const updateEducation = (index: number, field: string, value: string) => {
    const updatedEducation = [...formData.education];
    updatedEducation[index] = { ...updatedEducation[index], [field]: value };
    setFormData({ ...formData, education: updatedEducation });
  };

  const removeEducation = (index: number) => {
    setFormData({
      ...formData,
      education: formData.education.filter((_, i) => i !== index)
    });
  };

  const addSkill = (skill: string) => {
    if (skill.trim() && !formData.skills.includes(skill.trim())) {
      setFormData({ ...formData, skills: [...formData.skills, skill.trim()] });
    }
  };

  const removeSkill = (skill: string) => {
    setFormData({ ...formData, skills: formData.skills.filter(s => s !== skill) });
  };

  const addProject = () => {
    setFormData({
      ...formData,
      projects: [
        ...formData.projects,
        {
          name: '',
          description: '',
          url: '',
          technologies: []
        }
      ]
    });
  };

  const updateProject = (index: number, field: string, value: any) => {
    const updatedProjects = [...formData.projects];
    updatedProjects[index] = { ...updatedProjects[index], [field]: value };
    setFormData({ ...formData, projects: updatedProjects });
  };

  const removeProject = (index: number) => {
    setFormData({
      ...formData,
      projects: formData.projects.filter((_, i) => i !== index)
    });
  };

  const nextStep = () => {
    if (currentStep < 8) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 page-enter">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Resumes</h1>
          <p className="text-white/60 mt-2">
            Manage your resumes and track their performance
          </p>
        </div>

        {/* Premium Tabs */}
        <div className="flex gap-2 border-b border-white/10">
          <button
            onClick={() => setActiveTab('upload')}
            className={`px-4 py-2 font-medium transition-all duration-200 ${
              activeTab === 'upload'
                ? 'border-b-2 border-skyra-pink text-skyra-pink'
                : 'text-white/60 hover:text-white'
            }`}
          >
            Upload Resume
          </button>
          <button
            onClick={() => setActiveTab('create')}
            className={`px-4 py-2 font-medium transition-all duration-200 ${
              activeTab === 'create'
                ? 'border-b-2 border-skyra-pink text-skyra-pink'
                : 'text-white/60 hover:text-white'
            }`}
          >
            Create Resume
          </button>
        </div>

        {activeTab === 'upload' && (
          <>
            <ResumeUpload onUpload={handleUpload} isUploading={isUploading} />

            <Card variant="glass" className="card-hover">
              <CardHeader>
                <CardTitle>Your Resumes</CardTitle>
                <CardDescription>
                  {resumes.length} resume{resumes.length !== 1 ? 's' : ''} uploaded
                </CardDescription>
              </CardHeader>
            </Card>

            {isLoading ? (
              <LoadingState message="Loading resumes..." />
            ) : (
              <ResumeList
                resumes={resumes}
                onDelete={handleDelete}
                onParse={handleParse}
                onAnalyze={handleAnalyze}
                onOptimize={handleOptimize}
                onDownload={handleDownload}
                onRegenerateTemplate={handleRegenerateTemplate}
                isDeleting={isDeleting}
                deletingId={deletingId}
                isParsing={isParsing}
                parsingId={parsingId}
                isAnalyzing={isAnalyzing}
                analyzingId={analyzingId}
                isOptimizing={isOptimizing}
                optimizingId={optimizingId}
                isDownloading={isDownloading}
                downloadingId={downloadingId}
                isRegenerating={isRegeneratingTemplate}
                regeneratingId={regeneratingTemplateId}
              />
            )}
          </>
        )}

        {activeTab === 'create' && (
          <Card variant="glass" className="card-hover">
            <CardHeader>
              <CardTitle>Create Resume</CardTitle>
              <CardDescription>
                Step {currentStep} of 8
              </CardDescription>
            </CardHeader>
            <div className="p-6 space-y-6">
              {/* Step 1: Personal Info */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Personal Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Full Name *</label>
                      <Input
                        value={formData.personal_info.full_name}
                        onChange={(e) => setFormData({
                          ...formData,
                          personal_info: { ...formData.personal_info, full_name: e.target.value }
                        })}
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Email *</label>
                      <Input
                        type="email"
                        value={formData.personal_info.email}
                        onChange={(e) => setFormData({
                          ...formData,
                          personal_info: { ...formData.personal_info, email: e.target.value }
                        })}
                        placeholder="john@example.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Phone</label>
                      <Input
                        type="tel"
                        value={formData.personal_info.phone}
                        onChange={(e) => setFormData({
                          ...formData,
                          personal_info: { ...formData.personal_info, phone: e.target.value }
                        })}
                        placeholder="+1 234 567 8900"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Location</label>
                      <Input
                        value={formData.personal_info.location}
                        onChange={(e) => setFormData({
                          ...formData,
                          personal_info: { ...formData.personal_info, location: e.target.value }
                        })}
                        placeholder="San Francisco, CA"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">LinkedIn</label>
                      <Input
                        value={formData.personal_info.linkedin}
                        onChange={(e) => setFormData({
                          ...formData,
                          personal_info: { ...formData.personal_info, linkedin: e.target.value }
                        })}
                        placeholder="linkedin.com/in/johndoe"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">GitHub</label>
                      <Input
                        value={formData.personal_info.github}
                        onChange={(e) => setFormData({
                          ...formData,
                          personal_info: { ...formData.personal_info, github: e.target.value }
                        })}
                        placeholder="github.com/johndoe"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium mb-1">Website</label>
                      <Input
                        value={formData.personal_info.website}
                        onChange={(e) => setFormData({
                          ...formData,
                          personal_info: { ...formData.personal_info, website: e.target.value }
                        })}
                        placeholder="https://johndoe.com"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Summary */}
              {currentStep === 2 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Professional Summary</h3>
                  <div>
                    <label className="block text-sm font-medium mb-1">Summary</label>
                    <textarea
                      className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={formData.summary}
                      onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                      placeholder="Write a compelling professional summary..."
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleGenerateSummary}
                    disabled={isGeneratingSummary}
                  >
                    {isGeneratingSummary ? 'Generating...' : 'Generate with AI'}
                  </Button>
                </div>
              )}

              {/* Step 3: Experience */}
              {currentStep === 3 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Work Experience</h3>
                  {formData.experience.map((exp, index) => (
                    <Card key={index} className="p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-1">Company</label>
                          <Input
                            value={exp.company}
                            onChange={(e) => updateExperience(index, 'company', e.target.value)}
                            placeholder="Company Name"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Title</label>
                          <Input
                            value={exp.title}
                            onChange={(e) => updateExperience(index, 'title', e.target.value)}
                            placeholder="Job Title"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Location</label>
                          <Input
                            value={exp.location}
                            onChange={(e) => updateExperience(index, 'location', e.target.value)}
                            placeholder="City, State"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Start Date</label>
                          <Input
                            type="month"
                            value={exp.start_date}
                            onChange={(e) => updateExperience(index, 'start_date', e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">End Date</label>
                          <Input
                            type="month"
                            value={exp.end_date}
                            onChange={(e) => updateExperience(index, 'end_date', e.target.value)}
                            disabled={exp.is_current}
                          />
                        </div>
                        <div className="flex items-center">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={exp.is_current}
                              onChange={(e) => updateExperience(index, 'is_current', e.target.checked)}
                              className="rounded border-gray-300"
                            />
                            <span className="text-sm">Currently working here</span>
                          </label>
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium mb-1">Description</label>
                          <div className="flex gap-2 items-start">
                            <textarea
                              className="flex min-h-[80px] flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                              value={exp.description}
                              onChange={(e) => updateExperience(index, 'description', e.target.value)}
                              placeholder="Describe your responsibilities and achievements..."
                            />
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => handleGenerateExperienceDescription(index)}
                              disabled={isGeneratingExperience && generatingExperienceIndex === index}
                            >
                              {isGeneratingExperience && generatingExperienceIndex === index ? 'Generating...' : 'Generate with AI'}
                            </Button>
                          </div>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => removeExperience(index)}
                        className="mt-2"
                      >
                        Remove
                      </Button>
                    </Card>
                  ))}
                  <Button type="button" variant="outline" onClick={addExperience}>
                    + Add Experience
                  </Button>
                </div>
              )}

              {/* Step 4: Education */}
              {currentStep === 4 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Education</h3>
                  {formData.education.map((edu, index) => (
                    <Card key={index} className="p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-1">Institution</label>
                          <Input
                            value={edu.institution}
                            onChange={(e) => updateEducation(index, 'institution', e.target.value)}
                            placeholder="University Name"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Degree</label>
                          <Input
                            value={edu.degree}
                            onChange={(e) => updateEducation(index, 'degree', e.target.value)}
                            placeholder="Bachelor's, Master's, etc."
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Field of Study</label>
                          <Input
                            value={edu.field_of_study}
                            onChange={(e) => updateEducation(index, 'field_of_study', e.target.value)}
                            placeholder="Computer Science"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Grade</label>
                          <Input
                            value={edu.grade}
                            onChange={(e) => updateEducation(index, 'grade', e.target.value)}
                            placeholder="GPA or grade"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Start Date</label>
                          <Input
                            type="month"
                            value={edu.start_date}
                            onChange={(e) => updateEducation(index, 'start_date', e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">End Date</label>
                          <Input
                            type="month"
                            value={edu.end_date}
                            onChange={(e) => updateEducation(index, 'end_date', e.target.value)}
                          />
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => removeEducation(index)}
                        className="mt-2"
                      >
                        Remove
                      </Button>
                    </Card>
                  ))}
                  <Button type="button" variant="outline" onClick={addEducation}>
                    + Add Education
                  </Button>
                </div>
              )}

              {/* Step 5: Skills */}
              {currentStep === 5 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Skills</h3>
                  <div>
                    <label className="block text-sm font-medium mb-1">Add Skills</label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Type a skill and press Enter"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addSkill(e.currentTarget.value);
                            e.currentTarget.value = '';
                          }
                        }}
                      />
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm"
                      >
                        {skill}
                        <button
                          type="button"
                          onClick={() => removeSkill(skill)}
                          className="hover:text-destructive"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 6: Projects */}
              {currentStep === 6 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Projects</h3>
                  {formData.projects.map((proj, index) => (
                    <Card key={index} className="p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-1">Project Name</label>
                          <Input
                            value={proj.name}
                            onChange={(e) => updateProject(index, 'name', e.target.value)}
                            placeholder="Project Name"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">URL</label>
                          <Input
                            value={proj.url}
                            onChange={(e) => updateProject(index, 'url', e.target.value)}
                            placeholder="https://project.com"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium mb-1">Description</label>
                          <div className="flex gap-2 items-start">
                            <textarea
                              className="flex min-h-[80px] flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                              value={proj.description}
                              onChange={(e) => updateProject(index, 'description', e.target.value)}
                              placeholder="Describe the project..."
                            />
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => handleGenerateProjectDescription(index)}
                              disabled={isGeneratingProject && generatingProjectIndex === index}
                            >
                              {isGeneratingProject && generatingProjectIndex === index ? 'Generating...' : 'Generate with AI'}
                            </Button>
                          </div>
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium mb-1">Technologies (comma-separated)</label>
                          <Input
                            value={proj.technologies.join(', ')}
                            onChange={(e) => updateProject(index, 'technologies', e.target.value.split(',').map(t => t.trim()))}
                            placeholder="React, Node.js, MongoDB"
                          />
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => removeProject(index)}
                        className="mt-2"
                      >
                        Remove
                      </Button>
                    </Card>
                  ))}
                  <Button type="button" variant="outline" onClick={addProject}>
                    + Add Project
                  </Button>
                </div>
              )}

              {/* Step 7: Template Selection */}
              {currentStep === 7 && (
                <div className="space-y-4">
                  {isLoadingTemplates ? (
                    <div className="text-center py-8">
                      <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
                      <p className="mt-2 text-sm text-white/60">Loading templates...</p>
                    </div>
                  ) : (
                    <TemplateSelector
                      templates={availableTemplates}
                      selectedTemplate={selectedTemplate}
                      onTemplateSelect={setSelectedTemplate}
                      disabled={isCreatingResume}
                    />
                  )}
                </div>
              )}

              {/* Step 8: Preview */}
              {currentStep === 8 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Preview & Generate</h3>
                  <Card className="p-6">
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold">{formData.personal_info.full_name || 'Your Name'}</h4>
                        <p className="text-sm text-muted-foreground">
                          {formData.personal_info.email && `${formData.personal_info.email} • `}
                          {formData.personal_info.phone && `${formData.personal_info.phone} • `}
                          {formData.personal_info.location}
                        </p>
                      </div>
                      {formData.summary && (
                        <div>
                          <h4 className="font-semibold">Summary</h4>
                          <p className="text-sm">{formData.summary}</p>
                        </div>
                      )}
                      {formData.experience.length > 0 && (
                        <div>
                          <h4 className="font-semibold">Experience ({formData.experience.length})</h4>
                          <p className="text-sm text-muted-foreground">
                            {formData.experience.map(e => e.company).join(', ')}
                          </p>
                        </div>
                      )}
                      {formData.education.length > 0 && (
                        <div>
                          <h4 className="font-semibold">Education ({formData.education.length})</h4>
                          <p className="text-sm text-muted-foreground">
                            {formData.education.map(e => e.institution).join(', ')}
                          </p>
                        </div>
                      )}
                      {formData.skills.length > 0 && (
                        <div>
                          <h4 className="font-semibold">Skills ({formData.skills.length})</h4>
                          <p className="text-sm text-muted-foreground">{formData.skills.join(', ')}</p>
                        </div>
                      )}
                      {formData.projects.length > 0 && (
                        <div>
                          <h4 className="font-semibold">Projects ({formData.projects.length})</h4>
                          <p className="text-sm text-muted-foreground">
                            {formData.projects.map(p => p.name).join(', ')}
                          </p>
                        </div>
                      )}
                    </div>
                  </Card>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={prevStep}
                  disabled={currentStep === 1}
                >
                  Previous
                </Button>
                {currentStep < 8 ? (
                  <Button type="button" onClick={nextStep}>
                    Next
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    {!showDownloadButton ? (
                      <>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleDownloadPreviewPDF}
                          disabled={isDownloadingPreview}
                        >
                          {isDownloadingPreview ? 'Downloading...' : 'Download Preview'}
                        </Button>
                        <Button
                          type="button"
                          onClick={handleCreateResume}
                          disabled={isCreatingResume}
                        >
                          {isCreatingResume ? 'Creating...' : 'Generate PDF & Save'}
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          type="button"
                          onClick={handleDownloadPreviewPDF}
                          disabled={isDownloadingPreview}
                        >
                          {isDownloadingPreview ? 'Downloading...' : 'Download PDF'}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setShowDownloadButton(false);
                            setFormData({
                              personal_info: {
                                full_name: '',
                                email: '',
                                phone: '',
                                location: '',
                                linkedin: '',
                                github: '',
                                website: ''
                              },
                              summary: '',
                              experience: [],
                              education: [],
                              skills: [],
                              projects: []
                            });
                            setCurrentStep(1);
                          }}
                        >
                          Create Another
                        </Button>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </Card>
        )}

        {showDetail && selectedResume && parsedData && (
          <ResumeDetail
            resume={selectedResume}
            parsedData={parsedData}
            onClose={() => setShowDetail(false)}
          />
        )}

        {showAnalysis && selectedResume && analysisData && (
          <ResumeAnalysisResults
            analysis={analysisData}
            resume={selectedResume}
            onClose={() => setShowAnalysis(false)}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
