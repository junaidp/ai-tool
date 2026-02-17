import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { apiService } from '@/services/api';
import type { EffectivenessCriteria } from '@/types';
import { Plus, CheckCircle, Clock, XCircle, Sparkles, FileText, Pencil, Trash2, Wand2 } from 'lucide-react';

export default function EffectivenessCriteriaPage() {
  const [criteria, setCriteria] = useState<EffectivenessCriteria[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAiDialogOpen, setIsAiDialogOpen] = useState(false);
  const [isAiEditDialogOpen, setIsAiEditDialogOpen] = useState(false);
  const [editingCriteria, setEditingCriteria] = useState<EffectivenessCriteria | null>(null);
  const [aiEditingCriteria, setAiEditingCriteria] = useState<EffectivenessCriteria | null>(null);
  const [aiEditPrompt, setAiEditPrompt] = useState('');
  const [isAiEditLoading, setIsAiEditLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    dimension: '',
    criteria: '',
    threshold: '',
    evidenceType: '',
    frequency: ''
  });

  const [aiFormData, setAiFormData] = useState({
    regulatoryPosture: '',
    operatingStage: '',
    complexity: '',
    governanceMaturity: ''
  });

  const loadCriteria = async () => {
    const data = await apiService.getEffectivenessCriteria();
    setCriteria(data);
  };

  useEffect(() => {
    loadCriteria();
  }, []);

  const handleSave = async () => {
    try {
      if (editingCriteria) {
        // Update existing criteria
        await apiService.updateEffectivenessCriteria(editingCriteria.id, {
          dimension: formData.dimension,
          criteria: formData.criteria,
          threshold: formData.threshold,
          evidenceType: formData.evidenceType.split(',').map(e => e.trim()),
          frequency: formData.frequency,
          status: 'in_review'
        });
      } else {
        // Create new criteria
        await apiService.createEffectivenessCriteria({
          dimension: formData.dimension,
          criteria: formData.criteria,
          threshold: formData.threshold,
          evidenceType: formData.evidenceType.split(',').map(e => e.trim()),
          frequency: formData.frequency,
          status: 'in_review'
        });
      }
      setIsDialogOpen(false);
      setEditingCriteria(null);
      setFormData({ dimension: '', criteria: '', threshold: '', evidenceType: '', frequency: '' });
      await loadCriteria();
    } catch (error) {
      console.error('Failed to save criteria:', error);
      alert('Failed to save criteria. Please try again.');
    }
  };

  const handleEdit = (item: EffectivenessCriteria) => {
    setEditingCriteria(item);
    setFormData({
      dimension: item.dimension,
      criteria: item.criteria,
      threshold: item.threshold,
      evidenceType: Array.isArray(item.evidenceType) ? item.evidenceType.join(', ') : item.evidenceType,
      frequency: item.frequency
    });
    setIsDialogOpen(true);
  };

  const handleAiEdit = (item: EffectivenessCriteria) => {
    setAiEditingCriteria(item);
    setAiEditPrompt('');
    setIsAiEditDialogOpen(true);
  };

  const handleAiEditSubmit = async () => {
    if (!aiEditPrompt.trim() || !aiEditingCriteria) {
      alert('Please enter your editing instructions');
      return;
    }

    setIsAiEditLoading(true);
    try {
      const response = await apiService.editCriteriaWithAI({
        criteriaId: aiEditingCriteria.id,
        currentCriteria: {
          dimension: aiEditingCriteria.dimension,
          criteria: aiEditingCriteria.criteria,
          threshold: aiEditingCriteria.threshold,
          evidenceType: aiEditingCriteria.evidenceType,
          frequency: aiEditingCriteria.frequency
        },
        editPrompt: aiEditPrompt
      });

      // Update the criteria with AI-generated changes
      await apiService.updateEffectivenessCriteria(aiEditingCriteria.id, {
        dimension: response.updatedCriteria.dimension,
        criteria: response.updatedCriteria.criteria,
        threshold: response.updatedCriteria.threshold,
        evidenceType: response.updatedCriteria.evidenceType,
        frequency: response.updatedCriteria.frequency,
        status: 'in_review'
      });

      setIsAiEditDialogOpen(false);
      setAiEditingCriteria(null);
      setAiEditPrompt('');
      await loadCriteria();
      alert('✨ Criteria updated successfully with AI!');
    } catch (error) {
      console.error('Failed to edit criteria with AI:', error);
      alert('Failed to edit criteria with AI. Please try again.');
    } finally {
      setIsAiEditLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this criteria? This action cannot be undone.')) {
      return;
    }
    try {
      await apiService.deleteEffectivenessCriteria(id);
      await loadCriteria();
    } catch (error) {
      console.error('Failed to delete criteria:', error);
      alert('Failed to delete criteria. Please try again.');
    }
  };

  const handleDialogClose = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      setEditingCriteria(null);
      setFormData({ dimension: '', criteria: '', threshold: '', evidenceType: '', frequency: '' });
    }
  };

  const handleAiGenerate = async () => {
    try {
      // Validate inputs
      if (!aiFormData.regulatoryPosture || !aiFormData.operatingStage || !aiFormData.complexity || !aiFormData.governanceMaturity) {
        alert('Please fill in all required fields');
        return;
      }

      // Call AI to generate criteria with categorization
      const response = await apiService.generateCriteriaWithAI({
        regulatoryPosture: aiFormData.regulatoryPosture,
        operatingStage: aiFormData.operatingStage,
        complexity: aiFormData.complexity,
        governanceMaturity: aiFormData.governanceMaturity
      });

      // Save all AI-generated criteria to database
      for (const criteria of response.criteria) {
        await apiService.createEffectivenessCriteria(criteria);
      }

      setIsAiDialogOpen(false);
      setAiFormData({ regulatoryPosture: '', operatingStage: '', complexity: '', governanceMaturity: '' });
      await loadCriteria();
      alert(`✨ AI successfully generated ${response.criteria.length} effectiveness criteria with categorization!`);
    } catch (error) {
      console.error('Failed to generate criteria:', error);
      alert('Failed to generate criteria with AI. Please try again.');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'in_review':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge variant="success">Approved</Badge>;
      case 'in_review':
        return <Badge variant="warning">In Review</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Effectiveness Criteria</h1>
          <p className="text-muted-foreground mt-1">
            Define and manage board-approved effectiveness framework
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isAiDialogOpen} onOpenChange={setIsAiDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Sparkles className="h-4 w-4 mr-2" />
                AI Generate
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>AI-Powered Criteria Generator</DialogTitle>
                <DialogDescription>
                  Generate effectiveness criteria based on your organization profile
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Regulatory Posture</Label>
                  <Select value={aiFormData.regulatoryPosture} onValueChange={(value) => setAiFormData({...aiFormData, regulatoryPosture: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select regulatory posture" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Regulated">Regulated</SelectItem>
                      <SelectItem value="Lightly regulated">Lightly regulated</SelectItem>
                      <SelectItem value="Unregulated">Unregulated</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Operating Stage</Label>
                  <Select value={aiFormData.operatingStage} onValueChange={(value) => setAiFormData({...aiFormData, operatingStage: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select operating stage" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="High-growth/Transformation">High-growth/Transformation</SelectItem>
                      <SelectItem value="Steady-state">Steady-state</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Complexity</Label>
                  <Select value={aiFormData.complexity} onValueChange={(value) => setAiFormData({...aiFormData, complexity: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select complexity level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Single entity">Single entity</SelectItem>
                      <SelectItem value="Group (moderate)">Group (moderate)</SelectItem>
                      <SelectItem value="Group (complex)">Group (complex)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Governance Maturity</Label>
                  <Select value={aiFormData.governanceMaturity} onValueChange={(value) => setAiFormData({...aiFormData, governanceMaturity: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select governance maturity" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Immature">Immature</SelectItem>
                      <SelectItem value="Developing">Developing</SelectItem>
                      <SelectItem value="Mature">Mature</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAiDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleAiGenerate}>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate Criteria
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={isAiEditDialogOpen} onOpenChange={setIsAiEditDialogOpen}>
            <DialogContent className="max-w-xl">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Wand2 className="h-5 w-5 text-purple-600" />
                  Edit Criteria with AI
                </DialogTitle>
                <DialogDescription>
                  Describe how you'd like to modify this criterion. AI will update it based on your instructions.
                </DialogDescription>
              </DialogHeader>
              
              {aiEditingCriteria && (
                <div className="space-y-4">
                  <div className="bg-muted p-3 rounded-lg space-y-2">
                    <div>
                      <span className="text-sm font-medium">Current Dimension:</span>
                      <p className="text-sm text-muted-foreground">{aiEditingCriteria.dimension}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium">Current Criteria:</span>
                      <p className="text-sm text-muted-foreground">{aiEditingCriteria.criteria}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium">Current Threshold:</span>
                      <p className="text-sm text-muted-foreground">{aiEditingCriteria.threshold}</p>
                    </div>
                  </div>

                  <div>
                    <Label>Your Instructions</Label>
                    <Textarea 
                      placeholder="E.g., 'Make the criteria more specific to a high growth company' or 'Adjust threshold to be more stringent' or 'Add focus on quarterly reviews'"
                      value={aiEditPrompt}
                      onChange={(e) => setAiEditPrompt(e.target.value)}
                      rows={4}
                      className="mt-1"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Describe the changes you want in natural language
                    </p>
                  </div>
                </div>
              )}

              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => setIsAiEditDialogOpen(false)}
                  disabled={isAiEditLoading}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleAiEditSubmit}
                  disabled={isAiEditLoading || !aiEditPrompt.trim()}
                >
                  {isAiEditLoading ? (
                    <>
                      <div className="animate-spin h-4 w-4 mr-2 border-2 border-current border-t-transparent rounded-full" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Wand2 className="h-4 w-4 mr-2" />
                      Apply AI Changes
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Criteria
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{editingCriteria ? 'Edit' : 'Add'} Effectiveness Criteria</DialogTitle>
                <DialogDescription>
                  {editingCriteria ? 'Update the effectiveness criterion' : 'Define a new effectiveness criterion for board approval'}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Dimension</Label>
                  <Select value={formData.dimension} onValueChange={(value) => setFormData({...formData, dimension: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select dimension" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Design">Design</SelectItem>
                      <SelectItem value="Implementation">Implementation</SelectItem>
                      <SelectItem value="Operation">Operation</SelectItem>
                      <SelectItem value="Decision-Use">Decision-Use</SelectItem>
                      <SelectItem value="Assurance">Assurance</SelectItem>
                      <SelectItem value="Outcomes">Outcomes</SelectItem>
                      <SelectItem value="Adaptability">Adaptability</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Criteria</Label>
                  <Textarea 
                    placeholder="What defines effectiveness for this dimension?" 
                    value={formData.criteria}
                    onChange={(e) => setFormData({...formData, criteria: e.target.value})}
                  />
                </div>
                <div>
                  <Label>Threshold</Label>
                  <Input 
                    placeholder="Quantifiable threshold (e.g., 95% compliance)" 
                    value={formData.threshold}
                    onChange={(e) => setFormData({...formData, threshold: e.target.value})}
                  />
                </div>
                <div>
                  <Label>Evidence Types</Label>
                  <Input 
                    placeholder="Required evidence (comma-separated)" 
                    value={formData.evidenceType}
                    onChange={(e) => setFormData({...formData, evidenceType: e.target.value})}
                  />
                </div>
                <div>
                  <Label>Frequency</Label>
                  <Select value={formData.frequency} onValueChange={(value) => setFormData({...formData, frequency: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="continuous">Continuous</SelectItem>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                      <SelectItem value="annual">Annual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => handleDialogClose(false)}>Cancel</Button>
                <Button onClick={handleSave}>{editingCriteria ? 'Update' : 'Submit for Approval'}</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Effectiveness Framework Overview</CardTitle>
          <CardDescription>
            Board-approved dimensions and criteria for assessing control framework effectiveness
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {criteria.map((item) => (
              <div key={item.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(item.status)}
                      <h3 className="font-semibold">{item.dimension}</h3>
                      {getStatusBadge(item.status)}
                      <Badge variant={item.categorization === 'C' ? 'destructive' : item.categorization === 'H' ? 'default' : 'secondary'}>
                        {item.categorization === 'B' ? 'Baseline' : item.categorization === 'H' ? 'High' : 'Critical'}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{item.criteria}</p>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(item)} title="Edit">
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleAiEdit(item)} title="Edit with AI">
                      <Wand2 className="h-4 w-4 text-purple-600" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(item.id)} title="Delete">
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Threshold:</span>
                    <p className="text-muted-foreground">{item.threshold}</p>
                  </div>
                  <div>
                    <span className="font-medium">Frequency:</span>
                    <p className="text-muted-foreground capitalize">{item.frequency}</p>
                  </div>
                </div>

                <div className="text-sm">
                  <span className="font-medium">Evidence Types:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {item.evidenceType.map((type, idx) => (
                      <Badge key={idx} variant="outline">{type}</Badge>
                    ))}
                  </div>
                </div>

                {item.approvedBy && (
                  <div className="text-xs text-muted-foreground border-t pt-2">
                    Approved by {item.approvedBy} on {new Date(item.approvedDate!).toLocaleDateString()}
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Basis of Declaration</CardTitle>
          <CardDescription>
            Supporting documentation for board statement on effectiveness
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Button variant="outline" className="w-full justify-start">
              <FileText className="h-4 w-4 mr-2" />
              Criteria Selection Rationale
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <FileText className="h-4 w-4 mr-2" />
              Board Monitoring & Review Process
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <FileText className="h-4 w-4 mr-2" />
              Evidence Supporting Conclusion
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <FileText className="h-4 w-4 mr-2" />
              Criteria Gap Analysis
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
