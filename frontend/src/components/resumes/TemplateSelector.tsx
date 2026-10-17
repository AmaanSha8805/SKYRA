'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/dashboard/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/dashboard/Badge';
import { cn } from '@/lib/utils';

export interface Template {
  id: string;
  name: string;
  description: string;
  features: string[];
}

interface TemplateSelectorProps {
  templates: Template[];
  selectedTemplate: string;
  onTemplateSelect: (templateId: string) => void;
  disabled?: boolean;
}

export function TemplateSelector({ templates, selectedTemplate, onTemplateSelect, disabled = false }: TemplateSelectorProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Select Resume Template</h3>
      <p className="text-sm text-white/60">
        Choose an ATS-friendly template optimized for applicant tracking systems
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {templates.map((template) => (
          <Card
            key={template.id}
            className={cn(
              "cursor-pointer transition-all duration-200 hover:shadow-md",
              selectedTemplate === template.id
                ? "border-2 border-skyra-pink bg-skyra-pink/10"
                : "border border-white/10 hover:border-white/20"
            )}
            onClick={() => !disabled && onTemplateSelect(template.id)}
            style={{
              background: selectedTemplate === template.id 
                ? 'rgba(233,30,140,0.1)' 
                : 'rgba(13,13,31,0.8)',
              borderColor: selectedTemplate === template.id 
                ? '#E91E8C' 
                : 'rgba(139,92,246,0.15)'
            }}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{template.name}</CardTitle>
                {selectedTemplate === template.id && (
                  <Badge variant="success" className="text-xs">Selected</Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-white/70">{template.description}</p>
              
              <div className="space-y-2">
                <p className="text-xs font-medium text-white/50">Features:</p>
                <ul className="space-y-1">
                  {template.features.map((feature, index) => (
                    <li key={index} className="text-xs text-white/60 flex items-start gap-2">
                      <span className="text-skyra-pink mt-0.5">•</span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
              
              {/* Template Preview Placeholder */}
              <div 
                className="mt-3 h-24 rounded-lg border border-white/10 flex items-center justify-center text-xs text-white/40"
                style={{
                  background: 'linear-gradient(135deg, rgba(139,92,246,0.1), rgba(233,30,140,0.1))'
                }}
              >
                <div className="text-center">
                  <div className="text-2xl mb-1">📄</div>
                  <div>{template.name} Preview</div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {disabled && (
        <p className="text-xs text-white/40 italic">
          Template selection is disabled during PDF generation
        </p>
      )}
    </div>
  );
}