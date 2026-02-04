import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { apiService } from '@/services/api';
import type { Risk, Control } from '@/types';
import type { Risk as ApiRisk, Control as ApiControl } from '@/types/api.types';
import { AlertTriangle, Shield, Search, Sparkles, Plus, Link2 } from 'lucide-react';

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

const transformApiRisk = (apiRisk: ApiRisk): Risk => ({
  id: apiRisk.id,
  title: apiRisk.title,
  description: apiRisk.description,
  category: apiRisk.category,
  inherentRisk: apiRisk.inherentRisk as Risk['inherentRisk'],
  residualRisk: apiRisk.residualRisk as Risk['residualRisk'],
  owner: apiRisk.owner,
  linkedObjectives: safeJsonParse(apiRisk.linkedObjectives as any),
  linkedControls: safeJsonParse(apiRisk.linkedControls as any),
  lastAssessed: apiRisk.lastAssessed,
});

const transformApiControl = (apiControl: ApiControl): Control => ({
  id: apiControl.id,
  name: apiControl.name,
  description: apiControl.description,
  type: apiControl.type as Control['type'],
  automation: apiControl.automation as Control['automation'],
  frequency: apiControl.frequency,
  owner: apiControl.owner,
  linkedRisks: safeJsonParse(apiControl.linkedRisks as any),
  effectiveness: apiControl.effectiveness as Control['effectiveness'],
  evidenceSource: apiControl.evidenceSource,
});

export default function RiskControlLibrary() {
  const [risks, setRisks] = useState<Risk[]>([]);
  const [controls, setControls] = useState<Control[]>([]);
  const [isGenerateOpen, setIsGenerateOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAddCustomOpen, setIsAddCustomOpen] = useState(false);
  const [selectedRisk, setSelectedRisk] = useState<Risk | null>(null);
  const [isViewDetailsOpen, setIsViewDetailsOpen] = useState(false);
  const [isViewControlsOpen, setIsViewControlsOpen] = useState(false);
  const [isRiskAssessmentOpen, setIsRiskAssessmentOpen] = useState(false);
  const [customEntryType, setCustomEntryType] = useState<'risk' | 'control'>('risk');
  const [customRiskData, setCustomRiskData] = useState({
    title: '',
    description: '',
    category: '',
    inherentRisk: 'medium',
    owner: ''
  });
  const [customControlData, setCustomControlData] = useState({
    name: '',
    description: '',
    type: 'preventive',
    frequency: 'monthly',
    owner: ''
  });
  
  const [libraryFormData, setLibraryFormData] = useState({
    industry: '',
    companySize: '',
    products: '',
    geographies: '',
    systems: '',
    regulations: '',
    outsourcing: '',
    incidents: '',
    initiatives: ''
  });

  const loadData = async () => {
    const [risksData, controlsData] = await Promise.all([
      apiService.getRisks(), 
      apiService.getControls()
    ]);
    setRisks(risksData.map(transformApiRisk));
    setControls(controlsData.map(transformApiControl));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddCustomEntry = () => {
    setCustomRiskData({
      title: '',
      description: '',
      category: '',
      inherentRisk: 'medium',
      owner: ''
    });
    setCustomControlData({
      name: '',
      description: '',
      type: 'preventive',
      frequency: 'monthly',
      owner: ''
    });
    setIsAddCustomOpen(true);
  };

  const handleAddCustomSubmit = async () => {
    try {
      if (customEntryType === 'risk') {
        if (!customRiskData.title || !customRiskData.description || !customRiskData.owner) {
          alert('Please fill in all required fields');
          return;
        }
        await apiService.createRisk({
          ...customRiskData,
          residualRisk: customRiskData.inherentRisk,
          linkedObjectives: [],
          linkedControls: [],
          lastAssessed: null
        });
      } else {
        if (!customControlData.name || !customControlData.description || !customControlData.owner) {
          alert('Please fill in all required fields');
          return;
        }
        await apiService.createControl({
          ...customControlData,
          automation: 'manual',
          linkedRisks: [],
          effectiveness: null,
          evidenceSource: null
        });
      }
      setIsAddCustomOpen(false);
      await loadData();
      alert(`✅ ${customEntryType === 'risk' ? 'Risk' : 'Control'} added successfully!`);
    } catch (error) {
      console.error('Failed to add custom entry:', error);
      alert('Failed to add entry. Please try again.');
    }
  };

  const handleViewDetails = (risk: Risk) => {
    setSelectedRisk(risk);
    setIsViewDetailsOpen(true);
  };

  const handleViewControls = (risk: Risk) => {
    setSelectedRisk(risk);
    setIsViewControlsOpen(true);
  };

  const handleRiskAssessment = (risk: Risk) => {
    setSelectedRisk(risk);
    setIsRiskAssessmentOpen(true);
  };

  const handleGenerateLibrary = async () => {
    try {
      if (!libraryFormData.industry || !libraryFormData.companySize) {
        alert('Please fill in at least Industry and Company Size');
        return;
      }

      setIsGenerating(true);

      // Create sample risks based on organizational context
      // TODO: Add AI risk generation endpoint and use it here
      const sampleRisks = [
        {
          title: `Data Security & Privacy Risk`,
          description: `Risk of unauthorized access, data breaches, or non-compliance with ${libraryFormData.regulations || 'data protection regulations'}`,
          category: 'Information Security',
          inherentRisk: 'high',
          residualRisk: 'medium'
        },
        {
          title: `Operational Disruption Risk`,
          description: `Risk of service outages or process failures affecting ${libraryFormData.products || 'core operations'}`,
          category: 'Operational',
          inherentRisk: 'medium',
          residualRisk: 'low'
        },
        {
          title: `Third-Party Risk`,
          description: `Risk from vendor dependencies and outsourcing: ${libraryFormData.outsourcing || 'critical vendors'}`,
          category: 'Third Party',
          inherentRisk: 'high',
          residualRisk: 'medium'
        }
      ];

      // Create risks
      for (const risk of sampleRisks) {
        const newRisk = await apiService.createRisk({
          ...risk,
          owner: 'Risk Management',
          linkedObjectives: JSON.stringify([libraryFormData.industry, 'Operational Excellence']),
          linkedControls: JSON.stringify([]),
          lastAssessed: new Date().toISOString()
        });

        // Generate controls for this risk using AI
        const controlsResponse = await apiService.generateControlsWithAI({
          riskDescription: risk.description,
          riskLevel: risk.inherentRisk
        });

        // Create the generated controls
        for (const control of controlsResponse.controls.slice(0, 3)) {
          await apiService.createControl({
            name: control.name,
            description: control.description,
            type: control.type || 'preventive',
            automation: control.automation || 'manual',
            frequency: control.frequency || 'monthly',
            owner: control.owner || 'Control Owner',
            linkedRisks: JSON.stringify([newRisk.id]),
            effectiveness: 'not_tested',
            evidenceSource: 'TBD'
          });
        }
      }

      setIsGenerateOpen(false);
      setIsGenerating(false);
      setLibraryFormData({
        industry: '',
        companySize: '',
        products: '',
        geographies: '',
        systems: '',
        regulations: '',
        outsourcing: '',
        incidents: '',
        initiatives: ''
      });
      await loadData();
      alert('✨ AI successfully generated Risk-Control Library!');
    } catch (error: unknown) {
      console.error('Failed to generate library:', error);
      const errorMessage = error instanceof Error ? error.message : 'Please try again.';
      console.error('Error details:', errorMessage, error);
      alert(`Failed to generate library: ${errorMessage}`);
      setIsGenerating(false);
    }
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'critical':
        return 'destructive';
      case 'high':
        return 'warning';
      case 'medium':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getControlTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      preventive: 'bg-blue-500 text-white',
      detective: 'bg-yellow-500 text-white',
      corrective: 'bg-green-500 text-white',
    };
    return <Badge className={colors[type]}>{type.charAt(0).toUpperCase() + type.slice(1)}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Risk-Control Library</h1>
          <p className="text-muted-foreground mt-1">
            Customized library generated from organizational profile and best practices
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isGenerateOpen} onOpenChange={setIsGenerateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Sparkles className="h-4 w-4 mr-2" />
                Generate Library
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>Generate Customized Risk-Control Library</DialogTitle>
                <DialogDescription>
                  AI will generate a tailored library based on your organizational context
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Industry</Label>
                    <Select value={libraryFormData.industry} onValueChange={(value) => setLibraryFormData({...libraryFormData, industry: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select industry" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Financial Services">Financial Services</SelectItem>
                        <SelectItem value="Healthcare">Healthcare</SelectItem>
                        <SelectItem value="Manufacturing">Manufacturing</SelectItem>
                        <SelectItem value="Technology">Technology</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Company Size</Label>
                    <Select value={libraryFormData.companySize} onValueChange={(value) => setLibraryFormData({...libraryFormData, companySize: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select size" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="small">Small (&lt;100 employees)</SelectItem>
                        <SelectItem value="medium">Medium (100-1000)</SelectItem>
                        <SelectItem value="large">Large (&gt;1000)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label>Products/Services</Label>
                  <Input 
                    placeholder="e.g., Payment processing, Lending, Insurance" 
                    value={libraryFormData.products}
                    onChange={(e) => setLibraryFormData({...libraryFormData, products: e.target.value})}
                  />
                </div>

                <div>
                  <Label>Geographies</Label>
                  <Input 
                    placeholder="e.g., US, EU, APAC" 
                    value={libraryFormData.geographies}
                    onChange={(e) => setLibraryFormData({...libraryFormData, geographies: e.target.value})}
                  />
                </div>

                <div>
                  <Label>Key Systems</Label>
                  <Input 
                    placeholder="e.g., SAP, Salesforce, Azure AD" 
                    value={libraryFormData.systems}
                    onChange={(e) => setLibraryFormData({...libraryFormData, systems: e.target.value})}
                  />
                </div>

                <div>
                  <Label>Regulatory Themes</Label>
                  <Input 
                    placeholder="e.g., SOX, GDPR, PCI-DSS" 
                    value={libraryFormData.regulations}
                    onChange={(e) => setLibraryFormData({...libraryFormData, regulations: e.target.value})}
                  />
                </div>

                <div>
                  <Label>Outsourcing Partners</Label>
                  <Input 
                    placeholder="Number and criticality of vendors" 
                    value={libraryFormData.outsourcing}
                    onChange={(e) => setLibraryFormData({...libraryFormData, outsourcing: e.target.value})}
                  />
                </div>

                <div>
                  <Label>Known Incidents (Last 2 Years)</Label>
                  <Input 
                    placeholder="Brief description of key incidents" 
                    value={libraryFormData.incidents}
                    onChange={(e) => setLibraryFormData({...libraryFormData, incidents: e.target.value})}
                  />
                </div>

                <div>
                  <Label>Strategic Initiatives</Label>
                  <Input 
                    placeholder="e.g., Cloud migration, M&A, New market entry" 
                    value={libraryFormData.initiatives}
                    onChange={(e) => setLibraryFormData({...libraryFormData, initiatives: e.target.value})}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsGenerateOpen(false)} disabled={isGenerating}>
                  Cancel
                </Button>
                <Button onClick={handleGenerateLibrary} disabled={isGenerating}>
                  <Sparkles className="h-4 w-4 mr-2" />
                  {isGenerating ? 'Generating...' : 'Generate Library'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Button variant="outline" onClick={handleAddCustomEntry}>
            <Plus className="h-4 w-4 mr-2" />
            Add Custom Entry
          </Button>
        </div>
      </div>

      <Tabs defaultValue="risks">
        <TabsList>
          <TabsTrigger value="risks">Risk Library</TabsTrigger>
          <TabsTrigger value="controls">Control Library</TabsTrigger>
          <TabsTrigger value="linkage">Risk-Control Linkage</TabsTrigger>
        </TabsList>

        <TabsContent value="risks" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Risk Library</CardTitle>
                  <CardDescription>Tailored to your objectives and process architecture</CardDescription>
                </div>
                <div className="relative w-72">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search risks..." className="pl-8" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {risks.map((risk) => (
                  <div key={risk.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{risk.title}</h3>
                            <Badge variant="outline">{risk.category}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{risk.description}</p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Inherent Risk:</span>
                        <div className="mt-1">
                          <Badge variant={getRiskLevelColor(risk.inherentRisk)}>
                            {risk.inherentRisk.toUpperCase()}
                          </Badge>
                        </div>
                      </div>
                      <div>
                        <span className="font-medium">Residual Risk:</span>
                        <div className="mt-1">
                          <Badge variant={getRiskLevelColor(risk.residualRisk)}>
                            {risk.residualRisk.toUpperCase()}
                          </Badge>
                        </div>
                      </div>
                      <div>
                        <span className="font-medium">Owner:</span>
                        <p className="text-muted-foreground mt-1">{risk.owner}</p>
                      </div>
                    </div>

                    <div className="text-sm">
                      <span className="font-medium">Linked Objectives:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {risk.linkedObjectives.map((obj, idx) => (
                          <Badge key={idx} variant="secondary">
                            {obj}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="text-sm">
                      <span className="font-medium">Linked Controls:</span>
                      <p className="text-muted-foreground mt-1">
                        {risk.linkedControls.length} control(s) mitigating this risk
                      </p>
                    </div>

                    <div className="flex gap-2 pt-2 border-t">
                      <Button size="sm" variant="outline" onClick={() => handleViewDetails(risk)}>View Details</Button>
                      <Button size="sm" variant="outline" onClick={() => handleViewControls(risk)}>View Controls</Button>
                      <Button size="sm" variant="outline" onClick={() => handleRiskAssessment(risk)}>Risk Assessment</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="controls" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Control Library</CardTitle>
                  <CardDescription>Manual vs automated, with system-specific controls</CardDescription>
                </div>
                <div className="relative w-72">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search controls..." className="pl-8" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {controls.map((control) => (
                  <div key={control.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <Shield className="h-5 w-5 text-primary mt-0.5" />
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{control.name}</h3>
                            {getControlTypeBadge(control.type)}
                            <Badge variant="outline">{control.automation}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{control.description}</p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Frequency:</span>
                        <p className="text-muted-foreground">{control.frequency}</p>
                      </div>
                      <div>
                        <span className="font-medium">Owner:</span>
                        <p className="text-muted-foreground">{control.owner}</p>
                      </div>
                      <div>
                        <span className="font-medium">Evidence Source:</span>
                        <p className="text-muted-foreground">{control.evidenceSource}</p>
                      </div>
                    </div>

                    <div className="text-sm">
                      <span className="font-medium">Linked Risks:</span>
                      <p className="text-muted-foreground mt-1">
                        Mitigates {control.linkedRisks.length} identified risk(s)
                      </p>
                    </div>

                    <div className="flex gap-2 pt-2 border-t">
                      <Button size="sm" variant="outline">View Details</Button>
                      <Button size="sm" variant="outline">Test Scripts</Button>
                      <Button size="sm" variant="outline">Evidence</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="linkage" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Risk-Control Linkage Matrix</CardTitle>
              <CardDescription>Comprehensive mapping ensuring all risks are adequately controlled</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {risks.map((risk) => (
                  <div key={risk.id} className="border rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <AlertTriangle className="h-4 w-4 text-yellow-600" />
                      <h3 className="font-semibold">{risk.title}</h3>
                      <Badge variant={getRiskLevelColor(risk.residualRisk)}>
                        {risk.residualRisk.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="pl-6 space-y-2">
                      {risk.linkedControls.map((controlId) => {
                        const control = controls.find((c) => c.id === controlId);
                        if (!control) {
                          const materialControl = controlId;
                          return (
                            <div key={controlId} className="flex items-center gap-2 text-sm">
                              <Link2 className="h-4 w-4 text-primary" />
                              <span className="text-muted-foreground">Material Control: {materialControl}</span>
                            </div>
                          );
                        }
                        return (
                          <div key={control.id} className="flex items-center gap-2 text-sm">
                            <Link2 className="h-4 w-4 text-primary" />
                            <span>{control.name}</span>
                            {getControlTypeBadge(control.type)}
                            <Badge variant="outline" className="text-xs">{control.automation}</Badge>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Linkage Quality Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Risks with no controls</span>
                  <Badge variant="success">0</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Controls with no risks</span>
                  <Badge variant="warning">1</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">High risks with single control</span>
                  <Badge variant="warning">0</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Linkage completeness</span>
                  <Badge variant="success">98%</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Custom Entry Dialog */}
      <Dialog open={isAddCustomOpen} onOpenChange={setIsAddCustomOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add Custom Entry</DialogTitle>
            <DialogDescription>
              Add a custom risk or control to the library
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Entry Type *</Label>
              <Select value={customEntryType} onValueChange={(value: 'risk' | 'control') => setCustomEntryType(value)}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="risk">Risk</SelectItem>
                  <SelectItem value="control">Control</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {customEntryType === 'risk' ? (
              <>
                <div>
                  <Label>Risk Title *</Label>
                  <Input 
                    placeholder="e.g., Cyber Security Risk"
                    value={customRiskData.title}
                    onChange={(e) => setCustomRiskData({...customRiskData, title: e.target.value})}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Description *</Label>
                  <Textarea 
                    placeholder="Describe the risk in detail"
                    value={customRiskData.description}
                    onChange={(e) => setCustomRiskData({...customRiskData, description: e.target.value})}
                    className="mt-1"
                    rows={4}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Category</Label>
                    <Input 
                      placeholder="e.g., Information Security"
                      value={customRiskData.category}
                      onChange={(e) => setCustomRiskData({...customRiskData, category: e.target.value})}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Inherent Risk Level *</Label>
                    <Select value={customRiskData.inherentRisk} onValueChange={(value) => setCustomRiskData({...customRiskData, inherentRisk: value})}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label>Risk Owner *</Label>
                  <Input 
                    placeholder="e.g., Chief Information Officer"
                    value={customRiskData.owner}
                    onChange={(e) => setCustomRiskData({...customRiskData, owner: e.target.value})}
                    className="mt-1"
                  />
                </div>
              </>
            ) : (
              <>
                <div>
                  <Label>Control Name *</Label>
                  <Input 
                    placeholder="e.g., Access Control Review"
                    value={customControlData.name}
                    onChange={(e) => setCustomControlData({...customControlData, name: e.target.value})}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Description *</Label>
                  <Textarea 
                    placeholder="Describe the control in detail"
                    value={customControlData.description}
                    onChange={(e) => setCustomControlData({...customControlData, description: e.target.value})}
                    className="mt-1"
                    rows={4}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Control Type *</Label>
                    <Select value={customControlData.type} onValueChange={(value) => setCustomControlData({...customControlData, type: value})}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="preventive">Preventive</SelectItem>
                        <SelectItem value="detective">Detective</SelectItem>
                        <SelectItem value="corrective">Corrective</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Frequency *</Label>
                    <Select value={customControlData.frequency} onValueChange={(value) => setCustomControlData({...customControlData, frequency: value})}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="continuous">Continuous</SelectItem>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="quarterly">Quarterly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label>Control Owner *</Label>
                  <Input 
                    placeholder="e.g., IT Security Manager"
                    value={customControlData.owner}
                    onChange={(e) => setCustomControlData({...customControlData, owner: e.target.value})}
                    className="mt-1"
                  />
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddCustomOpen(false)}>Cancel</Button>
            <Button onClick={handleAddCustomSubmit}>
              <Plus className="h-4 w-4 mr-2" />
              Add {customEntryType === 'risk' ? 'Risk' : 'Control'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Details Dialog */}
      <Dialog open={isViewDetailsOpen} onOpenChange={setIsViewDetailsOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{selectedRisk?.title}</DialogTitle>
            <DialogDescription>
              Comprehensive risk details and metadata
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="border rounded-lg p-4 bg-muted/50">
              <h4 className="font-medium mb-2">Description</h4>
              <p className="text-sm text-muted-foreground">{selectedRisk?.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="border rounded-lg p-3">
                <p className="text-sm font-medium mb-1">Category</p>
                <Badge>{selectedRisk?.category}</Badge>
              </div>
              <div className="border rounded-lg p-3">
                <p className="text-sm font-medium mb-1">Owner</p>
                <p className="text-sm text-muted-foreground">{selectedRisk?.owner}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="border rounded-lg p-3">
                <p className="text-sm font-medium mb-2">Inherent Risk</p>
                <Badge variant={getRiskLevelColor(selectedRisk?.inherentRisk || 'medium')}>
                  {selectedRisk?.inherentRisk.toUpperCase()}
                </Badge>
              </div>
              <div className="border rounded-lg p-3">
                <p className="text-sm font-medium mb-2">Residual Risk</p>
                <Badge variant={getRiskLevelColor(selectedRisk?.residualRisk || 'medium')}>
                  {selectedRisk?.residualRisk.toUpperCase()}
                </Badge>
              </div>
            </div>

            <div className="border rounded-lg p-4">
              <p className="font-medium mb-2">Linked Objectives</p>
              <div className="flex flex-wrap gap-2">
                {selectedRisk?.linkedObjectives.map((obj, idx) => (
                  <Badge key={idx} variant="secondary">{obj}</Badge>
                ))}
                {(!selectedRisk?.linkedObjectives || selectedRisk.linkedObjectives.length === 0) && (
                  <p className="text-sm text-muted-foreground">No objectives linked</p>
                )}
              </div>
            </div>

            <div className="border rounded-lg p-4">
              <p className="font-medium mb-2">Mitigation Controls</p>
              <p className="text-sm text-muted-foreground">
                {selectedRisk?.linkedControls.length || 0} control(s) configured to mitigate this risk
              </p>
            </div>

            {selectedRisk?.lastAssessed && (
              <div className="border rounded-lg p-3 bg-blue-50">
                <p className="text-sm">
                  <strong>Last Assessed:</strong> {new Date(selectedRisk.lastAssessed).toLocaleDateString()}
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDetailsOpen(false)}>Close</Button>
            <Button onClick={() => {
              setIsViewDetailsOpen(false);
              handleRiskAssessment(selectedRisk!);
            }}>
              Run Assessment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Controls Dialog */}
      <Dialog open={isViewControlsOpen} onOpenChange={setIsViewControlsOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Controls Mitigating: {selectedRisk?.title}</DialogTitle>
            <DialogDescription>
              View all controls linked to this risk
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            {selectedRisk && controls.filter(c => c.linkedRisks.includes(selectedRisk.id.toString())).length > 0 ? (
              controls.filter(c => c.linkedRisks.includes(selectedRisk.id.toString())).map((control) => (
                <div key={control.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Shield className="h-5 w-5 text-blue-600" />
                      <h4 className="font-semibold">{control.name}</h4>
                    </div>
                    <Badge variant="outline">{control.type}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{control.description}</p>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Frequency:</span>
                      <p className="text-muted-foreground">{control.frequency}</p>
                    </div>
                    <div>
                      <span className="font-medium">Automation:</span>
                      <p className="text-muted-foreground">{control.automation}</p>
                    </div>
                    <div>
                      <span className="font-medium">Owner:</span>
                      <p className="text-muted-foreground">{control.owner}</p>
                    </div>
                  </div>
                  {control.effectiveness && (
                    <div className="mt-3 pt-3 border-t">
                      <span className="font-medium text-sm">Effectiveness: </span>
                      <Badge variant="success">{control.effectiveness}</Badge>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No controls currently linked to this risk</p>
                <Button variant="outline" className="mt-4" onClick={() => setIsViewControlsOpen(false)}>
                  <Link2 className="h-4 w-4 mr-2" />
                  Link Controls
                </Button>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewControlsOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Risk Assessment Dialog */}
      <Dialog open={isRiskAssessmentOpen} onOpenChange={setIsRiskAssessmentOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Risk Assessment: {selectedRisk?.title}</DialogTitle>
            <DialogDescription>
              Conduct qualitative risk assessment
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="border rounded-lg p-4">
                <p className="text-sm font-medium mb-2">Current Inherent Risk</p>
                <Badge variant={getRiskLevelColor(selectedRisk?.inherentRisk || 'medium')} className="text-lg">
                  {selectedRisk?.inherentRisk.toUpperCase()}
                </Badge>
              </div>
              <div className="border rounded-lg p-4">
                <p className="text-sm font-medium mb-2">Current Residual Risk</p>
                <Badge variant={getRiskLevelColor(selectedRisk?.residualRisk || 'medium')} className="text-lg">
                  {selectedRisk?.residualRisk.toUpperCase()}
                </Badge>
              </div>
            </div>

            <div className="border rounded-lg p-4 bg-muted/50">
              <h4 className="font-medium mb-3">Assessment Factors</h4>
              <div className="space-y-3">
                <div>
                  <Label>Impact Severity</Label>
                  <Select defaultValue="medium">
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low - Minor impact</SelectItem>
                      <SelectItem value="medium">Medium - Moderate impact</SelectItem>
                      <SelectItem value="high">High - Significant impact</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Likelihood</Label>
                  <Select defaultValue="medium">
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low - Unlikely to occur</SelectItem>
                      <SelectItem value="medium">Medium - Possible</SelectItem>
                      <SelectItem value="high">High - Likely to occur</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Control Effectiveness</Label>
                  <Select defaultValue="medium">
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low - Controls ineffective</SelectItem>
                      <SelectItem value="medium">Medium - Partially effective</SelectItem>
                      <SelectItem value="high">High - Highly effective</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="border rounded-lg p-4">
              <Label>Assessment Notes</Label>
              <Textarea 
                placeholder="Record your assessment observations and rationale..."
                className="mt-2"
                rows={4}
              />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
              <p className="text-blue-900">
                <strong>Note:</strong> This assessment will update the risk's residual risk level based on the factors above.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRiskAssessmentOpen(false)}>Cancel</Button>
            <Button onClick={() => {
              setIsRiskAssessmentOpen(false);
              alert('✅ Risk assessment completed and saved!');
            }}>
              Complete Assessment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
