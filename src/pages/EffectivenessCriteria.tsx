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
import { Plus, CheckCircle, Clock, XCircle, Sparkles, FileText } from 'lucide-react';

export default function EffectivenessCriteriaPage() {
  const [criteria, setCriteria] = useState<EffectivenessCriteria[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAiDialogOpen, setIsAiDialogOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    dimension: '',
    criteria: '',
    threshold: '',
    evidenceType: '',
    frequency: ''
  });

  const [aiFormData, setAiFormData] = useState({
    sector: '',
    operatingModel: '',
    riskProfile: '',
    regulations: ''
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
      await apiService.createEffectivenessCriteria({
        dimension: formData.dimension,
        criteria: formData.criteria,
        threshold: formData.threshold,
        evidenceType: formData.evidenceType.split(',').map(e => e.trim()),
        frequency: formData.frequency,
        status: 'in_review'
      });
      setIsDialogOpen(false);
      setFormData({ dimension: '', criteria: '', threshold: '', evidenceType: '', frequency: '' });
      await loadCriteria(); // Refresh the list
    } catch (error) {
      console.error('Failed to save criteria:', error);
      alert('Failed to save criteria. Please try again.');
    }
  };

  const handleAiGenerate = async () => {
    try {
      // Validate inputs
      if (!aiFormData.sector || !aiFormData.operatingModel || !aiFormData.riskProfile) {
        alert('Please fill in all required fields (sector, operating model, and risk profile)');
        return;
      }

      // Call OpenAI GPT-4 via backend
      const response = await apiService.generateCriteriaWithAI({
        sector: aiFormData.sector,
        operatingModel: aiFormData.operatingModel,
        riskProfile: aiFormData.riskProfile,
        regulations: aiFormData.regulations
      });

      // Save all AI-generated criteria to database
      for (const criteria of response.criteria) {
        await apiService.createEffectivenessCriteria(criteria);
      }

      setIsAiDialogOpen(false);
      setAiFormData({ sector: '', operatingModel: '', riskProfile: '', regulations: '' });
      await loadCriteria(); // Refresh the list
      alert(`✨ AI successfully generated ${response.criteria.length} effectiveness criteria!`);
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
                  <Label>Industry Sector</Label>
                  <Select value={aiFormData.sector} onValueChange={(value) => setAiFormData({...aiFormData, sector: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select sector" />
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
                  <Label>Operating Model</Label>
                  <Select value={aiFormData.operatingModel} onValueChange={(value) => setAiFormData({...aiFormData, operatingModel: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select model" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Centralized">Centralized</SelectItem>
                      <SelectItem value="Decentralized">Decentralized</SelectItem>
                      <SelectItem value="Hybrid">Hybrid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Risk Profile</Label>
                  <Select value={aiFormData.riskProfile} onValueChange={(value) => setAiFormData({...aiFormData, riskProfile: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select profile" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low Risk</SelectItem>
                      <SelectItem value="moderate">Moderate Risk</SelectItem>
                      <SelectItem value="high">High Risk</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Regulatory Obligations</Label>
                  <Textarea 
                    placeholder="List key regulations (e.g., SOX, GDPR, HIPAA)" 
                    value={aiFormData.regulations}
                    onChange={(e) => setAiFormData({...aiFormData, regulations: e.target.value})}
                  />
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

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Criteria
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add Effectiveness Criteria</DialogTitle>
                <DialogDescription>
                  Define a new effectiveness criterion for board approval
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
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleSave}>Submit for Approval</Button>
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
                    </div>
                    <p className="text-sm text-muted-foreground">{item.criteria}</p>
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
