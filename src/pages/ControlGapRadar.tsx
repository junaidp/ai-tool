import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { apiService } from '@/services/api';
import type { ControlGap } from '@/types';
import { AlertTriangle, TrendingUp, FileText, ExternalLink, Plus, Sparkles } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export default function ControlGapRadar() {
  const [gaps, setGaps] = useState<ControlGap[]>([]);
  const [isAiAnalysisOpen, setIsAiAnalysisOpen] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [frameworkType, setFrameworkType] = useState('');
  const [isReportGapOpen, setIsReportGapOpen] = useState(false);
  const [isViewDetailsOpen, setIsViewDetailsOpen] = useState(false);
  const [isReviewControlsOpen, setIsReviewControlsOpen] = useState(false);
  const [isRemediationPlanOpen, setIsRemediationPlanOpen] = useState(false);
  const [isEscalateOpen, setIsEscalateOpen] = useState(false);
  const [isActionPlanOpen, setIsActionPlanOpen] = useState(false);
  const [selectedGap, setSelectedGap] = useState<ControlGap | null>(null);
  const [reportGapData, setReportGapData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    riskTheme: '',
    source: 'internal'
  });

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

  const handleReportGap = () => {
    setReportGapData({
      title: '',
      description: '',
      priority: 'medium',
      riskTheme: '',
      source: 'internal'
    });
    setIsReportGapOpen(true);
  };

  const handleReportGapSubmit = async () => {
    if (!reportGapData.title || !reportGapData.description || !reportGapData.riskTheme) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      await apiService.createControlGap({
        ...reportGapData,
        affectedControls: [],
        proposedAction: 'Pending review and analysis',
        status: 'pending',
        identifiedDate: new Date().toISOString()
      });
      setIsReportGapOpen(false);
      await loadGaps();
      alert('✅ Control gap reported successfully!');
    } catch (error) {
      console.error('Failed to report gap:', error);
      alert('Failed to report gap. Please try again.');
    }
  };

  const handleViewDetails = (gap: ControlGap) => {
    setSelectedGap(gap);
    setIsViewDetailsOpen(true);
  };

  const handleReviewControls = (gap: ControlGap) => {
    setSelectedGap(gap);
    setIsReviewControlsOpen(true);
  };

  const handleCreateRemediationPlan = (gap: ControlGap) => {
    setSelectedGap(gap);
    setIsRemediationPlanOpen(true);
  };

  const handleEscalateToBoard = (gap: ControlGap) => {
    setSelectedGap(gap);
    setIsEscalateOpen(true);
  };

  const handleCreateActionPlan = (gap: ControlGap) => {
    setSelectedGap(gap);
    setIsActionPlanOpen(true);
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
          <Button onClick={handleReportGap}>
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
                  <Button size="sm" variant="outline" onClick={() => handleViewDetails(gap)}>View Details</Button>
                  <Button size="sm" variant="outline" onClick={() => handleReviewControls(gap)}>Review Controls</Button>
                  <Button size="sm" variant="outline" onClick={() => handleCreateRemediationPlan(gap)}>Create Remediation Plan</Button>
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
                    <Button size="sm" variant="destructive" onClick={() => handleEscalateToBoard(gap)}>Escalate to Board</Button>
                    <Button size="sm" variant="outline" onClick={() => handleCreateActionPlan(gap)}>Create Action Plan</Button>
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

      {/* Report Gap Dialog */}
      <Dialog open={isReportGapOpen} onOpenChange={setIsReportGapOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Report Control Gap</DialogTitle>
            <DialogDescription>
              Manually report a control gap for review and action
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Gap Title *</Label>
              <Input 
                placeholder="e.g., Missing Third-Party Risk Assessment Control"
                value={reportGapData.title}
                onChange={(e) => setReportGapData({...reportGapData, title: e.target.value})}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Description *</Label>
              <Textarea 
                placeholder="Describe the control gap in detail..."
                value={reportGapData.description}
                onChange={(e) => setReportGapData({...reportGapData, description: e.target.value})}
                className="mt-1"
                rows={4}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Priority *</Label>
                <Select value={reportGapData.priority} onValueChange={(value) => setReportGapData({...reportGapData, priority: value})}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="critical">Critical</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Source *</Label>
                <Select value={reportGapData.source} onValueChange={(value) => setReportGapData({...reportGapData, source: value})}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="internal">Internal</SelectItem>
                    <SelectItem value="external">External</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Risk Theme *</Label>
              <Input 
                placeholder="e.g., Third-Party Risk Management"
                value={reportGapData.riskTheme}
                onChange={(e) => setReportGapData({...reportGapData, riskTheme: e.target.value})}
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsReportGapOpen(false)}>Cancel</Button>
            <Button onClick={handleReportGapSubmit}>
              <Plus className="h-4 w-4 mr-2" />
              Report Gap
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Details Dialog */}
      <Dialog open={isViewDetailsOpen} onOpenChange={setIsViewDetailsOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{selectedGap?.title}</DialogTitle>
            <DialogDescription>
              Comprehensive gap details and analysis
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="border rounded-lg p-4 bg-muted/50">
              <h4 className="font-medium mb-2">Description</h4>
              <p className="text-sm text-muted-foreground">{selectedGap?.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="border rounded-lg p-3">
                <p className="text-sm font-medium mb-1">Priority</p>
                {selectedGap && getSeverityBadge(selectedGap.priority)}
              </div>
              <div className="border rounded-lg p-3">
                <p className="text-sm font-medium mb-1">Status</p>
                {selectedGap && getStatusBadge(selectedGap.status)}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="border rounded-lg p-3">
                <p className="text-sm font-medium mb-1">Source</p>
                <Badge variant={selectedGap?.source === 'internal' ? 'secondary' : 'outline'}>
                  {selectedGap?.source === 'internal' ? 'Internal' : 'External'}
                </Badge>
              </div>
              <div className="border rounded-lg p-3">
                <p className="text-sm font-medium mb-1">Risk Theme</p>
                <p className="text-sm text-muted-foreground">{selectedGap?.riskTheme}</p>
              </div>
            </div>

            <div className="border rounded-lg p-4">
              <p className="font-medium mb-2">Affected Controls</p>
              <div className="flex flex-wrap gap-2">
                {selectedGap?.affectedControls.map((control, idx) => (
                  <Badge key={idx} variant="outline">{control}</Badge>
                ))}
                {(!selectedGap?.affectedControls || selectedGap.affectedControls.length === 0) && (
                  <p className="text-sm text-muted-foreground">No controls affected</p>
                )}
              </div>
            </div>

            <div className="border rounded-lg p-4 bg-blue-50">
              <p className="font-medium mb-2 text-blue-900">AI-Proposed Action</p>
              <p className="text-sm text-blue-700">{selectedGap?.proposedAction}</p>
            </div>

            <div className="border rounded-lg p-3">
              <p className="text-sm">
                <strong>Identified Date:</strong> {selectedGap && formatDate(selectedGap.identifiedDate)}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDetailsOpen(false)}>Close</Button>
            <Button onClick={() => {
              setIsViewDetailsOpen(false);
              if (selectedGap) handleCreateRemediationPlan(selectedGap);
            }}>
              Create Remediation Plan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Review Controls Dialog */}
      <Dialog open={isReviewControlsOpen} onOpenChange={setIsReviewControlsOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Review Affected Controls: {selectedGap?.title}</DialogTitle>
            <DialogDescription>
              Review controls impacted by this gap
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            {selectedGap && selectedGap.affectedControls.length > 0 ? (
              selectedGap.affectedControls.map((control, idx) => (
                <div key={idx} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold">{control}</h4>
                    <Badge variant="warning">Affected</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    This control is impacted by the identified gap and may require enhancement or redesign.
                  </p>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Current Status:</span>
                      <p className="text-muted-foreground">Requires Review</p>
                    </div>
                    <div>
                      <span className="font-medium">Recommended Action:</span>
                      <p className="text-muted-foreground">Enhance control design</p>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <Button size="sm" variant="outline">View Control Details</Button>
                    <Button size="sm" variant="outline">Propose Enhancement</Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No specific controls affected</p>
                <p className="text-sm text-muted-foreground mt-1">This gap represents a missing control area</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsReviewControlsOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Remediation Plan Dialog */}
      <Dialog open={isRemediationPlanOpen} onOpenChange={setIsRemediationPlanOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Create Remediation Plan</DialogTitle>
            <DialogDescription>
              Define actions to address: {selectedGap?.title}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="border rounded-lg p-4 bg-muted/50">
              <h4 className="font-medium mb-2">Gap Summary</h4>
              <p className="text-sm text-muted-foreground">{selectedGap?.description}</p>
            </div>

            <div>
              <Label>Remediation Approach</Label>
              <Select defaultValue="new_control">
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new_control">Implement New Control</SelectItem>
                  <SelectItem value="enhance">Enhance Existing Control</SelectItem>
                  <SelectItem value="compensating">Add Compensating Control</SelectItem>
                  <SelectItem value="process">Process Improvement</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Action Steps</Label>
              <Textarea 
                placeholder="Define specific steps to remediate this gap..."
                className="mt-1"
                rows={4}
                defaultValue={`1. Design new control based on ${selectedGap?.proposedAction}
2. Document control procedures and responsibilities
3. Obtain stakeholder approval
4. Implement control in target systems
5. Train control owners and operators
6. Test control effectiveness`}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Owner</Label>
                <Input 
                  placeholder="e.g., Risk Manager"
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Target Completion Date</Label>
                <Input 
                  type="date"
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label>Budget / Resources</Label>
              <Textarea 
                placeholder="Describe required resources, budget, or external support..."
                className="mt-1"
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRemediationPlanOpen(false)}>Cancel</Button>
            <Button onClick={() => {
              setIsRemediationPlanOpen(false);
              alert('✅ Remediation plan created successfully!');
            }}>
              Create Plan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Escalate to Board Dialog */}
      <Dialog open={isEscalateOpen} onOpenChange={setIsEscalateOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Escalate to Board</DialogTitle>
            <DialogDescription>
              Prepare board-level escalation for critical gap: {selectedGap?.title}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="border-l-4 border-red-600 bg-red-50 p-4 rounded">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <h4 className="font-semibold text-red-900">Critical Priority Gap</h4>
              </div>
              <p className="text-sm text-red-700">{selectedGap?.description}</p>
            </div>

            <div>
              <Label>Executive Summary</Label>
              <Textarea 
                placeholder="Summarize the gap and its business impact for board members..."
                className="mt-1"
                rows={4}
                defaultValue={`Critical control gap identified requiring immediate board attention and resource allocation.

Gap: ${selectedGap?.title}
Impact: Potential exposure to ${selectedGap?.riskTheme} risks
Recommended Action: ${selectedGap?.proposedAction}`}
              />
            </div>

            <div>
              <Label>Business Impact</Label>
              <Select defaultValue="high">
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="critical">Critical - Immediate business threat</SelectItem>
                  <SelectItem value="high">High - Significant risk exposure</SelectItem>
                  <SelectItem value="medium">Medium - Moderate concern</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Board Meeting Date</Label>
              <Input 
                type="date"
                className="mt-1"
              />
            </div>

            <div>
              <Label>Supporting Documentation</Label>
              <div className="border rounded-lg p-3 bg-gray-50 mt-1">
                <p className="text-sm text-muted-foreground mb-2">Documents to include:</p>
                <div className="space-y-1 text-sm">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    <span>Gap analysis report</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    <span>Risk assessment</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    <span>Proposed remediation plan</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEscalateOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={() => {
              setIsEscalateOpen(false);
              alert('✅ Gap escalated to board successfully!');
            }}>
              Escalate to Board
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Action Plan Dialog */}
      <Dialog open={isActionPlanOpen} onOpenChange={setIsActionPlanOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Create Action Plan</DialogTitle>
            <DialogDescription>
              Immediate action plan for critical gap: {selectedGap?.title}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="border rounded-lg p-4 bg-red-50">
              <h4 className="font-medium text-red-900 mb-2">Gap Overview</h4>
              <p className="text-sm text-red-700">{selectedGap?.description}</p>
            </div>

            <div>
              <Label>Immediate Actions (Next 30 Days)</Label>
              <Textarea 
                placeholder="List critical actions to be taken immediately..."
                className="mt-1"
                rows={4}
                defaultValue="1. Conduct emergency risk assessment
2. Implement interim compensating controls
3. Assign dedicated resources
4. Begin control design process"
              />
            </div>

            <div>
              <Label>Short-term Actions (30-90 Days)</Label>
              <Textarea 
                placeholder="List short-term remediation steps..."
                className="mt-1"
                rows={3}
                defaultValue="1. Complete control design and documentation
2. Obtain necessary approvals
3. Begin implementation in pilot areas
4. Initial effectiveness testing"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Action Plan Owner</Label>
                <Input 
                  placeholder="e.g., Chief Risk Officer"
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Reporting Frequency</Label>
                <Select defaultValue="weekly">
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily Updates</SelectItem>
                    <SelectItem value="weekly">Weekly Reports</SelectItem>
                    <SelectItem value="biweekly">Bi-weekly Reviews</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
              <p className="text-blue-900">
                <strong>Note:</strong> This action plan will be tracked at executive level with regular status updates to senior management.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsActionPlanOpen(false)}>Cancel</Button>
            <Button onClick={() => {
              setIsActionPlanOpen(false);
              alert('✅ Action plan created and assigned successfully!');
            }}>
              Create & Assign
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
