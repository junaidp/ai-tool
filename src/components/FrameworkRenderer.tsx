import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface FrameworkRendererProps {
  content: string;
}

export function FrameworkRenderer({ content }: FrameworkRendererProps) {
  const renderMarkdown = (markdown: string) => {
    const lines = markdown.split('\n');
    const elements: React.ReactNode[] = [];
    let currentList: string[] = [];
    let currentTable: string[][] = [];
    let inCodeBlock = false;
    let codeBlockContent: string[] = [];
    let listLevel = 0;

    const flushList = () => {
      if (currentList.length > 0) {
        elements.push(
          <ul key={`list-${elements.length}`} className="space-y-2 ml-6 my-4">
            {currentList.map((item, idx) => (
              <li key={idx} className="text-sm leading-relaxed list-disc">{item}</li>
            ))}
          </ul>
        );
        currentList = [];
      }
    };

    const flushTable = () => {
      if (currentTable.length > 0) {
        elements.push(
          <div key={`table-${elements.length}`} className="overflow-x-auto my-6">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-primary/10">
                  {currentTable[0].map((header, idx) => (
                    <th key={idx} className="border border-border px-4 py-3 text-left font-semibold text-sm">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {currentTable.slice(1).map((row, rowIdx) => (
                  <tr key={rowIdx} className="hover:bg-muted/50">
                    {row.map((cell, cellIdx) => (
                      <td key={cellIdx} className="border border-border px-4 py-3 text-sm">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
        currentTable = [];
      }
    };

    const flushCodeBlock = () => {
      if (codeBlockContent.length > 0) {
        elements.push(
          <pre key={`code-${elements.length}`} className="bg-muted p-4 rounded-lg overflow-x-auto my-4">
            <code className="text-sm font-mono">{codeBlockContent.join('\n')}</code>
          </pre>
        );
        codeBlockContent = [];
      }
    };

    lines.forEach((line, index) => {
      // Code blocks
      if (line.trim().startsWith('```')) {
        if (inCodeBlock) {
          flushCodeBlock();
          inCodeBlock = false;
        } else {
          flushList();
          flushTable();
          inCodeBlock = true;
        }
        return;
      }

      if (inCodeBlock) {
        codeBlockContent.push(line);
        return;
      }

      // Headers
      if (line.startsWith('# ')) {
        flushList();
        flushTable();
        elements.push(
          <h1 key={`h1-${index}`} className="text-3xl font-bold mt-8 mb-4 text-primary">
            {line.substring(2)}
          </h1>
        );
      } else if (line.startsWith('## ')) {
        flushList();
        flushTable();
        elements.push(
          <h2 key={`h2-${index}`} className="text-2xl font-semibold mt-6 mb-3 text-primary/90">
            {line.substring(3)}
          </h2>
        );
      } else if (line.startsWith('### ')) {
        flushList();
        flushTable();
        elements.push(
          <h3 key={`h3-${index}`} className="text-xl font-semibold mt-5 mb-2 text-primary/80">
            {line.substring(4)}
          </h3>
        );
      } else if (line.startsWith('#### ')) {
        flushList();
        flushTable();
        elements.push(
          <h4 key={`h4-${index}`} className="text-lg font-semibold mt-4 mb-2">
            {line.substring(5)}
          </h4>
        );
      } else if (line.startsWith('##### ')) {
        flushList();
        flushTable();
        elements.push(
          <h5 key={`h5-${index}`} className="text-base font-semibold mt-3 mb-2">
            {line.substring(6)}
          </h5>
        );
      }
      // Horizontal rule
      else if (line.trim() === '---' || line.trim() === '***') {
        flushList();
        flushTable();
        elements.push(<Separator key={`sep-${index}`} className="my-6" />);
      }
      // Tables
      else if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
        flushList();
        const cells = line
          .split('|')
          .map(cell => cell.trim())
          .filter(cell => cell);
        
        // Skip separator rows
        if (!cells.every(cell => cell.match(/^[-:]+$/))) {
          currentTable.push(cells);
        }
      } else if (currentTable.length > 0 && !line.trim().startsWith('|')) {
        flushTable();
      }
      // Lists
      else if (line.match(/^\s*[-*+]\s+/) || line.match(/^\s*\d+\.\s+/)) {
        flushTable();
        const match = line.match(/^(\s*)([-*+]|\d+\.)\s+(.+)$/);
        if (match) {
          const indent = match[1].length;
          const content = match[3];
          currentList.push(content);
        }
      } else if (currentList.length > 0 && line.trim() === '') {
        flushList();
      }
      // Blockquotes
      else if (line.trim().startsWith('>')) {
        flushList();
        flushTable();
        elements.push(
          <blockquote key={`quote-${index}`} className="border-l-4 border-primary/30 pl-4 py-2 my-4 italic text-muted-foreground">
            {line.substring(line.indexOf('>') + 1).trim()}
          </blockquote>
        );
      }
      // Bold text patterns
      else if (line.includes('**')) {
        flushList();
        flushTable();
        const parts = line.split('**');
        const formatted = parts.map((part, idx) => 
          idx % 2 === 1 ? <strong key={idx} className="font-semibold">{part}</strong> : part
        );
        elements.push(
          <p key={`p-${index}`} className="text-sm leading-relaxed my-2">
            {formatted}
          </p>
        );
      }
      // Regular paragraphs
      else if (line.trim()) {
        flushList();
        flushTable();
        
        // Check for inline code
        if (line.includes('`')) {
          const parts = line.split('`');
          const formatted = parts.map((part, idx) => 
            idx % 2 === 1 ? (
              <code key={idx} className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">
                {part}
              </code>
            ) : part
          );
          elements.push(
            <p key={`p-${index}`} className="text-sm leading-relaxed my-2">
              {formatted}
            </p>
          );
        } else {
          elements.push(
            <p key={`p-${index}`} className="text-sm leading-relaxed my-2">
              {line}
            </p>
          );
        }
      }
      // Empty lines
      else if (line.trim() === '') {
        flushList();
        flushTable();
      }
    });

    // Flush any remaining content
    flushList();
    flushTable();
    flushCodeBlock();

    return elements;
  };

  return (
    <div className="prose prose-sm max-w-none">
      <div className="space-y-1">
        {renderMarkdown(content)}
      </div>
    </div>
  );
}
