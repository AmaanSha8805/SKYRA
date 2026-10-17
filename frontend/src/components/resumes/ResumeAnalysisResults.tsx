'use client';

import { ResumeAnalysis } from '@/types/resume';
import { Resume } from '@/types/resume';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/dashboard/Card';
import { Badge } from '@/components/dashboard/Badge';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/dashboard/ProgressBar';

interface ResumeAnalysisResultsProps {
  analysis: ResumeAnalysis;
  resume: Resume;
  onClose: () => void;
}

export function ResumeAnalysisResults({ analysis, resume, onClose }: ResumeAnalysisResultsProps) {
  const getScoreColor = (score: number): string => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getScoreLabel = (score: number): string => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Needs Improvement';
  };

  const getProgressBarVariant = (score: number): 'success' | 'warning' | 'error' => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'warning';
    return 'error';
  };

  const getBadgeVariant = (score: number): 'success' | 'warning' => {
    if (score >= 80) return 'success';
    return 'warning';
  };

  return (
    <Card className="animate-in fade-in slide-in-from-bottom-4 duration-300">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>ATS Analysis: {resume.title}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Generated on {new Date(analysis.created_at).toLocaleDateString()}
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            ✕
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Score */}
        <div className="text-center py-6 bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg">
          <div className="text-6xl font-bold mb-2">
            <span className={getScoreColor(analysis.overall_score)}>
              {analysis.overall_score}
            </span>
            <span className="text-2xl text-muted-foreground">/100</span>
          </div>
          <Badge variant={getBadgeVariant(analysis.overall_score)} className="text-sm">
            {getScoreLabel(analysis.overall_score)}
          </Badge>
          <p className="text-sm text-muted-foreground mt-2">Overall ATS Score</p>
        </div>

        {/* Score Breakdown */}
        <div>
          <h3 className="font-semibold mb-4 text-lg">Score Breakdown</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-muted-foreground">ATS Compatibility</span>
                <span className={`font-medium ${getScoreColor(analysis.ats_score)}`}>
                  {analysis.ats_score}%
                </span>
              </div>
              <ProgressBar value={analysis.ats_score} className="h-2" variant={getProgressBarVariant(analysis.ats_score)} />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-muted-foreground">Content Quality</span>
                <span className={`font-medium ${getScoreColor(analysis.content_score)}`}>
                  {analysis.content_score}%
                </span>
              </div>
              <ProgressBar value={analysis.content_score} className="h-2" variant={getProgressBarVariant(analysis.content_score)} />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-muted-foreground">Skills Assessment</span>
                <span className={`font-medium ${getScoreColor(analysis.skills_score)}`}>
                  {analysis.skills_score}%
                </span>
              </div>
              <ProgressBar value={analysis.skills_score} className="h-2" variant={getProgressBarVariant(analysis.skills_score)} />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-muted-foreground">Experience Relevance</span>
                <span className={`font-medium ${getScoreColor(analysis.experience_score)}`}>
                  {analysis.experience_score}%
                </span>
              </div>
              <ProgressBar value={analysis.experience_score} className="h-2" variant={getProgressBarVariant(analysis.experience_score)} />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-muted-foreground">Formatting</span>
                <span className={`font-medium ${getScoreColor(analysis.formatting_score)}`}>
                  {analysis.formatting_score}%
                </span>
              </div>
              <ProgressBar value={analysis.formatting_score} className="h-2" variant={getProgressBarVariant(analysis.formatting_score)} />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-muted-foreground">Keyword Optimization</span>
                <span className={`font-medium ${getScoreColor(analysis.keyword_score)}`}>
                  {analysis.keyword_score}%
                </span>
              </div>
              <ProgressBar value={analysis.keyword_score} className="h-2" variant={getProgressBarVariant(analysis.keyword_score)} />
            </div>
          </div>
        </div>

        {/* Strengths */}
        {analysis.strengths && analysis.strengths.length > 0 && (
          <div>
            <h3 className="font-semibold mb-3 text-lg flex items-center gap-2">
              <span className="text-green-500">✓</span> Strengths
            </h3>
            <div className="space-y-2">
              {analysis.strengths.map((strength, index) => (
                <div key={index} className="flex items-start gap-2 text-sm bg-green-50 dark:bg-green-950/20 p-3 rounded-lg">
                  <span className="text-green-500 mt-0.5">•</span>
                  <span>{strength}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Weaknesses */}
        {analysis.weaknesses && analysis.weaknesses.length > 0 && (
          <div>
            <h3 className="font-semibold mb-3 text-lg flex items-center gap-2">
              <span className="text-red-500">✗</span> Areas for Improvement
            </h3>
            <div className="space-y-2">
              {analysis.weaknesses.map((weakness, index) => (
                <div key={index} className="flex items-start gap-2 text-sm bg-red-50 dark:bg-red-950/20 p-3 rounded-lg">
                  <span className="text-red-500 mt-0.5">•</span>
                  <span>{weakness}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Detected Skills */}
        {analysis.detected_skills && analysis.detected_skills.length > 0 && (
          <div>
            <h3 className="font-semibold mb-3 text-lg">Detected Skills</h3>
            <div className="flex flex-wrap gap-2">
              {analysis.detected_skills.map((skill, index) => (
                <Badge key={index} variant="secondary" className="text-sm">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Missing Keywords */}
        {analysis.missing_keywords && analysis.missing_keywords.length > 0 && (
          <div>
            <h3 className="font-semibold mb-3 text-lg">Missing Keywords</h3>
            <div className="flex flex-wrap gap-2">
              {analysis.missing_keywords.map((keyword, index) => (
                <Badge key={index} variant="outline" className="text-sm">
                  {keyword}
                </Badge>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Consider adding these keywords to improve your ATS score
            </p>
          </div>
        )}

        {/* Recommendations */}
        {analysis.recommendations && analysis.recommendations.length > 0 && (
          <div>
            <h3 className="font-semibold mb-3 text-lg flex items-center gap-2">
              <span className="text-primary">💡</span> AI Recommendations
            </h3>
            <div className="space-y-2">
              {analysis.recommendations.map((recommendation, index) => (
                <div key={index} className="flex items-start gap-2 text-sm bg-primary/5 p-3 rounded-lg">
                  <span className="text-primary mt-0.5 font-bold">{index + 1}.</span>
                  <span>{recommendation}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Model Info */}
        <div className="text-xs text-muted-foreground pt-4 border-t">
          <p>Analysis powered by {analysis.model_name} (v{analysis.model_version})</p>
        </div>
      </CardContent>
    </Card>
  );
}
