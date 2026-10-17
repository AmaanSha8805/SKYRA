'use client';

import { Resume } from '@/types/resume';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/dashboard/Card';
import { Badge } from '@/components/dashboard/Badge';
import { Button } from '@/components/ui/Button';

interface ResumeDetailProps {
  resume: Resume;
  parsedData: any;
  onClose: () => void;
}

export function ResumeDetail({ resume, parsedData, onClose }: ResumeDetailProps) {
  const formatDate = (dateString: string | null): string => {
    if (!dateString) return 'Present';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <Card className="animate-in fade-in slide-in-from-bottom-4 duration-300">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Parsed Resume: {resume.title}</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            ✕
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Personal Info */}
        {parsedData.personal_info && (
          <div>
            <h3 className="font-semibold mb-3 text-lg">Personal Information</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              {parsedData.personal_info.name && (
                <div>
                  <span className="text-muted-foreground">Name:</span>
                  <span className="ml-2">{parsedData.personal_info.name}</span>
                </div>
              )}
              {parsedData.personal_info.email && (
                <div>
                  <span className="text-muted-foreground">Email:</span>
                  <span className="ml-2">{parsedData.personal_info.email}</span>
                </div>
              )}
              {parsedData.personal_info.phone && (
                <div>
                  <span className="text-muted-foreground">Phone:</span>
                  <span className="ml-2">{parsedData.personal_info.phone}</span>
                </div>
              )}
              {parsedData.personal_info.location && (
                <div>
                  <span className="text-muted-foreground">Location:</span>
                  <span className="ml-2">{parsedData.personal_info.location}</span>
                </div>
              )}
              {parsedData.personal_info.linkedin && (
                <div>
                  <span className="text-muted-foreground">LinkedIn:</span>
                  <span className="ml-2">{parsedData.personal_info.linkedin}</span>
                </div>
              )}
              {parsedData.personal_info.github && (
                <div>
                  <span className="text-muted-foreground">GitHub:</span>
                  <span className="ml-2">{parsedData.personal_info.github}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Summary */}
        {parsedData.summary && (
          <div>
            <h3 className="font-semibold mb-2 text-lg">Professional Summary</h3>
            <p className="text-sm text-muted-foreground">{parsedData.summary}</p>
          </div>
        )}

        {/* Skills */}
        {parsedData.skills && parsedData.skills.length > 0 && (
          <div>
            <h3 className="font-semibold mb-3 text-lg">Skills</h3>
            <div className="flex flex-wrap gap-2">
              {parsedData.skills.map((skill: string, index: number) => (
                <Badge key={index} variant="secondary">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Experience */}
        {parsedData.experience && parsedData.experience.length > 0 && (
          <div>
            <h3 className="font-semibold mb-3 text-lg">Work Experience</h3>
            <div className="space-y-4">
              {parsedData.experience.map((exp: any, index: number) => (
                <div key={index} className="border-l-2 border-primary/20 pl-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium">{exp.title}</h4>
                      <p className="text-sm text-muted-foreground">{exp.company}</p>
                    </div>
                    {exp.is_current && (
                      <Badge variant="success" className="text-xs">Current</Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatDate(exp.start_date)} - {formatDate(exp.end_date)}
                  </p>
                  {exp.location && (
                    <p className="text-xs text-muted-foreground">{exp.location}</p>
                  )}
                  {exp.description && (
                    <p className="text-sm mt-2">{exp.description}</p>
                  )}
                  {exp.achievements && exp.achievements.length > 0 && (
                    <ul className="text-sm mt-2 list-disc list-inside text-muted-foreground">
                      {exp.achievements.map((achievement: string, i: number) => (
                        <li key={i}>{achievement}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Education */}
        {parsedData.education && parsedData.education.length > 0 && (
          <div>
            <h3 className="font-semibold mb-3 text-lg">Education</h3>
            <div className="space-y-3">
              {parsedData.education.map((edu: any, index: number) => (
                <div key={index} className="border-l-2 border-primary/20 pl-4">
                  <h4 className="font-medium">{edu.degree}</h4>
                  <p className="text-sm text-muted-foreground">{edu.institution}</p>
                  {edu.field_of_study && (
                    <p className="text-xs text-muted-foreground">{edu.field_of_study}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatDate(edu.start_date)} - {formatDate(edu.end_date)}
                  </p>
                  {edu.grade && (
                    <p className="text-xs text-muted-foreground">Grade: {edu.grade}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Projects */}
        {parsedData.projects && parsedData.projects.length > 0 && (
          <div>
            <h3 className="font-semibold mb-3 text-lg">Projects</h3>
            <div className="space-y-3">
              {parsedData.projects.map((project: any, index: number) => (
                <div key={index} className="border-l-2 border-primary/20 pl-4">
                  <h4 className="font-medium">{project.name}</h4>
                  {project.description && (
                    <p className="text-sm text-muted-foreground">{project.description}</p>
                  )}
                  {project.url && (
                    <a
                      href={project.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary hover:underline"
                    >
                      {project.url}
                    </a>
                  )}
                  {project.technologies && project.technologies.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {project.technologies.map((tech: string, i: number) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {tech}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Certifications */}
        {parsedData.certifications && parsedData.certifications.length > 0 && (
          <div>
            <h3 className="font-semibold mb-3 text-lg">Certifications</h3>
            <div className="space-y-2">
              {parsedData.certifications.map((cert: any, index: number) => (
                <div key={index} className="flex items-start justify-between border-b border-border pb-2">
                  <div>
                    <h4 className="font-medium text-sm">{cert.name}</h4>
                    <p className="text-xs text-muted-foreground">{cert.issuer}</p>
                  </div>
                  <div className="text-right text-xs text-muted-foreground">
                    <p>{formatDate(cert.issue_date)}</p>
                    {cert.expiry_date && (
                      <p>Expires: {formatDate(cert.expiry_date)}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
