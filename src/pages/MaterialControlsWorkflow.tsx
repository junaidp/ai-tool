import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { apiService } from '@/services/api';
import type { PrincipalRisk, Process, AsIsControl, Gap, ToBeControl } from '@/types';
import { AlertTriangle, Building2, ChevronRight, ChevronLeft, CheckCircle2, Sparkles, Target, FileText, Download, Plus, Trash2 } from 'lucide-react';

type WorkflowStep = 0 | 1 | 2 | 3 | 4 | 5 | 6;

interface SelectedProcess {
  processId: string;
  processName: string;
  relevance: 'primary' | 'secondary';
  rationale: string;
}

interface MaturityAnswers {
  processStructure: string;
  procedureExists: string;
  rolesDefinition: string;
  automation: string;
  dataSources: string;
  interfaces: string;
  volumeCriticality: string;
  failureImpact: string;
  changeFrequency: string;
  monitoring: string;
  priorIssues: string;
}

export default function MaterialControlsWorkflow() {
  const [currentStep, setCurrentStep] = useState<WorkflowStep>(0);
  
  // Step 0: Select Principal Risk
  const [principalRisks, setPrincipalRisks] = useState<PrincipalRisk[]>([]);
  const [selectedRisk, setSelectedRisk] = useState<PrincipalRisk | null>(null);
  
  // Step 1: Process Mapping
  const [allProcesses, setAllProcesses] = useState<Process[]>([]);
  const [selectedProcesses, setSelectedProcesses] = useState<SelectedProcess[]>([]);
  const [newProcessData, setNewProcessData] = useState({ name: '', scope: '', owner: '' });
  
  // Step 2: Maturity Assessment
  const [currentProcessIdx, setCurrentProcessIdx] = useState(0);
  const [maturityAnswers, setMaturityAnswers] = useState<Record<string, MaturityAnswers>>({});
  
  // Step 3: Standard Controls
  const [standardControls, setStandardControls] = useState<any[]>([]);
  const [controlApplicability, setControlApplicability] = useState<Record<string, boolean>>({});
  
  // Step 4: As-Is Controls
  const [asIsControls, setAsIsControls] = useState<any[]>([]);
  
  // Step 5: Gaps
  const [gaps, setGaps] = useState<Gap[]>([]);
  
  // Step 6: To-Be Controls
  const [toBeControls, setToBeControls] = useState<ToBeControl[]>([]);

  useEffect(() => {
    loadPrincipalRisks();
    loadProcesses();
  }, []);

  const loadPrincipalRisks = async () => {
    const data = await apiService.getPrincipalRisks();
    setPrincipalRisks(data);
  };

  const loadProcesses = async () => {
    const data = await apiService.getProcesses();
    setAllProcesses(data);
  };

  const handleSelectRisk = (risk: PrincipalRisk) => {
    setSelectedRisk(risk);
    setCurrentStep(1);
  };

  const handleAddProcess = async () => {
    if (!newProcessData.name || !newProcessData.scope || !newProcessData.owner) {
      alert('Please fill all process fields');
      return;
    }
    
    const newProcess = await apiService.createProcess({
      processName: newProcessData.name,
      processScope: newProcessData.scope,
      processOwner: newProcessData.owner,
      systemsInScope: []
    });
    
    setAllProcesses([...allProcesses, newProcess]);
    setNewProcessData({ name: '', scope: '', owner: '' });
  };

  const handleToggleProcess = (process: Process, relevance: 'primary' | 'secondary') => {
    const existing = selectedProcesses.find(p => p.processId === process.id);
    if (existing) {
      setSelectedProcesses(selectedProcesses.filter(p => p.processId !== process.id));
    } else {
      setSelectedProcesses([...selectedProcesses, {
        processId: process.id,
        processName: process.processName,
        relevance,
        rationale: ''
      }]);
    }
  };

  const handleProceedToMaturity = () => {
    if (selectedProcesses.length === 0) {
      alert('Please select at least one process');
      return;
    }
    setCurrentStep(2);
  };

  const handleSubmitMaturity = () => {
    const currentProcess = selectedProcesses[currentProcessIdx];
    if (!maturityAnswers[currentProcess.processId]) {
      alert('Please answer all questions');
      return;
    }
    
    if (currentProcessIdx < selectedProcesses.length - 1) {
      setCurrentProcessIdx(currentProcessIdx + 1);
    } else {
      generateStandardControls();
    }
  };

  const generateStandardControls = async () => {
    try {
      // Generate baseline controls based on maturity profiles
      const controls: any[] = [];
      
      for (const proc of selectedProcesses) {
        const maturity = maturityAnswers[proc.processId];
        if (maturity) {
          // Call AI to suggest standard controls
          controls.push({
            id: `std-${proc.processId}-1`,
            controlName: `Access Control - ${proc.processName}`,
            controlObjective: 'Ensure only authorized personnel can access the process',
            controlType: 'preventive',
            domainTag: 'ops',
            typicalFrequency: 'continuous',
            typicalEvidence: 'Access logs, user reviews'
          });
        }
      }
      
      setStandardControls(controls);
      setCurrentStep(3);
    } catch (error) {
      console.error('Failed to generate standard controls:', error);
    }
  };

  const handleProceedToAsIs = () => {
    setCurrentStep(4);
  };

  const handleAnalyzeGaps = () => {
    const identifiedGaps: Gap[] = [];
    
    // Simple gap analysis
    standardControls.forEach((stdControl, idx) => {
      const applicable = controlApplicability[stdControl.id] !== false;
      const hasAsIs = asIsControls.some(asIs => asIs.mappedStdControlId === stdControl.id);
      
      if (applicable && !hasAsIs) {
        identifiedGaps.push({
          id: `gap-${idx}`,
          processId: selectedProcesses[0].processId,
          stdControlId: stdControl.id,
          gapType: 'missing',
          recommendedToBeControlId: undefined
        });
      }
    });
    
    setGaps(identifiedGaps);
    setCurrentStep(5);
  };

  const generateToBeControls = async () => {
    const toBe: ToBeControl[] = gaps.map((gap, idx) => ({
      id: `tobe-${idx}`,
      processId: gap.processId,
      controlObjective: `Address gap: ${gap.gapType}`,
      ownerRole: 'Process Owner',
      frequency: 'monthly',
      evidenceType: 'Documentation',
      controlType: 'detective',
      domainTag: 'ops',
      implementationGuidance: 'Implement control to address identified gap',
      implementationStatus: 'planned'
    }));
    
    setToBeControls(toBe);
    setCurrentStep(6);
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-between mb-8">
      {[
        { num: 0, label: 'Select Risk' },
        { num: 1, label: 'Process Mapping' },
        { num: 2, label: 'Maturity Assessment' },
        { num: 3, label: 'Standard Controls' },
        { num: 4, label: 'As-Is Controls' },
        { num: 5, label: 'Gap Analysis' },
        { num: 6, label: 'To-Be & RCM' }
      ].map((step, idx) => (
        <div key={step.num} className="flex items-center flex-1">
          <div className="flex flex-col items-center flex-1">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold
              ${currentStep >= step.num ? 'bg-primary text-primary-foreground' : 'bg-gray-200 text-gray-600'}`}>
              {currentStep > step.num ? <CheckCircle2 className="h-5 w-5" /> : step.num}
            </div>
            <span className="text-xs mt-2 text-center">{step.label}</span>
          </div>
          {idx < 6 && (
            <div className={`h-1 flex-1 mx-2 ${currentStep > step.num ? 'bg-primary' : 'bg-gray-200'}`} />
          )}
        </div>
      ))}
    </div>
  );

  // Step 0: Select Risk
  const renderStep0 = () => (
    <Card>
      <CardHeader>
        <CardTitle>Select Principal Risk</CardTitle>
        <CardDescription>Choose a principal risk to build its mitigation blueprint</CardDescription>
      </CardHeader>
      <CardContent>
        {principalRisks.length === 0 ? (
          <div className="text-center py-12">
            <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">No principal risks defined.</p>
            <p className="text-sm mt-2">Go to Principal Risks page to create one.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {principalRisks.map(risk => (
              <div key={risk.id} className="border rounded-lg p-4 hover:bg-accent cursor-pointer"
                   onClick={() => handleSelectRisk(risk)}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="h-5 w-5 text-orange-600" />
                      <h3 className="font-semibold">{risk.riskTitle}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">{risk.riskStatement}</p>
                    <div className="flex gap-2 mt-2">
                      {risk.domainTags.map(tag => (
                        <Badge key={tag} variant="secondary">{tag}</Badge>
                      ))}
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    <Target className="h-4 w-4 mr-2" />
                    Build Blueprint
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );

  // Step 1: Process Mapping
  const renderStep1 = () => (
    <Card>
      <CardHeader>
        <CardTitle>Process Mapping for: {selectedRisk?.riskTitle}</CardTitle>
        <CardDescription>Select processes that materially mitigate this principal risk</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          {allProcesses.map(process => {
            const selected = selectedProcesses.find(p => p.processId === process.id);
            return (
              <div key={process.id} className={`border rounded-lg p-4 ${selected ? 'border-primary bg-primary/5' : ''}`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="font-medium">{process.processName}</h4>
                    <p className="text-sm text-muted-foreground">{process.processScope}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant={selected?.relevance === 'primary' ? 'default' : 'outline'}
                          onClick={() => handleToggleProcess(process, 'primary')}>
                    Primary
                  </Button>
                  <Button size="sm" variant={selected?.relevance === 'secondary' ? 'default' : 'outline'}
                          onClick={() => handleToggleProcess(process, 'secondary')}>
                    Secondary
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="border-t pt-4">
          <h4 className="font-medium mb-3">Add New Process</h4>
          <div className="grid grid-cols-3 gap-3">
            <Input placeholder="Process Name" value={newProcessData.name}
                   onChange={e => setNewProcessData({...newProcessData, name: e.target.value})} />
            <Input placeholder="Scope" value={newProcessData.scope}
                   onChange={e => setNewProcessData({...newProcessData, scope: e.target.value})} />
            <Input placeholder="Owner" value={newProcessData.owner}
                   onChange={e => setNewProcessData({...newProcessData, owner: e.target.value})} />
          </div>
          <Button className="mt-3" size="sm" variant="outline" onClick={handleAddProcess}>
            <Plus className="h-4 w-4 mr-2" />
            Add Process
          </Button>
        </div>

        <div className="flex justify-between pt-4">
          <Button variant="outline" onClick={() => setCurrentStep(0)}>
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <Button onClick={handleProceedToMaturity}>
            Next: Maturity Assessment
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  // Step 2: Maturity Assessment
  const renderStep2 = () => {
    const currentProcess = selectedProcesses[currentProcessIdx];
    if (!currentProcess) return null;

    const answers = maturityAnswers[currentProcess.processId] || {
      processStructure: '', procedureExists: '', rolesDefinition: '', automation: '',
      dataSources: '', interfaces: '', volumeCriticality: '', failureImpact: '',
      changeFrequency: '', monitoring: '', priorIssues: ''
    };

    const updateAnswer = (key: keyof MaturityAnswers, value: string) => {
      setMaturityAnswers({
        ...maturityAnswers,
        [currentProcess.processId]: { ...answers, [key]: value }
      });
    };

    return (
      <Card>
        <CardHeader>
          <CardTitle>Process Maturity Assessment ({currentProcessIdx + 1} of {selectedProcesses.length})</CardTitle>
          <CardDescription>Process: {currentProcess.processName}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Process Structure</Label>
            <Select value={answers.processStructure} onValueChange={v => updateAnswer('processStructure', v)}>
              <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
              <SelectContent>
                <SelectItem value="centralized">Centralized</SelectItem>
                <SelectItem value="distributed">Distributed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Standardized Procedure Exists?</Label>
            <Select value={answers.procedureExists} onValueChange={v => updateAnswer('procedureExists', v)}>
              <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
              <SelectContent>
                <SelectItem value="yes">Yes</SelectItem>
                <SelectItem value="partial">Partial</SelectItem>
                <SelectItem value="no">No</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Automation Level</Label>
            <Select value={answers.automation} onValueChange={v => updateAnswer('automation', v)}>
              <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
              <SelectContent>
                <SelectItem value="manual">Mostly Manual</SelectItem>
                <SelectItem value="erp">ERP Workflow</SelectItem>
                <SelectItem value="automated">Automated Controls</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Failure Impact</Label>
            <Select value={answers.failureImpact} onValueChange={v => updateAnswer('failureImpact', v)}>
              <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
              <SelectContent>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={() => currentProcessIdx > 0 ? setCurrentProcessIdx(currentProcessIdx - 1) : setCurrentStep(1)}>
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <Button onClick={handleSubmitMaturity}>
              {currentProcessIdx < selectedProcesses.length - 1 ? 'Next Process' : 'Generate Controls'}
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  // Step 3: Standard Controls Baseline
  const renderStep3 = () => (
    <Card>
      <CardHeader>
        <CardTitle>Expected Standard Controls Baseline</CardTitle>
        <CardDescription>Review and mark applicability of generated controls</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {standardControls.map(control => (
          <div key={control.id} className="border rounded p-4">
            <div className="flex items-start gap-3">
              <Checkbox
                checked={controlApplicability[control.id] !== false}
                onCheckedChange={(checked) => setControlApplicability({...controlApplicability, [control.id]: !!checked})}
              />
              <div className="flex-1">
                <h4 className="font-medium">{control.controlName}</h4>
                <p className="text-sm text-muted-foreground">{control.controlObjective}</p>
                <div className="flex gap-2 mt-2">
                  <Badge>{control.controlType}</Badge>
                  <Badge variant="outline">{control.domainTag}</Badge>
                  <Badge variant="secondary">{control.typicalFrequency}</Badge>
                </div>
              </div>
            </div>
          </div>
        ))}

        <div className="flex justify-between pt-4">
          <Button variant="outline" onClick={() => setCurrentStep(2)}>
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <Button onClick={handleProceedToAsIs}>
            Next: Capture As-Is
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  // Step 4: As-Is Controls
  const renderStep4 = () => (
    <Card>
      <CardHeader>
        <CardTitle>Capture As-Is Controls</CardTitle>
        <CardDescription>Document current controls in place</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Map your existing controls to the standard baseline. You can upload SOPs or manually enter controls.
        </p>
        
        {standardControls.filter(c => controlApplicability[c.id] !== false).map(stdControl => (
          <div key={stdControl.id} className="border rounded p-4">
            <h4 className="font-medium mb-2">{stdControl.controlName}</h4>
            <Select>
              <SelectTrigger><SelectValue placeholder="Map to existing control..." /></SelectTrigger>
              <SelectContent>
                <SelectItem value="exists">Control Exists</SelectItem>
                <SelectItem value="partial">Partially Exists</SelectItem>
                <SelectItem value="not_exist">Does Not Exist</SelectItem>
              </SelectContent>
            </Select>
          </div>
        ))}

        <div className="flex justify-between pt-4">
          <Button variant="outline" onClick={() => setCurrentStep(3)}>
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <Button onClick={handleAnalyzeGaps}>
            Analyze Gaps
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  // Step 5: Gap Analysis
  const renderStep5 = () => (
    <Card>
      <CardHeader>
        <CardTitle>Gap Analysis Results</CardTitle>
        <CardDescription>{gaps.length} gaps identified</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {gaps.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle2 className="h-12 w-12 mx-auto mb-4 text-green-600" />
            <p className="text-lg font-medium">No gaps identified!</p>
            <p className="text-sm text-muted-foreground">All expected controls are in place.</p>
          </div>
        ) : (
          gaps.map(gap => (
            <div key={gap.id} className="border border-orange-200 bg-orange-50 rounded p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
                <span className="font-medium">Gap Type: {gap.gapType}</span>
              </div>
              <p className="text-sm text-muted-foreground">Control ID: {gap.stdControlId}</p>
            </div>
          ))
        )}

        <div className="flex justify-between pt-4">
          <Button variant="outline" onClick={() => setCurrentStep(4)}>
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <Button onClick={generateToBeControls}>
            Generate To-Be Controls
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  // Step 6: To-Be Controls & RCM
  const renderStep6 = () => (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>To-Be Controls & Implementation Plan</CardTitle>
          <CardDescription>{toBeControls.length} controls recommended</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {toBeControls.map(control => (
            <div key={control.id} className="border rounded p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-medium">{control.controlObjective}</h4>
                  <p className="text-sm text-muted-foreground mt-1">{control.implementationGuidance}</p>
                  <div className="flex gap-2 mt-2">
                    <Badge>{control.controlType}</Badge>
                    <Badge variant="outline">{control.frequency}</Badge>
                    <Badge variant="secondary">{control.implementationStatus}</Badge>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Risk-Control Matrix (RCM)</CardTitle>
          <CardDescription>Complete risk-control mapping</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">Risk: {selectedRisk?.riskTitle}</p>
                <p className="text-sm text-muted-foreground">
                  Processes: {selectedProcesses.length} | As-Is Controls: {asIsControls.length} | Gaps: {gaps.length} | To-Be: {toBeControls.length}
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export As-Is RCM
                </Button>
                <Button>
                  <Download className="h-4 w-4 mr-2" />
                  Export To-Be RCM
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={() => setCurrentStep(5)}>
          <ChevronLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Button onClick={() => { setCurrentStep(0); setSelectedRisk(null); }}>
          Complete & Start New
        </Button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Material Controls Workflow</h1>
        <p className="text-muted-foreground mt-1">
          Build mitigation blueprints for principal risks through 6-step workflow
        </p>
      </div>

      {renderStepIndicator()}

      {currentStep === 0 && renderStep0()}
      {currentStep === 1 && renderStep1()}
      {currentStep === 2 && renderStep2()}
      {currentStep === 3 && renderStep3()}
      {currentStep === 4 && renderStep4()}
      {currentStep === 5 && renderStep5()}
      {currentStep === 6 && renderStep6()}
    </div>
  );
}
