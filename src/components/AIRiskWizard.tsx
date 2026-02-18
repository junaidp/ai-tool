import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import type { BusinessContext, AIRiskCandidate, ThreatCategory, CategoryAnswers } from '@/types';
import {
  ArrowLeft, ArrowRight, Check, X, Pencil, Sparkles, Loader2,
  Building2, Target, DollarSign, TrendingDown, AlertTriangle,
  ChevronDown, ChevronUp, FileText
} from 'lucide-react';

// ==================== CONSTANTS ====================

const INDUSTRIES = [
  'Manufacturing', 'SaaS / Technology', 'Retail', 'Professional Services',
  'Financial Services', 'Healthcare', 'Real Estate', 'Construction',
  'Energy & Utilities', 'Other',
];

const FUNDING_TYPES = [
  'Bootstrapped / Self-funded', 'VC-backed', 'Private Equity owned',
  'Bank debt / Loans', 'Public company (listed)', 'Other',
];

const STRATEGIC_PRIORITIES = [
  'Achieve/maintain profitability', 'Grow revenue', 'Launch new products/services',
  'Enter new markets/geographies', 'Raise funding (next round)',
  'Improve operational efficiency', 'Scale infrastructure/systems',
  'Acquire or integrate another company', 'Prepare for exit/IPO',
];

const THREAT_CATEGORIES: { key: ThreatCategory; label: string; description: string; icon: typeof Building2; color: string }[] = [
  { key: 'business_model', label: 'Business Model', description: 'Threats that could fundamentally undermine how you create and deliver value, making your business unviable.', icon: Building2, color: 'text-purple-600' },
  { key: 'performance', label: 'Performance', description: 'Threats that could materially impair your ability to achieve strategic objectives or maintain competitive position.', icon: Target, color: 'text-blue-600' },
  { key: 'solvency', label: 'Solvency', description: 'Threats that could impair your ability to meet obligations or result in negative net assets.', icon: DollarSign, color: 'text-orange-600' },
  { key: 'liquidity', label: 'Liquidity', description: 'Threats that could restrict your access to cash or funding for short-term obligations.', icon: TrendingDown, color: 'text-red-600' },
];

interface CategoryQuestion {
  id: string;
  question: string;
  type: 'text' | 'textarea' | 'radio' | 'checkbox';
  placeholder?: string;
  options?: string[];
}

const CATEGORY_QUESTIONS: Record<ThreatCategory, CategoryQuestion[]> = {
  business_model: [
    { id: 'core_value', question: 'What is the ONE thing your business MUST be able to do to survive?', type: 'textarea', placeholder: 'e.g., Deliver precision-engineered components to automotive OEMs on time and to spec' },
    { id: 'customer_dependency', question: 'How dependent are you on your top customers?', type: 'radio', options: ['High - loss of top customers would threaten viability', 'Moderate - painful but we would survive', 'Low - we could replace them relatively easily'] },
    { id: 'competitive_threats', question: 'What could fundamentally disrupt your competitive position? (Select all that apply)', type: 'checkbox', options: ['New technology making our products/services obsolete', 'Low-cost competitors we cannot compete with on price', 'Loss of key intellectual property or proprietary advantage', 'Regulatory changes making our business model unviable', 'Major partner/supplier failure we cannot replace', 'None of these are significant threats'] },
    { id: 'critical_dependencies', question: 'Does your business model depend critically on any of these? (Select all that apply)', type: 'checkbox', options: ['A specific technology platform or infrastructure provider', 'A key partnership or distribution channel', 'Intellectual property (patents, trade secrets, brand)', 'Regulatory licenses or permissions', 'A specific geography or market', 'None of these'] },
  ],
  performance: [
    { id: 'strategic_risks', question: 'For your strategic priorities, what could prevent you from achieving them?', type: 'textarea', placeholder: 'e.g., Need 15% cost reduction but risk production inefficiencies, or launching new product but risk technical delays' },
    { id: 'operational_concerns', question: 'What operational issues could significantly impact performance? (Select all that apply)', type: 'checkbox', options: ['Major production efficiency/quality problems', 'Supply chain disruptions affecting delivery', 'Key talent loss (critical skills/people)', 'IT systems failure or cybersecurity breach', 'Major equipment/facility failure', 'Health & safety incident'] },
    { id: 'market_position', question: 'What could cause significant market share loss? (Select all that apply)', type: 'checkbox', options: ['Product quality issues leading to customer losses', 'Inability to innovate/keep up with competitors', 'Pricing pressure eroding margins', 'New market entrants taking share', 'Customer needs shifting away from our offerings'] },
  ],
  solvency: [
    { id: 'major_loss_events', question: 'What single event could cause losses exceeding 10% of your net worth? (Select all that apply)', type: 'checkbox', options: ['Major lawsuit or regulatory fine', 'Product liability or warranty claims', 'Asset impairment (inventory, equipment, goodwill)', 'Customer bankruptcy causing bad debt', 'Environmental liability or cleanup costs', 'Fraud or embezzlement', 'Uninsured catastrophic loss (fire, flood, etc.)', 'None of these are likely'] },
    { id: 'asset_risk', question: 'Do you carry significant inventory or assets at risk of impairment?', type: 'textarea', placeholder: 'e.g., £18M inventory with risk of obsolescence from automotive production cuts' },
    { id: 'liability_exposure', question: 'What is your uninsured liability exposure if a major incident occurred?', type: 'radio', options: ['Under £1M (covered by insurance)', '£1-5M (partially covered)', '£5-10M (largely uninsured)', 'Over £10M (catastrophic uninsured exposure)', 'Not sure'] },
    { id: 'covenant_position', question: 'Do you have debt covenants, and how tight is the headroom?', type: 'radio', options: ['No debt or no covenants', 'Yes - comfortable headroom (>20%)', 'Yes - moderate headroom (10-20%)', 'Yes - tight headroom (<10%)', 'Not sure'] },
  ],
  liquidity: [
    { id: 'cash_position', question: 'Describe your current cash position and available facilities.', type: 'textarea', placeholder: 'e.g., £3M cash, £5M overdraft (£4M drawn), so £4M total liquidity' },
    { id: 'revenue_loss_impact', question: 'If you lost your largest customer, what would happen to your cash position?', type: 'radio', options: ['We would survive - 12+ months runway without them', 'Major problem - 6-12 months runway', 'Immediate crisis - less than 6 months runway', 'Not sure'] },
    { id: 'working_capital', question: 'Are you experiencing working capital pressure? (Select all that apply)', type: 'checkbox', options: ['Customers extending payment terms', 'Suppliers requiring faster payment', 'Inventory building up', 'Seasonal fluctuations creating cash gaps', 'Growth requiring investment in working capital', 'No significant working capital issues'] },
    { id: 'largest_receivable', question: 'What is your largest single receivable and would a default create a liquidity crisis?', type: 'textarea', placeholder: 'e.g., £4M from Acme Corp - default would wipe out our cash position' },
    { id: 'covenant_breach_impact', question: 'If you breached a loan covenant, what would happen?', type: 'radio', options: ['No debt or no covenants', 'Bank would likely call the loan immediately', 'Bank would negotiate a waiver but restrict operations', 'Bank has historically been flexible', 'Not sure'] },
  ],
};

// ==================== TYPES ====================

type WizardPhase =
  | 'context'
  | 'category_questions'
  | 'category_generating'
  | 'category_review'
  | 'prioritize'
  | 'summary';

interface AIRiskWizardProps {
  onComplete: (risks: AIRiskCandidate[]) => void;
  onCancel: () => void;
}

// ==================== COMPONENT ====================

export default function AIRiskWizard({ onComplete, onCancel }: AIRiskWizardProps) {
  const [phase, setPhase] = useState<WizardPhase>('context');
  const [context, setContext] = useState<BusinessContext>({
    industry: '', annualRevenue: '', employeeCount: '',
    isProfitable: '', fundingType: '', customerDescription: '',
    strategicPriorities: [],
  });

  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);
  const [categoryAnswers, setCategoryAnswers] = useState<Record<ThreatCategory, CategoryAnswers>>({
    business_model: {}, performance: {}, solvency: {}, liquidity: {},
  });
  const [allRisks, setAllRisks] = useState<Record<ThreatCategory, AIRiskCandidate[]>>({
    business_model: [], performance: [], solvency: [], liquidity: [],
  });
  const [generationError, setGenerationError] = useState('');

  const [expandedRisk, setExpandedRisk] = useState<string | null>(null);
  const [editingRisk, setEditingRisk] = useState<AIRiskCandidate | null>(null);
  const [editType, setEditType] = useState('');
  const [editDetails, setEditDetails] = useState('');
  const [isEditingSaving, setIsEditingSaving] = useState(false);

  // ==================== DERIVED ====================

  const currentCategory = THREAT_CATEGORIES[currentCategoryIndex];
  const currentCategoryKey = currentCategory?.key;

  const allSelectedRisks = Object.values(allRisks).flat().filter(r => r.selected);
  const risksForCategory = (cat: ThreatCategory) => allRisks[cat] || [];
  const selectedForCategory = (cat: ThreatCategory) => risksForCategory(cat).filter(r => r.selected);
  const completedCategories = THREAT_CATEGORIES.filter(tc => risksForCategory(tc.key).length > 0);

  const isContextValid = context.industry && context.annualRevenue && context.customerDescription;

  // ==================== HELPERS ====================

  const getPriorityLabel = (score: number) => {
    if (score >= 20) return { label: 'CRITICAL', color: 'bg-red-200 text-red-900' };
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

  const getCategoryColor = (cat: ThreatCategory) => {
    switch (cat) {
      case 'business_model': return 'border-purple-300 bg-purple-50';
      case 'performance': return 'border-blue-300 bg-blue-50';
      case 'solvency': return 'border-orange-300 bg-orange-50';
      case 'liquidity': return 'border-red-300 bg-red-50';
    }
  };

  // ==================== HANDLERS ====================

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

  const handleStartCategories = () => {
    setCurrentCategoryIndex(0);
    setPhase('category_questions');
  };

  const handleAnswerChange = (questionId: string, value: string | string[]) => {
    setCategoryAnswers(prev => ({
      ...prev,
      [currentCategoryKey]: { ...prev[currentCategoryKey], [questionId]: value },
    }));
  };

  const handleCheckboxToggle = (questionId: string, option: string) => {
    setCategoryAnswers(prev => {
      const current = (prev[currentCategoryKey]?.[questionId] as string[]) || [];
      const updated = current.includes(option)
        ? current.filter(o => o !== option)
        : [...current, option];
      return { ...prev, [currentCategoryKey]: { ...prev[currentCategoryKey], [questionId]: updated } };
    });
  };

  const handleGenerateCategoryRisks = async () => {
    setPhase('category_generating');
    setGenerationError('');
    try {
      const result = await apiService.generateRisksByCategoryWithAI({
        businessContext: context,
        threatCategory: currentCategoryKey,
        categoryAnswers: categoryAnswers[currentCategoryKey],
      });
      const risksWithState = result.risks.map((r: AIRiskCandidate) => ({
        ...r,
        selected: r.recommendation === 'INCLUDE' || r.recommendation === 'CONSIDER',
        edited: false,
        userLikelihoodScore: r.likelihoodScore,
        userImpactScore: r.impactScore,
      }));
      setAllRisks(prev => ({ ...prev, [currentCategoryKey]: risksWithState }));
      setPhase('category_review');
    } catch (error: any) {
      console.error('Failed to generate risks:', error);
      setGenerationError(error.message || 'Failed to generate risks. Please try again.');
      setPhase('category_questions');
    }
  };

  const handleToggleRisk = (riskId: string, category: ThreatCategory) => {
    setAllRisks(prev => ({
      ...prev,
      [category]: prev[category].map(r =>
        r.id === riskId ? { ...r, selected: !r.selected } : r
      ),
    }));
  };

  const handleNextCategory = () => {
    if (currentCategoryIndex < THREAT_CATEGORIES.length - 1) {
      setCurrentCategoryIndex(prev => prev + 1);
      setPhase('category_questions');
    } else {
      setPhase('prioritize');
    }
  };

  const handlePrevCategory = () => {
    if (currentCategoryIndex > 0) {
      setCurrentCategoryIndex(prev => prev - 1);
      if (risksForCategory(THREAT_CATEGORIES[currentCategoryIndex - 1].key).length > 0) {
        setPhase('category_review');
      } else {
        setPhase('category_questions');
      }
    } else {
      setPhase('context');
    }
  };

  const handleStartEdit = (risk: AIRiskCandidate) => {
    setEditingRisk(risk);
    setEditType('');
    setEditDetails('');
  };

  const handleSaveEdit = async () => {
    if (!editingRisk || !editType || !editDetails) return;
    setIsEditingSaving(true);
    try {
      const result = await apiService.editRiskDefinitionWithAI({
        originalRisk: {
          title: editingRisk.title, definition: editingRisk.definition,
          causes: editingRisk.causes, impacts: editingRisk.impacts,
        },
        userEdits: { editType, details: editDetails },
        businessContext: {
          industry: context.industry, annualRevenue: context.annualRevenue,
          employeeCount: context.employeeCount, customerDescription: context.customerDescription,
        },
      });
      const cat = (editingRisk.threatCategories[0] as ThreatCategory) || currentCategoryKey;
      setAllRisks(prev => ({
        ...prev,
        [cat]: prev[cat].map(r =>
          r.id === editingRisk.id
            ? { ...r, title: result.title, definition: result.definition, causes: result.causes, impacts: result.impacts, edited: true }
            : r
        ),
      }));
      setEditingRisk(null);
    } catch (error: any) {
      console.error('Failed to edit risk:', error);
      alert('Failed to edit risk definition. Please try again.');
    } finally {
      setIsEditingSaving(false);
    }
  };

  const handleScoreChange = (riskId: string, cat: ThreatCategory, field: 'userLikelihoodScore' | 'userImpactScore', value: number) => {
    setAllRisks(prev => ({
      ...prev,
      [cat]: prev[cat].map(r => r.id === riskId ? { ...r, [field]: value } : r),
    }));
  };

  const handleComplete = () => { onComplete(allSelectedRisks); };

  // ==================== STEP INDICATOR ====================

  const steps = [
    { key: 'context', label: 'Context' },
    { key: 'business_model', label: 'Business Model' },
    { key: 'performance', label: 'Performance' },
    { key: 'solvency', label: 'Solvency' },
    { key: 'liquidity', label: 'Liquidity' },
    { key: 'prioritize', label: 'Prioritize' },
    { key: 'summary', label: 'Summary' },
  ];

  const getCurrentStepIndex = () => {
    if (phase === 'context') return 0;
    if (phase === 'category_questions' || phase === 'category_generating' || phase === 'category_review') return currentCategoryIndex + 1;
    if (phase === 'prioritize') return 5;
    if (phase === 'summary') return 6;
    return 0;
  };
  const currentStepIndex = getCurrentStepIndex();

  const renderStepIndicator = () => (
    <div className="flex items-center justify-between mb-8 overflow-x-auto">
      {steps.map((step, index) => (
        <div key={step.key} className="flex items-center flex-1 min-w-0">
          <div className="flex items-center min-w-0">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium border-2 flex-shrink-0 ${
              index < currentStepIndex ? 'bg-blue-600 border-blue-600 text-white'
                : index === currentStepIndex ? 'border-blue-600 text-blue-600 bg-blue-50'
                  : 'border-gray-300 text-gray-400'
            }`}>
              {index < currentStepIndex ? <Check className="h-3 w-3" /> : index + 1}
            </div>
            <span className={`ml-1 text-xs font-medium truncate ${index <= currentStepIndex ? 'text-blue-600' : 'text-gray-400'}`}>
              {step.label}
            </span>
          </div>
          {index < steps.length - 1 && (
            <div className={`flex-1 h-0.5 mx-2 ${index < currentStepIndex ? 'bg-blue-600' : 'bg-gray-200'}`} />
          )}
        </div>
      ))}
    </div>
  );

  // ==================== RENDER: CONTEXT PHASE ====================

  const renderContextPhase = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-3">
          <Sparkles className="h-4 w-4" />
          AI-Powered Risk Identification
        </div>
        <h2 className="text-2xl font-bold">Tell us about your business</h2>
        <p className="text-muted-foreground mt-1">
          Answer 5 quick questions, then we&apos;ll guide you through each FRC threat category (30-40 min total)
        </p>
      </div>

      {generationError && (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg border border-red-200">
          <p className="font-medium">Error</p>
          <p className="text-sm mt-1">{generationError}</p>
        </div>
      )}

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <span className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">1</span>
            What industry are you in?
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={context.industry} onValueChange={(v) => setContext(prev => ({ ...prev, industry: v }))}>
            <SelectTrigger><SelectValue placeholder="Select your industry" /></SelectTrigger>
            <SelectContent>
              {INDUSTRIES.map(ind => (<SelectItem key={ind} value={ind}>{ind}</SelectItem>))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <span className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">2</span>
            Three quick numbers about your business
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label className="text-sm">Annual Revenue</Label>
              <Input placeholder="e.g., £85M" value={context.annualRevenue} onChange={e => setContext(prev => ({ ...prev, annualRevenue: e.target.value }))} />
            </div>
            <div>
              <Label className="text-sm">Number of Employees</Label>
              <Input placeholder="e.g., 350" value={context.employeeCount} onChange={e => setContext(prev => ({ ...prev, employeeCount: e.target.value }))} />
            </div>
            <div>
              <Label className="text-sm">Are you profitable?</Label>
              <Select value={context.isProfitable} onValueChange={(v) => setContext(prev => ({ ...prev, isProfitable: v }))}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
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

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <span className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">3</span>
            How is your business funded?
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={context.fundingType} onValueChange={(v) => setContext(prev => ({ ...prev, fundingType: v }))}>
            <SelectTrigger><SelectValue placeholder="Select funding type" /></SelectTrigger>
            <SelectContent>
              {FUNDING_TYPES.map(ft => (<SelectItem key={ft} value={ft}>{ft}</SelectItem>))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

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
            value={context.customerDescription} onChange={e => setContext(prev => ({ ...prev, customerDescription: e.target.value }))} rows={3}
          />
        </CardContent>
      </Card>

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
                <div key={priority}
                  className={`flex items-center space-x-2 border rounded p-3 cursor-pointer transition-colors ${
                    isSelected ? 'bg-blue-50 border-blue-300' : isDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-accent'
                  }`}
                  onClick={() => !isDisabled && handleTogglePriority(priority)}
                >
                  <Checkbox checked={isSelected} disabled={isDisabled} onCheckedChange={() => !isDisabled && handleTogglePriority(priority)} />
                  <span className="text-sm">{priority}</span>
                </div>
              );
            })}
          </div>
          {context.strategicPriorities.length > 0 && (
            <p className="text-sm text-muted-foreground mt-2">Selected: {context.strategicPriorities.length}/3</p>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
        <Button onClick={handleStartCategories} disabled={!isContextValid}>
          Begin Threat Assessment <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );

  // ==================== RENDER: CATEGORY QUESTIONS ====================

  const renderCategoryQuestions = () => {
    const cat = currentCategory;
    const Icon = cat.icon;
    const questions = CATEGORY_QUESTIONS[cat.key];
    const answers = categoryAnswers[cat.key];

    return (
      <div className="space-y-6">
        <div className={`text-center p-6 rounded-lg border-2 ${getCategoryColor(cat.key)}`}>
          <Icon className={`h-10 w-10 mx-auto mb-3 ${cat.color}`} />
          <h2 className="text-2xl font-bold">
            Let&apos;s identify threats to your {cat.label.toUpperCase()}
          </h2>
          <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">{cat.description}</p>
          <p className="text-sm text-muted-foreground mt-1">
            Category {currentCategoryIndex + 1} of {THREAT_CATEGORIES.length} &bull; Answer the questions below, then AI will generate specific risks
          </p>
        </div>

        {generationError && (
          <div className="bg-red-50 text-red-700 p-4 rounded-lg border border-red-200">
            <p className="font-medium">Generation failed</p>
            <p className="text-sm mt-1">{generationError}</p>
          </div>
        )}

        {questions.map((q, qIdx) => (
          <Card key={q.id}>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <span className={`${cat.color} bg-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border`}>
                  {qIdx + 1}
                </span>
                {q.question}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {q.type === 'textarea' && (
                <Textarea placeholder={q.placeholder} value={(answers[q.id] as string) || ''}
                  onChange={e => handleAnswerChange(q.id, e.target.value)} rows={3} />
              )}
              {q.type === 'text' && (
                <Input placeholder={q.placeholder} value={(answers[q.id] as string) || ''}
                  onChange={e => handleAnswerChange(q.id, e.target.value)} />
              )}
              {q.type === 'radio' && q.options && (
                <div className="space-y-2">
                  {q.options.map(option => (
                    <div key={option}
                      className={`flex items-center space-x-3 border rounded p-3 cursor-pointer transition-colors ${
                        answers[q.id] === option ? 'bg-blue-50 border-blue-300' : 'hover:bg-accent'
                      }`}
                      onClick={() => handleAnswerChange(q.id, option)}
                    >
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        answers[q.id] === option ? 'border-blue-600' : 'border-gray-300'
                      }`}>
                        {answers[q.id] === option && <div className="w-2 h-2 rounded-full bg-blue-600" />}
                      </div>
                      <span className="text-sm">{option}</span>
                    </div>
                  ))}
                </div>
              )}
              {q.type === 'checkbox' && q.options && (
                <div className="space-y-2">
                  {q.options.map(option => {
                    const selected = ((answers[q.id] as string[]) || []).includes(option);
                    return (
                      <div key={option}
                        className={`flex items-center space-x-3 border rounded p-3 cursor-pointer transition-colors ${
                          selected ? 'bg-blue-50 border-blue-300' : 'hover:bg-accent'
                        }`}
                        onClick={() => handleCheckboxToggle(q.id, option)}
                      >
                        <Checkbox checked={selected} onCheckedChange={() => handleCheckboxToggle(q.id, option)} />
                        <span className="text-sm">{option}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        <div className="flex justify-between pt-4">
          <Button variant="outline" onClick={handlePrevCategory}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            {currentCategoryIndex === 0 ? 'Back to Context' : `Back to ${THREAT_CATEGORIES[currentCategoryIndex - 1].label}`}
          </Button>
          <Button onClick={handleGenerateCategoryRisks}>
            <Sparkles className="h-4 w-4 mr-2" />
            Generate {cat.label} Risks
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>
    );
  };

  // ==================== RENDER: CATEGORY GENERATING ====================

  const renderCategoryGenerating = () => {
    const cat = currentCategory;
    const Icon = cat.icon;
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="relative mb-8">
          <div className={`w-20 h-20 rounded-full flex items-center justify-center ${getCategoryColor(cat.key)}`}>
            <Icon className={`h-10 w-10 ${cat.color} animate-pulse`} />
          </div>
          <Loader2 className="h-24 w-24 text-blue-600 animate-spin absolute -top-2 -left-2" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Analyzing {cat.label} threats...</h2>
        <p className="text-muted-foreground text-center max-w-md mb-6">
          Generating tailored {cat.label.toLowerCase()} risks based on your answers and {context.industry} business profile. This typically takes 15-30 seconds.
        </p>
        <div className="w-64"><Progress value={undefined} className="h-2" /></div>
      </div>
    );
  };

  // ==================== RENDER: CATEGORY REVIEW ====================

  const renderCategoryReview = () => {
    const cat = currentCategory;
    const Icon = cat.icon;
    const risks = risksForCategory(cat.key);
    const selected = selectedForCategory(cat.key);
    const typicalRange = cat.key === 'business_model' ? '2-4' : cat.key === 'performance' ? '3-6' : cat.key === 'solvency' ? '2-5' : '2-4';

    return (
      <div className="space-y-6">
        <div className={`p-6 rounded-lg border-2 ${getCategoryColor(cat.key)}`}>
          <div className="flex items-center gap-3 mb-2">
            <Icon className={`h-8 w-8 ${cat.color}`} />
            <div>
              <h2 className="text-2xl font-bold">{cat.label} Threats</h2>
              <p className="text-muted-foreground">
                {risks.length} risks generated &bull; {selected.length} selected &bull; Typical range: {typicalRange} risks
              </p>
            </div>
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
                    <button onClick={() => handleToggleRisk(risk.id, cat.key)}
                      className={`mt-1 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                        risk.selected ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-red-100 text-red-700 hover:bg-red-200'
                      }`}>
                      {risk.selected ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-xs font-medium text-muted-foreground">#{index + 1}</span>
                        <Badge className={`text-xs ${getConfidenceBadge(risk.confidence)}`}>{risk.confidence} confidence</Badge>
                        <Badge className={`text-xs ${priority.color}`}>Score: {riskScore} ({priority.label})</Badge>
                        {risk.recommendation === 'INCLUDE' && <Badge className="text-xs bg-green-100 text-green-800">AI: Include</Badge>}
                        {risk.recommendation === 'CONSIDER' && <Badge className="text-xs bg-yellow-100 text-yellow-800">AI: Consider</Badge>}
                        {risk.edited && <Badge variant="outline" className="text-xs text-blue-600 border-blue-300">Edited</Badge>}
                      </div>
                      <h3 className="font-semibold text-base">{risk.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{risk.definition}</p>
                      <button onClick={() => setExpandedRisk(isExpanded ? null : risk.id)}
                        className="text-sm text-muted-foreground flex items-center gap-1 mt-2 hover:text-foreground">
                        {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                        {isExpanded ? 'Hide details' : 'Show full definition'}
                      </button>
                      {isExpanded && (
                        <div className="mt-3 space-y-3 border-t pt-3">
                          <div>
                            <p className="text-sm font-medium mb-1">Definition:</p>
                            <p className="text-sm text-muted-foreground whitespace-pre-line">{risk.definition}</p>
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
                                {getThreatIcon(tag)} {tag.replace('_', ' ')}
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
                            Likelihood: {risk.likelihoodScore}/5 — {risk.likelihoodReasoning}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Impact: {risk.impactScore}/5 — {risk.impactReasoning}
                          </div>
                        </div>
                      )}
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => handleStartEdit(risk)} title="Edit definition">
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Progress across categories */}
        <Card className="bg-muted/30">
          <CardContent className="p-4">
            <p className="text-sm font-medium mb-2">Progress across all categories:</p>
            <div className="grid grid-cols-4 gap-3">
              {THREAT_CATEGORIES.map(tc => {
                const catRisks = selectedForCategory(tc.key);
                const isDone = risksForCategory(tc.key).length > 0;
                const isCurrent = tc.key === cat.key;
                return (
                  <div key={tc.key} className={`text-center p-2 rounded border ${isCurrent ? 'border-blue-400 bg-blue-50' : isDone ? 'border-green-300 bg-green-50' : 'border-gray-200'}`}>
                    <p className="text-xs font-medium">{tc.label}</p>
                    <p className="text-lg font-bold">{catRisks.length}</p>
                    <p className="text-xs text-muted-foreground">{isDone ? 'selected' : 'pending'}</p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-between pt-4">
          <Button variant="outline" onClick={() => setPhase('category_questions')}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Re-answer Questions
          </Button>
          <Button onClick={handleNextCategory}>
            {currentCategoryIndex < THREAT_CATEGORIES.length - 1 ? (
              <>Next: {THREAT_CATEGORIES[currentCategoryIndex + 1].label} Threats <ArrowRight className="h-4 w-4 ml-2" /></>
            ) : (
              <>Review &amp; Prioritize All <ArrowRight className="h-4 w-4 ml-2" /></>
            )}
          </Button>
        </div>
      </div>
    );
  };

  // ==================== RENDER: EDIT DIALOG ====================

  const renderEditDialog = () => {
    if (!editingRisk) return null;
    return (
      <Dialog open={true} onOpenChange={() => setEditingRisk(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Risk: {editingRisk.title}</DialogTitle>
            <DialogDescription>Tell us what to change and AI will regenerate the definition</DialogDescription>
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
                  <div key={option.value}
                    className={`border rounded p-3 cursor-pointer text-sm transition-colors ${
                      editType === option.value ? 'bg-blue-50 border-blue-300 text-blue-700' : 'hover:bg-accent'
                    }`}
                    onClick={() => setEditType(option.value)}>
                    {option.label}
                  </div>
                ))}
              </div>
            </div>
            {editType && (
              <div>
                <Label className="mb-2 block">Provide the specific details:</Label>
                <Textarea placeholder="Describe what you want to change..." value={editDetails}
                  onChange={e => setEditDetails(e.target.value)} rows={3} />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingRisk(null)}>Cancel</Button>
            <Button onClick={handleSaveEdit} disabled={!editType || !editDetails || isEditingSaving}>
              {isEditingSaving
                ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />AI is rewriting...</>
                : <><Sparkles className="h-4 w-4 mr-2" />Regenerate Definition</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };

  // ==================== RENDER: PRIORITIZE ====================

  const renderPrioritizePhase = () => (
    <div className="space-y-6">
      <div className="text-center mb-4">
        <h2 className="text-2xl font-bold">Review &amp; Prioritize All Risks</h2>
        <p className="text-muted-foreground mt-1">
          {allSelectedRisks.length} risks across {completedCategories.length} threat categories. Adjust AI scoring if needed.
        </p>
      </div>

      {THREAT_CATEGORIES.map(cat => {
        const risks = selectedForCategory(cat.key);
        if (risks.length === 0) return null;
        const Icon = cat.icon;
        return (
          <div key={cat.key} className="space-y-3">
            <div className={`flex items-center gap-2 p-3 rounded-lg border ${getCategoryColor(cat.key)}`}>
              <Icon className={`h-5 w-5 ${cat.color}`} />
              <h3 className="font-bold">{cat.label} Threats ({risks.length})</h3>
            </div>
            {risks.map(risk => {
              const likelihood = risk.userLikelihoodScore || risk.likelihoodScore;
              const impact = risk.userImpactScore || risk.impactScore;
              const score = likelihood * impact;
              const priority = getPriorityLabel(score);
              return (
                <Card key={risk.id}>
                  <CardContent className="p-4">
                    <div className="grid grid-cols-5 gap-4 items-center">
                      <div className="col-span-2">
                        <h4 className="font-medium text-sm">{risk.title}</h4>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{risk.definition}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground mb-1">Likelihood</p>
                        <div className="flex items-center justify-center gap-1">
                          {[1, 2, 3, 4, 5].map(val => (
                            <button key={val} onClick={() => handleScoreChange(risk.id, cat.key, 'userLikelihoodScore', val)}
                              className={`w-7 h-7 rounded text-xs font-medium transition-colors ${
                                val === likelihood ? 'bg-blue-600 text-white' : val <= likelihood ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                              }`}>{val}</button>
                          ))}
                        </div>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground mb-1">Impact</p>
                        <div className="flex items-center justify-center gap-1">
                          {[1, 2, 3, 4, 5].map(val => (
                            <button key={val} onClick={() => handleScoreChange(risk.id, cat.key, 'userImpactScore', val)}
                              className={`w-7 h-7 rounded text-xs font-medium transition-colors ${
                                val === impact ? 'bg-orange-600 text-white' : val <= impact ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                              }`}>{val}</button>
                          ))}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-bold ${priority.color}`}>{score}</div>
                        <p className="text-xs font-medium mt-1">{priority.label}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        );
      })}

      <Card className="bg-muted/30">
        <CardContent className="p-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-red-500" />
                <span className="text-sm">CRITICAL/HIGH: {allSelectedRisks.filter(r => ((r.userLikelihoodScore || r.likelihoodScore) * (r.userImpactScore || r.impactScore)) >= 15).length}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-yellow-500" />
                <span className="text-sm">MEDIUM: {allSelectedRisks.filter(r => { const s = (r.userLikelihoodScore || r.likelihoodScore) * (r.userImpactScore || r.impactScore); return s >= 8 && s < 15; }).length}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-green-500" />
                <span className="text-sm">LOWER: {allSelectedRisks.filter(r => ((r.userLikelihoodScore || r.likelihoodScore) * (r.userImpactScore || r.impactScore)) < 8).length}</span>
              </div>
            </div>
            <span className="text-sm text-muted-foreground">Total: {allSelectedRisks.length} risks</span>
          </div>
        </CardContent>
      </Card>

      {THREAT_CATEGORIES.some(tc => selectedForCategory(tc.key).length < 2) && (
        <div className="bg-yellow-50 text-yellow-800 p-4 rounded-lg border border-yellow-200">
          <p className="font-medium text-sm">Coverage Warning</p>
          <p className="text-sm mt-1">
            FRC recommends at least 2 risks per threat category.
            {THREAT_CATEGORIES.filter(tc => selectedForCategory(tc.key).length < 2).map(tc =>
              ` ${tc.label}: ${selectedForCategory(tc.key).length} risk${selectedForCategory(tc.key).length !== 1 ? 's' : ''}.`
            )}
          </p>
        </div>
      )}

      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={() => { setCurrentCategoryIndex(THREAT_CATEGORIES.length - 1); setPhase('category_review'); }}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Liquidity Review
        </Button>
        <Button onClick={() => setPhase('summary')}>
          View Summary &amp; Complete <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );

  // ==================== RENDER: SUMMARY ====================

  const renderSummaryPhase = () => {
    const highRisks = allSelectedRisks.filter(r => ((r.userLikelihoodScore || r.likelihoodScore) * (r.userImpactScore || r.impactScore)) >= 15);
    const medRisks = allSelectedRisks.filter(r => { const s = (r.userLikelihoodScore || r.likelihoodScore) * (r.userImpactScore || r.impactScore); return s >= 8 && s < 15; });
    const lowRisks = allSelectedRisks.filter(r => ((r.userLikelihoodScore || r.likelihoodScore) * (r.userImpactScore || r.impactScore)) < 8);

    return (
      <div className="space-y-6">
        <div className="text-center mb-4">
          <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-full text-sm font-medium mb-3">
            <Check className="h-4 w-4" /> Risk Identification Complete
          </div>
          <h2 className="text-2xl font-bold">Principal Risk Summary</h2>
          <p className="text-muted-foreground mt-1">
            {allSelectedRisks.length} principal risks identified across 4 FRC threat categories
          </p>
        </div>

        <div className="grid grid-cols-4 gap-4">
          {THREAT_CATEGORIES.map(tc => {
            const Icon = tc.icon;
            const count = selectedForCategory(tc.key).length;
            return (
              <Card key={tc.key}>
                <CardContent className="p-4 text-center">
                  <Icon className={`h-6 w-6 mx-auto mb-1 ${tc.color}`} />
                  <div className="text-2xl font-bold">{count}</div>
                  <p className="text-xs text-muted-foreground">{tc.label}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid grid-cols-3 gap-4">
          <Card><CardContent className="p-4 text-center"><div className="text-2xl font-bold text-red-600">{highRisks.length}</div><p className="text-xs text-muted-foreground">Critical/High</p></CardContent></Card>
          <Card><CardContent className="p-4 text-center"><div className="text-2xl font-bold text-yellow-600">{medRisks.length}</div><p className="text-xs text-muted-foreground">Medium</p></CardContent></Card>
          <Card><CardContent className="p-4 text-center"><div className="text-2xl font-bold text-green-600">{lowRisks.length}</div><p className="text-xs text-muted-foreground">Lower</p></CardContent></Card>
        </div>

        {/* Risk Register by Category */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5" /> Risk Register by Threat Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-3 font-medium">#</th>
                    <th className="text-left p-3 font-medium">Risk Title</th>
                    <th className="text-left p-3 font-medium">Category</th>
                    <th className="text-left p-3 font-medium">Domains</th>
                    <th className="text-center p-3 font-medium">L</th>
                    <th className="text-center p-3 font-medium">I</th>
                    <th className="text-center p-3 font-medium">Score</th>
                    <th className="text-center p-3 font-medium">Priority</th>
                  </tr>
                </thead>
                <tbody>
                  {THREAT_CATEGORIES.flatMap(tc => {
                    const risks = selectedForCategory(tc.key);
                    return risks.sort((a, b) => {
                      const sa = (a.userLikelihoodScore || a.likelihoodScore) * (a.userImpactScore || a.impactScore);
                      const sb = (b.userLikelihoodScore || b.likelihoodScore) * (b.userImpactScore || b.impactScore);
                      return sb - sa;
                    });
                  }).map((risk, idx) => {
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
                                {getThreatIcon(t)} {t.replace('_', ' ')}
                              </Badge>
                            ))}
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="flex flex-wrap gap-1">
                            {risk.domainTags.map(d => (<Badge key={d} variant="secondary" className="text-xs">{d}</Badge>))}
                          </div>
                        </td>
                        <td className="p-3 text-center">{l}</td>
                        <td className="p-3 text-center">{i}</td>
                        <td className="p-3 text-center font-bold">{score}</td>
                        <td className="p-3 text-center"><Badge className={`text-xs ${priority.color}`}>{priority.label}</Badge></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Methodology */}
        <Card className="bg-blue-50/50 border-blue-200">
          <CardContent className="p-4">
            <h4 className="font-medium text-sm mb-2">Methodology</h4>
            <p className="text-sm text-muted-foreground">
              These {allSelectedRisks.length} principal risks were identified through a structured AI-assisted assessment
              aligned with FRC guidance on the four threat categories (Business Model, Performance, Solvency, Liquidity)
              for a {context.industry} company with {context.annualRevenue} annual revenue and {context.employeeCount} employees.
              Each category was assessed with targeted questions and AI-generated risk definitions.
              Risks are scored on a 1-5 Likelihood × Impact matrix (max score 25).
              Strategic priorities considered: {context.strategicPriorities.join(', ')}.
            </p>
          </CardContent>
        </Card>

        <div className="flex justify-between pt-4">
          <Button variant="outline" onClick={() => setPhase('prioritize')}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Prioritization
          </Button>
          <Button onClick={handleComplete} className="bg-green-600 hover:bg-green-700">
            <Check className="h-4 w-4 mr-2" /> Save {allSelectedRisks.length} Principal Risks
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
      {phase === 'category_questions' && renderCategoryQuestions()}
      {phase === 'category_generating' && renderCategoryGenerating()}
      {phase === 'category_review' && renderCategoryReview()}
      {phase === 'prioritize' && renderPrioritizePhase()}
      {phase === 'summary' && renderSummaryPhase()}

      {renderEditDialog()}
    </div>
  );
}
