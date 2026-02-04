import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { mockApiService } from '@/services/mockApi';
import type { DashboardData } from '@/types';
import { FileText, Download, Eye, Edit, TrendingUp, AlertTriangle, CheckCircle, Shield } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const COLORS = ['#22c55e', '#f59e0b', '#ef4444'];

export default function BoardReporting() {
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    mockApiService.getDashboardData().then(setData);
  }, []);

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
          <Button variant="outline">
            <Eye className="h-4 w-4 mr-2" />
            Preview Pack
          </Button>
          <Button variant="outline">
            <Edit className="h-4 w-4 mr-2" />
            Edit Draft
          </Button>
          <Button>
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
            <Button>Generate Board Pack</Button>
            <Button variant="outline">View Prior Year Statement</Button>
            <Button variant="outline">Provision 29 Disclosure Draft</Button>
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
                  <Button size="sm" variant="outline">View</Button>
                </div>

                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium text-green-900">Monitoring & Review Process</p>
                      <p className="text-sm text-green-700">Quarterly board reviews completed</p>
                    </div>
                  </div>
                  <Button size="sm" variant="outline">View</Button>
                </div>

                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium text-green-900">Evidence Supporting Conclusion</p>
                      <p className="text-sm text-green-700">Complete evidence trail maintained</p>
                    </div>
                  </div>
                  <Button size="sm" variant="outline">View</Button>
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
    </div>
  );
}
