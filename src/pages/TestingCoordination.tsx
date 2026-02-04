import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { apiService } from '@/services/api';
import type { TestPlan, Issue } from '@/types';
import {  Calendar, CheckCircle, Clock, XCircle, AlertTriangle, Plus, Download, Sparkles } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export default function TestingCoordination() {
  const [testPlans, setTestPlans] = useState<TestPlan[]>([]);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [isGeneratePlanOpen, setIsGeneratePlanOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [testingPeriod, setTestingPeriod] = useState('');
  const [testScope, setTestScope] = useState('');

  const loadData = async () => {
    const [tests, issuesData] = await Promise.all([
      apiService.getTestPlans(), 
      apiService.getIssues()
    ]);
    setTestPlans(tests);
    setIssues(issuesData);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleGenerateTestPlan = async () => {
    try {
      if (!testingPeriod || !testScope) {
        alert('Please select testing period and scope');
        return;
      }

      setIsGenerating(true);

      // Get all material controls to generate test plans for
      const controls = await apiService.getMaterialControls();
      
      // Filter based on scope
      let controlsToTest = controls;
      if (testScope === 'high_risk') {
        controlsToTest = controls.filter(c => c.materialityScore >= 70);
      } else if (testScope === 'manual_only') {
        controlsToTest = controls.filter(c => !c.name.toLowerCase().includes('automated'));
      }

      // Generate test plans for each control
      for (const control of controlsToTest) {
        // Determine test type based on control
        const testType = control.name.toLowerCase().includes('design') ? 'design' : 'operating';
        
        // Calculate scheduled date based on period
        const today = new Date();
        let scheduledDate = new Date();
        if (testingPeriod === 'Q1') {
          scheduledDate = new Date(today.getFullYear(), 0, 15); // Jan 15
        } else if (testingPeriod === 'Q2') {
          scheduledDate = new Date(today.getFullYear(), 3, 15); // Apr 15
        } else if (testingPeriod === 'Q3') {
          scheduledDate = new Date(today.getFullYear(), 6, 15); // Jul 15
        } else if (testingPeriod === 'Q4') {
          scheduledDate = new Date(today.getFullYear(), 9, 15); // Oct 15
        }

        await apiService.createTestPlan({
          controlId: control.id,
          controlName: control.name,
          testType,
          tester: 'Internal Audit',
          scheduledDate: scheduledDate.toISOString(),
          status: 'not_started',
          remediationRequired: false,
          results: null,
          exceptions: []
        });
      }

      setIsGeneratePlanOpen(false);
      setIsGenerating(false);
      setTestingPeriod('');
      setTestScope('');
      await loadData();
      alert(`✨ AI generated ${controlsToTest.length} test plans for ${testingPeriod}!`);
    } catch (error: any) {
      console.error('Failed to generate test plan:', error);
      console.error('Error details:', error.message, error.stack);
      alert(`Failed to generate test plan: ${error.message || 'Please try again.'}`);
      setIsGenerating(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'in_progress':
        return <Clock className="h-5 w-5 text-blue-600" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Calendar className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="success">Completed</Badge>;
      case 'in_progress':
        return <Badge variant="info">In Progress</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="outline">Not Started</Badge>;
    }
  };

  const completedTests = testPlans.filter((t) => t.status === 'completed').length;
  const inProgressTests = testPlans.filter((t) => t.status === 'in_progress').length;
  const testsWithRemediation = testPlans.filter((t) => t.remediationRequired).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Testing Coordination</h1>
          <p className="text-muted-foreground mt-1">
            Orchestrate control testing with evidence collection and remediation tracking
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isGeneratePlanOpen} onOpenChange={setIsGeneratePlanOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Sparkles className="h-4 w-4 mr-2" />
                AI Generate Plan
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>AI-Powered Test Plan Generation</DialogTitle>
                <DialogDescription>
                  Automatically generate testing schedule based on material controls and risk profiles
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Testing Period</Label>
                  <Select value={testingPeriod} onValueChange={setTestingPeriod}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select testing period" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Q1">Q1 (Jan - Mar)</SelectItem>
                      <SelectItem value="Q2">Q2 (Apr - Jun)</SelectItem>
                      <SelectItem value="Q3">Q3 (Jul - Sep)</SelectItem>
                      <SelectItem value="Q4">Q4 (Oct - Dec)</SelectItem>
                      <SelectItem value="Annual">Annual Review</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Test Scope</Label>
                  <Select value={testScope} onValueChange={setTestScope}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select test scope" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Material Controls</SelectItem>
                      <SelectItem value="high_risk">High Risk Controls Only (Score ≥70)</SelectItem>
                      <SelectItem value="manual_only">Manual Controls Only</SelectItem>
                      <SelectItem value="key_controls">Key Financial Controls</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="border rounded-lg p-4 bg-muted/50">
                  <h4 className="font-medium mb-2">AI will generate:</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• Test plans for each in-scope control</li>
                    <li>• Appropriate test types (design vs. operating)</li>
                    <li>• Optimal testing schedule based on frequency</li>
                    <li>• Resource allocation recommendations</li>
                    <li>• Sample size suggestions</li>
                  </ul>
                </div>

                <div className="text-sm text-muted-foreground">
                  <p>
                    The generated test plans will include recommended test procedures, evidence requirements,
                    and tester assignments based on control complexity and materiality.
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsGeneratePlanOpen(false)} disabled={isGenerating}>
                  Cancel
                </Button>
                <Button onClick={handleGenerateTestPlan} disabled={isGenerating}>
                  <Sparkles className="h-4 w-4 mr-2" />
                  {isGenerating ? 'Generating...' : 'Generate Test Plan'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Results
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Schedule Test
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Tests Planned</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{testPlans.length}</div>
            <p className="text-xs text-muted-foreground mt-1">This quarter</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{completedTests}</div>
            <Progress value={(completedTests / testPlans.length) * 100} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{inProgressTests}</div>
            <p className="text-xs text-muted-foreground mt-1">Active testing</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Remediation Required</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{testsWithRemediation}</div>
            <p className="text-xs text-muted-foreground mt-1">Follow-up needed</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="schedule">
        <TabsList>
          <TabsTrigger value="schedule">Test Schedule</TabsTrigger>
          <TabsTrigger value="results">Test Results</TabsTrigger>
          <TabsTrigger value="remediation">Remediation Tracking</TabsTrigger>
        </TabsList>

        <TabsContent value="schedule" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Annual Test Plan</CardTitle>
              <CardDescription>
                Auto-generated from material controls and effectiveness criteria requirements
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {testPlans.map((test) => (
                  <div key={test.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        {getStatusIcon(test.status)}
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{test.controlName}</h3>
                            {getStatusBadge(test.status)}
                            <Badge variant="outline">{test.testType}</Badge>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Tester:</span>
                        <p className="text-muted-foreground">{test.tester}</p>
                      </div>
                      <div>
                        <span className="font-medium">Scheduled Date:</span>
                        <p className="text-muted-foreground">{formatDate(test.scheduledDate)}</p>
                      </div>
                      <div>
                        <span className="font-medium">Control ID:</span>
                        <p className="text-muted-foreground">{test.controlId}</p>
                      </div>
                    </div>

                    {test.status === 'completed' && test.results && (
                      <div className="bg-gray-50 rounded p-3">
                        <p className="text-sm font-medium mb-1">Test Results:</p>
                        <p className="text-sm text-muted-foreground">{test.results}</p>
                        {test.exceptions && test.exceptions.length > 0 && (
                          <div className="mt-2">
                            <p className="text-sm font-medium text-yellow-900">Exceptions:</p>
                            <ul className="mt-1 space-y-1">
                              {test.exceptions.map((exception, idx) => (
                                <li key={idx} className="text-sm text-yellow-700 flex items-start gap-2">
                                  <AlertTriangle className="h-3 w-3 mt-0.5" />
                                  {exception}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="flex gap-2 pt-2 border-t">
                      {test.status === 'not_started' && (
                        <>
                          <Button size="sm">Start Test</Button>
                          <Button size="sm" variant="outline">View Test Script</Button>
                        </>
                      )}
                      {test.status === 'in_progress' && (
                        <>
                          <Button size="sm">Upload Evidence</Button>
                          <Button size="sm" variant="outline">Complete Test</Button>
                        </>
                      )}
                      {test.status === 'completed' && (
                        <>
                          <Button size="sm" variant="outline">View Evidence</Button>
                          <Button size="sm" variant="outline">View Report</Button>
                        </>
                      )}
                      <Button size="sm" variant="outline">Reschedule</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Testing Agent Capabilities</CardTitle>
              <CardDescription>AI-powered testing assistance (bounded and safe)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="border rounded-lg p-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <h4 className="font-medium text-sm">Agent Can Do</h4>
                  </div>
                  <ul className="text-sm text-muted-foreground space-y-1 pl-6">
                    <li>• Draft test steps</li>
                    <li>• Propose sampling approach</li>
                    <li>• Check evidence completeness</li>
                    <li>• Flag inconsistencies/gaps</li>
                  </ul>
                </div>
                <div className="border rounded-lg p-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <XCircle className="h-4 w-4 text-red-600" />
                    <h4 className="font-medium text-sm">Agent Cannot Do</h4>
                  </div>
                  <ul className="text-sm text-muted-foreground space-y-1 pl-6">
                    <li>• Mark "effective" without approval</li>
                    <li>• Change scope/materiality</li>
                    <li>• Override human judgment</li>
                    <li>• Auto-close findings</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="results" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Test Results Summary</CardTitle>
              <CardDescription>Design and operating effectiveness by control</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {testPlans
                  .filter((t) => t.status === 'completed')
                  .map((test) => (
                    <div key={test.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold">{test.controlName}</h3>
                          <p className="text-sm text-muted-foreground">
                            {test.testType === 'design' ? 'Design Effectiveness' : 'Operating Effectiveness'}
                          </p>
                        </div>
                        <Badge variant={test.remediationRequired ? 'warning' : 'success'}>
                          {test.remediationRequired ? 'Partially Effective' : 'Effective'}
                        </Badge>
                      </div>
                      <div className="bg-gray-50 rounded p-3 mb-3">
                        <p className="text-sm">{test.results}</p>
                      </div>
                      {test.exceptions && test.exceptions.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-sm font-medium">Exceptions Identified:</p>
                          {test.exceptions.map((exception, idx) => (
                            <div key={idx} className="flex items-start gap-2 text-sm">
                              <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
                              <span className="text-muted-foreground">{exception}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="remediation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Remediation Actions</CardTitle>
              <CardDescription>Track issues, remediation plans, and retest requirements</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {issues.map((issue) => (
                  <div key={issue.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <AlertTriangle
                          className={`h-5 w-5 mt-0.5 ${
                            issue.severity === 'critical'
                              ? 'text-red-600'
                              : issue.severity === 'high'
                              ? 'text-orange-600'
                              : 'text-yellow-600'
                          }`}
                        />
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{issue.title}</h3>
                            <Badge
                              variant={
                                issue.severity === 'critical'
                                  ? 'destructive'
                                  : issue.severity === 'high'
                                  ? 'warning'
                                  : 'secondary'
                              }
                            >
                              {issue.severity.toUpperCase()}
                            </Badge>
                            <Badge
                              variant={
                                issue.status === 'closed'
                                  ? 'success'
                                  : issue.status === 'in_remediation'
                                  ? 'info'
                                  : 'warning'
                              }
                            >
                              {issue.status.replace('_', ' ').toUpperCase()}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{issue.description}</p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Owner:</span>
                        <p className="text-muted-foreground">{issue.owner}</p>
                      </div>
                      <div>
                        <span className="font-medium">Due Date:</span>
                        <p className="text-muted-foreground">{formatDate(issue.dueDate)}</p>
                      </div>
                      <div>
                        <span className="font-medium">Discovered:</span>
                        <p className="text-muted-foreground">{formatDate(issue.discoveredDate)}</p>
                      </div>
                    </div>

                    {issue.remediationPlan && (
                      <div className="bg-blue-50 rounded p-3">
                        <p className="text-sm font-medium text-blue-900 mb-1">Remediation Plan:</p>
                        <p className="text-sm text-blue-700">{issue.remediationPlan}</p>
                        {issue.retestDate && (
                          <p className="text-xs text-blue-600 mt-2">Retest scheduled: {formatDate(issue.retestDate)}</p>
                        )}
                      </div>
                    )}

                    <div className="flex gap-2 pt-2 border-t">
                      <Button size="sm" variant="outline">Update Status</Button>
                      <Button size="sm" variant="outline">View Evidence</Button>
                      {issue.status === 'in_remediation' && issue.retestDate && (
                        <Button size="sm">Schedule Retest</Button>
                      )}
                      {issue.status === 'open' && <Button size="sm">Create Remediation Plan</Button>}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>Testing Orchestration Features</CardTitle>
          <CardDescription>Automated coordination and evidence management</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="border rounded-lg p-3">
              <h4 className="font-medium mb-2">Automated Tasking</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Request evidence from control owners</li>
                <li>• Schedule walkthroughs</li>
                <li>• Send reminders</li>
                <li>• Validate evidence completeness</li>
              </ul>
            </div>
            <div className="border rounded-lg p-3">
              <h4 className="font-medium mb-2">Evidence Management</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Immutable audit trail</li>
                <li>• Version control</li>
                <li>• Access controls</li>
                <li>• Retention policies</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
