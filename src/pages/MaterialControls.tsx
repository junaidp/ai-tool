import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { apiService } from '@/services/api';
import type { MaterialControl } from '@/types';
import type { MaterialControl as ApiMaterialControl } from '@/types/api.types';
import { Shield, Search, Plus, Download, Sparkles, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';

const safeJsonParse = (value: string | string[], fallback: string[] = []): string[] => {
  if (Array.isArray(value)) return value;
  if (!value || value === '') return fallback;
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
};

const transformApiMaterialControl = (apiControl: ApiMaterialControl): MaterialControl => ({
  id: apiControl.id,
  name: apiControl.name,
  description: apiControl.description,
  materialityScore: apiControl.materialityScore,
  rationale: apiControl.rationale,
  owner: apiControl.owner,
  evidenceSource: apiControl.evidenceSource,
  testingFrequency: apiControl.testingFrequency,
  dependencies: safeJsonParse(apiControl.dependencies as any),
  effectiveness: apiControl.effectiveness as MaterialControl['effectiveness'],
  lastTested: apiControl.lastTested || undefined,
});

export default function MaterialControls() {
  const [controls, setControls] = useState<MaterialControl[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAiScoringOpen, setIsAiScoringOpen] = useState(false);
  const [isScoring, setIsScoring] = useState(false);
  const [scoringProgress, setScoringProgress] = useState(0);
  const [isAddControlOpen, setIsAddControlOpen] = useState(false);
  const [controlFormData, setControlFormData] = useState({
    name: '',
    description: '',
    category: 'financial',
    frequency: 'monthly',
    owner: ''
  });

  const loadControls = async () => {
    const data = await apiService.getMaterialControls();
    setControls(data.map(transformApiMaterialControl));
  };

  useEffect(() => {
    loadControls();
  }, []);

  const handleExportRegister = () => {
    try {
      const csvHeaders = ['Control ID', 'Control Name', 'Description', 'Category', 'Frequency', 'Owner', 'Effectiveness', 'Materiality Score', 'Rationale'];
      const csvRows = controls.map(control => [
        `CTL-${control.id}`,
        control.name,
        control.description,
        control.category || 'N/A',
        control.frequency || 'N/A',
        control.owner || 'N/A',
        control.effectiveness || 'Not Tested',
        control.materialityScore || 'N/A',
        control.rationale || 'N/A'
      ]);

      const csvContent = [
        csvHeaders.join(','),
        ...csvRows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `material-controls-register-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      alert(`✅ Exported ${controls.length} controls to CSV!`);
    } catch (error) {
      console.error('Failed to export register:', error);
      alert('Failed to export register. Please try again.');
    }
  };

  const handleAddControl = () => {
    setControlFormData({
      name: '',
      description: '',
      category: 'financial',
      frequency: 'monthly',
      owner: ''
    });
    setIsAddControlOpen(true);
  };

  const handleAddControlSubmit = async () => {
    if (!controlFormData.name || !controlFormData.description || !controlFormData.owner) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      await apiService.createMaterialControl({
        name: controlFormData.name,
        description: controlFormData.description,
        owner: controlFormData.owner,
        materialityScore: 0,
        rationale: 'Pending AI scoring',
        evidenceSource: 'TBD',
        testingFrequency: controlFormData.frequency,
        dependencies: '[]',
        effectiveness: 'not_tested',
        lastTested: null
      });
      setIsAddControlOpen(false);
      await loadControls();
      alert('✅ Control added successfully!');
    } catch (error) {
      console.error('Failed to add control:', error);
      alert('Failed to add control. Please try again.');
    }
  };

  const handleAiScoring = async () => {
    try {
      setIsScoring(true);
      setScoringProgress(0);

      // Score each control using AI
      const totalControls = controls.length;
      for (let i = 0; i < totalControls; i++) {
        const control = controls[i];
        
        // Call AI to score this control
        const aiResult = await apiService.scoreControlWithAI({
          controlName: control.name,
          controlDescription: control.description,
          testResults: control.effectiveness || 'Not yet tested'
        });

        // Update control with AI score and rationale
        await apiService.updateMaterialControl(control.id, {
          materialityScore: aiResult.score,
          rationale: aiResult.reasoning
        });

        setScoringProgress(Math.round(((i + 1) / totalControls) * 100));
      }

      setIsAiScoringOpen(false);
      setIsScoring(false);
      await loadControls(); // Refresh controls
      alert(`✨ AI successfully scored ${totalControls} controls!`);
    } catch (error) {
      console.error('Failed to score controls:', error);
      alert('Failed to score controls with AI. Please try again.');
      setIsScoring(false);
    }
  };

  const filteredControls = controls.filter(
    (control) =>
      control.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      control.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getEffectivenessColor = (effectiveness: string) => {
    switch (effectiveness) {
      case 'effective':
        return 'text-green-600';
      case 'partially_effective':
        return 'text-yellow-600';
      case 'not_effective':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getEffectivenessBadge = (effectiveness: string) => {
    switch (effectiveness) {
      case 'effective':
        return <Badge variant="success">Effective</Badge>;
      case 'partially_effective':
        return <Badge variant="warning">Partially Effective</Badge>;
      case 'not_effective':
        return <Badge variant="destructive">Not Effective</Badge>;
      default:
        return <Badge variant="outline">Not Tested</Badge>;
    }
  };

  const getEffectivenessIcon = (effectiveness: string) => {
    switch (effectiveness) {
      case 'effective':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'partially_effective':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'not_effective':
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Shield className="h-5 w-5 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Material Controls Register</h1>
          <p className="text-muted-foreground mt-1">
            Board-approved scope of material controls with rationale and evidence
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isAiScoringOpen} onOpenChange={setIsAiScoringOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Sparkles className="h-4 w-4 mr-2" />
                AI Materiality Scoring
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>AI-Powered Materiality Scoring</DialogTitle>
                <DialogDescription>
                  Use GPT-4 to analyze and score all material controls based on multiple risk factors
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="border rounded-lg p-4 bg-muted/50">
                  <h4 className="font-medium mb-2">Scoring Factors</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Impact Severity</span>
                      <span className="text-muted-foreground">25%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Likelihood / Vulnerability</span>
                      <span className="text-muted-foreground">20%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Velocity (Time to Impact)</span>
                      <span className="text-muted-foreground">15%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Regulatory Sensitivity</span>
                      <span className="text-muted-foreground">20%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Single Point of Failure</span>
                      <span className="text-muted-foreground">10%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Historical Issues</span>
                      <span className="text-muted-foreground">10%</span>
                    </div>
                  </div>
                </div>
                
                {isScoring && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Scoring in progress...</span>
                      <span>{scoringProgress}%</span>
                    </div>
                    <Progress value={scoringProgress} />
                  </div>
                )}

                <div className="text-sm text-muted-foreground">
                  <p>
                    This will analyze all {controls.length} controls and assign materiality scores (0-100) 
                    based on AI assessment of risk factors. Existing scores will be updated.
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAiScoringOpen(false)} disabled={isScoring}>
                  Cancel
                </Button>
                <Button onClick={handleAiScoring} disabled={isScoring}>
                  <Sparkles className="h-4 w-4 mr-2" />
                  {isScoring ? 'Scoring...' : 'Start AI Scoring'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Button variant="outline" onClick={handleExportRegister}>
            <Download className="h-4 w-4 mr-2" />
            Export Register
          </Button>
          <Button onClick={handleAddControl}>
            <Plus className="h-4 w-4 mr-2" />
            Add Control
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Material Controls</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{controls.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Approved by Audit Committee</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Effective</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {controls.filter((c) => c.effectiveness === 'effective').length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Operating as designed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Partially Effective</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {controls.filter((c) => c.effectiveness === 'partially_effective').length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Requires remediation</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Avg Materiality Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(controls.reduce((acc, c) => acc + c.materialityScore, 0) / controls.length)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Out of 100</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Material Controls</CardTitle>
              <CardDescription>Controls identified as material based on AI-powered scoring engine</CardDescription>
            </div>
            <div className="relative w-72">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search controls..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredControls.map((control) => (
              <div key={control.id} className="border rounded-lg p-4 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    {getEffectivenessIcon(control.effectiveness)}
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{control.name}</h3>
                        {getEffectivenessBadge(control.effectiveness)}
                      </div>
                      <p className="text-sm text-muted-foreground">{control.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary">{control.materialityScore}</div>
                    <p className="text-xs text-muted-foreground">Materiality Score</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div>
                    <span className="text-sm font-medium">Materiality Rationale:</span>
                    <p className="text-sm text-muted-foreground mt-1">{control.rationale}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Owner:</span>
                    <p className="text-muted-foreground">{control.owner}</p>
                  </div>
                  <div>
                    <span className="font-medium">Evidence Source:</span>
                    <p className="text-muted-foreground">{control.evidenceSource}</p>
                  </div>
                  <div>
                    <span className="font-medium">Testing Frequency:</span>
                    <p className="text-muted-foreground">{control.testingFrequency}</p>
                  </div>
                  <div>
                    <span className="font-medium">Last Tested:</span>
                    <p className="text-muted-foreground">
                      {control.lastTested ? new Date(control.lastTested).toLocaleDateString() : 'Not tested'}
                    </p>
                  </div>
                </div>

                {control.dependencies.length > 0 && (
                  <div className="text-sm">
                    <span className="font-medium">System Dependencies:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {control.dependencies.map((dep, idx) => (
                        <Badge key={idx} variant="outline">
                          {dep}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-2 pt-2 border-t">
                  <Button size="sm" variant="outline">View Details</Button>
                  <Button size="sm" variant="outline">View Evidence</Button>
                  <Button size="sm" variant="outline">Test History</Button>
                  <Button size="sm" variant="outline">Edit</Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Materiality Scoring Engine</CardTitle>
          <CardDescription>AI-powered, configurable, and auditable scoring model</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Impact Severity</span>
              <span className="text-sm text-muted-foreground">Weight: 25%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Likelihood / Vulnerability</span>
              <span className="text-sm text-muted-foreground">Weight: 20%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Velocity (Time to Impact)</span>
              <span className="text-sm text-muted-foreground">Weight: 15%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Regulatory Sensitivity</span>
              <span className="text-sm text-muted-foreground">Weight: 20%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Single Point of Failure</span>
              <span className="text-sm text-muted-foreground">Weight: 10%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Historical Issues</span>
              <span className="text-sm text-muted-foreground">Weight: 10%</span>
            </div>
            <Button variant="outline" className="w-full mt-4">Configure Scoring Model</Button>
          </div>
        </CardContent>
      </Card>

      {/* Add Control Dialog */}
      <Dialog open={isAddControlOpen} onOpenChange={setIsAddControlOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add Material Control</DialogTitle>
            <DialogDescription>
              Add a new control to the material controls register
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Control Name *</Label>
              <Input 
                placeholder="e.g., Financial Close Reconciliation"
                value={controlFormData.name}
                onChange={(e) => setControlFormData({...controlFormData, name: e.target.value})}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Description *</Label>
              <Textarea 
                placeholder="Describe the control's purpose, scope, and how it operates"
                value={controlFormData.description}
                onChange={(e) => setControlFormData({...controlFormData, description: e.target.value})}
                className="mt-1"
                rows={4}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Category *</Label>
                <Select value={controlFormData.category} onValueChange={(value) => setControlFormData({...controlFormData, category: value})}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="financial">Financial Reporting</SelectItem>
                    <SelectItem value="operational">Operational</SelectItem>
                    <SelectItem value="compliance">Compliance</SelectItem>
                    <SelectItem value="it">IT General Controls</SelectItem>
                    <SelectItem value="strategic">Strategic</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Frequency *</Label>
                <Select value={controlFormData.frequency} onValueChange={(value) => setControlFormData({...controlFormData, frequency: value})}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="continuous">Continuous</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                    <SelectItem value="annual">Annual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Control Owner *</Label>
              <Input 
                placeholder="e.g., Finance Manager"
                value={controlFormData.owner}
                onChange={(e) => setControlFormData({...controlFormData, owner: e.target.value})}
                className="mt-1"
              />
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
              <p className="text-blue-900">
                <strong>Note:</strong> The control will be created with "Not Tested" status. Use AI Materiality Scoring to calculate the materiality score.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddControlOpen(false)}>Cancel</Button>
            <Button onClick={handleAddControlSubmit}>
              <Plus className="h-4 w-4 mr-2" />
              Add Control
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
