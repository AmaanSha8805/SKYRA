'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/dashboard/Card';
import { LoadingState } from '@/components/dashboard/LoadingState';
import { EmptyState } from '@/components/dashboard/EmptyState';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { interviewClient } from '@/lib/interview-client';
import { resumeClient } from '@/lib/resume-client';
import { pdfClient } from '@/lib/pdf-client';
import { Question, InterviewResult } from '@/types/interview';

interface Resume {
  id: string;
  title: string;
  original_filename: string;
  created_at: string;
}

type InterviewStep = 'setup' | 'questions' | 'results';

export default function InterviewPage() {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState<string | null>(null);
  const [jobTitle, setJobTitle] = useState('');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [isLoadingResumes, setIsLoadingResumes] = useState(true);
  const [isStarting, setIsStarting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  
  const [currentStep, setCurrentStep] = useState<InterviewStep>('setup');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<'A' | 'B' | 'C' | 'D' | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [currentEvaluation, setCurrentEvaluation] = useState<InterviewResult | null>(null);
  const [results, setResults] = useState<InterviewResult[]>([]);

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

  const handleStartInterview = async () => {
    if (!selectedResumeId || !jobTitle.trim()) {
      alert('Please select a resume and enter a job title');
      return;
    }

    try {
      setIsStarting(true);
      const response = await interviewClient.startInterview({
        resume_id: selectedResumeId,
        job_title: jobTitle.trim(),
        difficulty
      });
      setQuestions(response.questions);
      setCurrentQuestionIndex(0);
      setSelectedOption(null);
      setShowExplanation(false);
      setCurrentEvaluation(null);
      setResults([]);
      setCurrentStep('questions');
    } catch (error) {
      console.error('Failed to start interview:', error);
      alert('Failed to start interview. Please try again.');
    } finally {
      setIsStarting(false);
    }
  };

  const handleAnswerOption = async (option: 'A' | 'B' | 'C' | 'D') => {
    if (showExplanation) return; // Prevent re-submitting

    try {
      setIsSubmitting(true);
      setSelectedOption(option);
      
      const response = await interviewClient.submitAnswer({
        question: questions[currentQuestionIndex].question,
        selected_option: option,
        correct_answer: questions[currentQuestionIndex].correct_answer,
        explanation: questions[currentQuestionIndex].explanation
      });

      const result: InterviewResult = {
        question: questions[currentQuestionIndex].question,
        selected_option: option,
        evaluation: response.evaluation,
        questionData: questions[currentQuestionIndex]
      };
      
      setCurrentEvaluation(result);
      setShowExplanation(true);
      setResults([...results, result]);
    } catch (error) {
      console.error('Failed to submit answer:', error);
      alert('Failed to submit answer. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNextQuestion = () => {
    setShowExplanation(false);
    setSelectedOption(null);
    setCurrentEvaluation(null);

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setCurrentStep('results');
    }
  };

  const handleRestart = () => {
    setCurrentStep('setup');
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setShowExplanation(false);
    setCurrentEvaluation(null);
    setResults([]);
    setSelectedResumeId(null);
    setJobTitle('');
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-400';
    if (score >= 6) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 8) return 'bg-green-500/20 border-green-500/30';
    if (score >= 6) return 'bg-yellow-500/20 border-yellow-500/30';
    return 'bg-red-500/20 border-red-500/30';
  };

  const calculateOverallScore = () => {
    if (results.length === 0) return 0;
    const totalScore = results.reduce((sum, result) => sum + result.evaluation.score, 0);
    return Math.round((totalScore / (results.length * 10)) * 100);
  };

  const handleDownloadPDF = async () => {
    if (results.length === 0) return;
    
    try {
      setIsDownloading(true);
      // Create a formatted content string for the PDF
      let content = `Interview Results - ${jobTitle}\n\n`;
      content += `Overall Score: ${calculateOverallScore()}%\n`;
      content += `Correct Answers: ${results.filter(r => r.evaluation.is_correct).length} / ${results.length}\n\n`;
      content += `---\n\n`;
      
      results.forEach((result, index) => {
        content += `Question ${index + 1}:\n`;
        content += `${result.question}\n\n`;
        content += `Your Answer: Option ${result.selected_option} - ${result.questionData?.options[result.selected_option as keyof typeof result.questionData.options]}\n`;
        content += `Correct Answer: Option ${result.evaluation.correct_answer} - ${result.questionData?.options[result.evaluation.correct_answer as keyof typeof result.questionData.options]}\n`;
        content += `Result: ${result.evaluation.is_correct ? 'Correct' : 'Incorrect'} (${result.evaluation.score}/10)\n\n`;
        content += `Explanation:\n${result.evaluation.explanation}\n\n`;
        content += `---\n\n`;
      });
      
      const filename = `interview_results_${jobTitle.replace(/\s+/g, '_')}`;
      await pdfClient.downloadPDF(content, filename, 'interview');
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
          <h1 className="text-3xl font-semibold tracking-tight">Interview Coach</h1>
          <p className="text-white/60 mt-2">
            Practice your interview skills with AI-powered questions and feedback
          </p>
        </div>

        {/* Step 1: Setup */}
        {currentStep === 'setup' && (
          <Card variant="glass" className="card-hover">
            <CardHeader>
              <CardTitle>Setup Your Interview</CardTitle>
              <CardDescription>Choose your resume and target position</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {isLoadingResumes ? (
                <LoadingState message="Loading resumes..." />
              ) : resumes.length === 0 ? (
                <EmptyState
                  title="No resumes found"
                  description="Upload a resume first to use the interview coach"
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
                    <label className="text-sm font-medium mb-2 block">Difficulty Level</label>
                    <div className="flex gap-4">
                      {(['easy', 'medium', 'hard'] as const).map((level) => (
                        <button
                          key={level}
                          onClick={() => setDifficulty(level)}
                          className={`px-4 py-2 rounded-lg border-2 transition-all ${
                            difficulty === level
                              ? 'border-[#E91E8C] bg-[#E91E8C]/10 text-[#E91E8C]'
                              : 'border-white/10 hover:border-[#E91E8C]/50'
                          }`}
                        >
                          {level.charAt(0).toUpperCase() + level.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>

                  <Button
                    variant="gradient"
                    onClick={handleStartInterview}
                    disabled={!selectedResumeId || !jobTitle.trim() || isStarting}
                    className="w-full button-hover"
                  >
                    {isStarting ? 'Starting Interview...' : 'Start Interview'}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        )}

        {/* Step 2: Questions */}
        {currentStep === 'questions' && questions.length > 0 && (
          <Card variant="glass" className="card-hover">
            <CardHeader>
              <CardTitle>Question {currentQuestionIndex + 1} of {questions.length}</CardTitle>
              <CardDescription>
                {questions[currentQuestionIndex].category} • {questions[currentQuestionIndex].type}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-4 bg-secondary/50 rounded-lg">
                <p className="text-lg">{questions[currentQuestionIndex].question}</p>
              </div>

              {!showExplanation ? (
                <div className="space-y-3">
                  {(['A', 'B', 'C', 'D'] as const).map((option) => (
                    <button
                      key={option}
                      onClick={() => handleAnswerOption(option)}
                      disabled={isSubmitting}
                      className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                        selectedOption === option
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <span className="font-semibold mr-2">{option}.</span>
                      {questions[currentQuestionIndex].options[option]}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className={`p-4 rounded-lg border-2 ${
                    currentEvaluation?.evaluation.is_correct
                      ? 'bg-green-500/20 border-green-500/30'
                      : 'bg-red-500/20 border-red-500/30'
                  }`}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">
                        {currentEvaluation?.evaluation.is_correct ? '✓' : '✗'}
                      </span>
                      <span className="font-semibold">
                        {currentEvaluation?.evaluation.is_correct ? 'Correct!' : 'Incorrect'}
                      </span>
                    </div>
                    <p className="text-sm">
                      <span className="font-medium">Correct Answer:</span> {currentEvaluation?.evaluation.correct_answer}
                    </p>
                  </div>

                  <div className="p-4 glass rounded-lg">
                    <h4 className="font-medium mb-2">Explanation</h4>
                    <p className="text-sm text-muted-foreground">
                      {currentEvaluation?.evaluation.explanation}
                    </p>
                  </div>

                  <Button
                    variant="gradient"
                    onClick={handleNextQuestion}
                    className="w-full button-hover"
                  >
                    {currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'See Results'}
                  </Button>
                </div>
              )}

              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Progress: {currentQuestionIndex + 1}/{questions.length}</span>
                <span>{Math.round(((currentQuestionIndex + 1) / questions.length) * 100)}% complete</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Results */}
        {currentStep === 'results' && (
          <div className="space-y-6">
            <Card variant="glass" className="card-hover">
              <CardHeader>
                <CardTitle>Interview Results</CardTitle>
                <CardDescription>Overall performance score</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <div className={`text-6xl font-bold text-gradient`}>
                    {calculateOverallScore()}%
                  </div>
                  <p className="text-muted-foreground mt-2">Overall Score</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {results.filter(r => r.evaluation.is_correct).length} / {results.length} correct
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <h2 className="text-2xl font-semibold">Detailed Results</h2>
              {results.map((result, index) => (
                <Card key={index} variant="glass" className="card-hover">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-semibold">Question {index + 1}:</span>
                          <span className={`px-2 py-1 text-xs rounded-full border ${
                            result.evaluation.is_correct
                              ? 'bg-green-500/20 border-green-500/30 text-green-400'
                              : 'bg-red-500/20 border-red-500/30 text-red-400'
                          }`}>
                            {result.evaluation.is_correct ? 'Correct' : 'Incorrect'}
                          </span>
                          <span className={`px-2 py-1 text-xs rounded-full border ${getScoreBgColor(result.evaluation.score)} ${getScoreColor(result.evaluation.score)}`}>
                            {result.evaluation.score}/10
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-4">{result.question}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="flex gap-4">
              <Button onClick={handleDownloadPDF} variant="outline" disabled={isDownloading} className="flex-1">
                {isDownloading ? 'Downloading...' : 'Download PDF'}
              </Button>
              <Button variant="gradient" onClick={handleRestart} className="flex-1 button-hover">
                Start New Interview
              </Button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}