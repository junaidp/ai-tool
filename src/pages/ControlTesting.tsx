import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle, 
  Upload, 
  FileText, 
  Download,
  Trash2,
  Send,
  ArrowLeft,
  Save,
  Eye,
  ThumbsUp,
  ThumbsDown,
  Users,
  BarChart3,
  Calendar,
  Filter
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface ControlTestingResult {
  id: string;
  controlId: string;
  assessmentPeriod: string;
  testerId: string;
  testerName: string;
  dueDate?: string;
  
  designEffective?: boolean;
  designQuestions?: string;
  designNotes?: string;
  designScore?: number;
  
  operatingEffective?: boolean;
  operatingRate?: number;
  instancesTested?: number;
  instancesPassed?: number;
  instanceDetails?: string;
  operatingNotes?: string;
  operatingScore?: number;
  
  evidenceEffective?: boolean;
  evidenceQuestions?: string;
  evidenceNotes?: string;
  evidenceScore?: number;
  
  responsivenessEffective?: boolean;
  issuesIdentified?: number;
  issuesActioned?: number;
  responsivenessDetails?: string;
  responsivenessNotes?: string;
  responsivenessScore?: number;
  
  competenceEffective?: boolean;
  competenceQuestions?: string;
  competenceNotes?: string;
  competenceScore?: number;
  
  overallRating?: 'EFFECTIVE' | 'PARTIALLY_EFFECTIVE' | 'INEFFECTIVE';
  totalScore?: number;
  rationale?: string;
  evidenceFiles?: string;
  
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'SUBMITTED' | 'APPROVED' | 'FLAGGED_AS_DEFICIENCY';
  submittedAt?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  reviewComments?: string;
  
  createdAt: string;
  updatedAt: string;
}

interface TestSummary {
  total: number;
  notStarted: number;
  inProgress: number;
  submitted: number;
  approved: number;
  flagged: number;
  effective: number;
  partiallyEffective: number;
  ineffective: number;
}

const DESIGN_QUESTIONS = [
  { id: 'root_cause', text: 'Does the control address the root cause of the risk?' },
  { id: 'control_type', text: 'Is the control type (preventive/detective/corrective) appropriate?' },
  { id: 'frequency', text: 'Is the control frequency appropriate for the risk?' },
  { id: 'owner', text: 'Is the control owner appropriate and clearly defined?' },
  { id: 'triggers', text: 'Are control triggers and thresholds clearly defined?' },
];

const EVIDENCE_QUESTIONS = [
  { id: 'exists', text: 'Does evidence exist for each control instance?' },
  { id: 'contemporaneous', text: 'Is evidence contemporaneous (created at time of control)?' },
  { id: 'complete', text: 'Is evidence complete (shows all control steps)?' },
  { id: 'retained', text: 'Is evidence retained appropriately and accessible?' },
  { id: 'auditable', text: 'Can an auditor rely on the evidence provided?' },
];

const COMPETENCE_QUESTIONS = [
  { id: 'technical', text: 'Does the owner have technical competence?' },
  { id: 'authority', text: 'Does the owner have authority to act?' },
  { id: 'training', text: 'Has the owner received appropriate training?' },
  { id: 'backup', text: 'Is backup coverage identified and trained?' },
  { id: 'resources', text: 'Are adequate resources available to perform the control?' },
];

export default function ControlTesting() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('my-assignments');
  const [assessmentPeriod, setAssessmentPeriod] = useState('2025');
  const [myAssignments, setMyAssignments] = useState<ControlTestingResult[]>([]);
  const [allTests, setAllTests] = useState<ControlTestingResult[]>([]);
  const [summary, setSummary] = useState<TestSummary | null>(null);
  const [selectedTest, setSelectedTest] = useState<ControlTestingResult | null>(null);
  const [isTestDialogOpen, setIsTestDialogOpen] = useState(false);
  const [currentTestStep, setCurrentTestStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);

  const [testData, setTestData] = useState<Partial<ControlTestingResult>>({});

  useEffect(() => {
    loadData();
  }, [assessmentPeriod]);

  const loadData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      const [myAssignmentsRes, summaryRes] = await Promise.all([
        fetch(`http://localhost:3001/api/control-testing/my-assignments?assessmentPeriod=${assessmentPeriod}`, { headers }),
        fetch(`http://localhost:3001/api/control-testing/summary/${assessmentPeriod}`, { headers }),
      ]);

      if (myAssignmentsRes.ok) {
        const data = await myAssignmentsRes.json();
        setMyAssignments(data);
      }

      if (summaryRes.ok) {
        const data = await summaryRes.json();
        setSummary(data);
      }

      if (user?.role === 'CONTROLS_MANAGER' || user?.role === 'FRAMEWORK_OWNER') {
        const allTestsRes = await fetch(`http://localhost:3001/api/control-testing/period/${assessmentPeriod}`, { headers });
        if (allTestsRes.ok) {
          const data = await allTestsRes.json();
          setAllTests(data);
        }
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartTest = (test: ControlTestingResult) => {
    setSelectedTest(test);
    setTestData({
      ...test,
      designQuestions: test.designQuestions || JSON.stringify(DESIGN_QUESTIONS.map(q => ({ id: q.id, answer: null }))),
      evidenceQuestions: test.evidenceQuestions || JSON.stringify(EVIDENCE_QUESTIONS.map(q => ({ id: q.id, answer: null }))),
      competenceQuestions: test.competenceQuestions || JSON.stringify(COMPETENCE_QUESTIONS.map(q => ({ id: q.id, answer: null }))),
      instanceDetails: test.instanceDetails || JSON.stringify([]),
      responsivenessDetails: test.responsivenessDetails || JSON.stringify([]),
    });
    setCurrentTestStep(1);
    setIsTestDialogOpen(true);
  };

  const handleSaveTest = async (submit = false) => {
    if (!selectedTest) return;

    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch('http://localhost:3001/api/control-testing/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...testData,
          controlId: selectedTest.controlId,
          assessmentPeriod: selectedTest.assessmentPeriod,
          status: submit ? 'SUBMITTED' : 'IN_PROGRESS',
        }),
      });

      if (response.ok) {
        if (submit) {
          const result = await response.json();
          await fetch(`http://localhost:3001/api/control-testing/${result.id}/submit`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });
        }
        
        setIsTestDialogOpen(false);
        loadData();
        alert(submit ? '✅ Testing submitted successfully!' : '✅ Progress saved!');
      }
    } catch (error) {
      console.error('Error saving test:', error);
      alert('Failed to save test');
    }
  };

  const handleUploadEvidence = async (file: File) => {
    if (!selectedTest) return;

    setUploadingFile(true);
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`http://localhost:3001/api/control-testing/${selectedTest.id}/upload-evidence`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        setTestData(prev => ({
          ...prev,
          evidenceFiles: result.result.evidenceFiles,
        }));
        alert('✅ Evidence uploaded successfully!');
      }
    } catch (error) {
      console.error('Error uploading evidence:', error);
      alert('Failed to upload evidence');
    } finally {
      setUploadingFile(false);
    }
  };

  const calculateDesignScore = () => {
    if (!testData.designQuestions) return 0;
    const questions = JSON.parse(testData.designQuestions);
    const yesCount = questions.filter((q: any) => q.answer === true).length;
    return yesCount;
  };

  const calculateEvidenceScore = () => {
    if (!testData.evidenceQuestions) return 0;
    const questions = JSON.parse(testData.evidenceQuestions);
    const yesCount = questions.filter((q: any) => q.answer === true).length;
    return yesCount;
  };

  const calculateCompetenceScore = () => {
    if (!testData.competenceQuestions) return 0;
    const questions = JSON.parse(testData.competenceQuestions);
    const yesCount = questions.filter((q: any) => q.answer === true).length;
    return yesCount;
  };

  const calculateOperatingScore = () => {
    if (!testData.operatingRate) return 0;
    const rate = testData.operatingRate;
    if (rate === 100) return 5;
    if (rate >= 95) return 4;
    if (rate >= 80) return 3;
    if (rate >= 60) return 2;
    return 1;
  };

  const calculateResponsivenessScore = () => {
    if (!testData.issuesIdentified || testData.issuesIdentified === 0) return 5;
    const rate = ((testData.issuesActioned || 0) / testData.issuesIdentified) * 100;
    if (rate === 100) return 5;
    if (rate >= 90) return 4;
    if (rate >= 75) return 3;
    if (rate >= 50) return 2;
    return 1;
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; icon: any; label: string }> = {
      NOT_STARTED: { variant: 'secondary', icon: Clock, label: 'Not Started' },
      IN_PROGRESS: { variant: 'default', icon: Clock, label: 'In Progress' },
      SUBMITTED: { variant: 'default', icon: Send, label: 'Submitted' },
      APPROVED: { variant: 'default', icon: CheckCircle, label: 'Approved' },
      FLAGGED_AS_DEFICIENCY: { variant: 'destructive', icon: AlertTriangle, label: 'Flagged' },
    };
    const config = variants[status] || variants.NOT_STARTED;
    const Icon = config.icon;
    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const getRatingBadge = (rating?: string) => {
    if (!rating) return null;
    const variants: Record<string, { variant: any; label: string }> = {
      EFFECTIVE: { variant: 'default', label: 'Effective' },
      PARTIALLY_EFFECTIVE: { variant: 'secondary', label: 'Partially Effective' },
      INEFFECTIVE: { variant: 'destructive', label: 'Ineffective' },
    };
    const config = variants[rating];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const renderTest1Design = () => {
    const questions = testData.designQuestions ? JSON.parse(testData.designQuestions) : DESIGN_QUESTIONS.map(q => ({ id: q.id, answer: null }));
    
    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-2">Test 1: Design Effectiveness</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Assess whether the control is appropriately designed to address the risk.
          </p>
        </div>

        <div className="space-y-4">
          {DESIGN_QUESTIONS.map((question, idx) => {
            const answer = questions.find((q: any) => q.id === question.id);
            return (
              <Card key={question.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-1">
                      <p className="font-medium mb-3">{idx + 1}. {question.text}</p>
                      <RadioGroup
                        value={answer?.answer === true ? 'yes' : answer?.answer === false ? 'no' : ''}
                        onValueChange={(value) => {
                          const updated = questions.map((q: any) => 
                            q.id === question.id ? { ...q, answer: value === 'yes' } : q
                          );
                          setTestData(prev => ({ ...prev, designQuestions: JSON.stringify(updated) }));
                        }}
                      >
                        <div className="flex gap-4">
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="yes" id={`${question.id}-yes`} />
                            <Label htmlFor={`${question.id}-yes`}>Yes</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="no" id={`${question.id}-no`} />
                            <Label htmlFor={`${question.id}-no`}>No</Label>
                          </div>
                        </div>
                      </RadioGroup>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div>
          <Label>Additional Notes</Label>
          <Textarea
            value={testData.designNotes || ''}
            onChange={(e) => setTestData(prev => ({ ...prev, designNotes: e.target.value }))}
            placeholder="Add any additional observations or context..."
            rows={4}
          />
        </div>

        <div className="bg-muted p-4 rounded-lg">
          <p className="font-semibold">Design Score: {calculateDesignScore()} / 5</p>
          <p className="text-sm text-muted-foreground mt-1">
            {calculateDesignScore() >= 4 ? '✅ Effective' : calculateDesignScore() >= 3 ? '⚠️ Partially Effective' : '❌ Ineffective'}
          </p>
        </div>
      </div>
    );
  };

  const renderTest2Operating = () => {
    const instances = testData.instanceDetails ? JSON.parse(testData.instanceDetails) : [];
    
    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-2">Test 2: Operating Effectiveness</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Test whether the control is performed consistently and correctly.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Instances Tested</Label>
            <Input
              type="number"
              value={testData.instancesTested || ''}
              onChange={(e) => setTestData(prev => ({ 
                ...prev, 
                instancesTested: parseInt(e.target.value) || 0,
                operatingRate: prev.instancesTested ? ((prev.instancesPassed || 0) / parseInt(e.target.value)) * 100 : 0
              }))}
              placeholder="e.g., 12"
            />
          </div>
          <div>
            <Label>Instances Passed</Label>
            <Input
              type="number"
              value={testData.instancesPassed || ''}
              onChange={(e) => setTestData(prev => ({ 
                ...prev, 
                instancesPassed: parseInt(e.target.value) || 0,
                operatingRate: prev.instancesTested ? (parseInt(e.target.value) / (prev.instancesTested || 1)) * 100 : 0
              }))}
              placeholder="e.g., 12"
            />
          </div>
        </div>

        <div>
          <Button
            variant="outline"
            onClick={() => {
              const newInstance = {
                id: Date.now(),
                date: '',
                description: '',
                passed: true,
                notes: '',
              };
              const updated = [...instances, newInstance];
              setTestData(prev => ({ ...prev, instanceDetails: JSON.stringify(updated) }));
            }}
          >
            Add Instance Detail
          </Button>
        </div>

        {instances.length > 0 && (
          <div className="space-y-2">
            {instances.map((instance: any, idx: number) => (
              <Card key={instance.id}>
                <CardContent className="pt-4">
                  <div className="grid grid-cols-4 gap-4">
                    <div>
                      <Label>Date</Label>
                      <Input
                        type="date"
                        value={instance.date}
                        onChange={(e) => {
                          const updated = instances.map((i: any) => 
                            i.id === instance.id ? { ...i, date: e.target.value } : i
                          );
                          setTestData(prev => ({ ...prev, instanceDetails: JSON.stringify(updated) }));
                        }}
                      />
                    </div>
                    <div className="col-span-2">
                      <Label>Description</Label>
                      <Input
                        value={instance.description}
                        onChange={(e) => {
                          const updated = instances.map((i: any) => 
                            i.id === instance.id ? { ...i, description: e.target.value } : i
                          );
                          setTestData(prev => ({ ...prev, instanceDetails: JSON.stringify(updated) }));
                        }}
                        placeholder="What was tested?"
                      />
                    </div>
                    <div className="flex items-end gap-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          checked={instance.passed}
                          onCheckedChange={(checked) => {
                            const updated = instances.map((i: any) => 
                              i.id === instance.id ? { ...i, passed: checked } : i
                            );
                            setTestData(prev => ({ ...prev, instanceDetails: JSON.stringify(updated) }));
                          }}
                        />
                        <Label>Passed</Label>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const updated = instances.filter((i: any) => i.id !== instance.id);
                          setTestData(prev => ({ ...prev, instanceDetails: JSON.stringify(updated) }));
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div>
          <Label>Additional Notes</Label>
          <Textarea
            value={testData.operatingNotes || ''}
            onChange={(e) => setTestData(prev => ({ ...prev, operatingNotes: e.target.value }))}
            placeholder="Add any additional observations..."
            rows={4}
          />
        </div>

        <div className="bg-muted p-4 rounded-lg">
          <p className="font-semibold">Operating Rate: {testData.operatingRate?.toFixed(1) || 0}%</p>
          <p className="font-semibold">Operating Score: {calculateOperatingScore()} / 5</p>
          <p className="text-sm text-muted-foreground mt-1">
            {(testData.operatingRate || 0) >= 95 ? '✅ Effective' : (testData.operatingRate || 0) >= 80 ? '⚠️ Partially Effective' : '❌ Ineffective'}
          </p>
        </div>
      </div>
    );
  };

  const renderTest3Evidence = () => {
    const questions = testData.evidenceQuestions ? JSON.parse(testData.evidenceQuestions) : EVIDENCE_QUESTIONS.map(q => ({ id: q.id, answer: null }));
    const evidenceFiles = testData.evidenceFiles ? JSON.parse(testData.evidenceFiles) : [];
    
    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-2">Test 3: Evidence Effectiveness</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Assess whether there is sufficient and appropriate evidence.
          </p>
        </div>

        <div className="space-y-4">
          {EVIDENCE_QUESTIONS.map((question, idx) => {
            const answer = questions.find((q: any) => q.id === question.id);
            return (
              <Card key={question.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-1">
                      <p className="font-medium mb-3">{idx + 1}. {question.text}</p>
                      <RadioGroup
                        value={answer?.answer === true ? 'yes' : answer?.answer === false ? 'no' : ''}
                        onValueChange={(value) => {
                          const updated = questions.map((q: any) => 
                            q.id === question.id ? { ...q, answer: value === 'yes' } : q
                          );
                          setTestData(prev => ({ ...prev, evidenceQuestions: JSON.stringify(updated) }));
                        }}
                      >
                        <div className="flex gap-4">
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="yes" id={`${question.id}-yes`} />
                            <Label htmlFor={`${question.id}-yes`}>Yes</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="no" id={`${question.id}-no`} />
                            <Label htmlFor={`${question.id}-no`}>No</Label>
                          </div>
                        </div>
                      </RadioGroup>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div>
          <Label>Upload Evidence Files</Label>
          <div className="mt-2">
            <Input
              type="file"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleUploadEvidence(file);
              }}
              disabled={uploadingFile}
            />
          </div>
          {evidenceFiles.length > 0 && (
            <div className="mt-4 space-y-2">
              {evidenceFiles.map((file: any) => (
                <div key={file.filename} className="flex items-center justify-between p-2 border rounded">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    <span className="text-sm">{file.originalName}</span>
                  </div>
                  <Button variant="ghost" size="sm">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <Label>Additional Notes</Label>
          <Textarea
            value={testData.evidenceNotes || ''}
            onChange={(e) => setTestData(prev => ({ ...prev, evidenceNotes: e.target.value }))}
            placeholder="Add any additional observations..."
            rows={4}
          />
        </div>

        <div className="bg-muted p-4 rounded-lg">
          <p className="font-semibold">Evidence Score: {calculateEvidenceScore()} / 5</p>
          <p className="text-sm text-muted-foreground mt-1">
            {calculateEvidenceScore() >= 4 ? '✅ Effective' : calculateEvidenceScore() >= 3 ? '⚠️ Partially Effective' : '❌ Ineffective'}
          </p>
        </div>
      </div>
    );
  };

  const renderTest4Responsiveness = () => {
    const issues = testData.responsivenessDetails ? JSON.parse(testData.responsivenessDetails) : [];
    
    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-2">Test 4: Responsiveness Effectiveness</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Assess whether issues are acted upon appropriately and timely.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Issues Identified</Label>
            <Input
              type="number"
              value={testData.issuesIdentified || ''}
              onChange={(e) => setTestData(prev => ({ ...prev, issuesIdentified: parseInt(e.target.value) || 0 }))}
              placeholder="e.g., 5"
            />
          </div>
          <div>
            <Label>Issues Actioned</Label>
            <Input
              type="number"
              value={testData.issuesActioned || ''}
              onChange={(e) => setTestData(prev => ({ ...prev, issuesActioned: parseInt(e.target.value) || 0 }))}
              placeholder="e.g., 5"
            />
          </div>
        </div>

        <div>
          <Button
            variant="outline"
            onClick={() => {
              const newIssue = {
                id: Date.now(),
                date: '',
                description: '',
                actioned: true,
                daysToAction: 0,
                rootCauseAddressed: true,
              };
              const updated = [...issues, newIssue];
              setTestData(prev => ({ ...prev, responsivenessDetails: JSON.stringify(updated) }));
            }}
          >
            Add Issue Detail
          </Button>
        </div>

        {issues.length > 0 && (
          <div className="space-y-2">
            {issues.map((issue: any) => (
              <Card key={issue.id}>
                <CardContent className="pt-4">
                  <div className="space-y-3">
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label>Date Identified</Label>
                        <Input
                          type="date"
                          value={issue.date}
                          onChange={(e) => {
                            const updated = issues.map((i: any) => 
                              i.id === issue.id ? { ...i, date: e.target.value } : i
                            );
                            setTestData(prev => ({ ...prev, responsivenessDetails: JSON.stringify(updated) }));
                          }}
                        />
                      </div>
                      <div>
                        <Label>Days to Action</Label>
                        <Input
                          type="number"
                          value={issue.daysToAction}
                          onChange={(e) => {
                            const updated = issues.map((i: any) => 
                              i.id === issue.id ? { ...i, daysToAction: parseInt(e.target.value) || 0 } : i
                            );
                            setTestData(prev => ({ ...prev, responsivenessDetails: JSON.stringify(updated) }));
                          }}
                        />
                      </div>
                      <div className="flex items-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const updated = issues.filter((i: any) => i.id !== issue.id);
                            setTestData(prev => ({ ...prev, responsivenessDetails: JSON.stringify(updated) }));
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div>
                      <Label>Description</Label>
                      <Input
                        value={issue.description}
                        onChange={(e) => {
                          const updated = issues.map((i: any) => 
                            i.id === issue.id ? { ...i, description: e.target.value } : i
                          );
                          setTestData(prev => ({ ...prev, responsivenessDetails: JSON.stringify(updated) }));
                        }}
                        placeholder="What was the issue?"
                      />
                    </div>
                    <div className="flex gap-4">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          checked={issue.actioned}
                          onCheckedChange={(checked) => {
                            const updated = issues.map((i: any) => 
                              i.id === issue.id ? { ...i, actioned: checked } : i
                            );
                            setTestData(prev => ({ ...prev, responsivenessDetails: JSON.stringify(updated) }));
                          }}
                        />
                        <Label>Actioned</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          checked={issue.rootCauseAddressed}
                          onCheckedChange={(checked) => {
                            const updated = issues.map((i: any) => 
                              i.id === issue.id ? { ...i, rootCauseAddressed: checked } : i
                            );
                            setTestData(prev => ({ ...prev, responsivenessDetails: JSON.stringify(updated) }));
                          }}
                        />
                        <Label>Root Cause Addressed</Label>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div>
          <Label>Additional Notes</Label>
          <Textarea
            value={testData.responsivenessNotes || ''}
            onChange={(e) => setTestData(prev => ({ ...prev, responsivenessNotes: e.target.value }))}
            placeholder="Add any additional observations..."
            rows={4}
          />
        </div>

        <div className="bg-muted p-4 rounded-lg">
          <p className="font-semibold">Responsiveness Score: {calculateResponsivenessScore()} / 5</p>
          <p className="text-sm text-muted-foreground mt-1">
            {calculateResponsivenessScore() >= 4 ? '✅ Effective' : calculateResponsivenessScore() >= 3 ? '⚠️ Partially Effective' : '❌ Ineffective'}
          </p>
        </div>
      </div>
    );
  };

  const renderTest5Competence = () => {
    const questions = testData.competenceQuestions ? JSON.parse(testData.competenceQuestions) : COMPETENCE_QUESTIONS.map(q => ({ id: q.id, answer: null }));
    
    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-2">Test 5: Competence Effectiveness</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Assess whether the control owner has the capability and authority to perform the control.
          </p>
        </div>

        <div className="space-y-4">
          {COMPETENCE_QUESTIONS.map((question, idx) => {
            const answer = questions.find((q: any) => q.id === question.id);
            return (
              <Card key={question.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-1">
                      <p className="font-medium mb-3">{idx + 1}. {question.text}</p>
                      <RadioGroup
                        value={answer?.answer === true ? 'yes' : answer?.answer === false ? 'no' : ''}
                        onValueChange={(value) => {
                          const updated = questions.map((q: any) => 
                            q.id === question.id ? { ...q, answer: value === 'yes' } : q
                          );
                          setTestData(prev => ({ ...prev, competenceQuestions: JSON.stringify(updated) }));
                        }}
                      >
                        <div className="flex gap-4">
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="yes" id={`${question.id}-yes`} />
                            <Label htmlFor={`${question.id}-yes`}>Yes</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="no" id={`${question.id}-no`} />
                            <Label htmlFor={`${question.id}-no`}>No</Label>
                          </div>
                        </div>
                      </RadioGroup>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div>
          <Label>Additional Notes</Label>
          <Textarea
            value={testData.competenceNotes || ''}
            onChange={(e) => setTestData(prev => ({ ...prev, competenceNotes: e.target.value }))}
            placeholder="Add any additional observations..."
            rows={4}
          />
        </div>

        <div className="bg-muted p-4 rounded-lg">
          <p className="font-semibold">Competence Score: {calculateCompetenceScore()} / 5</p>
          <p className="text-sm text-muted-foreground mt-1">
            {calculateCompetenceScore() >= 4 ? '✅ Effective' : calculateCompetenceScore() >= 3 ? '⚠️ Partially Effective' : '❌ Ineffective'}
          </p>
        </div>
      </div>
    );
  };

  const renderOverallSummary = () => {
    const designScore = calculateDesignScore();
    const operatingScore = calculateOperatingScore();
    const evidenceScore = calculateEvidenceScore();
    const responsivenessScore = calculateResponsivenessScore();
    const competenceScore = calculateCompetenceScore();
    const totalScore = designScore + operatingScore + evidenceScore + responsivenessScore + competenceScore;
    const avgScore = totalScore / 5;

    let overallRating: 'EFFECTIVE' | 'PARTIALLY_EFFECTIVE' | 'INEFFECTIVE';
    if (avgScore >= 4) {
      overallRating = 'EFFECTIVE';
    } else if (avgScore >= 3) {
      overallRating = 'PARTIALLY_EFFECTIVE';
    } else {
      overallRating = 'INEFFECTIVE';
    }

    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-2">Overall Assessment Summary</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Review all test results and overall effectiveness rating.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Test 1: Design</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{designScore} / 5</p>
              <p className="text-sm text-muted-foreground">
                {designScore >= 4 ? 'Effective' : designScore >= 3 ? 'Partially Effective' : 'Ineffective'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Test 2: Operating</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{operatingScore} / 5</p>
              <p className="text-sm text-muted-foreground">{testData.operatingRate?.toFixed(1)}% rate</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Test 3: Evidence</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{evidenceScore} / 5</p>
              <p className="text-sm text-muted-foreground">
                {evidenceScore >= 4 ? 'Effective' : evidenceScore >= 3 ? 'Partially Effective' : 'Ineffective'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Test 4: Responsiveness</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{responsivenessScore} / 5</p>
              <p className="text-sm text-muted-foreground">
                {testData.issuesActioned || 0} / {testData.issuesIdentified || 0} actioned
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Test 5: Competence</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{competenceScore} / 5</p>
              <p className="text-sm text-muted-foreground">
                {competenceScore >= 4 ? 'Effective' : competenceScore >= 3 ? 'Partially Effective' : 'Ineffective'}
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="border-2">
          <CardHeader>
            <CardTitle>Overall Effectiveness Rating</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-3xl font-bold">{totalScore} / 25</p>
                <p className="text-sm text-muted-foreground">Average: {avgScore.toFixed(1)} / 5</p>
              </div>
              <div>
                {getRatingBadge(overallRating)}
              </div>
              <div>
                <Label>Rationale (Auto-generated)</Label>
                <Textarea
                  value={`Based on the 5 effectiveness tests, the control scored ${totalScore}/25 (${avgScore.toFixed(1)}/5 average). Design: ${designScore}/5, Operating: ${operatingScore}/5 (${testData.operatingRate?.toFixed(1)}%), Evidence: ${evidenceScore}/5, Responsiveness: ${responsivenessScore}/5, Competence: ${competenceScore}/5. Overall rating: ${overallRating.replace('_', ' ')}.`}
                  rows={4}
                  readOnly
                  className="bg-muted"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Control Testing</h1>
          <p className="text-muted-foreground">Operational Effectiveness Assessment</p>
        </div>
        <div className="flex gap-2">
          <Select value={assessmentPeriod} onValueChange={setAssessmentPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2024">2024</SelectItem>
              <SelectItem value="2025">2025</SelectItem>
              <SelectItem value="2026">2026</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {summary && (
        <div className="grid grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Total Tests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.inProgress + summary.submitted}</div>
              <Progress value={((summary.inProgress + summary.submitted) / summary.total) * 100} className="mt-2" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Approved</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{summary.approved}</div>
              <Progress value={(summary.approved / summary.total) * 100} className="mt-2" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Effective</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.effective}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {summary.partiallyEffective} partial, {summary.ineffective} ineffective
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="my-assignments">My Assignments</TabsTrigger>
          {(user?.role === 'CONTROLS_MANAGER' || user?.role === 'FRAMEWORK_OWNER') && (
            <>
              <TabsTrigger value="all-tests">All Tests</TabsTrigger>
              <TabsTrigger value="review">Review Queue</TabsTrigger>
            </>
          )}
        </TabsList>

        <TabsContent value="my-assignments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>My Testing Assignments</CardTitle>
              <CardDescription>Controls assigned to you for testing</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Control ID</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {myAssignments.map((test) => {
                    const testsCompleted = [
                      test.designScore,
                      test.operatingScore,
                      test.evidenceScore,
                      test.responsivenessScore,
                      test.competenceScore
                    ].filter(s => s !== null && s !== undefined).length;
                    const progress = (testsCompleted / 5) * 100;

                    return (
                      <TableRow key={test.id}>
                        <TableCell className="font-medium">{test.controlId}</TableCell>
                        <TableCell>
                          {test.dueDate ? new Date(test.dueDate).toLocaleDateString() : '-'}
                        </TableCell>
                        <TableCell>{getStatusBadge(test.status)}</TableCell>
                        <TableCell>{getRatingBadge(test.overallRating)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress value={progress} className="w-20" />
                            <span className="text-sm text-muted-foreground">{testsCompleted}/5</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            onClick={() => handleStartTest(test)}
                            disabled={test.status === 'APPROVED'}
                          >
                            {test.status === 'NOT_STARTED' ? 'Start' : test.status === 'APPROVED' ? 'View' : 'Continue'}
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="all-tests" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Control Tests</CardTitle>
              <CardDescription>Overview of all testing activities for {assessmentPeriod}</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Control ID</TableHead>
                    <TableHead>Tester</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allTests.map((test) => (
                    <TableRow key={test.id}>
                      <TableCell className="font-medium">{test.controlId}</TableCell>
                      <TableCell>{test.testerName}</TableCell>
                      <TableCell>{getStatusBadge(test.status)}</TableCell>
                      <TableCell>{getRatingBadge(test.overallRating)}</TableCell>
                      <TableCell>
                        {test.submittedAt ? new Date(test.submittedAt).toLocaleDateString() : '-'}
                      </TableCell>
                      <TableCell>
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="review" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Review Queue</CardTitle>
              <CardDescription>Tests submitted for your review</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Control ID</TableHead>
                    <TableHead>Tester</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allTests.filter(t => t.status === 'SUBMITTED').map((test) => (
                    <TableRow key={test.id}>
                      <TableCell className="font-medium">{test.controlId}</TableCell>
                      <TableCell>{test.testerName}</TableCell>
                      <TableCell>{getRatingBadge(test.overallRating)}</TableCell>
                      <TableCell>
                        {test.submittedAt ? new Date(test.submittedAt).toLocaleDateString() : '-'}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4 mr-1" />
                            Review
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={isTestDialogOpen} onOpenChange={setIsTestDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Control Testing: {selectedTest?.controlId}</DialogTitle>
            <DialogDescription>
              Complete all 5 effectiveness tests for this control
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5, 6].map((step) => (
                <Button
                  key={step}
                  variant={currentTestStep === step ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setCurrentTestStep(step)}
                  className="flex-1"
                >
                  {step === 6 ? 'Summary' : `Test ${step}`}
                </Button>
              ))}
            </div>

            <div className="min-h-[400px]">
              {currentTestStep === 1 && renderTest1Design()}
              {currentTestStep === 2 && renderTest2Operating()}
              {currentTestStep === 3 && renderTest3Evidence()}
              {currentTestStep === 4 && renderTest4Responsiveness()}
              {currentTestStep === 5 && renderTest5Competence()}
              {currentTestStep === 6 && renderOverallSummary()}
            </div>
          </div>

          <DialogFooter>
            <div className="flex justify-between w-full">
              <div className="flex gap-2">
                {currentTestStep > 1 && (
                  <Button
                    variant="outline"
                    onClick={() => setCurrentTestStep(currentTestStep - 1)}
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Previous
                  </Button>
                )}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => handleSaveTest(false)}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Progress
                </Button>
                {currentTestStep < 6 ? (
                  <Button onClick={() => setCurrentTestStep(currentTestStep + 1)}>
                    Next
                  </Button>
                ) : (
                  <Button onClick={() => handleSaveTest(true)}>
                    <Send className="h-4 w-4 mr-2" />
                    Submit for Review
                  </Button>
                )}
              </div>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
