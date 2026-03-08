import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { apiService } from '@/services/api';
import { Pencil, Save, Download, FileDown, RefreshCw } from 'lucide-react';
import { comprehensiveFrameworkSections } from '@/data/frameworkContent';

interface FrameworkSection {
  id: string;
  title: string;
  content: string;
  editable: boolean;
}

const defaultFrameworkSections: FrameworkSection[] = comprehensiveFrameworkSections;

export default function FrameworkBuilder() {
  const [sections, setSections] = useState<FrameworkSection[]>(defaultFrameworkSections);
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [isLoadingFramework, setIsLoadingFramework] = useState(false);

  const handleEdit = (sectionId: string) => {
    const section = sections.find(s => s.id === sectionId);
    if (section) {
      setEditContent(section.content);
      setEditingSection(sectionId);
    }
  };

  const handleSave = () => {
    if (editingSection) {
      setSections(sections.map(s => 
        s.id === editingSection ? { ...s, content: editContent } : s
      ));
      setEditingSection(null);
      setEditContent('');
    }
  };

  const handleExportWord = () => {
    const content = `INTERNAL CONTROL FRAMEWORK\n\n${sections.map(s => `\n${s.title.toUpperCase()}\n${'='.repeat(s.title.length)}\n\n${s.content}\n`).join('\n')}`;
    const blob = new Blob([content], { type: 'application/msword' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `framework-${new Date().toISOString().split('T')[0]}.doc`;
    link.click();
    alert('✅ Framework exported to Word!');
  };

  const handleExportPDF = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow pop-ups to export PDF');
      return;
    }

    const htmlContent = `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>Internal Control Framework</title>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Source+Sans+3:wght@300;400;600&display=swap" rel="stylesheet">
<style>
@page { margin: 0.5in; }
body { font-family: 'Source Sans 3', sans-serif; line-height: 1.7; color: #2C3040; margin: 0; padding: 0; }
.header { background: linear-gradient(135deg, #0F2240 0%, #162D50 60%, #0A1A30 100%); color: white; padding: 36pt 32pt; margin: 0 0 24pt 0; }
.header .eyebrow { font-size: 9pt; letter-spacing: 3pt; color: #C9A84C; text-transform: uppercase; margin-bottom: 10pt; }
.header h1 { font-family: 'Playfair Display', serif; font-size: 32pt; font-weight: 700; margin: 0 0 6pt 0; line-height: 1.1; }
.header .gold { color: #C9A84C; }
.header .sub { font-size: 13pt; font-style: italic; color: rgba(255,255,255,0.6); font-family: 'Playfair Display', serif; margin-top: 8pt; }
.content { padding: 0 16pt; }
h2 { font-family: 'Playfair Display', serif; font-size: 20pt; font-weight: 700; color: #0F2240; margin: 28pt 0 8pt 0; padding-bottom: 6pt; border-bottom: 2px solid #C9A84C; }
h3 { font-family: 'Playfair Display', serif; font-size: 14pt; font-weight: 600; color: #0F2240; margin: 16pt 0 6pt 0; }
p { margin: 6pt 0; font-size: 10.5pt; line-height: 1.7; }
ul { padding-left: 18pt; margin: 6pt 0; }
li { margin: 3pt 0; font-size: 10pt; }
</style></head><body>
<div class="header">
<div class="eyebrow">UK CGC · Provision 29</div>
<h1>Internal Control<br><span class="gold">Effectiveness Framework</span></h1>
<div class="sub">A Guidance Document for Implementation</div>
</div>
<div class="content">
${sections.map(section => `
<h2>${section.title}</h2>
${section.content.split('\n').map(line => {
  if (line.startsWith('**') && line.endsWith('**')) {
    return `<h3>${line.replace(/\*\*/g, '')}</h3>`;
  } else if (line.startsWith('•')) {
    return `<li>${line.substring(1).trim()}</li>`;
  } else if (line.trim()) {
    return `<p>${line}</p>`;
  }
  return '';
}).join('\n')}
`).join('\n')}
<p style="margin-top: 32pt; font-size: 9pt; color: #666;">Generated: ${new Date().toLocaleString()}</p>
</div>
</body></html>`;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    setTimeout(() => printWindow.print(), 500);
    alert('✅ Print dialog opened. Use "Save as PDF" to save.');
  };

  return (
    <div style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
      {/* Custom CSS matching reference */}
      <style>{`
        .framework-container { background: #F7F5F0; min-height: 100vh; }
        .hero { background: linear-gradient(135deg, #0F2240 0%, #162D50 60%, #0A1A30 100%); padding: 80px 60px 64px; position: relative; overflow: hidden; }
        .hero::before { content: ''; position: absolute; top: 0; right: 0; width: 50%; height: 100%; background: repeating-linear-gradient(-45deg, transparent, transparent 40px, rgba(201,168,76,0.03) 40px, rgba(201,168,76,0.03) 41px); }
        .hero-eyebrow { font-size: 11px; letter-spacing: 4px; color: #C9A84C; text-transform: uppercase; margin-bottom: 16px; font-weight: 600; }
        .hero-title { font-family: 'Playfair Display', serif; font-size: 52px; font-weight: 700; color: white; line-height: 1.1; margin-bottom: 8px; }
        .hero-title span { color: #C9A84C; }
        .hero-sub { font-size: 18px; color: rgba(255,255,255,0.6); font-style: italic; margin-bottom: 32px; font-family: 'Playfair Display', serif; }
        .meta-pill { background: rgba(255,255,255,0.08); border: 1px solid rgba(201,168,76,0.3); border-radius: 4px; padding: 6px 14px; font-size: 12px; color: rgba(255,255,255,0.7); display: inline-block; margin-right: 12px; }
        .meta-pill strong { color: #C9A84C; }
        .content { padding: 60px; max-width: 1200px; margin: 0 auto; }
        .section { padding-top: 60px; }
        .section-heading { font-family: 'Playfair Display', serif; font-size: 32px; font-weight: 700; color: #0F2240; margin-bottom: 8px; padding-bottom: 12px; border-bottom: 2px solid #C9A84C; display: inline-block; }
        .subsection-title { font-family: 'Playfair Display', serif; font-size: 20px; font-weight: 600; color: #0F2240; margin: 24px 0 12px; }
        .section p { margin-bottom: 12px; font-size: 15.5px; line-height: 1.8; color: #2C3040; }
        .section ul { padding-left: 24px; margin-bottom: 16px; }
        .section li { margin-bottom: 6px; font-size: 15px; line-height: 1.7; color: #2C3040; }
        .edit-btn { opacity: 0; transition: opacity 0.2s; }
        .section:hover .edit-btn { opacity: 1; }
        .btn-group { position: fixed; top: 20px; right: 20px; z-index: 100; display: flex; gap: 8px; }
        .btn { padding: 8px 16px; border-radius: 6px; font-size: 13px; font-weight: 600; cursor: pointer; border: none; display: flex; align-items: center; gap: 6px; }
        .btn-primary { background: #0F2240; color: white; }
        .btn-outline { background: white; color: #0F2240; border: 1px solid #0F2240; }
        .btn:hover { opacity: 0.9; }
      `}</style>

      <div className="framework-container">
        {/* Export Buttons */}
        <div className="btn-group">
          <button className="btn btn-outline" onClick={handleExportWord}>
            <FileDown size={16} /> Export Word
          </button>
          <button className="btn btn-primary" onClick={handleExportPDF}>
            <Download size={16} /> Export PDF
          </button>
        </div>

        {/* Hero Section */}
        <div className="hero">
          <div className="hero-eyebrow">UK Corporate Governance Code · Provision 29</div>
          <div className="hero-title">Internal Control<br /><span>Effectiveness Framework</span></div>
          <div className="hero-sub">A Guidance Document for Implementation</div>
          <div>
            <div className="meta-pill"><strong>Company:</strong> FTSE 250 Manufacturing</div>
            <div className="meta-pill"><strong>Maturity:</strong> Developing</div>
            <div className="meta-pill"><strong>Regulation:</strong> Moderately Regulated</div>
            <div className="meta-pill"><strong>Version:</strong> 1.0 · 2025</div>
          </div>
        </div>

        {/* Content Sections */}
        <div className="content">
          {sections.map((section) => (
            <div key={section.id} className="section">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                <div className="section-heading">{section.title}</div>
                {section.editable && (
                  <button 
                    className="edit-btn btn btn-outline" 
                    onClick={() => handleEdit(section.id)}
                    style={{ padding: '6px 12px', fontSize: '12px' }}
                  >
                    <Pencil size={14} /> Edit
                  </button>
                )}
              </div>
              <div>
                {section.content.split('\n').map((line, idx) => {
                  if (line.startsWith('**') && line.endsWith('**')) {
                    return <div key={idx} className="subsection-title">{line.replace(/\*\*/g, '')}</div>;
                  } else if (line.startsWith('•')) {
                    return <li key={idx}>{line.substring(1).trim()}</li>;
                  } else if (line.trim() === '') {
                    return <div key={idx} style={{ height: '8px' }} />;
                  } else {
                    return <p key={idx}>{line}</p>;
                  }
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={editingSection !== null} onOpenChange={(open) => !open && setEditingSection(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit: {sections.find(s => s.id === editingSection)?.title}</DialogTitle>
            <DialogDescription>Update the content below. Use ** for bold headings and • for bullet points.</DialogDescription>
          </DialogHeader>
          <Textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="min-h-[400px] font-mono text-sm"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingSection(null)}>Cancel</Button>
            <Button onClick={handleSave}><Save className="h-4 w-4 mr-2" />Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
