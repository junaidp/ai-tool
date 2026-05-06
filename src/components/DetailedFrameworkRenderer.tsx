import React from 'react';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

interface DetailedFrameworkRendererProps {
  content: string;
}

export function DetailedFrameworkRenderer({ content }: DetailedFrameworkRendererProps) {
  
  const renderFormattedText = (text: string) => {
    const parts = text.split('**');
    return parts.map((part, idx) => 
      idx % 2 === 1 ? <strong key={idx} className="font-semibold">{part}</strong> : part
    );
  };

  const renderContent = () => {
    const elements: React.ReactNode[] = [];
    const lines = content.split('\n');
    
    // Extract title
    const titleMatch = content.match(/^#\s+(.+)/m);
    const title = titleMatch ? titleMatch[1] : '';
    
    // Render title
    if (title) {
      elements.push(
        <div key="title" className="mb-6">
          <h1 className="text-3xl font-bold text-center text-primary mb-1">
            {title}
          </h1>
          <p className="text-center text-sm text-muted-foreground italic mb-4">
            {title.includes('Detailed') ? 'Practitioner reference with explanations and examples' : ''}
          </p>
          <Separator />
        </div>
      );
    }

    let i = 0;
    let currentSection: { title: string; content: React.ReactNode[] } | null = null;
    let currentRequirement: { code: string; title: string; content: React.ReactNode[] } | null = null;
    let currentSubsection: { type: 'why' | 'example'; content: string[] } | null = null;

    const flushSubsection = () => {
      if (currentSubsection && currentRequirement) {
        if (currentSubsection.type === 'why') {
          currentRequirement.content.push(
            <div key={`why-${currentRequirement.code}`} className="mt-4 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border-l-4 border-blue-500">
              <h4 className="font-semibold text-sm text-blue-900 dark:text-blue-100 mb-2">Why this matters</h4>
              {currentSubsection.content.map((para, idx) => (
                <p key={idx} className="text-sm leading-relaxed mb-2 text-blue-900/90 dark:text-blue-100/90">
                  {renderFormattedText(para)}
                </p>
              ))}
            </div>
          );
        } else {
          currentRequirement.content.push(
            <div key={`example-${currentRequirement.code}`} className="mt-4 p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border-l-4 border-green-500">
              <h4 className="font-semibold text-sm text-green-900 dark:text-green-100 mb-2">What good looks like in practice</h4>
              {currentSubsection.content.map((para, idx) => (
                <p key={idx} className="text-sm leading-relaxed mb-2 text-green-900/90 dark:text-green-100/90">
                  {renderFormattedText(para)}
                </p>
              ))}
            </div>
          );
        }
        currentSubsection = null;
      }
    };

    const flushRequirement = () => {
      flushSubsection();
      if (currentRequirement && currentSection) {
        currentSection.content.push(
          <div key={currentRequirement.code} className="mb-6 p-5 bg-card border rounded-lg">
            <div className="flex items-center gap-3 mb-3">
              <span className="inline-flex items-center justify-center bg-primary text-primary-foreground px-3 py-1 rounded-md font-bold text-sm">
                {currentRequirement.code}
              </span>
              <h4 className="font-semibold text-base">{currentRequirement.title}</h4>
            </div>
            {currentRequirement.content}
          </div>
        );
        currentRequirement = null;
      }
    };

    const flushSection = () => {
      flushRequirement();
      if (currentSection) {
        elements.push(
          <div key={currentSection.title} className="mb-8">
            <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-4 rounded-t-lg border-t border-x border-primary/30">
              <h2 className="text-2xl font-bold text-primary">{currentSection.title}</h2>
            </div>
            <div className="border border-primary/30 rounded-b-lg p-6 bg-background/50">
              {currentSection.content}
            </div>
          </div>
        );
        currentSection = null;
      }
    };

    while (i < lines.length) {
      const line = lines[i];

      // Section headers (## Section)
      if (line.match(/^##\s+Section\s+\d+/i)) {
        flushSection();
        currentSection = {
          title: line.replace(/^##\s+/, ''),
          content: []
        };
        i++;
        continue;
      }

      // Requirement codes (R1.1, CE1, P1, etc.)
      if (line.match(/^(R\d+\.\d+|CE\d+|P\d+)\s*$/)) {
        flushRequirement();
        const code = line.trim();
        // Look ahead for title
        let title = '';
        if (i + 1 < lines.length && !lines[i + 1].startsWith('#')) {
          title = lines[i + 1].trim();
          i++;
        }
        currentRequirement = {
          code,
          title,
          content: []
        };
        i++;
        continue;
      }

      // Subsection markers
      if (line.match(/^(Requirement|Why this matters|Why this requirement exists|Why this exists)/i)) {
        flushSubsection();
        if (line.match(/^Requirement/i)) {
          currentSubsection = null; // Requirement text goes directly
        } else {
          currentSubsection = { type: 'why', content: [] };
        }
        i++;
        continue;
      }

      if (line.match(/^(What good looks like|.*in practice)/i)) {
        flushSubsection();
        currentSubsection = { type: 'example', content: [] };
        i++;
        continue;
      }

      // Regular content
      if (line.trim() && !line.startsWith('#')) {
        if (currentSubsection) {
          currentSubsection.content.push(line.trim());
        } else if (currentRequirement) {
          currentRequirement.content.push(
            <p key={`req-${i}`} className="text-sm leading-relaxed mb-2">
              {renderFormattedText(line)}
            </p>
          );
        } else if (currentSection) {
          currentSection.content.push(
            <p key={`sec-${i}`} className="text-sm leading-relaxed mb-3">
              {renderFormattedText(line)}
            </p>
          );
        }
      }

      i++;
    }

    // Flush remaining
    flushSection();

    return elements;
  };

  return (
    <div className="max-w-none">
      {renderContent()}
    </div>
  );
}
