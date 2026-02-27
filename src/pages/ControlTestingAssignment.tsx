import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Users, Calendar, Send, CheckCircle, AlertCircle, BarChart3 } from 'lucide-react';

interface Control {
  id: string;
  name: string;
  description: string;
  owner: string;
  effectiveness: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface Assignment {
  controlId: string;
  controlName: string;
  testerId: string;
  testerName: string;
  dueDate: string;
}

interface TesterProgress {
  testerId: string;
  testerName: string;
  total: number;
  notStarted: number;
  inProgress: number;
  submitted: number;
  approved: number;
}

export default function ControlTestingAssignment() {
  const [assessmentPeriod, setAssessmentPeriod] = useState('2025');
  const [controls, setControls] = useState<Control[]>([]);
  const [testers, setTesters] = useState<User[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [selectedControls, setSelectedControls] = useState<Set<string>>(new Set());
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [selectedTester, setSelectedTester] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [testerProgress, setTesterProgress] = useState<TesterProgress[]>([]);
  const [assignmentMethod, setAssignmentMethod] = useState<'manual' | 'risk-based'>('manual');

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

      const [controlsRes, testersRes, progressRes] = await Promise.all([
        fetch('http://localhost:3001/api/material-controls', { headers }),
        fetch('http://localhost:3001/api/control-testing/config/options', { headers }),
        fetch(`http://localhost:3001/api/control-testing/progress/by-tester/${assessmentPeriod}`, { headers }),
      ]);

      if (controlsRes.ok) {
        const data = await controlsRes.json();
        setControls(data);
      }

      if (testersRes.ok) {
        const data = await testersRes.json();
        setTesters(data.testers || []);
      }

      if (progressRes.ok) {
        const data = await progressRes.json();
        setTesterProgress(data);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectControl = (controlId: string) => {
    const newSelected = new Set(selectedControls);
    if (newSelected.has(controlId)) {
      newSelected.delete(controlId);
    } else {
      newSelected.add(controlId);
    }
    setSelectedControls(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedControls.size === controls.length) {
      setSelectedControls(new Set());
    } else {
      setSelectedControls(new Set(controls.map(c => c.id)));
    }
  };

  const handleOpenAssignDialog = () => {
    if (selectedControls.size === 0) {
      alert('Please select at least one control');
      return;
    }
    setIsAssignDialogOpen(true);
  };

  const handleBulkAssign = async () => {
    if (!selectedTester || !dueDate) {
      alert('Please select a tester and due date');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const tester = testers.find(t => t.id === selectedTester);
      
      const assignmentData = Array.from(selectedControls).map(controlId => {
        const control = controls.find(c => c.id === controlId);
        return {
          controlId,
          controlName: control?.name || controlId,
          testerId: selectedTester,
          testerName: tester?.name || '',
          dueDate,
        };
      });

      const response = await fetch('http://localhost:3001/api/control-testing/bulk-assign', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          assignments: assignmentData,
          assessmentPeriod,
        }),
      });

      if (response.ok) {
        alert(`✅ Successfully assigned ${selectedControls.size} controls to ${tester?.name}`);
        setIsAssignDialogOpen(false);
        setSelectedControls(new Set());
        setSelectedTester('');
        setDueDate('');
        loadData();
      } else {
        alert('Failed to assign controls');
      }
    } catch (error) {
      console.error('Error assigning controls:', error);
      alert('Failed to assign controls');
    } finally {
      setLoading(false);
    }
  };

  const handleRiskBasedAssignment = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      const assignmentData = controls.map(control => {
        let testerId = '';
        let testerName = '';
        let sampleSize = 5;
        
        if (control.effectiveness === 'high' || control.effectiveness === 'critical') {
          const internalAuditor = testers.find(t => t.role === 'FRAMEWORK_OWNER');
          testerId = internalAuditor?.id || testers[0]?.id || '';
          testerName = internalAuditor?.name || testers[0]?.name || '';
          sampleSize = 25;
        } else if (control.effectiveness === 'medium') {
          const manager = testers.find(t => t.role === 'CONTROLS_MANAGER');
          testerId = manager?.id || testers[0]?.id || '';
          testerName = manager?.name || testers[0]?.name || '';
          sampleSize = 15;
        } else {
          const owner = testers.find(t => t.role === 'CONTROL_OWNER');
          testerId = owner?.id || testers[0]?.id || '';
          testerName = owner?.name || testers[0]?.name || '';
          sampleSize = 5;
        }

        const dueDateObj = new Date();
        dueDateObj.setMonth(dueDateObj.getMonth() + 2);
        
        return {
          controlId: control.id,
          controlName: control.name,
          testerId,
          testerName,
          dueDate: dueDateObj.toISOString().split('T')[0],
        };
      });

      const response = await fetch('http://localhost:3001/api/control-testing/bulk-assign', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          assignments: assignmentData,
          assessmentPeriod,
        }),
      });

      if (response.ok) {
        alert(`✅ Successfully assigned ${controls.length} controls based on risk priority`);
        loadData();
      } else {
        alert('Failed to assign controls');
      }
    } catch (error) {
      console.error('Error assigning controls:', error);
      alert('Failed to assign controls');
    } finally {
      setLoading(false);
    }
  };

  const getProgressPercentage = (progress: TesterProgress) => {
    if (progress.total === 0) return 0;
    return ((progress.approved + progress.submitted) / progress.total) * 100;
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Testing Assignment & Configuration</h1>
          <p className="text-muted-foreground">Assign controls to testers and track progress</p>
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

      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4" />
              Total Testers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{testers.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Total Controls
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{controls.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Selected
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{selectedControls.size}</div>
          </CardContent>
        </Card>
      </div>

      {testerProgress.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Tester Progress Overview</CardTitle>
            <CardDescription>Testing progress by assigned tester</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tester</TableHead>
                  <TableHead>Total Assigned</TableHead>
                  <TableHead>Not Started</TableHead>
                  <TableHead>In Progress</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Approved</TableHead>
                  <TableHead>Progress</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {testerProgress.map((progress) => (
                  <TableRow key={progress.testerId}>
                    <TableCell className="font-medium">{progress.testerName}</TableCell>
                    <TableCell>{progress.total}</TableCell>
                    <TableCell>{progress.notStarted}</TableCell>
                    <TableCell>{progress.inProgress}</TableCell>
                    <TableCell>{progress.submitted}</TableCell>
                    <TableCell>{progress.approved}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary" 
                            style={{ width: `${getProgressPercentage(progress)}%` }}
                          />
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {getProgressPercentage(progress).toFixed(0)}%
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Assignment Configuration</CardTitle>
              <CardDescription>Select assignment method and configure testing</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setAssignmentMethod('manual')}
                className={assignmentMethod === 'manual' ? 'border-primary' : ''}
              >
                Manual Assignment
              </Button>
              <Button
                variant="outline"
                onClick={() => setAssignmentMethod('risk-based')}
                className={assignmentMethod === 'risk-based' ? 'border-primary' : ''}
              >
                Risk-Based Auto-Assignment
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {assignmentMethod === 'manual' ? (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">
                  Select controls and assign to a tester manually
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={handleSelectAll}>
                    {selectedControls.size === controls.length ? 'Deselect All' : 'Select All'}
                  </Button>
                  <Button 
                    onClick={handleOpenAssignDialog}
                    disabled={selectedControls.size === 0}
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Assign Selected ({selectedControls.size})
                  </Button>
                </div>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedControls.size === controls.length && controls.length > 0}
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead>Control ID</TableHead>
                    <TableHead>Control Name</TableHead>
                    <TableHead>Owner</TableHead>
                    <TableHead>Risk Level</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {controls.map((control) => (
                    <TableRow key={control.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedControls.has(control.id)}
                          onCheckedChange={() => handleSelectControl(control.id)}
                        />
                      </TableCell>
                      <TableCell className="font-medium">{control.id}</TableCell>
                      <TableCell>{control.name}</TableCell>
                      <TableCell>{control.owner}</TableCell>
                      <TableCell>
                        <Badge variant={
                          control.effectiveness === 'high' ? 'destructive' :
                          control.effectiveness === 'medium' ? 'default' : 'secondary'
                        }>
                          {control.effectiveness || 'Low'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-muted p-4 rounded-lg space-y-3">
                <h3 className="font-semibold">Risk-Based Assignment Rules</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-red-500" />
                    <span><strong>HIGH/CRITICAL Risks:</strong> Internal Audit (25-40 sample size)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-yellow-500" />
                    <span><strong>MEDIUM Risks:</strong> Controls Manager (10-20 sample size)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span><strong>LOW Risks:</strong> Control Owners (5-10 sample size)</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center p-4 border rounded-lg">
                <div>
                  <p className="font-medium">Ready to assign {controls.length} controls</p>
                  <p className="text-sm text-muted-foreground">
                    Controls will be automatically assigned based on risk priority
                  </p>
                </div>
                <Button onClick={handleRiskBasedAssignment} disabled={loading}>
                  <Send className="h-4 w-4 mr-2" />
                  Auto-Assign All Controls
                </Button>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Control ID</TableHead>
                    <TableHead>Control Name</TableHead>
                    <TableHead>Risk Level</TableHead>
                    <TableHead>Will Be Assigned To</TableHead>
                    <TableHead>Sample Size</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {controls.slice(0, 10).map((control) => {
                    let assignedRole = 'Control Owner';
                    let sampleSize = '5-10';
                    
                    if (control.effectiveness === 'high' || control.effectiveness === 'critical') {
                      assignedRole = 'Internal Audit';
                      sampleSize = '25-40';
                    } else if (control.effectiveness === 'medium') {
                      assignedRole = 'Controls Manager';
                      sampleSize = '10-20';
                    }

                    return (
                      <TableRow key={control.id}>
                        <TableCell className="font-medium">{control.id}</TableCell>
                        <TableCell>{control.name}</TableCell>
                        <TableCell>
                          <Badge variant={
                            control.effectiveness === 'high' ? 'destructive' :
                            control.effectiveness === 'medium' ? 'default' : 'secondary'
                          }>
                            {control.effectiveness || 'Low'}
                          </Badge>
                        </TableCell>
                        <TableCell>{assignedRole}</TableCell>
                        <TableCell>{sampleSize}</TableCell>
                      </TableRow>
                    );
                  })}
                  {controls.length > 10 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground">
                        ... and {controls.length - 10} more controls
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Controls to Tester</DialogTitle>
            <DialogDescription>
              Assign {selectedControls.size} selected control(s) to a tester
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Select Tester</Label>
              <Select value={selectedTester} onValueChange={setSelectedTester}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a tester..." />
                </SelectTrigger>
                <SelectContent>
                  {testers.map((tester) => (
                    <SelectItem key={tester.id} value={tester.id}>
                      {tester.name} ({tester.role})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Due Date</Label>
              <Input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>

            <div className="bg-muted p-3 rounded-lg">
              <p className="text-sm">
                <strong>Selected Controls:</strong> {selectedControls.size}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                All selected controls will be assigned to the chosen tester with the same due date.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAssignDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleBulkAssign} disabled={loading}>
              <Send className="h-4 w-4 mr-2" />
              Assign Controls
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
