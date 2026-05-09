import React from 'react';

interface FrameworkRendererProps {
  content: string;
}

export function FrameworkRenderer({ content }: FrameworkRendererProps) {
  
  const renderFormattedText = (text: string) => {
    const parts = text.split('**');
    return parts.map((part, idx) => 
      idx % 2 === 1 ? <strong key={idx}>{part}</strong> : part
    );
  };

  const parseExecutiveSummary = (text: string) => {
    const execSummaryMatch = text.match(/Executive Summary\s*\nFor the board[^\n]*\n\n([\s\S]*?)(?=\n\n(?:Internal Control Framework|Section \d|$))/i);
    if (!execSummaryMatch) return null;

    const summaryText = execSummaryMatch[1];
    const items: { title: string; content: string }[] = [];
    
    const lines = summaryText.split('\n');
    let currentTitle = '';
    let currentContent: string[] = [];
    
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      
      if (trimmed.match(/^[A-Z][^.]*$/) && trimmed.length < 80 && !trimmed.match(/^(The|A|An|This|It|Level|Immediate|Principal|Going)/)) {
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
    
    if (currentTitle && currentContent.length > 0) {
      items.push({
        title: currentTitle,
        content: currentContent.join(' ').trim()
      });
    }

    return items.length > 0 ? items : null;
  };

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
      .filter(line => !line.match(/^\|[\s:-]+\|/))
      .map(line => 
        line.split('|')
          .map(cell => cell.trim())
          .filter(cell => cell)
      );

    if (rows.length === 0) return { element: null, nextIdx: idx };

    const element = (
      <table className="std-table">
        <thead>
          <tr>
            {rows[0].map((header, hIdx) => (
              <th key={hIdx}>{renderFormattedText(header)}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.slice(1).map((row, rIdx) => (
            <tr key={rIdx}>
              {row.map((cell, cIdx) => (
                <td key={cIdx}>{renderFormattedText(cell)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    );

    return { element, nextIdx: idx };
  };

  const renderContent = () => {
    const elements: React.ReactNode[] = [];
    const lines = content.split('\n');
    
    const titleMatch = content.match(/^#\s+(.+)/m);
    const title = titleMatch ? titleMatch[1] : '';
    
    const execSummary = parseExecutiveSummary(content);
    const metadata = parseMetadata(content);

    // Executive Summary
    if (execSummary && execSummary.length > 0) {
      elements.push(
        <div key="exec-summary">
          <h1 className="exec-title">Executive Summary</h1>
          <p className="exec-subtitle">For the board — what this framework is and what it requires</p>
          <table className="exec-table">
            <tbody>
              <tr><td colSpan={2}>&nbsp;</td></tr>
              {execSummary.map((item, idx) => (
                <tr key={idx}>
                  <td>{item.title}</td>
                  <td>{renderFormattedText(item.content)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    // Main Title Section
    if (Object.keys(metadata).length > 0) {
      elements.push(
        <div key="metadata" className="main-title-section">
          <h1 className="main-title">Internal Control Framework</h1>
          <p className="main-subtitle">Fast-Moving Consumer Goods Organisation — Summary Edition</p>
          <table className="info-card-table">
            <tbody>
              {Object.entries(metadata).map(([key, value]) => (
                <tr key={key}>
                  <td className="card-label" dangerouslySetInnerHTML={{ __html: key.replace(' ', '<br>') }} />
                  <td className="card-body">{renderFormattedText(value)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    // Main content sections
    let i = 0;
    let sectionContent: React.ReactNode[] = [];
    let currentSectionTitle = '';

    while (i < lines.length) {
      const line = lines[i];

      if (line.match(/^##\s+Section\s+\d+/i)) {
        if (sectionContent.length > 0) {
          elements.push(
            <div key={currentSectionTitle}>
              <div className="section-header">{currentSectionTitle}</div>
              {sectionContent}
            </div>
          );
          sectionContent = [];
        }

        currentSectionTitle = line.replace(/^##\s+/, '');
        i++;
        continue;
      }

      if (line.startsWith('### ')) {
        sectionContent.push(
          <h2 key={`h3-${i}`} className="subsection-title">
            {line.substring(4)}
          </h2>
        );
        i++;
        continue;
      }

      if (line.startsWith('#### ')) {
        sectionContent.push(
          <h3 key={`h4-${i}`} className="component-title">
            {line.substring(5)}
          </h3>
        );
        i++;
        continue;
      }

      if (line.match(/^(R\d+\.\d+|CE\d+|P\d+)\s*—/)) {
        sectionContent.push(
          <div key={`req-${i}`} className="req-block">
            <div className="req-id">{line.trim()}</div>
          </div>
        );
        i++;
        continue;
      }

      if (line.trim().startsWith('|')) {
        const { element, nextIdx } = renderTable(lines, i);
        if (element) {
          sectionContent.push(<div key={`table-${i}`}>{element}</div>);
        }
        i = nextIdx;
        continue;
      }

      if (line.match(/^\s*[-*]\s+/)) {
        const listItems: string[] = [];
        while (i < lines.length && lines[i].match(/^\s*[-*]\s+/)) {
          listItems.push(lines[i].replace(/^\s*[-*]\s+/, ''));
          i++;
        }
        sectionContent.push(
          <ul key={`list-${i}`} style={{ margin: '10px 0 16px 24px', fontSize: '13.5px', lineHeight: '1.8' }}>
            {listItems.map((item, idx) => (
              <li key={idx}>{renderFormattedText(item)}</li>
            ))}
          </ul>
        );
        continue;
      }

      if (line.trim() && !line.startsWith('#')) {
        sectionContent.push(
          <p key={`p-${i}`} className="body-text">
            {renderFormattedText(line)}
          </p>
        );
      }

      i++;
    }

    if (sectionContent.length > 0) {
      elements.push(
        <div key={currentSectionTitle}>
          <div className="section-header">{currentSectionTitle}</div>
          {sectionContent}
        </div>
      );
    }

    return elements;
  };

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Merriweather:ital,wght@0,400;0,700;1,400&family=Source+Sans+3:wght@400;600;700&display=swap" rel="stylesheet" />
      <style dangerouslySetInnerHTML={{ __html: `
        .framework-page * { box-sizing: border-box; }
        
        .framework-page {
          font-family: 'Source Sans 3', 'Gill Sans', Calibri, sans-serif;
          font-size: 14px;
          line-height: 1.6;
          color: #2c2c2c;
          background: #f5f5f5;
        }

        .framework-page .page {
          max-width: 900px;
          margin: 0 auto;
          background: #ffffff;
          padding: 48px 56px;
        }

        .framework-page .exec-title {
          font-family: 'Source Sans 3', sans-serif;
          font-size: 26px;
          font-weight: 700;
          color: #1e4d2b;
          margin-bottom: 4px;
        }

        .framework-page .exec-subtitle {
          font-style: italic;
          color: #2d6a3f;
          font-size: 13.5px;
          margin-bottom: 18px;
          font-family: 'Source Sans 3', sans-serif;
        }

        .framework-page .exec-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 48px;
        }

        .framework-page .exec-table tr:nth-child(odd) td { background: #f2f8f3; }
        .framework-page .exec-table tr:nth-child(even) td { background: #e8f2eb; }

        .framework-page .exec-table tr:first-child td {
          background: #1e4d2b;
          color: #ffffff;
          font-weight: 600;
          font-size: 13px;
          padding: 10px 14px;
          border: none;
        }

        .framework-page .exec-table td {
          padding: 11px 14px;
          border: none;
          vertical-align: top;
          font-size: 13.5px;
        }

        .framework-page .exec-table td:first-child {
          width: 160px;
          font-weight: 600;
          color: #1a1a1a;
          white-space: nowrap;
        }

        .framework-page .main-title-section {
          margin-bottom: 36px;
        }

        .framework-page .main-title {
          font-family: 'Source Sans 3', sans-serif;
          font-size: 36px;
          font-weight: 700;
          color: #1e4d2b;
          margin-bottom: 2px;
        }

        .framework-page .main-subtitle {
          font-style: italic;
          color: #2d6a3f;
          font-size: 17px;
          margin-bottom: 24px;
          border-bottom: 2px solid #4a8c5c;
          padding-bottom: 10px;
        }

        .framework-page .info-card-table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0 10px;
          margin-bottom: 8px;
        }

        .framework-page .info-card-table td {
          padding: 12px 16px;
          vertical-align: top;
          font-size: 13.5px;
        }

        .framework-page .info-card-table td.card-label {
          background: #1e4d2b;
          color: #ffffff;
          font-weight: 700;
          font-size: 13px;
          width: 120px;
          text-align: center;
          vertical-align: middle;
        }

        .framework-page .info-card-table td.card-body {
          background: #e8f2eb;
          color: #2c2c2c;
        }

        .framework-page .section-header {
          background: #1e4d2b;
          color: #ffffff;
          font-size: 18px;
          font-weight: 700;
          padding: 12px 18px;
          margin: 40px 0 24px 0;
          font-family: 'Source Sans 3', sans-serif;
        }

        .framework-page .subsection-title {
          font-size: 16px;
          font-weight: 700;
          color: #1e4d2b;
          border-bottom: 1.5px solid #4a8c5c;
          padding-bottom: 5px;
          margin: 28px 0 12px 0;
          font-family: 'Source Sans 3', sans-serif;
        }

        .framework-page .body-text {
          font-size: 13.5px;
          line-height: 1.65;
          color: #2c2c2c;
          margin-bottom: 14px;
        }

        .framework-page .std-table {
          width: 100%;
          border-collapse: collapse;
          margin: 16px 0;
          font-size: 13.5px;
        }

        .framework-page .std-table th {
          background: #1e4d2b;
          color: #ffffff;
          padding: 9px 12px;
          text-align: left;
          font-weight: 600;
          font-size: 13px;
        }

        .framework-page .std-table td {
          padding: 9px 12px;
          border-bottom: 1px solid #c8dece;
          vertical-align: top;
        }

        .framework-page .std-table tbody tr:nth-child(even) td { background: #f2f8f3; }
        .framework-page .std-table tbody tr:nth-child(odd) td  { background: #ffffff; }

        .framework-page .std-table td:first-child { font-weight: 600; }

        .framework-page .req-block {
          margin: 18px 0;
        }

        .framework-page .req-id {
          font-weight: 700;
          color: #1e4d2b;
          font-size: 13.5px;
          margin-bottom: 4px;
        }

        .framework-page .component-title {
          font-size: 15px;
          font-weight: 700;
          color: #1e4d2b;
          margin: 28px 0 10px 0;
          font-family: 'Source Sans 3', sans-serif;
        }
      `}} />
      <div className="framework-page">
        <div className="page">
          {renderContent()}
        </div>
      </div>
    </>
  );
}
