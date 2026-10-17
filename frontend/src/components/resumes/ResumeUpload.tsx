'use client';

import { useState, useRef } from 'react';
import { Card, CardContent } from '@/components/dashboard/Card';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

interface ResumeUploadProps {
  onUpload: (file: File, title?: string) => Promise<void>;
  isUploading?: boolean;
}

export function ResumeUpload({ onUpload, isUploading = false }: ResumeUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  const ALLOWED_TYPES = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

  const validateFile = (file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return 'Only PDF and DOCX files are allowed';
    }
    if (file.size > MAX_FILE_SIZE) {
      return 'File size must be less than 10MB';
    }
    return null;
  };

  const handleFileSelect = (file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      setSelectedFile(null);
      return;
    }

    setError(null);
    setSelectedFile(file);
    setTitle(file.name.replace(/\.[^/.]+$/, '')); // Remove extension for title
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      await onUpload(selectedFile, title || undefined);
      setSelectedFile(null);
      setTitle('');
      setError(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    }
  };

  const handleCancel = () => {
    setSelectedFile(null);
    setTitle('');
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        {!selectedFile ? (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={cn(
              'border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200',
              isDragging ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50',
              'cursor-pointer'
            )}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx"
              onChange={handleFileInputChange}
              className="hidden"
              disabled={isUploading}
            />
            <div className="space-y-3">
              <div className="text-4xl">📄</div>
              <div>
                <p className="font-medium">Drop your resume here</p>
                <p className="text-sm text-muted-foreground mt-1">
                  or click to browse (PDF, DOCX up to 10MB)
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl">📄</div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{selectedFile.name}</p>
                <p className="text-sm text-muted-foreground">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCancel}
                disabled={isUploading}
              >
                ✕
              </Button>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Resume Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="My Resume"
                className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-all"
                disabled={isUploading}
              />
            </div>

            <Button
              onClick={handleUpload}
              disabled={isUploading}
              className="w-full"
            >
              {isUploading ? (
                <span className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Uploading...
                </span>
              ) : (
                'Upload Resume'
              )}
            </Button>
          </div>
        )}

        {error && (
          <div className="mt-4 rounded-lg bg-destructive/10 p-3 text-sm text-destructive animate-in fade-in slide-in-from-top-2">
            {error}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
