import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { apiService } from '@/services/api';
import type { BusinessContext, AIRiskCandidate } from '@/types';
import {
  ArrowLeft, ArrowRight, Check, X, Pencil, Sparkles, Loader2,
  Building2, Target, DollarSign, TrendingDown, AlertTriangle,
  ChevronDown, ChevronUp, Download, FileText
} from 'lucide-react';

const INDUSTRIES = [
  'Manufacturing',
  'SaaS / Technology',
  'Retail',
  'Professional Services',
  'Financial Services',
  'Healthcare',
  'Real Estate',
  'Construction',
  'Energy & Utilities',
  'Other',
];

const FUNDING_TYPES = [
  'Bootstrapped / Self-funded',
  'VC-backed',
  'Private Equity owned',
  'Bank debt / Loans',
  'Public company (listed)',
  'Other',
];

const STRATEGIC_PRIORITIES = [
  'Achieve/maintain profitability',
  'Grow revenue',
  'Launch new products/services',
  'Enter new markets/geographies',
  'Raise funding (next round)',
  'Improve operational efficiency',
  'Scale infrastructure/systems',
  'Acquire or integrate another company',
  'Prepare for exit/IPO',
];

type WizardPhase = 'context' | 'generating' | 'review' | 'editing' | 'prioritize' | 'summary';

interface AIRiskWizardProps {
  onComplete: (risks: AIRiskCandidate[]) => void;
  onCancel: () => void;
}

export default function AIRiskWizard({ onComplete, onCancel }: AIRiskWizardProps) {
  // Phase state
  const [phase, setPhase] = useState<WizardPhase>('context');

  // Phase 1: Business context
  const [context, setContext] = useState<BusinessContext>({
    industry: '',
    annualRevenue: '',
    employeeCount: '',
    isProfitable: '',
    fundingType: '',
    customerDescription: '',
    strategicPriorities: [],
  });

  // Phase 2: Generated risks
  const [risks, setRisks] = useState<AIRiskCandidate[]>([]);
  const [generationError, setGenerationError] = useState('');

  // Phase 3: Review state
  const [expandedRisk, setExpandedRisk] = useState<string | null>(null);

  // Phase 4: Editing state
  const [editingRisk, setEditingRisk] = useState<AIRiskCandidate | null>(null);
  const [editType, setEditType] = useState('');
  const [editDetails, setEditDetails] = useState('');
  const [isEditingSaving, setIsEditingSaving] = useState(false);

  // Phase 5: Prioritization
  // (uses risks state with userLikelihoodScore / userImpactScore)

  const isContextValid = context.industry && context.annualRevenue && context.customerDescription;

  const selectedRisks = risks.filter(r => r.selected);
  const removedRisks = risks.filter(r => r.selected === false);
  const editedRisks = risks.filter(r => r.edited);

  // ==================== PHASE 1: BUSINESS CONTEXT ====================

  const handleTogglePriority = (priority: string) => {
    setContext(prev => ({
      ...prev,
      strategicPriorities: prev.strategicPriorities.includes(priority)
        ? prev.strategicPriorities.filter(p => p !== priority)
        : prev.strategicPriorities.length < 3
          ? [...prev.strategicPriorities, priority]
          : prev.strategicPriorities,
    }));
  };

  const handleGenerateRisks = async () => {
    setPhase('generating');
    setGenerationError('');
    try {
      const result = await apiService.generatePrincipalRisksWithAI(context);
      const risksWithState = result.risks.map((r: AIRiskCandidate) => ({
        ...r,
        selected: r.recommendation === 'INCLUDE' || r.recommendation === 'CONSIDER',
        edited: false,
        userLikelihoodScore: r.likelihoodScore,
        userImpactScore: r.impactScore,
      }));
      setRisks(risksWithState);
      setPhase('review');
    } catch (error: any) {
      console.error('Failed to generate risks:', error);
      setGenerationError(error.message || 'Failed to generate risks. Please try again.');
      setPhase('context');
    }
  };

  // ==================== PHASE 3: REVIEW ====================

  const handleToggleRisk = (riskId: string) => {
    setRisks(prev => prev.map(r =>
      r.id === riskId ? { ...r, selected: !r.selected } : r
    ));
  };

  const handleStartEdit = (risk: AIRiskCandidate) => {
    setEditingRisk(risk);
    setEditType('');
    setEditDetails('');
    setPhase('editing');
  };

  // ==================== PHASE 4: EDITING ====================

  const handleSaveEdit = async () => {
    if (!editingRisk || !editType || !editDetails) return;
    setIsEditingSaving(true);
    try {
      const result = await apiService.editRiskDefinitionWithAI({
        originalRisk: {
          title: editingRisk.title,
          definition: editingRisk.definition,
          causes: editingRisk.causes,
          impacts: editingRisk.impacts,
        },
        userEdits: { editType, details: editDetails },
        businessContext: {
          industry: context.industry,
          annualRevenue: context.annualRevenue,
          employeeCount: context.employeeCount,
          customerDescription: context.customerDescription,
        },
      });

      setRisks(prev => prev.map(r =>
        r.id === editingRisk.id
          ? {
              ...r,
              title: result.title,
              definition: result.definition,
              causes: result.causes,
              impacts: result.impacts,
              edited: true,
            }
          : r
      ));

      setEditingRisk(null);
      setPhase('review');
    } catch (error: any) {
      console.error('Failed to edit risk:', error);
      alert('Failed to edit risk definition. Please try again.');
    } finally {
      setIsEditingSaving(false);
    }
  };

  // ==================== PHASE 5: PRIORITIZE ====================

  const handleScoreChange = (riskId: string, field: 'userLikelihoodScore' | 'userImpactScore', value: number) => {
    setRisks(prev => prev.map(r =>
      r.id === riskId ? { ...r, [field]: value } : r
    ));
  };

  // ==================== PHASE 6: COMPLETE ====================

  const handleComplete = () => {
    onComplete(selectedRisks);
  };

  const getPriorityLabel = (score: number) => {
    if (score >= 15) return { label: 'HIGH', color: 'bg-red-100 text-red-800' };
    if (score >= 8) return { label: 'MEDIUM', color: 'bg-yellow-100 text-yellow-800' };
    return { label: 'LOWER', color: 'bg-green-100 text-green-800' };
  };

  const getConfidenceBadge = (confidence: string) => {
    switch (confidence) {
      case 'HIGH': return 'bg-green-100 text-green-800 border-green-300';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'LOW': return 'bg-gray-100 text-gray-800 border-gray-300';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getThreatIcon = (tag: string) => {
    switch (tag) {
      case 'business_model': return <Building2 className="h-3 w-3" />;
      case 'performance': return <Target className="h-3 w-3" />;
      case 'solvency': return <DollarSign className="h-3 w-3" />;
      case 'liquidity': return <TrendingDown className="h-3 w-3" />;
      default: return <AlertTriangle className="h-3 w-3" />;
    }
  };

  // ==================== STEP INDICATOR ====================

  const steps = [
    { key: 'context', label: 'Business Context' },
    { key: 'review', label: 'Review Risks' },
    { key: 'prioritize', label: 'Prioritize' },
    { key: 'summary', label: 'Summary' },
  ];

  const currentStepIndex = steps.findIndex(s =>
    s.key === phase || (phase === 'generating' && s.key === 'context') || (phase === 'editing' && s.key === 'review')
  );

  const renderStepIndicator = () => (
    <div className="flex items-center justify-between mb-8">
      {steps.map((step, index) => (
        <div key={step.key} className="flex items-center flex-1">
          <div className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium border-2 ${
              index < currentStepIndex
                ? 'bg-blue-600 border-blue-600 text-white'
                : index === currentStepIndex
                  ? 'border-blue-600 text-blue-600 bg-blue-50'
                  : 'border-gray-300 text-gray-400'
            }`}>
              {index < currentStepIndex ? <Check className="h-4 w-4" /> : index + 1}
            </div>
            <span className={`ml-2 text-sm font-medium ${
              index <= currentStepIndex ? 'text-blue-600' : 'text-gray-400'
            }`}>
              {step.label}
            </span>
          </div>
          {index < steps.length - 1 && (
            <div className={`flex-1 h-0.5 mx-4 ${
              index < currentStepIndex ? 'bg-blue-600' : 'bg-gray-200'
            }`} />
          )}
        </div>
      ))}
    </div>
  );

  // ==================== RENDER PHASES ====================

  const renderContextPhase = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-3">
          <Sparkles className="h-4 w-4" />
          AI-Powered Risk Identification
        </div>
        <h2 className="text-2xl font-bold">Tell us about your business</h2>
        <p className="text-muted-foreground mt-1">Answer 5 quick questions so AI can generate tailored principal risks (5 minutes)</p>
      </div>

      {generationError && (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg border border-red-200">
          <p className="font-medium">Generation failed</p>
          <p className="text-sm mt-1">{generationError}</p>
        </div>
      )}

      {/* Question 1: Industry */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <span className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">1</span>
            What industry are you in?
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={context.industry} onValueChange={(v) => setContext(prev => ({ ...prev, industry: v }))}>
            <SelectTrigger>
              <SelectValue placeholder="Select your industry" />
            </SelectTrigger>
            <SelectContent>
              {INDUSTRIES.map(ind => (
                <SelectItem key={ind} value={ind}>{ind}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Question 2: Basic Financials */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <span className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">2</span>
            Three quick numbers about your business
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label className="text-sm">Annual Revenue</Label>
              <Input
                placeholder="e.g., £85M"
                value={context.annualRevenue}
                onChange={e => setContext(prev => ({ ...prev, annualRevenue: e.target.value }))}
              />
            </div>
            <div>
              <Label className="text-sm">Number of Employees</Label>
              <Input
                placeholder="e.g., 350"
                value={context.employeeCount}
                onChange={e => setContext(prev => ({ ...prev, employeeCount: e.target.value }))}
              />
            </div>
            <div>
              <Label className="text-sm">Are you profitable?</Label>
              <Select value={context.isProfitable} onValueChange={(v) => setContext(prev => ({ ...prev, isProfitable: v }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Yes">Yes</SelectItem>
                  <SelectItem value="No">No</SelectItem>
                  <SelectItem value="Break-even">Break-even</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Question 3: Funding */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <span className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">3</span>
            How is your business funded?
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={context.fundingType} onValueChange={(v) => setContext(prev => ({ ...prev, fundingType: v }))}>
            <SelectTrigger>
              <SelectValue placeholder="Select funding type" />
            </SelectTrigger>
            <SelectContent>
              {FUNDING_TYPES.map(ft => (
                <SelectItem key={ft} value={ft}>{ft}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Question 4: Customer Base */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <span className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">4</span>
            Describe your customer base in one sentence
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="E.g., We have 150 B2B customers, mainly in automotive and aerospace sectors. Top 3 represent 60% of revenue."
            value={context.customerDescription}
            onChange={e => setContext(prev => ({ ...prev, customerDescription: e.target.value }))}
            rows={3}
          />
        </CardContent>
      </Card>

      {/* Question 5: Strategic Priorities */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <span className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">5</span>
            What are your top 3 priorities this year? (Select up to 3)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2">
            {STRATEGIC_PRIORITIES.map(priority => {
              const isSelected = context.strategicPriorities.includes(priority);
              const isDisabled = !isSelected && context.strategicPriorities.length >= 3;
              return (
                <div
                  key={priority}
                  className={`flex items-center space-x-2 border rounded p-3 cursor-pointer transition-colors ${
                    isSelected ? 'bg-blue-50 border-blue-300' : isDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-accent'
                  }`}
                  onClick={() => !isDisabled && handleTogglePriority(priority)}
                >
                  <Checkbox
                    checked={isSelected}
                    disabled={isDisabled}
                    onCheckedChange={() => !isDisabled && handleTogglePriority(priority)}
                  />
                  <span className="text-sm">{priority}</span>
                </div>
              );
            })}
          </div>
          {context.strategicPriorities.length > 0 && (
            <p className="text-sm text-muted-foreground mt-2">
              Selected: {context.strategicPriorities.length}/3
            </p>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
        <Button onClick={handleGenerateRisks} disabled={!isContextValid}>
          <Sparkles className="h-4 w-4 mr-2" />
          Generate Principal Risks with AI
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );

  const renderGeneratingPhase = () => (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="relative mb-8">
        <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center">
          <Sparkles className="h-10 w-10 text-blue-600 animate-pulse" />
        </div>
        <Loader2 className="h-24 w-24 text-blue-600 animate-spin absolute -top-2 -left-2" />
      </div>
      <h2 className="text-2xl font-bold mb-2">AI is analyzing your business...</h2>
      <p className="text-muted-foreground text-center max-w-md mb-6">
        Generating tailored principal risks based on your {context.industry} business profile.
        This typically takes 15-30 seconds.
      </p>
      <div className="w-64">
        <Progress value={undefined} className="h-2" />
      </div>
      <div className="mt-8 text-sm text-muted-foreground space-y-2 text-center">
        <p>Loading {context.industry} risk patterns...</p>
        <p>Analyzing financial profile ({context.annualRevenue} revenue)...</p>
        <p>Parsing customer base description...</p>
        <p>Generating board-quality definitions...</p>
      </div>
    </div>
  );

  const renderReviewPhase = () => (
    <div className="space-y-6">
      <div className="text-center mb-4">
        <h2 className="text-2xl font-bold">
          We&apos;ve identified {risks.length} potential principal risks
        </h2>
        <p className="text-muted-foreground mt-1">
          Review each one: Keep if relevant, Remove if not applicable, Edit to adjust wording
        </p>
      </div>

      <div className="flex items-center gap-6 bg-muted/50 rounded-lg p-4">
        <div className="flex items-center gap-2">
          <Check className="h-4 w-4 text-green-600" />
          <span className="text-sm font-medium">Selected: {selectedRisks.length}</span>
        </div>
        <div className="flex items-center gap-2">
          <X className="h-4 w-4 text-red-600" />
          <span className="text-sm font-medium">Removed: {removedRisks.length}</span>
        </div>
        <div className="flex items-center gap-2">
          <Pencil className="h-4 w-4 text-blue-600" />
          <span className="text-sm font-medium">Edited: {editedRisks.length}</span>
        </div>
        <div className="ml-auto text-sm text-muted-foreground">
          FRC recommends 8-15 risks
        </div>
      </div>

      <div className="space-y-3">
        {risks.map((risk, index) => {
          const isExpanded = expandedRisk === risk.id;
          const riskScore = (risk.userLikelihoodScore || risk.likelihoodScore) * (risk.userImpactScore || risk.impactScore);
          const priority = getPriorityLabel(riskScore);

          return (
            <Card key={risk.id} className={`transition-all ${
              risk.selected === false ? 'opacity-50 border-red-200' : risk.selected ? 'border-green-200' : ''
            }`}>
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  {/* Selection toggle */}
                  <button
                    onClick={() => handleToggleRisk(risk.id)}
                    className={`mt-1 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                      risk.selected
                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                        : 'bg-red-100 text-red-700 hover:bg-red-200'
                    }`}
                  >
                    {risk.selected ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                  </button>

                  <div className="flex-1 min-w-0">
                    {/* Header row */}
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium text-muted-foreground">#{index + 1}</span>
                      <Badge variant="outline" className="text-xs">{risk.category}</Badge>
                      <Badge className={`text-xs ${getConfidenceBadge(risk.confidence)}`}>
                        {risk.confidence} confidence
                      </Badge>
                      <Badge className={`text-xs ${priority.color}`}>
                        Score: {riskScore} ({priority.label})
                      </Badge>
                      {risk.edited && (
                        <Badge variant="outline" className="text-xs text-blue-600 border-blue-300">Edited</Badge>
                      )}
                    </div>

                    {/* Title */}
                    <h3 className="font-semibold text-base">{risk.title}</h3>

                    {/* AI recommendation */}
                    <p className="text-sm text-blue-600 mt-1">
                      AI says: {risk.confidence} priority — {risk.confidenceReasoning}
                    </p>

                    {/* Expandable details */}
                    <button
                      onClick={() => setExpandedRisk(isExpanded ? null : risk.id)}
                      className="text-sm text-muted-foreground flex items-center gap-1 mt-2 hover:text-foreground"
                    >
                      {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                      {isExpanded ? 'Hide details' : 'Show full definition'}
                    </button>

                    {isExpanded && (
                      <div className="mt-3 space-y-3 border-t pt-3">
                        <div>
                          <p className="text-sm font-medium mb-1">Definition:</p>
                          <p className="text-sm text-muted-foreground">{risk.definition}</p>
                        </div>

                        <div>
                          <p className="text-sm font-medium mb-1">Causes / Drivers:</p>
                          <ul className="text-sm text-muted-foreground list-disc list-inside">
                            {risk.causes.map((c, i) => <li key={i}>{c}</li>)}
                          </ul>
                        </div>

                        <div>
                          <p className="text-sm font-medium mb-1">Potential Impacts:</p>
                          <ul className="text-sm text-muted-foreground list-disc list-inside">
                            {risk.impacts.map((imp, i) => <li key={i}>{imp}</li>)}
                          </ul>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <span className="text-xs text-muted-foreground">Threatens:</span>
                          {risk.threatCategories.map(tag => (
                            <Badge key={tag} variant="outline" className="text-xs flex items-center gap-1">
                              {getThreatIcon(tag)}
                              {tag.replace('_', ' ')}
                            </Badge>
                          ))}
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <span className="text-xs text-muted-foreground">Domains:</span>
                          {risk.domainTags.map(tag => (
                            <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                          ))}
                        </div>

                        <div className="text-xs text-muted-foreground">
                          <span>Likelihood: {risk.likelihoodScore}/5</span>
                          <span className="mx-2">|</span>
                          <span>Impact: {risk.impactScore}/5</span>
                          <span className="mx-2">|</span>
                          <span>{risk.likelihoodReasoning}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-1 flex-shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleStartEdit(risk)}
                      title="Edit definition"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={() => setPhase('context')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Context
        </Button>
        <Button onClick={() => setPhase('prioritize')} disabled={selectedRisks.length === 0}>
          Continue to Prioritization
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );

  const renderEditingPhase = () => {
    if (!editingRisk) return null;

    return (
      <Dialog open={true} onOpenChange={() => { setEditingRisk(null); setPhase('review'); }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Risk: {editingRisk.title}</DialogTitle>
            <DialogDescription>
              Tell us what to change and AI will regenerate the definition
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="bg-muted/50 rounded-lg p-4">
              <p className="text-sm font-medium mb-2">Current Definition:</p>
              <p className="text-sm text-muted-foreground">{editingRisk.definition}</p>
            </div>

            <div>
              <Label className="mb-2 block">What would you like to change?</Label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: 'specific_details', label: 'Make details more specific (names, numbers)' },
                  { value: 'adjust_figures', label: 'Adjust the financial figures' },
                  { value: 'change_causes', label: 'Change the causes/drivers' },
                  { value: 'change_impact', label: 'Adjust the impact description' },
                  { value: 'rewrite_tone', label: 'Rewrite the tone/wording' },
                  { value: 'other', label: 'Something else' },
                ].map(option => (
                  <div
                    key={option.value}
                    className={`border rounded p-3 cursor-pointer text-sm transition-colors ${
                      editType === option.value
                        ? 'bg-blue-50 border-blue-300 text-blue-700'
                        : 'hover:bg-accent'
                    }`}
                    onClick={() => setEditType(option.value)}
                  >
                    {option.label}
                  </div>
                ))}
              </div>
            </div>

            {editType && (
              <div>
                <Label className="mb-2 block">Provide the specific details:</Label>
                <Textarea
                  placeholder={
                    editType === 'specific_details'
                      ? 'E.g., Our top 3 customers are Acme Corp, TechGiant Ltd, and MegaCo. They represent 45% of revenue.'
                      : editType === 'adjust_figures'
                        ? 'E.g., Our actual inventory value is £18M, not the estimated figure.'
                        : 'Describe what you want to change...'
                  }
                  value={editDetails}
                  onChange={e => setEditDetails(e.target.value)}
                  rows={3}
                />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => { setEditingRisk(null); setPhase('review'); }}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveEdit}
              disabled={!editType || !editDetails || isEditingSaving}
            >
              {isEditingSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  AI is rewriting...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Regenerate Definition
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };

  const renderPrioritizePhase = () => (
    <div className="space-y-6">
      <div className="text-center mb-4">
        <h2 className="text-2xl font-bold">Prioritize Your Risks</h2>
        <p className="text-muted-foreground mt-1">
          Review AI scoring and adjust if needed. Likelihood x Impact = Risk Score.
        </p>
      </div>

      <div className="grid grid-cols-5 gap-4 text-xs font-medium text-muted-foreground px-4 pb-2 border-b">
        <div className="col-span-2">Risk</div>
        <div className="text-center">Likelihood (1-5)</div>
        <div className="text-center">Impact (1-5)</div>
        <div className="text-center">Score & Priority</div>
      </div>

      <div className="space-y-3">
        {selectedRisks.map(risk => {
          const likelihood = risk.userLikelihoodScore || risk.likelihoodScore;
          const impact = risk.userImpactScore || risk.impactScore;
          const score = likelihood * impact;
          const priority = getPriorityLabel(score);

          return (
            <Card key={risk.id}>
              <CardContent className="p-4">
                <div className="grid grid-cols-5 gap-4 items-center">
                  {/* Risk info */}
                  <div className="col-span-2">
                    <h4 className="font-medium text-sm">{risk.title}</h4>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{risk.definition}</p>
                  </div>

                  {/* Likelihood */}
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      {[1, 2, 3, 4, 5].map(val => (
                        <button
                          key={val}
                          onClick={() => handleScoreChange(risk.id, 'userLikelihoodScore', val)}
                          className={`w-8 h-8 rounded text-xs font-medium transition-colors ${
                            val === likelihood
                              ? 'bg-blue-600 text-white'
                              : val <= likelihood
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                          }`}
                        >
                          {val}
                        </button>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground">{risk.likelihoodReasoning}</p>
                  </div>

                  {/* Impact */}
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      {[1, 2, 3, 4, 5].map(val => (
                        <button
                          key={val}
                          onClick={() => handleScoreChange(risk.id, 'userImpactScore', val)}
                          className={`w-8 h-8 rounded text-xs font-medium transition-colors ${
                            val === impact
                              ? 'bg-orange-600 text-white'
                              : val <= impact
                                ? 'bg-orange-100 text-orange-700'
                                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                          }`}
                        >
                          {val}
                        </button>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground">{risk.impactReasoning}</p>
                  </div>

                  {/* Score */}
                  <div className="text-center">
                    <div className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-bold ${priority.color}`}>
                      {score}
                    </div>
                    <p className="text-xs font-medium mt-1">{priority.label} PRIORITY</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Priority distribution */}
      <Card className="bg-muted/30">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-red-500" />
                <span className="text-sm">
                  HIGH: {selectedRisks.filter(r => ((r.userLikelihoodScore || r.likelihoodScore) * (r.userImpactScore || r.impactScore)) >= 15).length} risks
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-yellow-500" />
                <span className="text-sm">
                  MEDIUM: {selectedRisks.filter(r => {
                    const s = (r.userLikelihoodScore || r.likelihoodScore) * (r.userImpactScore || r.impactScore);
                    return s >= 8 && s < 15;
                  }).length} risks
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-green-500" />
                <span className="text-sm">
                  LOWER: {selectedRisks.filter(r => ((r.userLikelihoodScore || r.likelihoodScore) * (r.userImpactScore || r.impactScore)) < 8).length} risks
                </span>
              </div>
            </div>
            <span className="text-sm text-muted-foreground">Total: {selectedRisks.length} risks</span>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={() => setPhase('review')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Review
        </Button>
        <Button onClick={() => setPhase('summary')}>
          View Summary & Complete
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );

  const renderSummaryPhase = () => {
    const highRisks = selectedRisks.filter(r => ((r.userLikelihoodScore || r.likelihoodScore) * (r.userImpactScore || r.impactScore)) >= 15);
    const medRisks = selectedRisks.filter(r => {
      const s = (r.userLikelihoodScore || r.likelihoodScore) * (r.userImpactScore || r.impactScore);
      return s >= 8 && s < 15;
    });
    const lowRisks = selectedRisks.filter(r => ((r.userLikelihoodScore || r.likelihoodScore) * (r.userImpactScore || r.impactScore)) < 8);

    return (
      <div className="space-y-6">
        <div className="text-center mb-4">
          <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-full text-sm font-medium mb-3">
            <Check className="h-4 w-4" />
            Risk Identification Complete
          </div>
          <h2 className="text-2xl font-bold">Principal Risk Summary</h2>
          <p className="text-muted-foreground mt-1">
            {selectedRisks.length} principal risks identified for your {context.industry} business
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold text-blue-600">{selectedRisks.length}</div>
              <p className="text-sm text-muted-foreground">Total Risks</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold text-red-600">{highRisks.length}</div>
              <p className="text-sm text-muted-foreground">High Priority</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold text-yellow-600">{medRisks.length}</div>
              <p className="text-sm text-muted-foreground">Medium Priority</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold text-green-600">{lowRisks.length}</div>
              <p className="text-sm text-muted-foreground">Lower Priority</p>
            </CardContent>
          </Card>
        </div>

        {/* Risk Register Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Risk Register
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-3 font-medium">#</th>
                    <th className="text-left p-3 font-medium">Risk Title</th>
                    <th className="text-left p-3 font-medium">Threat Category</th>
                    <th className="text-left p-3 font-medium">Domains</th>
                    <th className="text-center p-3 font-medium">L</th>
                    <th className="text-center p-3 font-medium">I</th>
                    <th className="text-center p-3 font-medium">Score</th>
                    <th className="text-center p-3 font-medium">Priority</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedRisks
                    .sort((a, b) => {
                      const scoreA = (a.userLikelihoodScore || a.likelihoodScore) * (a.userImpactScore || a.impactScore);
                      const scoreB = (b.userLikelihoodScore || b.likelihoodScore) * (b.userImpactScore || b.impactScore);
                      return scoreB - scoreA;
                    })
                    .map((risk, idx) => {
                      const l = risk.userLikelihoodScore || risk.likelihoodScore;
                      const i = risk.userImpactScore || risk.impactScore;
                      const score = l * i;
                      const priority = getPriorityLabel(score);
                      return (
                        <tr key={risk.id} className="border-t">
                          <td className="p-3 text-muted-foreground">{idx + 1}</td>
                          <td className="p-3 font-medium">{risk.title}</td>
                          <td className="p-3">
                            <div className="flex flex-wrap gap-1">
                              {risk.threatCategories.map(t => (
                                <Badge key={t} variant="outline" className="text-xs flex items-center gap-1">
                                  {getThreatIcon(t)}
                                  {t.replace('_', ' ')}
                                </Badge>
                              ))}
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="flex flex-wrap gap-1">
                              {risk.domainTags.map(d => (
                                <Badge key={d} variant="secondary" className="text-xs">{d}</Badge>
                              ))}
                            </div>
                          </td>
                          <td className="p-3 text-center">{l}</td>
                          <td className="p-3 text-center">{i}</td>
                          <td className="p-3 text-center font-bold">{score}</td>
                          <td className="p-3 text-center">
                            <Badge className={`text-xs ${priority.color}`}>{priority.label}</Badge>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Methodology note */}
        <Card className="bg-blue-50/50 border-blue-200">
          <CardContent className="p-4">
            <h4 className="font-medium text-sm mb-2">Methodology</h4>
            <p className="text-sm text-muted-foreground">
              These {selectedRisks.length} principal risks were identified through an AI-assisted structured assessment
              of the business context for a {context.industry} company with {context.annualRevenue} annual revenue
              and {context.employeeCount} employees. Risks are scored on a 1-5 Likelihood × Impact matrix
              (max score 25). Strategic priorities considered: {context.strategicPriorities.join(', ')}.
            </p>
          </CardContent>
        </Card>

        <div className="flex justify-between pt-4">
          <Button variant="outline" onClick={() => setPhase('prioritize')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Prioritization
          </Button>
          <Button onClick={handleComplete} className="bg-green-600 hover:bg-green-700">
            <Check className="h-4 w-4 mr-2" />
            Save {selectedRisks.length} Principal Risks
          </Button>
        </div>
      </div>
    );
  };

  // ==================== MAIN RENDER ====================

  return (
    <div className="max-w-5xl mx-auto">
      {renderStepIndicator()}

      {phase === 'context' && renderContextPhase()}
      {phase === 'generating' && renderGeneratingPhase()}
      {phase === 'review' && renderReviewPhase()}
      {phase === 'editing' && (
        <>
          {renderReviewPhase()}
          {renderEditingPhase()}
        </>
      )}
      {phase === 'prioritize' && renderPrioritizePhase()}
      {phase === 'summary' && renderSummaryPhase()}
    </div>
  );
}
