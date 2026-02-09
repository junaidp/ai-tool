import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { apiService } from '@/services/api';
import type { FrameworkComponent } from '@/types';
import { Building2, Users, Target, Shield, FileText, TrendingUp, Plus, Download } from 'lucide-react';

const componentIcons = {
  governance: Users,
  risk_taxonomy: Target,
  risk_appetite: TrendingUp,
  control_model: Shield,
  three_lines: Building2,
  policy: FileText,
  reporting: TrendingUp,
};

export default function FrameworkBuilder() {
  const [components, setComponents] = useState<FrameworkComponent[]>([]);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [isAddComponentOpen, setIsAddComponentOpen] = useState(false);
  const [selectedComponent, setSelectedComponent] = useState<FrameworkComponent | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isViewDetailsOpen, setIsViewDetailsOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [componentFormData, setComponentFormData] = useState({
    name: '',
    type: 'governance',
    description: '',
    owner: ''
  });

  useEffect(() => {
    apiService.getFrameworkComponents().then(setComponents);
  }, []);

  const loadComponents = async () => {
    const data = await apiService.getFrameworkComponents();
    setComponents(data);
  };

  const handleExportBlueprint = () => {
    try {
      const blueprintContent = `
# RISK MANAGEMENT & INTERNAL CONTROLS FRAMEWORK BLUEPRINT

Generated: ${new Date().toLocaleDateString()}

## Framework Components

${components.map(c => `
### ${c.name}
**Type:** ${c.type}
**Status:** ${c.status}
**Owner:** ${c.owner}
**Description:** ${c.description}
${c.lastReviewed ? `**Last Reviewed:** ${new Date(c.lastReviewed).toLocaleDateString()}` : ''}
`).join('\n')}

## Framework Structure

This framework consists of ${components.length} components across governance, risk, control, and assurance domains.

---
*This document is confidential and proprietary*
      `;

      const blob = new Blob([blueprintContent], { type: 'text/markdown' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `framework-blueprint-${new Date().toISOString().split('T')[0]}.md`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      alert('✅ Framework blueprint exported successfully!');
    } catch (error) {
      console.error('Failed to export blueprint:', error);
      alert('Failed to export blueprint. Please try again.');
    }
  };

  const handleAddComponent = () => {
    setComponentFormData({
      name: '',
      type: 'governance',
      description: '',
      owner: ''
    });
    setIsAddComponentOpen(true);
  };

  const handleAddComponentSubmit = async () => {
    if (!componentFormData.name || !componentFormData.description || !componentFormData.owner) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      await apiService.createFrameworkComponent({
        ...componentFormData,
        status: 'in_review',
        lastReviewed: null
      });
      setIsAddComponentOpen(false);
      await loadComponents();
      alert('✅ Component added successfully!');
    } catch (error) {
      console.error('Failed to add component:', error);
      alert('Failed to add component. Please try again.');
    }
  };

  const handleEditComponent = (component: FrameworkComponent) => {
    setSelectedComponent(component);
    setComponentFormData({
      name: component.name,
      type: component.type,
      description: component.description,
      owner: component.owner
    });
    setIsEditOpen(true);
  };

  const handleEditSubmit = async () => {
    if (!selectedComponent) return;

    try {
      await apiService.updateFrameworkComponent(selectedComponent.id, componentFormData);
      setIsEditOpen(false);
      setSelectedComponent(null);
      await loadComponents();
      alert('✅ Component updated successfully!');
    } catch (error) {
      console.error('Failed to update component:', error);
      alert('Failed to update component. Please try again.');
    }
  };

  const handleViewDetails = (component: FrameworkComponent) => {
    setSelectedComponent(component);
    setIsViewDetailsOpen(true);
  };

  const handleLaunchWizard = () => {
    setWizardStep(1);
    setIsWizardOpen(true);
  };

  const handleWizardNext = () => {
    if (wizardStep < 3) {
      setWizardStep(wizardStep + 1);
    } else {
      setIsWizardOpen(false);
      alert('✅ Framework wizard completed! Your framework configuration has been saved.');
    }
  };

  const groupedComponents = components.reduce((acc, component) => {
    if (!acc[component.type]) acc[component.type] = [];
    acc[component.type].push(component);
    return acc;
  }, {} as Record<string, FrameworkComponent[]>);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Framework Builder</h1>
          <p className="text-muted-foreground mt-1">
            Design and configure your risk management & internal controls framework
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportBlueprint}>
            <Download className="h-4 w-4 mr-2" />
            Export Blueprint
          </Button>
          <Button onClick={handleAddComponent}>
            <Plus className="h-4 w-4 mr-2" />
            Add Component
          </Button>
        </div>
      </div>

      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <CardTitle>Guided Framework Builder</CardTitle>
          <CardDescription>
            Step-by-step wizard to capture organizational context and build your framework
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleLaunchWizard}>Launch Framework Wizard</Button>
        </CardContent>
      </Card>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All Components</TabsTrigger>
          <TabsTrigger value="governance">Governance</TabsTrigger>
          <TabsTrigger value="risk">Risk</TabsTrigger>
          <TabsTrigger value="control">Control</TabsTrigger>
          <TabsTrigger value="assurance">Assurance</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {components.map((component) => {
              const Icon = componentIcons[component.type];
              return (
                <Card key={component.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <Icon className="h-5 w-5 text-primary" />
                        <CardTitle className="text-base">{component.name}</CardTitle>
                      </div>
                      <Badge variant={component.status === 'approved' ? 'success' : 'warning'}>
                        {component.status === 'approved' ? 'Approved' : 'In Review'}
                      </Badge>
                    </div>
                    <CardDescription>{component.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Owner:</span>
                        <span className="font-medium">{component.owner}</span>
                      </div>
                      {component.lastReviewed && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Last Reviewed:</span>
                          <span>{new Date(component.lastReviewed).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button size="sm" variant="outline" className="flex-1" onClick={() => handleEditComponent(component)}>Edit</Button>
                      <Button size="sm" variant="outline" className="flex-1" onClick={() => handleViewDetails(component)}>View Details</Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="governance">
          <Card>
            <CardHeader>
              <CardTitle>Governance Operating Model</CardTitle>
              <CardDescription>Committee structures, decision rights, and escalation routes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {groupedComponents.governance?.map((component) => (
                <div key={component.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">{component.name}</h3>
                    <Badge variant={component.status === 'approved' ? 'success' : 'warning'}>
                      {component.status === 'approved' ? 'Approved' : 'In Review'}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{component.description}</p>
                  <div className="mt-3 text-sm">
                    <span className="text-muted-foreground">Owner: </span>
                    <span className="font-medium">{component.owner}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="risk">
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Risk Taxonomy</CardTitle>
                <CardDescription>Enterprise risk categories and objective mapping</CardDescription>
              </CardHeader>
              <CardContent>
                {groupedComponents.risk_taxonomy?.map((component) => (
                  <div key={component.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">{component.name}</h3>
                      <Badge variant="success">Approved</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{component.description}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Risk Appetite Framework</CardTitle>
                <CardDescription>Appetite statements, tolerances, and triggers</CardDescription>
              </CardHeader>
              <CardContent>
                {groupedComponents.risk_appetite?.map((component) => (
                  <div key={component.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">{component.name}</h3>
                      <Badge variant="success">Approved</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{component.description}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="control">
          <Card>
            <CardHeader>
              <CardTitle>Control Model</CardTitle>
              <CardDescription>Preventive, detective, and corrective controls with dependencies</CardDescription>
            </CardHeader>
            <CardContent>
              {groupedComponents.control_model?.map((component) => (
                <div key={component.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">{component.name}</h3>
                    <Badge variant="success">Approved</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{component.description}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assurance">
          <Card>
            <CardHeader>
              <CardTitle>Three Lines of Defence</CardTitle>
              <CardDescription>RACI matrix and assurance mapping</CardDescription>
            </CardHeader>
            <CardContent>
              {groupedComponents.three_lines?.map((component) => (
                <div key={component.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">{component.name}</h3>
                    <Badge variant="warning">In Review</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{component.description}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>Framework Outputs</CardTitle>
          <CardDescription>Generated documentation and artifacts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2">
            <Button variant="outline" className="justify-start h-auto py-4">
              <div className="text-left">
                <div className="font-medium">Framework Blueprint Document</div>
                <div className="text-xs text-muted-foreground">Complete framework design documentation</div>
              </div>
            </Button>
            <Button variant="outline" className="justify-start h-auto py-4">
              <div className="text-left">
                <div className="font-medium">RACI Matrix</div>
                <div className="text-xs text-muted-foreground">Roles and responsibilities mapping</div>
              </div>
            </Button>
            <Button variant="outline" className="justify-start h-auto py-4">
              <div className="text-left">
                <div className="font-medium">Workflow Diagrams</div>
                <div className="text-xs text-muted-foreground">Process flows and escalation routes</div>
              </div>
            </Button>
            <Button variant="outline" className="justify-start h-auto py-4">
              <div className="text-left">
                <div className="font-medium">Effectiveness Mapping</div>
                <div className="text-xs text-muted-foreground">Framework linkage to criteria</div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Framework Wizard Dialog */}
      <Dialog open={isWizardOpen} onOpenChange={setIsWizardOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Framework Wizard - Step {wizardStep} of 3</DialogTitle>
            <DialogDescription>
              {wizardStep === 1 && 'Define your organizational context'}
              {wizardStep === 2 && 'Configure risk and control parameters'}
              {wizardStep === 3 && 'Set up governance structure'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {wizardStep === 1 && (
              <>
                <div>
                  <Label>Industry / Sector *</Label>
                  <Select>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select industry" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="financial">Financial Services</SelectItem>
                      <SelectItem value="technology">Technology</SelectItem>
                      <SelectItem value="healthcare">Healthcare</SelectItem>
                      <SelectItem value="manufacturing">Manufacturing</SelectItem>
                      <SelectItem value="retail">Retail</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Company Size *</Label>
                  <Select>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select size" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="small">Small (1-50 employees)</SelectItem>
                      <SelectItem value="medium">Medium (51-500 employees)</SelectItem>
                      <SelectItem value="large">Large (501+ employees)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Operating Model</Label>
                  <Textarea 
                    placeholder="Describe your operating model (e.g., centralized, decentralized, matrix)"
                    className="mt-1"
                  />
                </div>
              </>
            )}

            {wizardStep === 2 && (
              <>
                <div>
                  <Label>Risk Appetite Level *</Label>
                  <Select>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low - Conservative approach</SelectItem>
                      <SelectItem value="moderate">Moderate - Balanced approach</SelectItem>
                      <SelectItem value="high">High - Aggressive approach</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Primary Control Framework *</Label>
                  <Select>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select framework" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="coso">COSO Internal Control</SelectItem>
                      <SelectItem value="iso27001">ISO 27001</SelectItem>
                      <SelectItem value="nist">NIST Cybersecurity Framework</SelectItem>
                      <SelectItem value="sox">SOX Compliance</SelectItem>
                      <SelectItem value="custom">Custom Framework</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Key Risk Categories</Label>
                  <Textarea 
                    placeholder="List your main risk categories (e.g., Strategic, Financial, Operational, Compliance)"
                    className="mt-1"
                  />
                </div>
              </>
            )}

            {wizardStep === 3 && (
              <>
                <div>
                  <Label>Governance Structure *</Label>
                  <Select>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select structure" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="board">Board-led</SelectItem>
                      <SelectItem value="committee">Committee-based</SelectItem>
                      <SelectItem value="hybrid">Hybrid Model</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Three Lines Model *</Label>
                  <Select>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select implementation" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="traditional">Traditional Three Lines</SelectItem>
                      <SelectItem value="iia2020">IIA 2020 Model</SelectItem>
                      <SelectItem value="custom">Custom Model</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Reporting Frequency *</Label>
                  <Select>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                      <SelectItem value="annual">Annual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
              <p className="text-blue-900">
                <strong>Note:</strong> Your inputs will be used to configure framework components and generate tailored templates.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsWizardOpen(false)}>Cancel</Button>
            <Button onClick={handleWizardNext}>
              {wizardStep < 3 ? 'Next Step' : 'Complete Wizard'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Component Dialog */}
      <Dialog open={isAddComponentOpen} onOpenChange={setIsAddComponentOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add Framework Component</DialogTitle>
            <DialogDescription>
              Create a new component for your risk management framework
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Component Name *</Label>
              <Input 
                placeholder="e.g., Risk Assessment Process"
                value={componentFormData.name}
                onChange={(e) => setComponentFormData({...componentFormData, name: e.target.value})}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Component Type *</Label>
              <Select value={componentFormData.type} onValueChange={(value) => setComponentFormData({...componentFormData, type: value})}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="governance">Governance</SelectItem>
                  <SelectItem value="risk_taxonomy">Risk Taxonomy</SelectItem>
                  <SelectItem value="risk_appetite">Risk Appetite</SelectItem>
                  <SelectItem value="control_model">Control Model</SelectItem>
                  <SelectItem value="three_lines">Three Lines</SelectItem>
                  <SelectItem value="policy">Policy</SelectItem>
                  <SelectItem value="reporting">Reporting</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Description *</Label>
              <Textarea 
                placeholder="Describe the component's purpose and scope"
                value={componentFormData.description}
                onChange={(e) => setComponentFormData({...componentFormData, description: e.target.value})}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Owner *</Label>
              <Input 
                placeholder="e.g., Chief Risk Officer"
                value={componentFormData.owner}
                onChange={(e) => setComponentFormData({...componentFormData, owner: e.target.value})}
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddComponentOpen(false)}>Cancel</Button>
            <Button onClick={handleAddComponentSubmit}>Add Component</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Component Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Component</DialogTitle>
            <DialogDescription>
              Update component details
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Component Name *</Label>
              <Input 
                value={componentFormData.name}
                onChange={(e) => setComponentFormData({...componentFormData, name: e.target.value})}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Component Type *</Label>
              <Select value={componentFormData.type} onValueChange={(value) => setComponentFormData({...componentFormData, type: value})}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="governance">Governance</SelectItem>
                  <SelectItem value="risk_taxonomy">Risk Taxonomy</SelectItem>
                  <SelectItem value="risk_appetite">Risk Appetite</SelectItem>
                  <SelectItem value="control_model">Control Model</SelectItem>
                  <SelectItem value="three_lines">Three Lines</SelectItem>
                  <SelectItem value="policy">Policy</SelectItem>
                  <SelectItem value="reporting">Reporting</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Description *</Label>
              <Textarea 
                value={componentFormData.description}
                onChange={(e) => setComponentFormData({...componentFormData, description: e.target.value})}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Owner *</Label>
              <Input 
                value={componentFormData.owner}
                onChange={(e) => setComponentFormData({...componentFormData, owner: e.target.value})}
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
            <Button onClick={handleEditSubmit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Details Dialog */}
      <Dialog open={isViewDetailsOpen} onOpenChange={setIsViewDetailsOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{selectedComponent?.name}</DialogTitle>
            <DialogDescription>
              Component details and configuration
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="border rounded-lg p-3">
                <p className="text-sm font-medium mb-1">Type</p>
                <Badge>{selectedComponent?.type}</Badge>
              </div>
              <div className="border rounded-lg p-3">
                <p className="text-sm font-medium mb-1">Status</p>
                <Badge variant={selectedComponent?.status === 'approved' ? 'success' : 'warning'}>
                  {selectedComponent?.status === 'approved' ? 'Approved' : 'In Review'}
                </Badge>
              </div>
            </div>

            <div className="border rounded-lg p-4">
              <p className="font-medium mb-2">Description</p>
              <p className="text-sm text-muted-foreground">{selectedComponent?.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="border rounded-lg p-3">
                <p className="text-sm font-medium mb-1">Owner</p>
                <p className="text-sm text-muted-foreground">{selectedComponent?.owner}</p>
              </div>
              <div className="border rounded-lg p-3">
                <p className="text-sm font-medium mb-1">Last Reviewed</p>
                <p className="text-sm text-muted-foreground">
                  {selectedComponent?.lastReviewed 
                    ? new Date(selectedComponent.lastReviewed).toLocaleDateString() 
                    : 'Not reviewed yet'}
                </p>
              </div>
            </div>

            <div className="border rounded-lg p-4 bg-muted/50">
              <p className="font-medium mb-2">Related Components</p>
              <p className="text-sm text-muted-foreground">
                This component integrates with other framework elements in the {selectedComponent?.type} domain.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDetailsOpen(false)}>Close</Button>
            <Button onClick={() => {
              setIsViewDetailsOpen(false);
              if (selectedComponent) handleEditComponent(selectedComponent);
            }}>
              Edit Component
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
