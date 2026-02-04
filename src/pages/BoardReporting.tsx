import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { apiService } from '@/services/api';
import type { DashboardData } from '@/types';
import { FileText, Download, Eye, Edit, TrendingUp, AlertTriangle, CheckCircle, Shield } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const COLORS = ['#22c55e', '#f59e0b', '#ef4444'];

export default function BoardReporting() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isEditDraftOpen, setIsEditDraftOpen] = useState(false);
  const [draftText, setDraftText] = useState('');
  const [isPriorYearOpen, setIsPriorYearOpen] = useState(false);
  const [isProvision29Open, setIsProvision29Open] = useState(false);
  const [basisView, setBasisView] = useState<'criteria' | 'monitoring' | 'evidence' | null>(null);

  useEffect(() => {
    apiService.getDashboardData().then(setData);
  }, []);

  const handlePreviewPack = () => {
    setIsPreviewOpen(true);
  };

  const handleEditDraft = () => {
    if (data) {
      const initialDraft = `The Board has established a comprehensive risk management and internal control framework, approved by the Audit Committee in January 2024. Throughout the year, the Board conducted quarterly reviews of control effectiveness against board-approved criteria covering design, implementation, operation, decision-use, assurance, outcomes, and adaptability. Continuous monitoring systems provided real-time visibility into control performance, with ${data.controlHealth.tested} material controls tested during the period.`;
      setDraftText(initialDraft);
      setIsEditDraftOpen(true);
    }
  };

  const handleSaveDraft = () => {
    alert('✅ Draft saved successfully!');
    setIsEditDraftOpen(false);
  };

  const handleViewPriorYear = () => {
    setIsPriorYearOpen(true);
  };

  const handleProvision29 = () => {
    setIsProvision29Open(true);
  };

  const handleExportPDF = () => {
    try {
      if (!data) {
        alert('No data available to export');
        return;
      }

      // Create HTML content for PDF
      const controlHealthPercent = Math.round((data.controlHealth.effective / data.controlHealth.tested) * 100);
      
      const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Board Reporting Pack - ${new Date().toLocaleDateString()}</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; padding: 40px; max-width: 800px; margin: 0 auto; }
    h1 { color: #1e40af; border-bottom: 3px solid #3b82f6; padding-bottom: 10px; }
    h2 { color: #1e40af; margin-top: 30px; }
    .section { margin-bottom: 30px; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px; }
    .metric { display: inline-block; margin: 10px 20px 10px 0; }
    .metric-value { font-size: 32px; font-weight: bold; color: #3b82f6; }
    .metric-label { font-size: 14px; color: #6b7280; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th, td { padding: 12px; text-align: left; border-bottom: 1px solid #e5e7eb; }
    th { background-color: #f3f4f6; font-weight: 600; }
    .footer { margin-top: 50px; padding-top: 20px; border-top: 2px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 12px; }
  </style>
</head>
<body>
  <h1>Board Reporting Pack</h1>
  <p><strong>Report Date:</strong> ${new Date().toLocaleDateString()}</p>
  <p><strong>Reporting Period:</strong> FY ${new Date().getFullYear()}</p>

  <div class="section">
    <h2>Executive Summary</h2>
    <p>This report provides the Board with a comprehensive view of the effectiveness of risk management and internal control systems for the period.</p>
    
    <div class="metric">
      <div class="metric-value">${data.controlHealth.totalMaterial}</div>
      <div class="metric-label">Material Controls</div>
    </div>
    
    <div class="metric">
      <div class="metric-value">${data.controlHealth.tested}</div>
      <div class="metric-label">Controls Tested</div>
    </div>
    
    <div class="metric">
      <div class="metric-value">${controlHealthPercent}%</div>
      <div class="metric-label">Effectiveness Rate</div>
    </div>
  </div>

  <div class="section">
    <h2>Effectiveness Assessment</h2>
    <table>
      <tr>
        <th>Dimension</th>
        <th>Status</th>
      </tr>
      <tr>
        <td>Design</td>
        <td>✓ Met</td>
      </tr>
      <tr>
        <td>Implementation</td>
        <td>✓ Met</td>
      </tr>
      <tr>
        <td>Operation</td>
        <td>✓ Met</td>
      </tr>
      <tr>
        <td>Decision-Use</td>
        <td>⚠ Partially Met</td>
      </tr>
    </table>
  </div>

  <div class="section">
    <h2>Board Conclusion</h2>
    <p>The framework is operating effectively with minor improvements required in decision-use evidence collection.</p>
    
    <p>As of December 31, ${new Date().getFullYear() - 1}, the Board has reviewed the effectiveness of ${data.controlHealth.totalMaterial} material controls. Testing has been completed for ${data.controlHealth.tested} controls (${Math.round((data.controlHealth.tested / data.controlHealth.totalMaterial) * 100)}%), with ${data.controlHealth.effective} controls (${controlHealthPercent}%) demonstrating effective operation.</p>
  </div>

  <div class="section">
    <h2>Material Weaknesses</h2>
    <p><strong>Status:</strong> No material weaknesses identified</p>
    <p>All material controls are operating effectively as designed. Exceptions identified are within acceptable tolerance levels and are subject to remediation plans with defined timelines.</p>
  </div>

  <div class="footer">
    <p>This report is confidential and intended for Board members only.</p>
    <p>Generated: ${new Date().toLocaleString()}</p>
  </div>
</body>
</html>`;

      // Create blob and download
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `board-reporting-pack-${new Date().toISOString().split('T')[0]}.html`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      alert('✅ Board pack exported successfully! Open the HTML file and use your browser to "Print to PDF"');
    } catch (error) {
      console.error('Failed to export PDF:', error);
      alert('Failed to export board pack. Please try again.');
    }
  };

  if (!data) return <div>Loading...</div>;

  const effectivenessData = [
    { name: 'Met', value: data.effectivenessStatus.met, color: '#22c55e' },
    { name: 'Partially Met', value: data.effectivenessStatus.partially, color: '#f59e0b' },
    { name: 'Not Met', value: data.effectivenessStatus.notMet, color: '#ef4444' },
  ];

  const controlHealthPercent = Math.round((data.controlHealth.effective / data.controlHealth.tested) * 100);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Board Reporting</h1>
          <p className="text-muted-foreground mt-1">
            Executive dashboard and board pack generation for annual statement
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handlePreviewPack}>
            <Eye className="h-4 w-4 mr-2" />
            Preview Pack
          </Button>
          <Button variant="outline" onClick={handleEditDraft}>
            <Edit className="h-4 w-4 mr-2" />
            Edit Draft
          </Button>
          <Button onClick={handleExportPDF}>
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
        </div>
      </div>

      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <CardTitle>Annual Board Statement Preparation</CardTitle>
          <CardDescription>
            Generate defensible board statement on risk management & internal controls effectiveness
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <Button onClick={handlePreviewPack}>Generate Board Pack</Button>
            <Button variant="outline" onClick={handleViewPriorYear}>View Prior Year Statement</Button>
            <Button variant="outline" onClick={handleProvision29}>Provision 29 Disclosure Draft</Button>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="dashboard">
        <TabsList>
          <TabsTrigger value="dashboard">Effectiveness Dashboard</TabsTrigger>
          <TabsTrigger value="controls">Material Controls Health</TabsTrigger>
          <TabsTrigger value="issues">Key Issues</TabsTrigger>
          <TabsTrigger value="forward">Forward Look</TabsTrigger>
          <TabsTrigger value="disclosure">Annual Disclosure</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Effectiveness Criteria Status</CardTitle>
                <CardDescription>Board-approved dimensions - overall assessment</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={effectivenessData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {effectivenessData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Effectiveness Summary</CardTitle>
                <CardDescription>Status across all dimensions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium">Design</span>
                    </div>
                    <Badge variant="success">Met</Badge>
                  </div>
                  <Progress value={100} className="h-2" />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium">Implementation</span>
                    </div>
                    <Badge variant="success">Met</Badge>
                  </div>
                  <Progress value={95} className="h-2" />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium">Operation</span>
                    </div>
                    <Badge variant="success">Met</Badge>
                  </div>
                  <Progress value={92} className="h-2" />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-yellow-600" />
                      <span className="text-sm font-medium">Decision-Use</span>
                    </div>
                    <Badge variant="warning">Partially Met</Badge>
                  </div>
                  <Progress value={75} className="h-2" />
                </div>

                <div className="pt-4 border-t">
                  <p className="text-sm text-muted-foreground">
                    <strong>Board Conclusion:</strong> The framework is operating effectively with minor
                    improvements required in decision-use evidence collection.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Basis of Declaration</CardTitle>
              <CardDescription>Supporting evidence for board statement</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium text-green-900">Criteria Selection Rationale</p>
                      <p className="text-sm text-green-700">Documented and board-approved</p>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => setBasisView('criteria')}>View</Button>
                </div>

                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium text-green-900">Monitoring & Review Process</p>
                      <p className="text-sm text-green-700">Quarterly board reviews completed</p>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => setBasisView('monitoring')}>View</Button>
                </div>

                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium text-green-900">Evidence Supporting Conclusion</p>
                      <p className="text-sm text-green-700">Complete evidence trail maintained</p>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => setBasisView('evidence')}>View</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="controls" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Testing Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-2">
                  {Math.round((data.controlHealth.tested / data.controlHealth.totalMaterial) * 100)}%
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  {data.controlHealth.tested} of {data.controlHealth.totalMaterial} tested
                </p>
                <Progress value={(data.controlHealth.tested / data.controlHealth.totalMaterial) * 100} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Control Effectiveness</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-2 text-green-600">{controlHealthPercent}%</div>
                <p className="text-sm text-muted-foreground mb-3">
                  {data.controlHealth.effective} effective controls
                </p>
                <Progress value={controlHealthPercent} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Exception Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-2">
                  {Math.round(((data.controlHealth.tested - data.controlHealth.effective) / data.controlHealth.tested) * 100)}%
                </div>
                <p className="text-sm text-muted-foreground mb-3">Within tolerance threshold</p>
                <Progress
                  value={((data.controlHealth.tested - data.controlHealth.effective) / data.controlHealth.tested) * 100}
                />
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Material Controls by Theme</CardTitle>
              <CardDescription>Distribution of material controls across risk categories</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.issuesByTheme}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="theme" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3b82f6" name="Controls" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Balance Sheet Date Declaration</CardTitle>
              <CardDescription>Material controls status as of financial year-end</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-900 leading-relaxed">
                  As of December 31, 2023, the Board has reviewed the effectiveness of {data.controlHealth.totalMaterial}{' '}
                  material controls. Testing has been completed for {data.controlHealth.tested} controls ({Math.round((data.controlHealth.tested / data.controlHealth.totalMaterial) * 100)}%),
                  with {data.controlHealth.effective} controls ({controlHealthPercent}%) demonstrating effective operation.
                  Exceptions identified are within acceptable tolerance levels and are subject to remediation plans with
                  defined timelines.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="issues" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Material Weaknesses</CardTitle>
              <CardDescription>Issues requiring board attention and disclosure</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-3" />
                <p className="text-lg font-medium">No Material Weaknesses Identified</p>
                <p className="text-sm text-muted-foreground mt-1">
                  All material controls are operating effectively as designed
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Issues by Theme</CardTitle>
              <CardDescription>Open issues and remediation status</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.issuesByTheme}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="theme" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#f59e0b" name="Open Issues" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Remediation Progress</CardTitle>
              <CardDescription>Time to fix and closure rates</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.remediationProgress}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="opened" fill="#ef4444" name="Opened" />
                  <Bar dataKey="closed" fill="#22c55e" name="Closed" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="forward" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Forward Look</CardTitle>
              <CardDescription>Changes, emerging risks, and planned improvements</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Planned Changes (Next 12 Months)</h4>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 text-sm">
                    <TrendingUp className="h-4 w-4 text-blue-600 mt-0.5" />
                    <span>ERP system upgrade - enhanced automated controls</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <TrendingUp className="h-4 w-4 text-blue-600 mt-0.5" />
                    <span>Expansion into new geographic markets - additional compliance requirements</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <TrendingUp className="h-4 w-4 text-blue-600 mt-0.5" />
                    <span>Cloud migration initiative - infrastructure control updates</span>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="font-medium mb-2">Emerging Risks</h4>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 text-sm">
                    <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
                    <span>Increased ransomware threat landscape - enhanced monitoring required</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
                    <span>New regulatory guidance on AI governance - framework updates planned</span>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="font-medium mb-2">Planned Improvements</h4>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 text-sm">
                    <Shield className="h-4 w-4 text-green-600 mt-0.5" />
                    <span>Automation of manual reconciliation controls - Q2 2024</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <Shield className="h-4 w-4 text-green-600 mt-0.5" />
                    <span>Enhanced continuous monitoring coverage - Q3 2024</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <Shield className="h-4 w-4 text-green-600 mt-0.5" />
                    <span>Decision-use evidence collection improvements - Q1 2024</span>
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Assurance Plan</CardTitle>
              <CardDescription>Planned testing and assurance activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <span className="text-sm font-medium">Q1 2024: Annual IT General Controls Review</span>
                  <Badge variant="outline">Internal Audit</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <span className="text-sm font-medium">Q2 2024: SOX 404 Testing</span>
                  <Badge variant="outline">External Audit</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <span className="text-sm font-medium">Q3 2024: Vendor Risk Assessment</span>
                  <Badge variant="outline">2nd Line</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <span className="text-sm font-medium">Q4 2024: Framework Effectiveness Review</span>
                  <Badge variant="outline">Audit Committee</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="disclosure" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Annual Report Disclosure (Provision 29)</CardTitle>
              <CardDescription>Draft disclosure for board review and approval</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-white border rounded-lg p-4 space-y-3">
                  <h4 className="font-medium">How Monitoring and Review Were Performed</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    The Board has established a comprehensive risk management and internal control framework, approved by
                    the Audit Committee in January 2024. Throughout the year, the Board conducted quarterly reviews of
                    control effectiveness against board-approved criteria covering design, implementation, operation,
                    decision-use, assurance, outcomes, and adaptability. Continuous monitoring systems provided real-time
                    visibility into control performance, with {data.controlHealth.tested} material controls tested during
                    the period.
                  </p>
                </div>

                <div className="bg-white border rounded-lg p-4 space-y-3">
                  <h4 className="font-medium">Basis of Declaration at Balance Sheet Date</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    As of December 31, 2023, the Board has reviewed evidence from {data.controlHealth.tested} material
                    control tests, continuous monitoring signals from integrated systems, and remediation activities for
                    identified exceptions. {data.controlHealth.effective} controls ({controlHealthPercent}%) demonstrated
                    effective operation. All exceptions were within established tolerance thresholds and subject to
                    approved remediation plans.
                  </p>
                </div>

                <div className="bg-white border rounded-lg p-4 space-y-3">
                  <h4 className="font-medium">Ineffective Material Controls</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    No material weaknesses were identified during the year. Minor control exceptions were identified in
                    vendor due diligence processes, with remediation completed in Q1 2024. The Board is satisfied that
                    these exceptions did not constitute material weaknesses in the overall control framework.
                  </p>
                </div>

                <div className="bg-white border rounded-lg p-4 space-y-3">
                  <h4 className="font-medium">Follow-up on Prior Year Weaknesses</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    All control improvements identified in the prior year have been successfully implemented and tested.
                    The Board has verified closure of all prior year findings through independent testing and evidence
                    review.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Disclosure Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Button>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Draft
                </Button>
                <Button variant="outline">Submit for Review</Button>
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export to Word
                </Button>
                <Button variant="outline">View Version History</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>Evidence Index</CardTitle>
          <CardDescription>Drill-down capability for board members to review supporting evidence</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 md:grid-cols-2">
            <Button variant="outline" className="justify-start">
              <FileText className="h-4 w-4 mr-2" />
              Effectiveness Criteria Evidence
            </Button>
            <Button variant="outline" className="justify-start">
              <FileText className="h-4 w-4 mr-2" />
              Control Test Results
            </Button>
            <Button variant="outline" className="justify-start">
              <FileText className="h-4 w-4 mr-2" />
              Exception Reports & Analysis
            </Button>
            <Button variant="outline" className="justify-start">
              <FileText className="h-4 w-4 mr-2" />
              Remediation Action Plans
            </Button>
            <Button variant="outline" className="justify-start">
              <FileText className="h-4 w-4 mr-2" />
              Continuous Monitoring Dashboards
            </Button>
            <Button variant="outline" className="justify-start">
              <FileText className="h-4 w-4 mr-2" />
              Approval Audit Trails
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Preview Pack Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Board Pack Preview</DialogTitle>
            <DialogDescription>
              Preview of the complete board reporting pack
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="border rounded-lg p-4 bg-muted/50">
              <h3 className="font-semibold mb-2">Executive Summary</h3>
              <div className="grid grid-cols-3 gap-4 mb-3">
                <div>
                  <div className="text-2xl font-bold text-blue-600">{data.controlHealth.totalMaterial}</div>
                  <div className="text-xs text-muted-foreground">Material Controls</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {Math.round((data.controlHealth.effective / data.controlHealth.tested) * 100)}%
                  </div>
                  <div className="text-xs text-muted-foreground">Effectiveness</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-yellow-600">0</div>
                  <div className="text-xs text-muted-foreground">Material Weaknesses</div>
                </div>
              </div>
            </div>

            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-2">Key Findings</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                  <span>All effectiveness criteria dimensions met or partially met</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                  <span>{data.controlHealth.effective} of {data.controlHealth.tested} tested controls operating effectively</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                  <span>No material weaknesses identified</span>
                </li>
                <li className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
                  <span>Minor improvements required in decision-use evidence collection</span>
                </li>
              </ul>
            </div>

            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-2">Board Conclusion</h3>
              <p className="text-sm text-muted-foreground">
                The framework is operating effectively with minor improvements required in decision-use evidence collection. All exceptions are within tolerance thresholds and subject to approved remediation plans.
              </p>
            </div>

            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-2">Included Sections</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-blue-600" />
                  <span>Effectiveness Dashboard</span>
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-blue-600" />
                  <span>Material Controls Health</span>
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-blue-600" />
                  <span>Key Issues & Remediation</span>
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-blue-600" />
                  <span>Forward Look</span>
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-blue-600" />
                  <span>Annual Disclosure Draft</span>
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-blue-600" />
                  <span>Evidence Index</span>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPreviewOpen(false)}>Close</Button>
            <Button onClick={handleExportPDF}>
              <Download className="h-4 w-4 mr-2" />
              Export to PDF
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Prior Year Statement Dialog */}
      <Dialog open={isPriorYearOpen} onOpenChange={setIsPriorYearOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Prior Year Board Statement (FY 2023)</DialogTitle>
            <DialogDescription>
              Review the prior year's annual board statement for reference
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-white border rounded-lg p-4 space-y-3">
              <h4 className="font-medium">Board's Responsibility</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                The Board is responsible for determining the nature and extent of the significant risks it is willing to take in achieving its strategic objectives. The Board maintains sound risk management and internal control systems and is responsible for reviewing their effectiveness.
              </p>
            </div>

            <div className="bg-white border rounded-lg p-4 space-y-3">
              <h4 className="font-medium">How Monitoring and Review Were Performed (FY 2023)</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Throughout FY 2023, the Board conducted quarterly reviews of control effectiveness against approved criteria covering design, implementation, operation, and outcomes. The Board reviewed comprehensive reports from management, internal audit, and external audit. Continuous monitoring systems provided real-time visibility into control performance, with 156 material controls tested during the period.
              </p>
            </div>

            <div className="bg-white border rounded-lg p-4 space-y-3">
              <h4 className="font-medium">Basis of Declaration at Balance Sheet Date (Dec 31, 2023)</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                As of December 31, 2023, the Board reviewed evidence from 156 material control tests, continuous monitoring signals from integrated systems, and remediation activities for identified exceptions. 148 controls (95%) demonstrated effective operation. All exceptions were within established tolerance thresholds and subject to approved remediation plans.
              </p>
            </div>

            <div className="bg-white border rounded-lg p-4 space-y-3">
              <h4 className="font-medium">Material Weaknesses (FY 2023)</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                No material weaknesses were identified during FY 2023. Minor control exceptions were identified in vendor due diligence processes, with remediation completed in Q1 2024. The Board was satisfied that these exceptions did not constitute material weaknesses.
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
              <p className="text-blue-900">
                <strong>Note:</strong> This prior year statement is provided for reference and consistency in approach. The current year statement should reflect the actual control testing results and board assessment for the current period.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPriorYearOpen(false)}>Close</Button>
            <Button onClick={() => {
              setIsPriorYearOpen(false);
              handleEditDraft();
            }}>
              Use as Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Provision 29 Disclosure Draft Dialog */}
      <Dialog open={isProvision29Open} onOpenChange={setIsProvision29Open}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Provision 29 Disclosure Draft</DialogTitle>
            <DialogDescription>
              Draft disclosure for UK Corporate Governance Code - Provision 29
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2">UK Corporate Governance Code - Provision 29</h4>
              <p className="text-sm text-blue-800">
                The Board should monitor the company's risk management and internal control systems and, at least annually, carry out a review of their effectiveness and report on that review in the annual report. The monitoring and review should cover all material controls, including financial, operational and compliance controls.
              </p>
            </div>

            <div className="bg-white border rounded-lg p-4 space-y-3">
              <h4 className="font-medium">Draft Disclosure Statement</h4>
              <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
                <p>
                  <strong className="text-foreground">Risk Management Framework:</strong> The Board has established a comprehensive risk management and internal control framework that is integrated with the Company's strategy and business planning processes. The framework is designed to manage rather than eliminate the risk of failure to achieve business objectives and can only provide reasonable and not absolute assurance against material misstatement or loss.
                </p>

                <p>
                  <strong className="text-foreground">Board Oversight:</strong> Throughout {new Date().getFullYear()}, the Board conducted quarterly reviews of control effectiveness. The Audit Committee, on behalf of the Board, reviewed detailed reports covering:
                </p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Results of testing of {data?.controlHealth.tested || 'material'} controls identified as material to financial reporting and business operations</li>
                  <li>Analysis of control exceptions and remediation progress</li>
                  <li>Assessment against effectiveness criteria approved by the Board</li>
                  <li>Output from continuous monitoring systems providing real-time control insights</li>
                  <li>Reports from internal audit, external audit, and regulatory examinations</li>
                </ul>

                <p>
                  <strong className="text-foreground">Effectiveness Assessment:</strong> The Board's assessment is based on a structured framework covering design, implementation, operation, decision-use, assurance, outcomes, and adaptability of controls. As of December 31, {new Date().getFullYear() - 1}, {data?.controlHealth.effective || 'material'} controls ({data ? Math.round((data.controlHealth.effective / data.controlHealth.tested) * 100) : '95'}%) demonstrated effective operation.
                </p>

                <p>
                  <strong className="text-foreground">Material Weaknesses:</strong> No material weaknesses in internal control over financial reporting or operations were identified during the period under review. The Board is satisfied that the Company maintains effective risk management and internal control systems.
                </p>

                <p>
                  <strong className="text-foreground">Continuous Improvement:</strong> The Company has plans in place to further strengthen its control environment through automation initiatives and enhanced continuous monitoring coverage, scheduled for implementation in {new Date().getFullYear()}.
                </p>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm">
              <p className="text-yellow-900">
                <strong>Disclosure Checklist:</strong>
              </p>
              <ul className="mt-2 space-y-1 text-yellow-800">
                <li>✓ Description of risk management framework</li>
                <li>✓ How monitoring and review were performed</li>
                <li>✓ Basis of assessment at balance sheet date</li>
                <li>✓ Statement on material weaknesses (or confirmation of none)</li>
                <li>✓ Forward-looking statements on improvements</li>
              </ul>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsProvision29Open(false)}>Close</Button>
            <Button onClick={() => {
              const provision29Text = `Risk Management Framework: The Board has established a comprehensive risk management and internal control framework that is integrated with the Company's strategy and business planning processes. The framework is designed to manage rather than eliminate the risk of failure to achieve business objectives and can only provide reasonable and not absolute assurance against material misstatement or loss.

Board Oversight: Throughout ${new Date().getFullYear()}, the Board conducted quarterly reviews of control effectiveness against board-approved criteria.

Effectiveness Assessment: As of December 31, ${new Date().getFullYear() - 1}, ${data?.controlHealth.effective || 'material'} controls demonstrated effective operation.

Material Weaknesses: No material weaknesses were identified during the period under review.`;
              setDraftText(provision29Text);
              setIsProvision29Open(false);
              setIsEditDraftOpen(true);
            }}>
              <Edit className="h-4 w-4 mr-2" />
              Edit in Draft
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Basis of Declaration Dialog */}
      <Dialog open={basisView !== null} onOpenChange={() => setBasisView(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {basisView === 'criteria' && 'Criteria Selection Rationale'}
              {basisView === 'monitoring' && 'Monitoring & Review Process'}
              {basisView === 'evidence' && 'Evidence Supporting Conclusion'}
            </DialogTitle>
            <DialogDescription>
              Detailed documentation supporting the board statement
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {basisView === 'criteria' && (
              <>
                <div className="bg-white border rounded-lg p-4 space-y-3">
                  <h4 className="font-medium">Board Approval</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    The effectiveness criteria framework was presented to and approved by the Audit Committee on January 15, 2024, and subsequently ratified by the full Board on January 22, 2024. The criteria were developed based on:
                  </p>
                  <ul className="text-sm text-muted-foreground space-y-1 pl-6 list-disc">
                    <li>COSO Internal Control Framework principles</li>
                    <li>UK Corporate Governance Code requirements</li>
                    <li>Industry best practices and regulatory guidance</li>
                    <li>Company-specific risk profile and operating model</li>
                  </ul>
                </div>

                <div className="bg-white border rounded-lg p-4 space-y-3">
                  <h4 className="font-medium">Rationale for Selected Dimensions</h4>
                  <div className="space-y-2 text-sm">
                    <p className="text-muted-foreground"><strong className="text-foreground">Design:</strong> Ensures controls are appropriately designed to address identified risks</p>
                    <p className="text-muted-foreground"><strong className="text-foreground">Implementation:</strong> Verifies controls are properly implemented and resourced</p>
                    <p className="text-muted-foreground"><strong className="text-foreground">Operation:</strong> Confirms controls operate consistently as designed</p>
                    <p className="text-muted-foreground"><strong className="text-foreground">Decision-Use:</strong> Validates that control information informs decision-making</p>
                    <p className="text-muted-foreground"><strong className="text-foreground">Assurance:</strong> Ensures adequate independent testing and validation</p>
                    <p className="text-muted-foreground"><strong className="text-foreground">Outcomes:</strong> Measures achievement of control objectives</p>
                    <p className="text-muted-foreground"><strong className="text-foreground">Adaptability:</strong> Assesses framework's response to changes</p>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
                  <p className="text-blue-900">
                    <strong>Documentation:</strong> Full criteria framework documentation, board minutes, and approval resolutions are maintained in the governance repository.
                  </p>
                </div>
              </>
            )}

            {basisView === 'monitoring' && (
              <>
                <div className="bg-white border rounded-lg p-4 space-y-3">
                  <h4 className="font-medium">Quarterly Board Review Process</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    The Board conducted comprehensive reviews of control effectiveness in Q1, Q2, Q3, and Q4 of {new Date().getFullYear() - 1}. Each review included:
                  </p>
                  <ul className="text-sm text-muted-foreground space-y-1 pl-6 list-disc">
                    <li>Dashboard showing effectiveness criteria status across all dimensions</li>
                    <li>Results of material control testing with exception analysis</li>
                    <li>Summary of control changes and new risks identified</li>
                    <li>Remediation progress on prior period exceptions</li>
                    <li>Forward-looking assessment of emerging risks</li>
                  </ul>
                </div>

                <div className="bg-white border rounded-lg p-4 space-y-3">
                  <h4 className="font-medium">Review Participants</h4>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p>• Full Board (all non-executive and executive directors)</p>
                    <p>• Audit Committee members with detailed deep-dives</p>
                    <p>• Chief Risk Officer and Head of Internal Audit presentations</p>
                    <p>• External audit engagement partner (Q2 and Q4)</p>
                  </div>
                </div>

                <div className="bg-white border rounded-lg p-4 space-y-3">
                  <h4 className="font-medium">Board Actions Taken</h4>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p>• Approved additional testing scope for high-risk controls (Q1)</p>
                    <p>• Directed enhanced monitoring of decision-use dimension (Q2)</p>
                    <p>• Reviewed and approved remediation plans for identified exceptions (Q3)</p>
                    <p>• Confirmed year-end effectiveness conclusion (Q4)</p>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
                  <p className="text-blue-900">
                    <strong>Documentation:</strong> Board and Audit Committee meeting minutes, management reports, and board presentations are maintained for all {new Date().getFullYear() - 1} reviews.
                  </p>
                </div>
              </>
            )}

            {basisView === 'evidence' && (
              <>
                <div className="bg-white border rounded-lg p-4 space-y-3">
                  <h4 className="font-medium">Control Testing Evidence</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Comprehensive testing was performed on {data?.controlHealth.tested || 'all material'} controls during {new Date().getFullYear() - 1}:
                  </p>
                  <ul className="text-sm text-muted-foreground space-y-1 pl-6 list-disc">
                    <li>Design effectiveness testing for all new and modified controls</li>
                    <li>Operating effectiveness testing based on control frequency</li>
                    <li>Sample sizes determined using statistical sampling methodology</li>
                    <li>Independent testing by Internal Audit and External Audit</li>
                    <li>Evidence retention in centralized repository</li>
                  </ul>
                </div>

                <div className="bg-white border rounded-lg p-4 space-y-3">
                  <h4 className="font-medium">Supporting Documentation</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-foreground">Test Plans and Procedures</span>
                      <Badge>{data?.controlHealth.tested || '158'} documents</Badge>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-foreground">Test Evidence Files</span>
                      <Badge>1,247 files</Badge>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-foreground">Exception Reports</span>
                      <Badge>{data?.controlHealth.tested - (data?.controlHealth.effective || 0)} reports</Badge>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-foreground">Remediation Action Plans</span>
                      <Badge>{data?.controlHealth.tested - (data?.controlHealth.effective || 0)} plans</Badge>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-foreground">Continuous Monitoring Reports</span>
                      <Badge>52 weekly reports</Badge>
                    </div>
                  </div>
                </div>

                <div className="bg-white border rounded-lg p-4 space-y-3">
                  <h4 className="font-medium">External Assurance</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    External audit provided independent assurance through SOX 404 testing, reviewing design and operating effectiveness of key financial controls. Internal audit performed risk-based testing across operational and compliance controls, with all reports reviewed by the Audit Committee.
                  </p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
                  <p className="text-blue-900">
                    <strong>Documentation:</strong> Complete evidence trail maintained in secure repository with access controls and audit logging. Available for board member review upon request.
                  </p>
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBasisView(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Draft Dialog */}
      <Dialog open={isEditDraftOpen} onOpenChange={setIsEditDraftOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Edit Board Statement Draft</DialogTitle>
            <DialogDescription>
              Edit the annual disclosure statement for board review
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Disclosure Statement</Label>
              <Textarea 
                value={draftText}
                onChange={(e) => setDraftText(e.target.value)}
                className="mt-2 min-h-[300px]"
                placeholder="Enter board statement text..."
              />
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
              <p className="text-blue-900">
                <strong>Note:</strong> This draft will be saved for board review. Ensure all statements are accurate and supported by evidence.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDraftOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveDraft}>
              <Edit className="h-4 w-4 mr-2" />
              Save Draft
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
