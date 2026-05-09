import React from 'react';

interface DetailedFrameworkRendererProps {
  content: string;
}

export function DetailedFrameworkRenderer({ content }: DetailedFrameworkRendererProps) {
  
  const renderFormattedText = (text: string) => {
    const parts = text.split('**');
    return parts.map((part, idx) => 
      idx % 2 === 1 ? <strong key={idx}>{part}</strong> : part
    );
  };

  const renderContent = () => {
    const elements: React.ReactNode[] = [];
    const lines = content.split('\n');
    
    const titleMatch = content.match(/^#\s+(.+)/m);
    const title = titleMatch ? titleMatch[1] : '';
    
    // Title
    if (title) {
      elements.push(
        <div key="title" className="main-title-section">
          <h1 className="main-title">Internal Control Framework</h1>
          <p className="main-subtitle">Fast-Moving Consumer Goods Organisation — Detailed Edition</p>
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
            <div key={`why-${currentRequirement.code}`} className="highlight-card hc-gold">
              <div className="hc-label">Why this matters</div>
              <div className="hc-body">
                {currentSubsection.content.map((para, idx) => (
                  <p key={idx} className="body-text">
                    {renderFormattedText(para)}
                  </p>
                ))}
              </div>
            </div>
          );
        } else {
          currentRequirement.content.push(
            <div key={`example-${currentRequirement.code}`} className="highlight-card hc-green">
              <div className="hc-label">What good looks like</div>
              <div className="hc-body">
                {currentSubsection.content.map((para, idx) => (
                  <p key={idx} className="body-text">
                    {renderFormattedText(para)}
                  </p>
                ))}
              </div>
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
          <div key={currentRequirement.code} className="req-block">
            <div className="req-id">{currentRequirement.code} — {currentRequirement.title}</div>
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
          <div key={currentSection.title}>
            <div className="section-header">{currentSection.title}</div>
            {currentSection.content}
          </div>
        );
        currentSection = null;
      }
    };

    while (i < lines.length) {
      const line = lines[i];

      if (line.match(/^##\s+Section\s+\d+/i)) {
        flushSection();
        currentSection = {
          title: line.replace(/^##\s+/, ''),
          content: []
        };
        i++;
        continue;
      }

      if (line.match(/^(R\d+\.\d+|CE\d+|P\d+)\s*$/)) {
        flushRequirement();
        const code = line.trim();
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

      if (line.match(/^(Requirement|Why this matters|Why this requirement exists|Why this exists)/i)) {
        flushSubsection();
        if (line.match(/^Requirement/i)) {
          currentSubsection = null;
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

      if (line.trim() && !line.startsWith('#')) {
        if (currentSubsection) {
          currentSubsection.content.push(line.trim());
        } else if (currentRequirement) {
          currentRequirement.content.push(
            <p key={`req-${i}`} className="body-text">
              {renderFormattedText(line)}
            </p>
          );
        } else if (currentSection) {
          currentSection.content.push(
            <p key={`sec-${i}`} className="body-text">
              {renderFormattedText(line)}
            </p>
          );
        }
      }

      i++;
    }

    flushSection();

    return elements;
  };

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Merriweather:ital,wght@0,400;0,700;1,400&family=Source+Sans+3:wght@400;600;700&display=swap" rel="stylesheet" />
      <style dangerouslySetInnerHTML={{ __html: `
        .framework-detailed-page * { box-sizing: border-box; }
        
        .framework-detailed-page {
          font-family: 'Source Sans 3', 'Gill Sans', Calibri, sans-serif !important;
          font-size: 14px !important;
          line-height: 1.6 !important;
          color: #2c2c2c !important;
          background: #f5f5f5 !important;
        }

        .framework-detailed-page .page {
          max-width: 900px !important;
          margin: 0 auto !important;
          background: #ffffff !important;
          padding: 48px 56px !important;
        }

        .framework-detailed-page .main-title-section {
          margin-bottom: 36px !important;
        }

        .framework-detailed-page .main-title {
          font-family: 'Source Sans 3', sans-serif !important;
          font-size: 36px !important;
          font-weight: 700 !important;
          color: #1e4d2b !important;
          margin-bottom: 2px !important;
        }

        .framework-detailed-page .main-subtitle {
          font-style: italic !important;
          color: #2d6a3f !important;
          font-size: 17px !important;
          margin-bottom: 24px !important;
          border-bottom: 2px solid #4a8c5c !important;
          padding-bottom: 10px !important;
        }

        .framework-detailed-page .section-header {
          background: #1e4d2b !important;
          color: #ffffff !important;
          font-size: 18px !important;
          font-weight: 700 !important;
          padding: 12px 18px !important;
          margin: 40px 0 24px 0 !important;
          font-family: 'Source Sans 3', sans-serif !important;
        }

        .framework-detailed-page .subsection-title {
          font-size: 16px !important;
          font-weight: 700 !important;
          color: #1e4d2b !important;
          border-bottom: 1.5px solid #4a8c5c !important;
          padding-bottom: 5px !important;
          margin: 28px 0 12px 0 !important;
          font-family: 'Source Sans 3', sans-serif !important;
        }

        .framework-detailed-page .body-text {
          font-size: 13.5px !important;
          line-height: 1.65 !important;
          color: #2c2c2c !important;
          margin-bottom: 14px !important;
        }

        .framework-detailed-page .highlight-card {
          display: table !important;
          width: 100% !important;
          border-collapse: collapse !important;
          margin: 14px 0 !important;
        }

        .framework-detailed-page .highlight-card .hc-label {
          display: table-cell !important;
          width: 110px !important;
          padding: 12px 14px !important;
          font-weight: 700 !important;
          font-size: 13px !important;
          vertical-align: middle !important;
          text-align: center !important;
        }

        .framework-detailed-page .highlight-card .hc-body {
          display: table-cell !important;
          padding: 12px 16px !important;
          font-size: 13.5px !important;
          line-height: 1.6 !important;
          vertical-align: top !important;
        }

        .framework-detailed-page .hc-gold .hc-label { background: #b8860b !important; color: #ffffff !important; }
        .framework-detailed-page .hc-gold .hc-body  { background: #fdf3d0 !important; color: #1a1a1a !important; }

        .framework-detailed-page .hc-green .hc-label { background: #2d6a3f !important; color: #ffffff !important; }
        .framework-detailed-page .hc-green .hc-body  { background: #e8f2eb !important; color: #1a1a1a !important; }

        .framework-detailed-page .req-block {
          margin: 18px 0 !important;
        }

        .framework-detailed-page .req-id {
          font-weight: 700 !important;
          color: #1e4d2b !important;
          font-size: 13.5px !important;
          margin-bottom: 4px !important;
        }

        .framework-detailed-page .component-title {
          font-size: 15px !important;
          font-weight: 700 !important;
          color: #1e4d2b !important;
          margin: 28px 0 10px 0 !important;
          font-family: 'Source Sans 3', sans-serif !important;
        }
      `}} />
      <div className="framework-detailed-page">
        <div className="page">
          {renderContent()}
        </div>
      </div>
    </>
  );
}
