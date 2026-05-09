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
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Merriweather:ital,wght@0,400;0,700;1,400&family=Source+Sans+3:wght@400;600;700&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --dark-green: #1e4d2b;
          --mid-green: #2d6a3f;
          --light-green-bg: #e8f2eb;
          --lighter-green-bg: #f2f8f3;
          --gold: #b8860b;
          --gold-bg: #fdf3d0;
          --gold-light-bg: #fef9e7;
          --text-dark: #1a1a1a;
          --text-body: #2c2c2c;
          --border-green: #4a8c5c;
          --border-light: #c8dece;
          --white: #ffffff;
          --page-width: 900px;
        }

        .main-title-section {
          margin-bottom: 36px;
        }

        .main-title {
          font-family: 'Source Sans 3', sans-serif;
          font-size: 36px;
          font-weight: 700;
          color: var(--dark-green);
          margin-bottom: 2px;
        }

        .main-subtitle {
          font-style: italic;
          color: var(--mid-green);
          font-size: 17px;
          margin-bottom: 24px;
          border-bottom: 2px solid var(--border-green);
          padding-bottom: 10px;
        }

        .section-header {
          background: var(--dark-green);
          color: var(--white);
          font-size: 18px;
          font-weight: 700;
          padding: 12px 18px;
          margin: 40px 0 24px 0;
          font-family: 'Source Sans 3', sans-serif;
        }

        .subsection-title {
          font-size: 16px;
          font-weight: 700;
          color: var(--dark-green);
          border-bottom: 1.5px solid var(--border-green);
          padding-bottom: 5px;
          margin: 28px 0 12px 0;
          font-family: 'Source Sans 3', sans-serif;
        }

        .body-text {
          font-size: 13.5px;
          line-height: 1.65;
          color: var(--text-body);
          margin-bottom: 14px;
        }

        .highlight-card {
          display: table;
          width: 100%;
          border-collapse: collapse;
          margin: 14px 0;
        }

        .highlight-card .hc-label {
          display: table-cell;
          width: 110px;
          padding: 12px 14px;
          font-weight: 700;
          font-size: 13px;
          vertical-align: middle;
          text-align: center;
        }

        .highlight-card .hc-body {
          display: table-cell;
          padding: 12px 16px;
          font-size: 13.5px;
          line-height: 1.6;
          vertical-align: top;
        }

        .hc-gold .hc-label { background: var(--gold); color: var(--white); }
        .hc-gold .hc-body  { background: var(--gold-bg); color: var(--text-dark); }

        .hc-green .hc-label { background: var(--mid-green); color: var(--white); }
        .hc-green .hc-body  { background: var(--light-green-bg); color: var(--text-dark); }

        .req-block {
          margin: 18px 0;
        }

        .req-id {
          font-weight: 700;
          color: var(--dark-green);
          font-size: 13.5px;
          margin-bottom: 4px;
        }

        .component-title {
          font-size: 15px;
          font-weight: 700;
          color: var(--dark-green);
          margin: 28px 0 10px 0;
          font-family: 'Source Sans 3', sans-serif;
        }
      `}</style>
      <div style={{ 
        fontFamily: "'Source Sans 3', 'Gill Sans', Calibri, sans-serif",
        fontSize: '14px',
        lineHeight: '1.6',
        color: 'var(--text-body)',
        maxWidth: '900px',
        margin: '0 auto',
        background: '#ffffff',
        padding: '48px 56px'
      }}>
        {renderContent()}
      </div>
    </>
  );
}
