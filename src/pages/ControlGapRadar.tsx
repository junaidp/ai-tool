import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { apiService } from '@/services/api';
import type { ControlGap } from '@/types';
import { AlertTriangle, TrendingUp, FileText, ExternalLink, Plus, Sparkles } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export default function ControlGapRadar() {
  const [gaps, setGaps] = useState<ControlGap[]>([]);
  const [isAiAnalysisOpen, setIsAiAnalysisOpen] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [frameworkType, setFrameworkType] = useState('');

  const loadGaps = async () => {
    const data = await apiService.getControlGaps();
    setGaps(data);
  };

  useEffect(() => {
    loadGaps();
  }, []);

  const handleAiAnalysis = async () => {
    try {
      if (!frameworkType) {
        alert('Please select a framework type');
        return;
      }

      setIsAnalyzing(true);

      // Get existing controls from Material Controls
      const controls = await apiService.getMaterialControls();
      const existingControls = controls.map(c => c.name);

      // Call AI to analyze gaps
      const response = await apiService.generateGapsWithAI({
        frameworkType,
        existingControls
      });

      // Save all generated gaps to database
      for (const gap of response.gaps) {
        await apiService.createControlGap({
          title: gap.title,
          description: gap.description,
          priority: gap.priority,
          riskTheme: gap.affectedAreas?.[0] || 'Risk Management',
          source: 'internal',
          affectedControls: gap.affectedAreas || [],
          proposedAction: gap.recommendedAction,
          status: 'pending',
          identifiedDate: new Date().toISOString()
        });
      }

      setIsAiAnalysisOpen(false);
      setIsAnalyzing(false);
      setFrameworkType('');
      await loadGaps(); // Refresh the list
      alert(`✨ AI identified ${response.gaps.length} potential control gaps!`);
    } catch (error) {
      console.error('Failed to analyze gaps:', error);
      alert('Failed to analyze control gaps. Please try again.');
      setIsAnalyzing(false);
    }
  };

  const getSeverityBadge = (priority: string) => {
    switch (priority) {
      case 'critical':
        return <Badge variant="destructive">Critical</Badge>;
      case 'high':
        return <Badge className="bg-orange-500 text-white">High</Badge>;
      case 'medium':
        return <Badge variant="warning">Medium</Badge>;
      default:
        return <Badge variant="outline">Low</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge variant="success">Approved</Badge>;
      case 'in_review':
        return <Badge variant="info">In Review</Badge>;
      case 'pending':
        return <Badge variant="warning">Pending</Badge>;
      default:
        return <Badge variant="outline">Rejected</Badge>;
    }
  };

  const internalGaps = gaps.filter((g) => g.source === 'internal');
  const externalGaps = gaps.filter((g) => g.source === 'external');
  const criticalGaps = gaps.filter((g) => g.priority === 'critical');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Control Gap Radar</h1>
          <p className="text-muted-foreground mt-1">
            Real-time identification of control gaps from internal and external signals
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isAiAnalysisOpen} onOpenChange={setIsAiAnalysisOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Sparkles className="h-4 w-4 mr-2" />
                AI Analysis
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>AI Control Gap Analysis</DialogTitle>
                <DialogDescription>
                  Use GPT-4 to analyze your current control framework and identify potential gaps
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Framework Type</Label>
                  <Select value={frameworkType} onValueChange={setFrameworkType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select framework type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="COSO">COSO Internal Control Framework</SelectItem>
                      <SelectItem value="ISO 27001">ISO 27001 Information Security</SelectItem>
                      <SelectItem value="NIST CSF">NIST Cybersecurity Framework</SelectItem>
                      <SelectItem value="SOX">SOX Financial Controls</SelectItem>
                      <SelectItem value="COBIT">COBIT IT Governance</SelectItem>
                      <SelectItem value="Custom">Custom Framework</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="border rounded-lg p-4 bg-muted/50">
                  <h4 className="font-medium mb-2">AI will analyze:</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• Your current material controls</li>
                    <li>• Industry best practices for {frameworkType || 'selected framework'}</li>
                    <li>• Common control gaps and blind spots</li>
                    <li>• Regulatory requirements</li>
                    <li>• Emerging risks and threats</li>
                  </ul>
                </div>

                <div className="text-sm text-muted-foreground">
                  <p>
                    The AI will generate 3-5 potential control gaps with priorities, affected areas, 
                    and recommended actions for your review.
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAiAnalysisOpen(false)} disabled={isAnalyzing}>
                  Cancel
                </Button>
                <Button onClick={handleAiAnalysis} disabled={isAnalyzing}>
                  <Sparkles className="h-4 w-4 mr-2" />
                  {isAnalyzing ? 'Analyzing...' : 'Run AI Analysis'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Report Gap
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Gaps Identified</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{gaps.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Last 30 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Critical Priority</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{criticalGaps.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Immediate action required</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Internal Sources</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{internalGaps.length}</div>
            <p className="text-xs text-muted-foreground mt-1">From incidents & exceptions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">External Sources</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{externalGaps.length}</div>
            <p className="text-xs text-muted-foreground mt-1">From regulatory & sector alerts</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All Gaps</TabsTrigger>
          <TabsTrigger value="internal">Internal Signals</TabsTrigger>
          <TabsTrigger value="external">External Signals</TabsTrigger>
          <TabsTrigger value="critical">Critical Priority</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {gaps.map((gap) => (
            <Card key={gap.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="h-5 w-5 text-yellow-600" />
                      <CardTitle className="text-lg">{gap.title}</CardTitle>
                      {getSeverityBadge(gap.priority)}
                      {getStatusBadge(gap.status)}
                    </div>
                    <CardDescription>{gap.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Source:</span>
                    <div className="mt-1">
                      <Badge variant={gap.source === 'internal' ? 'secondary' : 'outline'}>
                        {gap.source === 'internal' ? 'Internal' : 'External'}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <span className="font-medium">Risk Theme:</span>
                    <p className="text-muted-foreground mt-1">{gap.riskTheme}</p>
                  </div>
                  <div>
                    <span className="font-medium">Identified Date:</span>
                    <p className="text-muted-foreground mt-1">{formatDate(gap.identifiedDate)}</p>
                  </div>
                  <div>
                    <span className="font-medium">Affected Controls:</span>
                    <p className="text-muted-foreground mt-1">{gap.affectedControls.length} control(s)</p>
                  </div>
                </div>

                <div>
                  <span className="text-sm font-medium">Affected Controls:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {gap.affectedControls.map((control, idx) => (
                      <Badge key={idx} variant="outline">
                        {control}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="bg-blue-50 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <Sparkles className="h-4 w-4 text-blue-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-blue-900">AI-Proposed Action</p>
                      <p className="text-sm text-blue-700 mt-1">{gap.proposedAction}</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 pt-2 border-t">
                  <Button size="sm" variant="outline">View Details</Button>
                  <Button size="sm" variant="outline">Review Controls</Button>
                  <Button size="sm" variant="outline">Create Remediation Plan</Button>
                  {gap.status === 'pending' && (
                    <Button size="sm">Submit for Approval</Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="internal" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Internal Signal Sources</CardTitle>
              <CardDescription>Gaps identified from internal monitoring and incidents</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {internalGaps.map((gap) => (
                <div key={gap.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{gap.title}</h3>
                        {getSeverityBadge(gap.priority)}
                      </div>
                      <p className="text-sm text-muted-foreground">{gap.description}</p>
                    </div>
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Risk Theme: </span>
                    <span className="text-muted-foreground">{gap.riskTheme}</span>
                  </div>
                  <div className="bg-blue-50 rounded p-2 text-sm">
                    <span className="font-medium text-blue-900">Proposed Action: </span>
                    <span className="text-blue-700">{gap.proposedAction}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Internal Signal Types</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="text-sm">Repeated CCM Exceptions</span>
                  <Badge>1</Badge>
                </div>
                <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="text-sm">Audit Findings</span>
                  <Badge>0</Badge>
                </div>
                <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="text-sm">Incidents & Near Misses</span>
                  <Badge>0</Badge>
                </div>
                <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="text-sm">Major Changes</span>
                  <Badge>0</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="external" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>External Signal Sources</CardTitle>
              <CardDescription>Gaps identified from regulatory updates and sector trends</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {externalGaps.map((gap) => (
                <div key={gap.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <ExternalLink className="h-4 w-4 text-muted-foreground" />
                        <h3 className="font-semibold">{gap.title}</h3>
                        {getSeverityBadge(gap.priority)}
                      </div>
                      <p className="text-sm text-muted-foreground">{gap.description}</p>
                    </div>
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Risk Theme: </span>
                    <span className="text-muted-foreground">{gap.riskTheme}</span>
                  </div>
                  <div className="bg-blue-50 rounded p-2 text-sm">
                    <span className="font-medium text-blue-900">Proposed Action: </span>
                    <span className="text-blue-700">{gap.proposedAction}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>External Signal Types</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="text-sm">Regulatory Updates</span>
                  <Badge>1</Badge>
                </div>
                <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="text-sm">Sector Trends & Alerts</span>
                  <Badge>1</Badge>
                </div>
                <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="text-sm">Peer Incidents</span>
                  <Badge>0</Badge>
                </div>
                <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="text-sm">Supplier Risk Intelligence</span>
                  <Badge>0</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="critical" className="space-y-4">
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="text-red-900">Critical Priority Gaps</CardTitle>
              <CardDescription className="text-red-700">
                Immediate action required - escalated to management
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {criticalGaps.map((gap) => (
                <div key={gap.id} className="border border-red-200 bg-white rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <AlertTriangle className="h-5 w-5 text-red-600" />
                        <h3 className="font-semibold">{gap.title}</h3>
                        {getStatusBadge(gap.status)}
                      </div>
                      <p className="text-sm text-muted-foreground">{gap.description}</p>
                    </div>
                  </div>
                  <div className="bg-red-50 border border-red-200 rounded p-3">
                    <p className="text-sm font-medium text-red-900 mb-1">Proposed Action:</p>
                    <p className="text-sm text-red-700">{gap.proposedAction}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="destructive">Escalate to Board</Button>
                    <Button size="sm" variant="outline">Create Action Plan</Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>AI Control Gap Radar Configuration</CardTitle>
          <CardDescription>Configure signal classification and automated proposals</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-3">
              <h4 className="font-medium">Signal Classification</h4>
              <Button variant="outline" className="w-full justify-start">
                <FileText className="h-4 w-4 mr-2" />
                Risk/Control Theme Mapping
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <TrendingUp className="h-4 w-4 mr-2" />
                Priority Scoring Rules
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Sparkles className="h-4 w-4 mr-2" />
                AI Classification Model
              </Button>
            </div>
            <div className="space-y-3">
              <h4 className="font-medium">Automated Workflows</h4>
              <Button variant="outline" className="w-full justify-start">
                <AlertTriangle className="h-4 w-4 mr-2" />
                Escalation Rules
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <FileText className="h-4 w-4 mr-2" />
                Remediation Templates
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <ExternalLink className="h-4 w-4 mr-2" />
                External Feed Sources
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
