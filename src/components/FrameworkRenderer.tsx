import React from 'react';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

interface FrameworkRendererProps {
  content: string;
}

export function FrameworkRenderer({ content }: FrameworkRendererProps) {
  
  // Parse Executive Summary section
  const parseExecutiveSummary = (text: string) => {
    const execSummaryMatch = text.match(/Executive Summary\s*\nFor the board[^\n]*\n\n([\s\S]*?)(?=\n\n(?:Internal Control Framework|Section \d|$))/i);
    if (!execSummaryMatch) return null;

    const summaryText = execSummaryMatch[1];
    const items: { title: string; content: string }[] = [];
    
    // Split by lines and parse key-value pairs
    const lines = summaryText.split('\n');
    let currentTitle = '';
    let currentContent: string[] = [];
    
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      
      // Check if this is a title line (starts with capital, ends without period, and is relatively short)
      if (trimmed.match(/^[A-Z][^.]*$/) && trimmed.length < 80 && !trimmed.match(/^(The|A|An|This|It|Level|Immediate|Principal|Going)/)) {
        // Save previous item if exists
        if (currentTitle && currentContent.length > 0) {
          items.push({
            title: currentTitle,
            content: currentContent.join(' ').trim()
          });
        }
        currentTitle = trimmed;
        currentContent = [];
      } else {
        currentContent.push(trimmed);
      }
    }
    
    // Save last item
    if (currentTitle && currentContent.length > 0) {
      items.push({
        title: currentTitle,
        content: currentContent.join(' ').trim()
      });
    }

    return items.length > 0 ? items : null;
  };

  // Parse document metadata
  const parseMetadata = (text: string) => {
    const metadata: { [key: string]: string } = {};
    
    const patterns = [
      { key: 'Framework edition', regex: /Framework edition\s*\n([^\n]+(?:\n(?![A-Z][^\n]+\n)[^\n]+)*)/i },
      { key: 'Governing standard', regex: /Governing standard\s*\n([^\n]+(?:\n(?![A-Z][^\n]+\n)[^\n]+)*)/i },
      { key: 'Organisation type', regex: /Organisation type\s*\n([^\n]+(?:\n(?![A-Z][^\n]+\n)[^\n]+)*)/i },
      { key: 'Version control', regex: /Version control\s*\n([^\n]+(?:\n(?![A-Z][^\n]+\n)[^\n]+)*)/i },
      { key: 'Amendment triggers', regex: /Amendment triggers\s*\n([^\n]+(?:\n(?![A-Z][^\n]+\n)[^\n]+)*)/i }
    ];

    patterns.forEach(({ key, regex }) => {
      const match = text.match(regex);
      if (match) {
        metadata[key] = match[1].trim();
      }
    });

    return metadata;
  };

  // Render formatted text with bold support
  const renderFormattedText = (text: string) => {
    const parts = text.split('**');
    return parts.map((part, idx) => 
      idx % 2 === 1 ? <strong key={idx} className="font-semibold">{part}</strong> : part
    );
  };

  // Parse and render tables
  const renderTable = (lines: string[], startIdx: number) => {
    const tableLines: string[] = [];
    let idx = startIdx;
    
    while (idx < lines.length && (lines[idx].trim().startsWith('|') || lines[idx].trim() === '')) {
      if (lines[idx].trim().startsWith('|')) {
        tableLines.push(lines[idx]);
      }
      idx++;
    }

    if (tableLines.length === 0) return { element: null, nextIdx: startIdx };

    const rows = tableLines
      .filter(line => !line.match(/^\|[\s:-]+\|/)) // Skip separator rows
      .map(line => 
        line.split('|')
          .map(cell => cell.trim())
          .filter(cell => cell)
      );

    if (rows.length === 0) return { element: null, nextIdx: idx };

    const element = (
      <div className="overflow-x-auto my-6">
        <table className="w-full border-collapse border border-border">
          <thead>
            <tr className="bg-primary/5">
              {rows[0].map((header, hIdx) => (
                <th key={hIdx} className="border border-border px-4 py-3 text-left font-semibold text-sm">
                  {renderFormattedText(header)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.slice(1).map((row, rIdx) => (
              <tr key={rIdx} className="hover:bg-muted/30">
                {row.map((cell, cIdx) => (
                  <td key={cIdx} className="border border-border px-4 py-3 text-sm align-top">
                    {renderFormattedText(cell)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );

    return { element, nextIdx: idx };
  };

  // Main rendering function
  const renderContent = () => {
    const elements: React.ReactNode[] = [];
    const lines = content.split('\n');
    
    // Extract title
    const titleMatch = content.match(/^#\s+(.+)/m);
    const title = titleMatch ? titleMatch[1] : '';
    
    // Parse Executive Summary
    const execSummary = parseExecutiveSummary(content);
    
    // Parse metadata
    const metadata = parseMetadata(content);

    // Render title
    if (title) {
      elements.push(
        <div key="title" className="mb-8">
          <h1 className="text-4xl font-bold text-center text-primary mb-2">
            {title}
          </h1>
          <Separator className="mt-4" />
        </div>
      );
    }

    // Render Executive Summary as special table
    if (execSummary && execSummary.length > 0) {
      elements.push(
        <div key="exec-summary" className="mb-8">
          <h2 className="text-3xl font-bold text-[#2d7a4a] mb-2">Executive Summary</h2>
          <p className="text-base italic text-[#2d7a4a] mb-4 border-b-2 border-[#2d7a4a] pb-2">
            For the board — what this framework is and what it requires
          </p>
          <div className="border-t-8 border-[#2d7a4a] mb-0">
            <table className="w-full border-collapse">
              <tbody>
                {execSummary.map((item, idx) => (
                  <tr key={idx} className="border-b border-gray-300 last:border-b-0">
                    <td className="px-4 py-4 font-normal text-sm align-top w-1/5 bg-[#d4e8d4]">
                      {item.title}
                    </td>
                    <td className="px-6 py-4 text-sm leading-relaxed bg-white">
                      {renderFormattedText(item.content)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
    }

    // Render metadata section - "Internal Control Framework" header and boxes
    if (Object.keys(metadata).length > 0) {
      elements.push(
        <div key="metadata" className="mb-8 mt-12">
          <h2 className="text-3xl font-bold text-[#2d7a4a] mb-2">Internal Control Framework</h2>
          <p className="text-base italic text-[#2d7a4a] mb-4 border-b-2 border-[#2d7a4a] pb-2">
            Fast-Moving Consumer Goods Organisation — Summary Edition
          </p>
          <div className="space-y-0">
            {Object.entries(metadata).map(([key, value], idx) => (
              <div key={key} className="flex border-b border-gray-300 last:border-b-0">
                <div className="bg-[#2d7a4a] text-white px-4 py-4 font-semibold text-sm w-1/5 flex items-center">
                  {key}
                </div>
                <div className="px-6 py-4 text-sm leading-relaxed flex-1 bg-[#e8f5e8]">
                  {renderFormattedText(value)}
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    // Render main content sections
    let i = 0;
    let inSection = false;
    let sectionContent: React.ReactNode[] = [];
    let currentSectionTitle = '';

    while (i < lines.length) {
      const line = lines[i];

      // Section headers (## )
      if (line.match(/^##\s+Section\s+\d+/i)) {
        // Flush previous section
        if (sectionContent.length > 0) {
          elements.push(
            <div key={currentSectionTitle} className="mb-8">
              <div className="bg-[#1e5631] text-white p-4 border-b-2 border-[#1e5631]">
                <h2 className="text-2xl font-bold">{currentSectionTitle}</h2>
              </div>
              <div className="border border-gray-300 p-6 bg-white">
                {sectionContent}
              </div>
            </div>
          );
          sectionContent = [];
        }

        currentSectionTitle = line.replace(/^##\s+/, '');
        inSection = true;
        i++;
        continue;
      }

      // Subsection headers (###)
      if (line.startsWith('### ')) {
        sectionContent.push(
          <h3 key={`h3-${i}`} className="text-xl font-semibold mt-6 mb-3 text-[#1e5631]">
            {line.substring(4)}
          </h3>
        );
        i++;
        continue;
      }

      // Subheadings (####)
      if (line.startsWith('#### ')) {
        sectionContent.push(
          <h4 key={`h4-${i}`} className="text-lg font-semibold mt-4 mb-2 text-[#2d7a4a]">
            {line.substring(5)}
          </h4>
        );
        i++;
        continue;
      }

      // Component headers (R1.1, CE1, P1, etc.)
      if (line.match(/^(R\d+\.\d+|CE\d+|P\d+)\s*$/)) {
        sectionContent.push(
          <div key={`component-${i}`} className="mt-6 mb-2">
            <span className="inline-block bg-primary text-primary-foreground px-3 py-1 rounded font-semibold text-sm">
              {line.trim()}
            </span>
          </div>
        );
        i++;
        continue;
      }

      // Tables
      if (line.trim().startsWith('|')) {
        const { element, nextIdx } = renderTable(lines, i);
        if (element) {
          sectionContent.push(<div key={`table-${i}`}>{element}</div>);
        }
        i = nextIdx;
        continue;
      }

      // Lists
      if (line.match(/^\s*[-*]\s+/)) {
        const listItems: string[] = [];
        while (i < lines.length && lines[i].match(/^\s*[-*]\s+/)) {
          listItems.push(lines[i].replace(/^\s*[-*]\s+/, ''));
          i++;
        }
        sectionContent.push(
          <ul key={`list-${i}`} className="list-disc ml-6 space-y-2 my-4">
            {listItems.map((item, idx) => (
              <li key={idx} className="text-sm leading-relaxed">
                {renderFormattedText(item)}
              </li>
            ))}
          </ul>
        );
        continue;
      }

      // Regular paragraphs
      if (line.trim() && !line.startsWith('#')) {
        sectionContent.push(
          <p key={`p-${i}`} className="text-sm leading-relaxed my-3">
            {renderFormattedText(line)}
          </p>
        );
      }

      i++;
    }

    // Flush last section
    if (sectionContent.length > 0) {
      elements.push(
        <div key={currentSectionTitle} className="mb-8">
          <div className="bg-[#1e5631] text-white p-4 border-b-2 border-[#1e5631]">
            <h2 className="text-2xl font-bold">{currentSectionTitle}</h2>
          </div>
          <div className="border border-gray-300 p-6 bg-white">
            {sectionContent}
          </div>
        </div>
      );
    }

    return elements;
  };

  return (
    <div className="max-w-none">
      {renderContent()}
    </div>
  );
}
