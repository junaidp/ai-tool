import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { apiService } from '@/services/api';
import type { PrincipalRisk, AIRiskCandidate } from '@/types';
import { Plus, AlertTriangle, Pencil, Trash2, TrendingDown, DollarSign, Target, Building2, Sparkles } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import AIRiskWizard from '@/components/AIRiskWizard';

export default function PrincipalRisksPage() {
  const [risks, setRisks] = useState<PrincipalRisk[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRisk, setEditingRisk] = useState<PrincipalRisk | null>(null);
  const [showAIWizard, setShowAIWizard] = useState(false);
  const [isSavingAIRisks, setIsSavingAIRisks] = useState(false);
  
  const [formData, setFormData] = useState({
    riskTitle: '',
    riskStatement: '',
    domainTags: [] as string[],
    threatLensTags: [] as string[],
    riskOwner: ''
  });

  const loadRisks = async () => {
    const data = await apiService.getPrincipalRisks();
    setRisks(data);
  };

  useEffect(() => {
    loadRisks();
  }, []);

  const handleSave = async () => {
    try {
      if (editingRisk) {
        await apiService.updatePrincipalRisk(editingRisk.id, formData);
      } else {
        await apiService.createPrincipalRisk(formData);
      }
      setIsDialogOpen(false);
      setEditingRisk(null);
      setFormData({ riskTitle: '', riskStatement: '', domainTags: [], threatLensTags: [], riskOwner: '' });
      await loadRisks();
    } catch (error) {
      console.error('Failed to save risk:', error);
      alert('Failed to save principal risk. Please try again.');
    }
  };

  const handleEdit = (risk: PrincipalRisk) => {
    setEditingRisk(risk);
    setFormData({
      riskTitle: risk.riskTitle,
      riskStatement: risk.riskStatement,
      domainTags: risk.domainTags,
      threatLensTags: risk.threatLensTags,
      riskOwner: risk.riskOwner
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this principal risk?')) {
      return;
    }
    try {
      await apiService.deletePrincipalRisk(id);
      await loadRisks();
    } catch (error) {
      console.error('Failed to delete risk:', error);
      alert('Failed to delete principal risk. Please try again.');
    }
  };

  const handleAIWizardComplete = async (aiRisks: AIRiskCandidate[]) => {
    setIsSavingAIRisks(true);
    try {
      for (const aiRisk of aiRisks) {
        await apiService.createPrincipalRisk({
          riskTitle: aiRisk.title,
          riskStatement: aiRisk.definition
            + '\n\nCauses: ' + aiRisk.causes.join('; ')
            + '\n\nImpacts: ' + aiRisk.impacts.join('; ')
            + '\n\nLikelihood: ' + (aiRisk.userLikelihoodScore || aiRisk.likelihoodScore) + '/5'
            + ' | Impact: ' + (aiRisk.userImpactScore || aiRisk.impactScore) + '/5'
            + ' | Score: ' + ((aiRisk.userLikelihoodScore || aiRisk.likelihoodScore) * (aiRisk.userImpactScore || aiRisk.impactScore)) + '/25',
          domainTags: aiRisk.domainTags,
          threatLensTags: aiRisk.threatCategories,
          riskOwner: 'To be assigned',
        });
      }
      setShowAIWizard(false);
      await loadRisks();
    } catch (error) {
      console.error('Failed to save AI-generated risks:', error);
      alert('Failed to save some risks. Please try again.');
    } finally {
      setIsSavingAIRisks(false);
    }
  };

  const getThreatIcon = (tag: string) => {
    switch (tag) {
      case 'business_model':
        return <Building2 className="h-4 w-4" />;
      case 'performance':
        return <Target className="h-4 w-4" />;
      case 'solvency':
        return <DollarSign className="h-4 w-4" />;
      case 'liquidity':
        return <TrendingDown className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const toggleDomainTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      domainTags: prev.domainTags.includes(tag)
        ? prev.domainTags.filter(t => t !== tag)
        : [...prev.domainTags, tag]
    }));
  };

  const toggleThreatTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      threatLensTags: prev.threatLensTags.includes(tag)
        ? prev.threatLensTags.filter(t => t !== tag)
        : [...prev.threatLensTags, tag]
    }));
  };

  if (showAIWizard) {
    return (
      <div className="space-y-6">
        <AIRiskWizard
          onComplete={handleAIWizardComplete}
          onCancel={() => setShowAIWizard(false)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Principal Risks</h1>
          <p className="text-muted-foreground mt-1">
            Risks that could threaten business model, performance, solvency, or liquidity
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowAIWizard(true)} className="border-blue-300 text-blue-700 hover:bg-blue-50">
            <Sparkles className="h-4 w-4 mr-2" />
            AI Risk Identification
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Manual Risk
              </Button>
            </DialogTrigger>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>{editingRisk ? 'Edit' : 'Add'} Principal Risk</DialogTitle>
              <DialogDescription>
                Define a principal risk that could threaten the company's viability
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Risk Title</Label>
                <Input 
                  placeholder="e.g., Cybersecurity breach exposing customer data" 
                  value={formData.riskTitle}
                  onChange={(e) => setFormData({...formData, riskTitle: e.target.value})}
                />
              </div>
              <div>
                <Label>Risk Statement</Label>
                <Textarea 
                  placeholder="Describe the specific risk event or circumstance, its potential impact, and why it qualifies as a principal risk"
                  value={formData.riskStatement}
                  onChange={(e) => setFormData({...formData, riskStatement: e.target.value})}
                  rows={4}
                />
              </div>
              
              <div>
                <Label className="mb-2 block">Threat Lens (Select all that apply)</Label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: 'business_model', label: 'Business Model', icon: Building2 },
                    { value: 'performance', label: 'Performance', icon: Target },
                    { value: 'solvency', label: 'Solvency', icon: DollarSign },
                    { value: 'liquidity', label: 'Liquidity', icon: TrendingDown }
                  ].map(({ value, label, icon: Icon }) => (
                    <div key={value} className="flex items-center space-x-2 border rounded p-3 cursor-pointer hover:bg-accent"
                         onClick={() => toggleThreatTag(value)}>
                      <Checkbox
                        checked={formData.threatLensTags.includes(value)}
                        onCheckedChange={() => toggleThreatTag(value)}
                      />
                      <Icon className="h-4 w-4" />
                      <span className="text-sm">{label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label className="mb-2 block">Control Domains (Select all that apply)</Label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: 'ops', label: 'Operations' },
                    { value: 'reporting', label: 'Reporting' },
                    { value: 'financial', label: 'Financial' },
                    { value: 'compliance', label: 'Compliance' }
                  ].map(({ value, label }) => (
                    <div key={value} className="flex items-center space-x-2 border rounded p-3 cursor-pointer hover:bg-accent"
                         onClick={() => toggleDomainTag(value)}>
                      <Checkbox
                        checked={formData.domainTags.includes(value)}
                        onCheckedChange={() => toggleDomainTag(value)}
                      />
                      <span className="text-sm">{label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label>Risk Owner</Label>
                <Input 
                  placeholder="e.g., Chief Information Security Officer" 
                  value={formData.riskOwner}
                  onChange={(e) => setFormData({...formData, riskOwner: e.target.value})}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSave}>{editingRisk ? 'Update' : 'Create'} Risk</Button>
            </DialogFooter>
          </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Principal Risk Register</CardTitle>
          <CardDescription>
            FRC guidance suggests 8-15 principal risks is typical for most organizations
          </CardDescription>
        </CardHeader>
        <CardContent>
          {risks.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No principal risks defined yet.</p>
              <p className="text-sm mt-2">Click &quot;Add Manual Risk&quot; or use &quot;AI Risk Identification&quot; to get started.</p>
              <Button
                variant="outline"
                className="mt-4 border-blue-300 text-blue-700 hover:bg-blue-50"
                onClick={() => setShowAIWizard(true)}
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Start AI-Powered Risk Identification (5 min)
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {risks.map((risk) => (
                <div key={risk.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-orange-600" />
                        <h3 className="font-semibold text-lg">{risk.riskTitle}</h3>
                      </div>
                      <p className="text-sm text-muted-foreground">{risk.riskStatement}</p>
                      
                      <div className="flex flex-wrap gap-2 mt-3">
                        <div className="text-xs text-muted-foreground">Threatens:</div>
                        {risk.threatLensTags.map((tag) => (
                          <Badge key={tag} variant="outline" className="flex items-center gap-1">
                            {getThreatIcon(tag)}
                            {tag.replace('_', ' ')}
                          </Badge>
                        ))}
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <div className="text-xs text-muted-foreground">Domains:</div>
                        {risk.domainTags.map((tag) => (
                          <Badge key={tag} variant="secondary">
                            {tag}
                          </Badge>
                        ))}
                      </div>

                      <div className="text-sm text-muted-foreground">
                        <span className="font-medium">Owner:</span> {risk.riskOwner}
                      </div>
                    </div>
                    
                    <div className="flex gap-2 ml-4">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(risk)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(risk.id)}>
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Principal Risk Guidelines</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm max-w-none">
          <h4>What qualifies as a Principal Risk?</h4>
          <p>Principal risks are those that could <strong>threaten</strong>:</p>
          <ul>
            <li><strong>Business Model:</strong> How you create and deliver value</li>
            <li><strong>Future Performance:</strong> Your ability to achieve strategic objectives</li>
            <li><strong>Solvency:</strong> Your ability to meet obligations and maintain positive net assets</li>
            <li><strong>Liquidity:</strong> Access to cash and funding for short-term obligations</li>
          </ul>
          
          <h4>What Principal Risks are NOT:</h4>
          <ul>
            <li>Not every risk is a "principal risk" - focus on material, strategic-level risks</li>
            <li>Day-to-day operational issues typically don't qualify unless they have systemic impact</li>
            <li>Financial statement risks are not automatically principal risks</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
