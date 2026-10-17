'use client';

import { Resume } from '@/types/resume';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/dashboard/Card';
import { Badge } from '@/components/dashboard/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/dashboard/EmptyState';
import { cn } from '@/lib/utils';
import { Zap, BarChart2, Sparkles, Trash2, Download, FileText } from 'lucide-react';

interface ResumeListProps {
  resumes: Resume[];
  onDelete: (resumeId: string) => Promise<void>;
  onParse?: (resumeId: string) => Promise<void>;
  onAnalyze?: (resumeId: string) => Promise<void>;
  onOptimize?: (resumeId: string) => Promise<void>;
  onDownload?: (resume: Resume) => Promise<void>;
  onRegenerateTemplate?: (resumeId: string, templateId: string) => Promise<void>;
  isDeleting?: boolean;
  deletingId?: string | null;
  isParsing?: boolean;
  parsingId?: string | null;
  isAnalyzing?: boolean;
  analyzingId?: string | null;
  isOptimizing?: boolean;
  optimizingId?: string | null;
  isDownloading?: boolean;
  downloadingId?: string | null;
  isRegenerating?: boolean;
  regeneratingId?: string | null;
}

export function ResumeList({ resumes, onDelete, onParse, onAnalyze, onOptimize, onDownload, onRegenerateTemplate, isDeleting = false, deletingId, isParsing = false, parsingId, isAnalyzing = false, analyzingId, isOptimizing = false, optimizingId, isDownloading = false, downloadingId, isRegenerating = false, regeneratingId }: ResumeListProps) {
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getATSBadge = (resume: Resume) => {
    if (!resume.latest_analysis) {
      return (
        <button
          onClick={() => onAnalyze && onAnalyze(resume.id)}
          disabled={isAnalyzing && analyzingId === resume.id}
          className="flex items-center gap-1.5 px-3.5 py-1 text-xs font-medium rounded-full transition-all disabled:opacity-50"
          style={{
            background: 'linear-gradient(135deg, rgba(233,30,140,0.2), rgba(139,92,246,0.2))',
            color: 'white',
            border: '0.5px solid rgba(233,30,140,0.3)',
            borderRadius: '20px',
            padding: '5px 14px',
            fontSize: '12px',
            fontWeight: '500'
          }}
        >
          {isAnalyzing && analyzingId === resume.id ? (
            <div className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
          ) : (
            <BarChart2 className="w-3 h-3" />
          )}
          {isAnalyzing && analyzingId === resume.id ? 'Analyzing...' : 'Analyze'}
        </button>
      );
    }

    const atsScore = resume.latest_analysis.ats_score;

    if (atsScore >= 80) {
      return (
        <Badge
          className="px-3 py-1 text-xs font-medium rounded-full"
          style={{
            background: 'rgba(16,185,129,0.15)',
            color: '#10b981',
            border: '0.5px solid rgba(16,185,129,0.3)',
            borderRadius: '20px'
          }}
        >
          ATS Ready
        </Badge>
      );
    } else {
      return (
        <div className="flex items-center gap-2">
          <Badge
            className="px-3 py-1 text-xs font-medium rounded-full"
            style={{
              background: 'rgba(233,30,140,0.15)',
              color: '#E91E8C',
              border: '0.5px solid rgba(233,30,140,0.3)',
              borderRadius: '20px'
            }}
          >
            Low ATS
          </Badge>
          <button
            onClick={() => onOptimize && onOptimize(resume.id)}
            disabled={isOptimizing && optimizingId === resume.id}
            className="flex items-center gap-1.5 text-xs font-medium rounded-full transition-all disabled:opacity-50"
            style={{
              background: 'rgba(245,158,11,0.15)',
              color: '#f59e0b',
              border: '0.5px solid rgba(245,158,11,0.3)',
              borderRadius: '20px',
              padding: '5px 14px',
              fontSize: '12px',
              fontWeight: '500'
            }}
          >
            {isOptimizing && optimizingId === resume.id ? (
              <div className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
            ) : (
              <Sparkles className="w-3 h-3" />
            )}
            {isOptimizing && optimizingId === resume.id ? 'Optimizing...' : 'Optimize'}
          </button>
        </div>
      );
    }
  };

  if (resumes.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <EmptyState
            icon="📄"
            title="No resumes yet"
            description="Upload your first resume to get started with SKYRA's career intelligence features."
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {resumes.map((resume) => (
        <Card
          key={resume.id}
          className="hover:shadow-md transition-all duration-200"
          style={{
            background: 'rgba(13,13,31,0.8)',
            border: '0.5px solid rgba(139,92,246,0.15)',
            borderRadius: '14px',
            padding: '16px 20px'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'rgba(233,30,140,0.25)';
            e.currentTarget.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'rgba(139,92,246,0.15)';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          <CardContent className="p-0">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-2xl flex-shrink-0">
                📄
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate">{resume.title}</h3>
                    <p className="truncate" style={{ color: 'rgba(255,255,255,0.35)', fontSize: '12px' }}>
                      {resume.original_filename}
                    </p>
                  </div>
                  <Badge variant={resume.is_active ? 'success' : 'secondary'}>
                    {resume.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                
                <div className="flex items-center gap-4 mt-2" style={{ color: 'rgba(255,255,255,0.25)', fontSize: '11px' }}>
                  <span>{formatFileSize(resume.file_size)}</span>
                  <span>•</span>
                  <span>{formatDate(resume.created_at)}</span>
                  {resume.template_id && (
                    <>
                      <span>•</span>
                      <span className="capitalize">{resume.template_id} Template</span>
                    </>
                  )}
                </div>

                <div className="mt-2">
                  {getATSBadge(resume)}
                </div>
              </div>

              <div className="flex items-center gap-2">
                {onDownload && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDownload(resume)}
                    disabled={isDownloading && downloadingId === resume.id}
                    className="flex items-center gap-1.5 transition-all disabled:opacity-50"
style={{
  background: 'rgba(59,130,246,0.15)',
  color: '#60a5fa',
  border: '0.5px solid rgba(59,130,246,0.3)',
  borderRadius: '20px',
  padding: '5px 14px',
  fontSize: '12px',
  fontWeight: '500'
}}
title="Download PDF"
                  >
                    {isDownloading && downloadingId === resume.id ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    ) : (
                      'Download'
                    )}
                  </Button>
                )}
                {onRegenerateTemplate && (
                  <button
                    onClick={() => onRegenerateTemplate(resume.id, resume.template_id || 'classic')}
                    disabled={isRegenerating && regeneratingId === resume.id}
                    className="flex items-center gap-1.5 transition-all disabled:opacity-50"
                    style={{
                      background: 'rgba(16,185,129,0.15)',
                      color: '#10b981',
                      border: '0.5px solid rgba(16,185,129,0.3)',
                      borderRadius: '20px',
                      padding: '5px 14px',
                      fontSize: '12px',
                      fontWeight: '500'
                    }}
                    title="Regenerate with different template"
                  >
                    {isRegenerating && regeneratingId === resume.id ? (
                      <div className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    ) : (
                      <FileText className="w-3 h-3" />
                    )}
                    {isRegenerating && regeneratingId === resume.id ? 'Regenerating...' : 'Change Template'}
                  </button>
                )}
                {onParse && (
                  <button
                    onClick={() => onParse(resume.id)}
                    disabled={isParsing && parsingId === resume.id}
                    className="flex items-center gap-1.5 transition-all disabled:opacity-50"
                    style={{
                      background: 'rgba(139,92,246,0.15)',
                      color: '#a78bfa',
                      border: '0.5px solid rgba(139,92,246,0.3)',
                      borderRadius: '20px',
                      padding: '5px 14px',
                      fontSize: '12px',
                      fontWeight: '500'
                    }}
                  >
                    {isParsing && parsingId === resume.id ? (
                      <div className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    ) : (
                      <Zap className="w-3 h-3" />
                    )}
                    {isParsing && parsingId === resume.id ? 'Parsing...' : 'Parse'}
                  </button>
                )}
                {onAnalyze && (
                  <button
                    onClick={() => onAnalyze(resume.id)}
                    disabled={isAnalyzing && analyzingId === resume.id}
                    className="flex items-center gap-1.5 transition-all disabled:opacity-50"
                    style={{
                      background: 'linear-gradient(135deg, rgba(233,30,140,0.2), rgba(139,92,246,0.2))',
                      color: 'white',
                      border: '0.5px solid rgba(233,30,140,0.3)',
                      borderRadius: '20px',
                      padding: '5px 14px',
                      fontSize: '12px',
                      fontWeight: '500'
                    }}
                  >
                    {isAnalyzing && analyzingId === resume.id ? (
                      <div className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    ) : (
                      <BarChart2 className="w-3 h-3" />
                    )}
                    {isAnalyzing && analyzingId === resume.id ? 'Analyzing...' : 'Analyze'}
                  </button>
                )}
                {onOptimize && (
                  <button
                    onClick={() => onOptimize(resume.id)}
                    disabled={isOptimizing && optimizingId === resume.id}
                    className="flex items-center gap-1.5 transition-all disabled:opacity-50"
                    style={{
                      background: 'rgba(245,158,11,0.15)',
                      color: '#f59e0b',
                      border: '0.5px solid rgba(245,158,11,0.3)',
                      borderRadius: '20px',
                      padding: '5px 14px',
                      fontSize: '12px',
                      fontWeight: '500'
                    }}
                  >
                    {isOptimizing && optimizingId === resume.id ? (
                      <div className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    ) : (
                      <Sparkles className="w-3 h-3" />
                    )}
                    {isOptimizing && optimizingId === resume.id ? 'Optimizing...' : 'Optimize'}
                  </button>
                )}
                <button
                  onClick={() => onDelete(resume.id)}
                  disabled={isDeleting && deletingId === resume.id}
                  className="flex items-center gap-1.5 transition-all disabled:opacity-50"
                  style={{
                    background: 'rgba(239,68,68,0.1)',
                    color: '#ef4444',
                    border: '0.5px solid rgba(239,68,68,0.2)',
                    borderRadius: '20px',
                    padding: '5px 14px',
                    fontSize: '12px',
                    fontWeight: '500'
                  }}
                >
                  {isDeleting && deletingId === resume.id ? (
                    <div className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  ) : (
                    <Trash2 className="w-3 h-3" />
                  )}
                  {isDeleting && deletingId === resume.id ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
