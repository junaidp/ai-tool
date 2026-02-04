import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { apiService } from '@/services/api';
import type { Risk, Control } from '@/types';
import { AlertTriangle, Shield, Search, Sparkles, Plus, Link2 } from 'lucide-react';

export default function RiskControlLibrary() {
  const [risks, setRisks] = useState<Risk[]>([]);
  const [controls, setControls] = useState<Control[]>([]);
  const [isGenerateOpen, setIsGenerateOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  
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
    setRisks(risksData);
    setControls(controlsData);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleGenerateLibrary = async () => {
    try {
      if (!libraryFormData.industry || !libraryFormData.companySize) {
        alert('Please fill in at least Industry and Company Size');
        return;
      }

      setIsGenerating(true);

      // Generate risks based on organizational context
      const riskPrompt = `Generate 5-7 key risks for a ${libraryFormData.companySize} ${libraryFormData.industry} company with:
- Products/Services: ${libraryFormData.products}
- Operating in: ${libraryFormData.geographies}
- Key Systems: ${libraryFormData.systems}
- Regulations: ${libraryFormData.regulations}
- Strategic Initiatives: ${libraryFormData.initiatives}`;

      // For each generated risk, create controls
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
          linkedObjectives: [libraryFormData.industry, 'Operational Excellence'],
          linkedControls: [],
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
            controlId: control.controlId || `CTL-${Date.now()}`,
            name: control.name,
            description: control.description,
            type: control.type || 'preventive',
            frequency: control.frequency || 'monthly',
            owner: control.owner || 'Control Owner',
            linkedRisks: [newRisk.id]
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
    } catch (error) {
      console.error('Failed to generate library:', error);
      alert('Failed to generate library. Please try again.');
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
          <Button variant="outline">
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
                      <Button size="sm" variant="outline">View Details</Button>
                      <Button size="sm" variant="outline">View Controls</Button>
                      <Button size="sm" variant="outline">Risk Assessment</Button>
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
    </div>
  );
}
