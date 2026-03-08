import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { apiService } from '@/services/api';
import type {
  PrincipalRisk,
  MaturityLevel,
  MaturityPackage,
  ControlTemplate,
  Section2Control,
  SuggestedControl,
  GapAnalysisResult,
  ImplementationPlan,
  ImplementationPhase,
  RiskWorkflowProgress,
  ControlObjective,
  ControlFrequency,
} from '@/types';
import {
  detectRiskType,
  getMaturityPackages,
  getMaturityPackage,
  getRecommendedTarget,
  performGapAnalysis,
  prioritiseSuggestions,
  calculateMaturityScore,
  MATURITY_LEVEL_META,
} from '@/data/maturityTemplates';
import {
  AlertTriangle,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Sparkles,
  Target,
  Download,
  ChevronDown,
  ChevronUp,
  X,
  Pencil,
  Clock,
  BarChart3,
  Shield,
  FileText,
  ArrowRight,
  Info,
} from 'lucide-react';

// ============================================================
// Types
// ============================================================

type WorkflowStep = 0 | 1 | 2 | 3 | 4 | 5 | 6;

interface DocumentedControl {
  templateId: string;
  hasControl: 'yes' | 'no' | 'similar';
  controlName: string;
  preparedBy: string;
  reviewedBy: string;
  frequency: ControlFrequency;
  evidence: string;
  hasThresholds: boolean;
  thresholdDetails: string;
}

// ============================================================
// Component
// ============================================================

export default function MaterialControlsWorkflow() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Navigation
  const [currentStep, setCurrentStep] = useState<WorkflowStep>(0);

  // Step 0: Select Risk
  const [principalRisks, setPrincipalRisks] = useState<PrincipalRisk[]>([]);
  const [selectedRisk, setSelectedRisk] = useState<PrincipalRisk | null>(null);
  const [detectedRiskType, setDetectedRiskType] = useState<string>('generic');
  const [riskPriority, setRiskPriority] = useState<'HIGH' | 'MEDIUM' | 'LOWER'>('MEDIUM');

  // Step 1: Maturity Level Selection
  const [maturityPackages, setMaturityPackages] = useState<MaturityPackage[]>([]);
  const [expandedLevel, setExpandedLevel] = useState<MaturityLevel | null>(null);
  const [selectedCurrentLevel, setSelectedCurrentLevel] = useState<MaturityLevel | null>(null);
  const [aiGeneratedControls, setAiGeneratedControls] = useState<Record<number, any>>({});
  const [loadingAIControls, setLoadingAIControls] = useState<Record<number, boolean>>({});

  // Step 2: Document Current Controls
  const [currentLevelPackage, setCurrentLevelPackage] = useState<MaturityPackage | null>(null);
  const [currentControlIdx, setCurrentControlIdx] = useState(0);
  const [documentedControls, setDocumentedControls] = useState<DocumentedControl[]>([]);

  // Step 3: Set Target Level
  const [targetLevel, setTargetLevel] = useState<MaturityLevel | null>(null);
  const [recommendedTarget, setRecommendedTarget] = useState<MaturityLevel>(3);

  // Step 4: Gap Analysis
  const [gapAnalysis, setGapAnalysis] = useState<GapAnalysisResult | null>(null);

  // Step 5: Review Suggested Controls
  const [suggestedControls, setSuggestedControls] = useState<SuggestedControl[]>([]);
  const [currentSuggestionIdx, setCurrentSuggestionIdx] = useState(0);
  const [customizingControl, setCustomizingControl] = useState<string | null>(null);

  // Step 6: Implementation Timeline
  const [implementationPlan, setImplementationPlan] = useState<ImplementationPlan | null>(null);

  // Multi-risk progress
  const [completedRisks, setCompletedRisks] = useState<RiskWorkflowProgress[]>([]);
  const [allDocumentedControls, setAllDocumentedControls] = useState<Section2Control[]>([]);
  const [isCompletingRisk, setIsCompletingRisk] = useState(false);

  // ============================================================
  // Data Loading
  // ============================================================

  useEffect(() => {
    loadPrincipalRisks();
    loadCompletedRisks();
  }, []);

  // Auto-select risk from URL parameter
  useEffect(() => {
    const riskId = searchParams.get('riskId');
    if (riskId && principalRisks.length > 0 && !selectedRisk) {
      const risk = principalRisks.find(r => r.id === riskId);
      if (risk) {
        handleSelectRisk(risk);
      }
    }
  }, [searchParams, principalRisks, selectedRisk]);

  const loadPrincipalRisks = async () => {
    try {
      const data = await apiService.getPrincipalRisks();
      setPrincipalRisks(data);
    } catch (error) {
      console.error('Failed to load principal risks:', error);
    }
  };

  const loadCompletedRisks = async () => {
    try {
      const data = await apiService.getCompletedRisks();
      setCompletedRisks(data);
    } catch (error) {
      console.error('Failed to load completed risks:', error);
    }
  };

  const loadCompletedRiskControls = async (riskId: string) => {
    try {
      const controls = await apiService.getSection2Controls(riskId);
      return controls;
    } catch (error) {
      console.error('Failed to load completed risk controls:', error);
      return [];
    }
  };

  // ============================================================
  // Utility: Extract score from risk statement
  // ============================================================

  const extractRiskScore = (risk: PrincipalRisk): { likelihood: number; impact: number; score: number } => {
    const text = risk.riskStatement || '';
    const likelihoodMatch = text.match(/Likelihood:\s*(\d)/);
    const impactMatch = text.match(/Impact:\s*(\d)/);
    const scoreMatch = text.match(/Score:\s*(\d+)/);
    const likelihood = likelihoodMatch ? parseInt(likelihoodMatch[1]) : 3;
    const impact = impactMatch ? parseInt(impactMatch[1]) : 3;
    const score = scoreMatch ? parseInt(scoreMatch[1]) : likelihood * impact;
    return { likelihood, impact, score };
  };

  const getRiskPriority = (risk: PrincipalRisk): 'HIGH' | 'MEDIUM' | 'LOWER' => {
    const { score } = extractRiskScore(risk);
    if (score >= 12) return 'HIGH';
    if (score >= 6) return 'MEDIUM';
    return 'LOWER';
  };

  // ============================================================
  // Step Handlers
  // ============================================================

  const handleSelectRisk = async (risk: PrincipalRisk) => {
    setSelectedRisk(risk);
    const rType = detectRiskType(risk.riskTitle, risk.riskStatement);
    setDetectedRiskType(rType);
    const priority = getRiskPriority(risk);
    setRiskPriority(priority);
    const packages = getMaturityPackages(rType);
    setMaturityPackages(packages);
    setExpandedLevel(null);
    setSelectedCurrentLevel(null);
    setDocumentedControls([]);
    setCurrentControlIdx(0);
    setTargetLevel(null);
    setGapAnalysis(null);
    setSuggestedControls([]);
    setCurrentSuggestionIdx(0);
    setImplementationPlan(null);
    setAiGeneratedControls({});
    setLoadingAIControls({});
    
    // Check if this risk is already completed
    const completedRisk = completedRisks.find(cr => cr.riskId === risk.id);
    if (completedRisk) {
      // Load the saved controls and show them in a summary view
      const savedControls = await loadCompletedRiskControls(risk.id);
      if (savedControls.length > 0) {
        // Set the state to show completed controls in read-only mode
        setSelectedCurrentLevel(completedRisk.currentLevel || 2);
        setTargetLevel(completedRisk.targetLevel || 3);
        setDocumentedControls(savedControls.map(c => ({
          title: c.title,
          description: c.description,
          type: c.controlType as any,
          objectives: Array.isArray(c.objectives) ? c.objectives : [],
          owner: c.owner || '',
          frequency: c.frequency as any,
          evidence: c.evidence || '',
          reviewer: c.reviewer || '',
        })));
        setAllDocumentedControls(savedControls);
        // Show controls at step 2 (Document Controls) in view mode
        setCurrentStep(2);
        return;
      }
    }
    
    setCurrentStep(1);
  };

  const loadAIControlsForLevel = async (level: MaturityLevel) => {
    if (!selectedRisk || aiGeneratedControls[level] || loadingAIControls[level]) return;

    setLoadingAIControls(prev => ({ ...prev, [level]: true }));
    try {
      const result = await apiService.generateMaturityControlsForRisk({
        riskTitle: selectedRisk.riskTitle,
        riskStatement: selectedRisk.riskStatement,
        riskCategory: selectedRisk.domainTags?.[0] || 'General',
        maturityLevel: level,
      });
      setAiGeneratedControls(prev => ({ ...prev, [level]: result }));
    } catch (error) {
      console.error('Failed to generate AI controls:', error);
    } finally {
      setLoadingAIControls(prev => ({ ...prev, [level]: false }));
    }
  };

  const handleToggleLevel = (level: MaturityLevel) => {
    if (expandedLevel === level) {
      setExpandedLevel(null);
    } else {
      setExpandedLevel(level);
      loadAIControlsForLevel(level);
    }
  };

  const handleSelectCurrentLevel = (level: MaturityLevel) => {
    setSelectedCurrentLevel(level);
    const pkg = maturityPackages.find(p => p.level === level) || null;
    setCurrentLevelPackage(pkg);
    if (pkg) {
      // Use AI-generated specific controls if available, otherwise fall back to templates
      const aiControls = aiGeneratedControls[level]?.specificControls || [];
      const controlsToUse = aiControls.length > 0 ? aiControls : pkg.controlTemplates;
      
      setDocumentedControls(
        controlsToUse.map((t: any) => ({
          templateId: t.id || `ai-${level}-${Math.random().toString(36).substr(2, 9)}`,
          hasControl: 'yes' as const,
          controlName: '',
          preparedBy: t.defaultOwner,
          reviewedBy: '',
          frequency: t.defaultFrequency,
          evidence: '',
          hasThresholds: false,
          thresholdDetails: '',
        }))
      );
    }
    setRecommendedTarget(getRecommendedTarget(riskPriority, level));
  };

  const handleProceedToDocumentation = () => {
    if (!selectedCurrentLevel) return;
    setCurrentControlIdx(0);
    setCurrentStep(2);
  };

  const handleProceedToTarget = () => {
    if (!selectedRisk || !selectedCurrentLevel) {
      console.error('Missing required data for target selection');
      return;
    }
    
    // Calculate recommended target if not already set
    const { score } = extractRiskScore(selectedRisk);
    const recommended = getRecommendedTarget(detectedRiskType, selectedCurrentLevel, score);
    setRecommendedTarget(recommended);
    setTargetLevel(recommended);
    setCurrentStep(3);
  };

  const handleConfirmTarget = () => {
    if (!targetLevel || !selectedCurrentLevel || !selectedRisk) return;

    const existingControls = documentedControls
      .filter(dc => dc.hasControl === 'yes' || dc.hasControl === 'similar')
      .map(dc => {
        // Check AI-generated controls first, then fall back to templates
        const aiControls = aiGeneratedControls[selectedCurrentLevel]?.specificControls || [];
        const template = aiControls.find((t: any) => t.id === dc.templateId || dc.templateId.startsWith('ai-')) 
          || currentLevelPackage?.controlTemplates.find(t => t.id === dc.templateId);
        return {
          templateId: dc.templateId,
          type: template?.type || 'detective',
          objectives: template?.objectives || ['operations'],
        };
      });

    const gap = performGapAnalysis(detectedRiskType, selectedCurrentLevel, targetLevel, existingControls);

    const suggested = prioritiseSuggestions(gap.missingTemplates, riskPriority);

    const currentScore = MATURITY_LEVEL_META[selectedCurrentLevel].range[0] + 0.2;
    const targetScore = MATURITY_LEVEL_META[targetLevel].range[1];

    setGapAnalysis({
      id: `gap-${selectedRisk.id}`,
      riskId: selectedRisk.id,
      currentLevel: selectedCurrentLevel,
      targetLevel,
      currentScore,
      targetScore,
      existingControls: documentedControls
        .filter(dc => dc.hasControl === 'yes' || dc.hasControl === 'similar')
        .map((dc, idx) => {
          // Check AI-generated controls first, then fall back to templates
          const aiControls = aiGeneratedControls[selectedCurrentLevel!]?.specificControls || [];
          const template = aiControls.find((t: any) => t.id === dc.templateId || dc.templateId.startsWith('ai-')) 
            || currentLevelPackage?.controlTemplates.find(t => t.id === dc.templateId);
          return {
            id: `CTRL-${String(idx + 1).padStart(3, '0')}`,
            riskId: selectedRisk!.id,
            title: dc.controlName || template?.title || '',
            description: template?.description || '',
            type: template?.type || 'detective',
            objectives: (template?.objectives || ['operations']) as ControlObjective[],
            owner: dc.preparedBy,
            frequency: dc.frequency,
            evidence: dc.evidence || template?.defaultEvidence || '',
            status: 'existing' as const,
            maturityLevel: selectedCurrentLevel!,
            source: 'existing_documented' as const,
            templateId: dc.templateId,
          };
        }),
      missingControls: gap.missingTemplates,
      missingObjectives: gap.missingObjectives as ControlObjective[],
      missingTypes: gap.missingTypes as ('preventive' | 'detective' | 'corrective')[],
      suggestedControls: suggested,
      gapCount: gap.missingTemplates.length,
      effortEstimate: gap.effortEstimate,
      timelineEstimate: gap.timelineEstimate,
    });

    setSuggestedControls(suggested);
    setCurrentSuggestionIdx(0);
    setCurrentStep(4);
  };

  const handleProceedToSuggestions = () => {
    setCurrentStep(5);
  };

  const handleAcceptControl = (idx: number) => {
    const updated = [...suggestedControls];
    updated[idx] = { ...updated[idx], accepted: true, rejected: false };
    setSuggestedControls(updated);
    if (idx < suggestedControls.length - 1) {
      setCurrentSuggestionIdx(idx + 1);
    }
  };

  const handleRejectControl = (idx: number) => {
    const updated = [...suggestedControls];
    updated[idx] = { ...updated[idx], accepted: false, rejected: true };
    setSuggestedControls(updated);
    if (idx < suggestedControls.length - 1) {
      setCurrentSuggestionIdx(idx + 1);
    }
  };

  const handleGenerateTimeline = () => {
    if (!gapAnalysis || !selectedCurrentLevel || !targetLevel) return;

    const accepted = suggestedControls.filter(sc => sc.accepted);

    const phase1Controls: Section2Control[] = [];
    const phase2Controls: Section2Control[] = [];
    const phase3Controls: Section2Control[] = [];

    accepted.forEach((sc, idx) => {
      const control: Section2Control = {
        id: `CTRL-NEW-${String(idx + 1).padStart(3, '0')}`,
        riskId: selectedRisk!.id,
        title: sc.template.title,
        description: sc.template.description,
        type: sc.template.type,
        objectives: sc.template.objectives,
        owner: sc.customizations?.owner || sc.template.defaultOwner,
        frequency: sc.customizations?.frequency || sc.template.defaultFrequency,
        evidence: sc.template.defaultEvidence,
        status: 'planned',
        maturityLevel: sc.template.maturityLevel,
        source: 'ai_suggested',
        templateId: sc.templateId,
        implementationPhase: sc.implementationPhase,
        implementationEffort: sc.template.implementationEffort,
        implementationTimeline:
          sc.implementationPhase === 1 ? 'Months 1-3' :
          sc.implementationPhase === 2 ? 'Months 4-6' : 'Months 7-12',
      };

      if (sc.implementationPhase === 1) phase1Controls.push(control);
      else if (sc.implementationPhase === 2) phase2Controls.push(control);
      else phase3Controls.push(control);
    });

    const existingCount = gapAnalysis.existingControls.length;
    const currentScore = gapAnalysis.currentScore;
    const targetScore = gapAnalysis.targetScore;
    const increment = (targetScore - currentScore) / 3;

    const plan: ImplementationPlan = {
      id: `plan-${selectedRisk!.id}`,
      totalControls: existingCount + accepted.length,
      existingControls: existingCount,
      newControls: accepted.length,
      currentAverageMaturity: currentScore,
      targetAverageMaturity: targetScore,
      phases: [
        {
          phase: 1,
          name: 'Quick Wins',
          timeline: 'Months 1-3',
          controls: phase1Controls,
          enhancements: phase1Controls.filter(c => c.status === 'to_be_enhanced').length,
          newControls: phase1Controls.length,
          targetMaturity: Math.round((currentScore + increment) * 10) / 10,
          effort: 'low',
        },
        {
          phase: 2,
          name: 'High Impact',
          timeline: 'Months 4-6',
          controls: phase2Controls,
          enhancements: 0,
          newControls: phase2Controls.length,
          targetMaturity: Math.round((currentScore + increment * 2) * 10) / 10,
          effort: 'medium',
        },
        {
          phase: 3,
          name: 'Optimisation',
          timeline: 'Months 7-12',
          controls: phase3Controls,
          enhancements: 0,
          newControls: phase3Controls.length,
          targetMaturity: Math.round(targetScore * 10) / 10,
          effort: 'high',
        },
      ],
      totalTimelineMonths: 12,
    };

    setImplementationPlan(plan);
    setCurrentStep(6);
  };

  const handleCompleteRisk = async () => {
    if (!selectedRisk || !gapAnalysis || !implementationPlan) return;

    setIsCompletingRisk(true);
    try {
      // Save all controls to the Risk-Control Library
      const allControls = [...gapAnalysis.existingControls, ...implementationPlan.phases.flatMap(p => p.controls)];
      
      for (const control of allControls) {
        // Create control in the Control table (Risk-Control Library)
        await apiService.createControl({
          name: control.title,
          description: control.description || '',
          type: control.type === 'preventive' ? 'preventive' : control.type === 'detective' ? 'detective' : 'corrective',
          automation: 'manual',
          frequency: control.frequency || 'monthly',
          owner: control.owner || 'To be assigned',
          linkedRisks: [selectedRisk.riskTitle],
          effectiveness: 'effective',
          evidenceSource: control.evidence || 'To be documented',
        });

        // Also save to Section2Control table for Material Controls tracking
        const section2Data: any = {
          riskId: selectedRisk.id,
          title: control.title,
          description: control.description || '',
          controlType: control.type,
          objectives: control.objectives || [],
          owner: control.owner || '',
          frequency: control.frequency || 'monthly',
          evidence: control.evidence || '',
          status: control.status || 'existing',
          maturityLevel: selectedCurrentLevel || 1,
          source: control.source || 'workflow_documented',
        };

        // Only add optional fields if they have actual values
        if (control.reviewer) section2Data.reviewer = control.reviewer;
        if (control.implementationPhase !== undefined) section2Data.implementationPhase = control.implementationPhase;
        if (control.implementationEffort) section2Data.implementationEffort = control.implementationEffort;
        if (control.implementationTimeline) section2Data.implementationTimeline = control.implementationTimeline;

        await apiService.saveSection2Control(section2Data);
      }

      // Save completion status to database
      const completionData = {
        riskId: selectedRisk.id,
        riskTitle: selectedRisk.riskTitle,
        status: 'complete' as const,
        currentLevel: selectedCurrentLevel!,
        targetLevel: targetLevel!,
        controlCount: implementationPlan.totalControls,
        currentScore: gapAnalysis.currentScore,
        targetScore: gapAnalysis.targetScore,
      };

      await apiService.saveRiskCompletion(completionData);

      setCompletedRisks([
        ...completedRisks,
        completionData,
      ]);

      setAllDocumentedControls([...allDocumentedControls, ...allControls]);

      alert(`✅ Risk completed! ${allControls.length} controls have been saved to the Risk-Control Library.`);
      
      setSelectedRisk(null);
      setCurrentStep(0);
    } catch (error) {
      console.error('Failed to save controls:', error);
      alert('Failed to save controls to Risk-Control Library. Please try again.');
    } finally {
      setIsCompletingRisk(false);
    }
  };

  // ============================================================
  // Step Indicator
  // ============================================================

  const STEPS = [
    { num: 0 as WorkflowStep, label: 'Select Risk' },
    { num: 1 as WorkflowStep, label: 'Maturity Level' },
    { num: 2 as WorkflowStep, label: 'Document Controls' },
    { num: 3 as WorkflowStep, label: 'Set Target' },
    { num: 4 as WorkflowStep, label: 'Gap Analysis' },
    { num: 5 as WorkflowStep, label: 'Suggested Controls' },
    { num: 6 as WorkflowStep, label: 'Implementation' },
  ];

  const renderStepIndicator = () => (
    <div className="flex items-center justify-between mb-8">
      {STEPS.map((step, idx) => (
        <div key={step.num} className="flex items-center flex-1">
          <div className="flex flex-col items-center flex-1">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm
              ${currentStep > step.num
                ? 'bg-primary text-primary-foreground'
                : currentStep === step.num
                ? 'bg-primary text-primary-foreground'
                : 'bg-gray-200 text-gray-600'
              }`}
            >
              {currentStep > step.num ? <CheckCircle2 className="h-5 w-5" /> : step.num}
            </div>
            <span className="text-xs mt-2 text-center">{step.label}</span>
          </div>
          {idx < STEPS.length - 1 && (
            <div className={`h-1 flex-1 mx-2 ${currentStep > step.num ? 'bg-primary' : 'bg-gray-200'}`} />
          )}
        </div>
      ))}
    </div>
  );

  // ============================================================
  // Screen 0: Select Principal Risk
  // ============================================================

  const renderStep0 = () => {
    const completedIds = new Set(completedRisks.map(r => r.riskId));
    const totalRisks = principalRisks.length;
    const completedCount = completedRisks.length;
    const progressPct = totalRisks > 0 ? Math.round((completedCount / totalRisks) * 100) : 0;

    return (
      <div className="space-y-6">
        {completedRisks.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Material Controls Mapping Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-4">
                <div className="flex-1 bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-primary h-3 rounded-full transition-all"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
                <span className="text-sm font-medium">{completedCount} of {totalRisks} risks ({progressPct}%)</span>
              </div>
              <div className="space-y-2">
                {completedRisks.map(cr => (
                  <div 
                    key={cr.riskId} 
                    className="flex items-center justify-between text-sm border rounded px-3 py-2 hover:bg-accent cursor-pointer transition-colors"
                    onClick={() => {
                      const risk = principalRisks.find(r => r.id === cr.riskId);
                      if (risk) handleSelectRisk(risk);
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <span>{cr.riskTitle}</span>
                    </div>
                    <div className="flex items-center gap-4 text-muted-foreground">
                      <span>Maturity: {cr.currentScore?.toFixed(1)} → {cr.targetScore?.toFixed(1)}</span>
                      <span>Controls: {cr.controlCount}</span>
                      <ArrowRight className="h-4 w-4" />
                    </div>
                  </div>
                ))}
              </div>
              {completedRisks.length > 0 && (
                <div className="mt-3 text-sm text-muted-foreground">
                  Total Controls Identified: {allDocumentedControls.length} |
                  Estimated Time Remaining: ~{Math.round((totalRisks - completedCount) * 25)} minutes
                </div>
              )}
            </CardContent>
          </Card>
        )}

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
                {principalRisks.map(risk => {
                  const isCompleted = completedIds.has(risk.id);
                  const { score } = extractRiskScore(risk);
                  const priority = getRiskPriority(risk);
                  return (
                    <div
                      key={risk.id}
                      className={`border rounded-lg p-4 ${isCompleted ? 'opacity-60' : 'hover:bg-accent cursor-pointer'}`}
                      onClick={() => !isCompleted && handleSelectRisk(risk)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            {isCompleted ? (
                              <CheckCircle2 className="h-5 w-5 text-green-600" />
                            ) : (
                              <AlertTriangle className="h-5 w-5 text-orange-600" />
                            )}
                            {risk.riskNumber && (
                              <Badge variant="outline" className="font-mono text-xs">
                                {risk.riskNumber}
                              </Badge>
                            )}
                            <h3 className="font-semibold">{risk.riskTitle}</h3>
                            <Badge
                              variant={priority === 'HIGH' ? 'destructive' : priority === 'MEDIUM' ? 'default' : 'secondary'}
                            >
                              {priority}
                            </Badge>
                            {score > 0 && (
                              <span className="text-xs text-muted-foreground">Score: {score}/25</span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {risk.riskStatement.split('\n')[0]}
                          </p>
                          <div className="flex gap-2 mt-2">
                            {risk.domainTags.map(tag => (
                              <Badge key={tag} variant="secondary">{tag}</Badge>
                            ))}
                          </div>
                        </div>
                        {!isCompleted && (
                          <Button variant="outline" size="sm">
                            <Target className="h-4 w-4 mr-2" />
                            Build Blueprint
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  // ============================================================
  // Screen 1: Maturity Level Selection
  // ============================================================

  const renderStep1 = () => {
    if (!selectedRisk) return null;
    const { score } = extractRiskScore(selectedRisk);

    return (
      <div className="space-y-6">
        <Card className="border-blue-200 bg-blue-50/50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h3 className="font-semibold">{selectedRisk.riskTitle}</h3>
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                  {selectedRisk.riskStatement.split('\n')[0]}
                </p>
                <div className="flex gap-2 mt-2">
                  <Badge variant={riskPriority === 'HIGH' ? 'destructive' : 'default'}>{riskPriority}</Badge>
                  {score > 0 && <Badge variant="outline">Score: {score}/25</Badge>}
                  {selectedRisk.domainTags.map(tag => (
                    <Badge key={tag} variant="secondary">{tag}</Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Step 1: Select Your Current Maturity Level</CardTitle>
            <CardDescription>
              For this risk, controls typically exist at different maturity levels.
              Select the option that best describes your CURRENT state:
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {maturityPackages.map(pkg => {
              const isExpanded = expandedLevel === pkg.level;
              const isSelected = selectedCurrentLevel === pkg.level;
              const meta = MATURITY_LEVEL_META[pkg.level];

              return (
                <div
                  key={pkg.id}
                  className={`border-2 rounded-lg transition-all ${
                    isSelected
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div
                    className="flex items-start gap-4 p-4 cursor-pointer"
                    onClick={() => {
                      handleSelectCurrentLevel(pkg.level);
                      handleToggleLevel(pkg.level);
                    }}
                  >
                    <div className="mt-1">
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          isSelected ? 'border-primary' : 'border-gray-400'
                        }`}
                      >
                        {isSelected && <div className="w-3 h-3 rounded-full bg-primary" />}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold">
                            LEVEL {pkg.level}: {meta.name.toUpperCase()} ({meta.label})
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            Maturity Score: {meta.range[0]}-{meta.range[1]} / 5
                          </p>
                        </div>
                        <Button variant="ghost" size="sm">
                          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="px-4 pb-4 pl-13 border-t">
                      {loadingAIControls[pkg.level] ? (
                        <div className="pt-4 pl-9 flex items-center gap-3 text-sm text-muted-foreground">
                          <Sparkles className="h-4 w-4 animate-pulse text-blue-600" />
                          <span>AI is generating risk-specific controls for this maturity level...</span>
                        </div>
                      ) : aiGeneratedControls[pkg.level] ? (
                        <div className="pt-4 pl-9 space-y-4">
                          <div className="flex items-center gap-2 mb-3">
                            <Sparkles className="h-4 w-4 text-purple-600" />
                            <span className="text-xs font-medium text-purple-600">AI-Generated Risk-Specific Controls</span>
                          </div>
                          
                          <div>
                            <h5 className="text-sm font-medium mb-2">Typical Controls:</h5>
                            <ul className="space-y-1">
                              {aiGeneratedControls[pkg.level].typicalControls?.map((control: string, i: number) => (
                                <li key={i} className="flex items-center gap-2 text-sm">
                                  <CheckCircle2 className="h-3.5 w-3.5 text-green-600 flex-shrink-0" />
                                  {control}
                                </li>
                              ))}
                            </ul>
                          </div>
                          
                          <div>
                            <h5 className="text-sm font-medium mb-2">Characteristics:</h5>
                            <ul className="space-y-1">
                              {aiGeneratedControls[pkg.level].characteristics?.map((c: string, i: number) => (
                                <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full flex-shrink-0" />
                                  {c}
                                </li>
                              ))}
                            </ul>
                          </div>
                          
                          <div>
                            <h5 className="text-sm font-medium mb-2">Specific Controls ({aiGeneratedControls[pkg.level].specificControls?.length || 0}):</h5>
                            <div className="space-y-2">
                              {aiGeneratedControls[pkg.level].specificControls?.slice(0, 3).map((control: any, i: number) => (
                                <div key={i} className="bg-gray-50 rounded-lg p-3 border">
                                  <div className="flex items-start justify-between gap-2">
                                    <div className="flex-1">
                                      <p className="text-sm font-medium">{control.title}</p>
                                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{control.description}</p>
                                    </div>
                                    <Badge variant="outline" className="text-xs">{control.type}</Badge>
                                  </div>
                                  <div className="flex gap-2 mt-2">
                                    <span className="text-xs text-muted-foreground">Owner: {control.defaultOwner}</span>
                                    <span className="text-xs text-muted-foreground">•</span>
                                    <span className="text-xs text-muted-foreground">{control.defaultFrequency}</span>
                                  </div>
                                </div>
                              ))}
                              {aiGeneratedControls[pkg.level].specificControls?.length > 3 && (
                                <p className="text-xs text-muted-foreground italic">
                                  ... and {aiGeneratedControls[pkg.level].specificControls.length - 3} more controls
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="pt-4 pl-9 space-y-3">
                          <div>
                            <h5 className="text-sm font-medium mb-1">Typical Controls:</h5>
                            <ul className="space-y-1">
                              {pkg.controlTemplates.map(t => (
                                <li key={t.id} className="flex items-center gap-2 text-sm">
                                  <CheckCircle2 className="h-3.5 w-3.5 text-green-600 flex-shrink-0" />
                                  {t.title}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <h5 className="text-sm font-medium mb-1">Characteristics:</h5>
                            <ul className="space-y-1">
                              {pkg.characteristics.map((c, i) => (
                                <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full flex-shrink-0" />
                                  {c}
                                </li>
                              ))}
                            </ul>
                          </div>
                          {pkg.exampleCompanies && pkg.exampleCompanies.length > 0 && (
                            <p className="text-xs text-muted-foreground italic">
                              {pkg.exampleCompanies[0]}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}

            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={() => { setCurrentStep(0); setSelectedRisk(null); }}>
                <ChevronLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <Button 
                disabled={!selectedCurrentLevel || (selectedCurrentLevel && loadingAIControls[selectedCurrentLevel])} 
                onClick={handleProceedToDocumentation}
              >
                {selectedCurrentLevel && loadingAIControls[selectedCurrentLevel] ? (
                  <>
                    <Sparkles className="h-4 w-4 mr-2 animate-pulse" />
                    AI Processing...
                  </>
                ) : (
                  <>
                    Continue with Level {selectedCurrentLevel}
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  // ============================================================
  // Screen 2: Document Current Controls
  // ============================================================

  const renderStep2 = () => {
    // Check if this is a completed risk being viewed
    const isCompletedRiskView = completedRisks.some(cr => cr.riskId === selectedRisk?.id) && 
                                 documentedControls.length > 0 && 
                                 !currentLevelPackage;
    
    if (isCompletedRiskView) {
      // Show completed controls summary
      return (
        <div className="space-y-6">
          <Card className="border-green-200 bg-green-50/50">
            <CardContent className="pt-4 pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <div className="text-sm">
                    <span className="font-medium">Completed Risk - View Only</span>
                    <span className="text-muted-foreground ml-2">
                      This risk has been completed with {documentedControls.length} controls documented
                    </span>
                  </div>
                </div>
                <Badge className="bg-green-100 text-green-800 border-green-300">
                  Completed
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Documented Controls for {selectedRisk?.riskTitle}</CardTitle>
              <CardDescription>
                Current Maturity Level: {selectedCurrentLevel} | Target Level: {targetLevel}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {documentedControls.map((control, idx) => (
                  <div key={idx} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-lg">{control.title}</h4>
                        <p className="text-sm text-muted-foreground mt-1">{control.description}</p>
                      </div>
                      <Badge variant="outline">{control.type}</Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Owner:</span>
                        <p className="text-muted-foreground">{control.owner}</p>
                      </div>
                      <div>
                        <span className="font-medium">Frequency:</span>
                        <p className="text-muted-foreground">{control.frequency}</p>
                      </div>
                      <div>
                        <span className="font-medium">Evidence:</span>
                        <p className="text-muted-foreground">{control.evidence || 'Not specified'}</p>
                      </div>
                      <div>
                        <span className="font-medium">Objectives:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {control.objectives.map((obj, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">
                              {obj}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => { setCurrentStep(0); setSelectedRisk(null); }}>
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back to Risk Selection
            </Button>
          </div>
        </div>
      );
    }
    
    if (!currentLevelPackage || !selectedCurrentLevel) return null;
    // Use AI-generated specific controls if available, otherwise use templates
    const aiControls = aiGeneratedControls[selectedCurrentLevel]?.specificControls || [];
    const templates = aiControls.length > 0 ? aiControls : currentLevelPackage.controlTemplates;
    const template = templates[currentControlIdx];
    const doc = documentedControls[currentControlIdx];
    if (!template || !doc) return null;

    const updateDoc = (updates: Partial<DocumentedControl>) => {
      const newDocs = [...documentedControls];
      newDocs[currentControlIdx] = { ...newDocs[currentControlIdx], ...updates };
      setDocumentedControls(newDocs);
    };

    return (
      <div className="space-y-6">
        <Card className="border-blue-200 bg-blue-50/50">
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center justify-between">
              <div className="text-sm">
                <span className="font-medium">Documenting Your Current Controls</span>
                <span className="text-muted-foreground ml-2">
                  (Level {selectedCurrentLevel}: {MATURITY_LEVEL_META[selectedCurrentLevel].name})
                </span>
              </div>
              <Badge variant="outline">Control {currentControlIdx + 1} of {templates.length}</Badge>
            </div>
            <div className="mt-2 bg-gray-200 rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all"
                style={{ width: `${((currentControlIdx + 1) / templates.length) * 100}%` }}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Control #{currentControlIdx + 1}</CardTitle>
            <CardDescription>
              <span className="font-medium text-foreground">Standard Control: </span>
              "{template.title}"
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="border rounded-lg p-4 bg-gray-50">
              <p className="text-sm text-muted-foreground">{template.description}</p>
              <div className="flex gap-2 mt-2">
                <Badge variant="outline">{template.type}</Badge>
                {template.objectives.map(o => (
                  <Badge key={o} variant="secondary">{o}</Badge>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium">Do you have this control? <span className="text-red-500">*</span></Label>
              <div className="mt-2 space-y-2">
                {[
                  { value: 'yes', label: 'Yes, we have this' },
                  { value: 'no', label: "No, we don't have this" },
                  { value: 'similar', label: 'We have something similar but different' },
                ].map(opt => (
                  <label
                    key={opt.value}
                    className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                      doc.hasControl === opt.value ? 'border-primary bg-primary/5' : 'hover:bg-accent'
                    }`}
                    onClick={() => updateDoc({ hasControl: opt.value as 'yes' | 'no' | 'similar' })}
                  >
                    <div
                      className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        doc.hasControl === opt.value ? 'border-primary' : 'border-gray-400'
                      }`}
                    >
                      {doc.hasControl === opt.value && <div className="w-2 h-2 rounded-full bg-primary" />}
                    </div>
                    <span className="text-sm">{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {(doc.hasControl === 'yes' || doc.hasControl === 'similar') && (
              <div className="space-y-4 border-t pt-4">
                <p className="text-sm font-medium text-green-700">
                  Great! Let's document your version:
                </p>

                <div>
                  <Label>Q1: What do you call this report/process?</Label>
                  <Input
                    className="mt-1"
                    placeholder={template.title}
                    value={doc.controlName}
                    onChange={e => updateDoc({ controlName: e.target.value })}
                  />
                </div>

                <div>
                  <Label>Q2: Who prepares this?</Label>
                  <Select
                    value={doc.preparedBy}
                    onValueChange={v => updateDoc({ preparedBy: v })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select role..." />
                    </SelectTrigger>
                    <SelectContent>
                      {['CEO', 'CFO', 'CRO', 'Financial Controller', 'Accountant', 'IT Director', 'CISO', 'Sales Director', 'Operations Director', 'HR Director', 'Compliance Officer', 'Department Manager', 'Other'].map(role => (
                        <SelectItem key={role} value={role}>{role}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Q3: Who reviews/uses this?</Label>
                  <Select
                    value={doc.reviewedBy}
                    onValueChange={v => updateDoc({ reviewedBy: v })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select role..." />
                    </SelectTrigger>
                    <SelectContent>
                      {['CEO', 'CFO', 'CRO', 'Financial Controller', 'Accountant', 'IT Director', 'CISO', 'Sales Director', 'Operations Director', 'HR Director', 'Compliance Officer', 'Department Manager', 'Board of Directors', 'Audit Committee', 'CFO and department heads', 'Senior Management Team', 'Other'].map(role => (
                        <SelectItem key={role} value={role}>{role}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Q4: How often is it prepared?</Label>
                  <Select
                    value={doc.frequency}
                    onValueChange={v => updateDoc({ frequency: v as ControlFrequency })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select frequency..." />
                    </SelectTrigger>
                    <SelectContent>
                      {[
                        { value: 'continuous', label: 'Continuous' },
                        { value: 'daily', label: 'Daily' },
                        { value: 'weekly', label: 'Weekly' },
                        { value: 'monthly', label: 'Monthly' },
                        { value: 'quarterly', label: 'Quarterly' },
                        { value: 'annually', label: 'Annually' },
                        { value: 'ad_hoc', label: 'Ad Hoc' },
                      ].map(f => (
                        <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Q5: What evidence exists?</Label>
                  <Select
                    value={doc.evidence}
                    onValueChange={v => updateDoc({ evidence: v })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select evidence type..." />
                    </SelectTrigger>
                    <SelectContent>
                      {['Informal notes, emails', 'Spreadsheet or document', 'System report or dashboard', 'Meeting minutes', 'Formal report with sign-off', 'Automated system alerts', 'Database records', 'Audit trail in system', 'Physical documentation', 'Email confirmations', 'Signed approvals', 'Other'].map(evidence => (
                        <SelectItem key={evidence} value={evidence}>{evidence}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Q6: Are there any thresholds or triggers?</Label>
                  <div className="mt-2 space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <div
                        className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                          doc.hasThresholds ? 'border-primary' : 'border-gray-400'
                        }`}
                      >
                        {doc.hasThresholds && <div className="w-2 h-2 rounded-full bg-primary" />}
                      </div>
                      <span className="text-sm" onClick={() => updateDoc({ hasThresholds: true })}>Yes</span>
                    </label>
                    {doc.hasThresholds && (
                      <Textarea
                        className="ml-6"
                        placeholder="Describe thresholds..."
                        value={doc.thresholdDetails}
                        onChange={e => updateDoc({ thresholdDetails: e.target.value })}
                        rows={2}
                      />
                    )}
                    <label className="flex items-center gap-2 cursor-pointer">
                      <div
                        className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                          !doc.hasThresholds ? 'border-primary' : 'border-gray-400'
                        }`}
                      >
                        {!doc.hasThresholds && <div className="w-2 h-2 rounded-full bg-primary" />}
                      </div>
                      <span className="text-sm" onClick={() => updateDoc({ hasThresholds: false })}>No, just reporting</span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-between pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => {
                  if (currentControlIdx > 0) setCurrentControlIdx(currentControlIdx - 1);
                  else setCurrentStep(1);
                }}
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                {currentControlIdx > 0 ? 'Previous Control' : 'Back'}
              </Button>
              <Button
                disabled={!doc.hasControl}
                onClick={() => {
                  if (!doc.hasControl) {
                    alert('Please select whether you have this control before proceeding.');
                    return;
                  }
                  if (currentControlIdx < templates.length - 1) {
                    setCurrentControlIdx(currentControlIdx + 1);
                  } else {
                    handleProceedToTarget();
                  }
                }}
              >
                {currentControlIdx < templates.length - 1 ? 'Next Control' : 'Set Target Level'}
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  // ============================================================
  // Screen 3: Set Target Maturity Level
  // ============================================================

  const renderStep3 = () => {
    if (!selectedCurrentLevel || !selectedRisk) return null;
    const { score } = extractRiskScore(selectedRisk);
    const documentedCount = documentedControls.filter(
      dc => dc.hasControl === 'yes' || dc.hasControl === 'similar'
    ).length;
    const currentMeta = MATURITY_LEVEL_META[selectedCurrentLevel];
    const currentScore = currentMeta.range[0] + 0.2;

    return (
      <div className="space-y-6">
        <Card className="border-green-200 bg-green-50/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Current State Documented</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm mb-2">
              You've documented <strong>{documentedCount} controls</strong> at Level {selectedCurrentLevel}:
            </p>
            <ul className="space-y-1 mb-3">
              {documentedControls.map((dc, idx) => {
                // Check AI-generated controls first, then fall back to templates
                const aiControls = aiGeneratedControls[selectedCurrentLevel!]?.specificControls || [];
                const templates = aiControls.length > 0 ? aiControls : currentLevelPackage?.controlTemplates || [];
                const template = templates[idx];
                if (dc.hasControl === 'no') return null;
                return (
                  <li key={dc.templateId} className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
                    {dc.controlName || template?.title}
                  </li>
                );
              })}
            </ul>
            <p className="text-sm font-medium">
              Current Maturity: {currentScore.toFixed(1)} / 5 ({currentMeta.name})
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Target Maturity Level</CardTitle>
            <CardDescription>What maturity level do you want to achieve for this risk?</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <Sparkles className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-medium text-blue-900">AI Recommendation:</p>
                <p className="text-blue-700">
                  For {riskPriority} priority risks{score > 0 ? ` (score ${score}/25)` : ''},
                  target Level {recommendedTarget} ({MATURITY_LEVEL_META[recommendedTarget].name}) minimum.
                </p>
              </div>
            </div>

            {([selectedCurrentLevel, ...([2, 3, 4] as MaturityLevel[]).filter(l => l > selectedCurrentLevel)] as MaturityLevel[]).map(level => {
              const meta = MATURITY_LEVEL_META[level];
              const isRecommended = level === recommendedTarget;
              const isStay = level === selectedCurrentLevel;
              const isSelected = targetLevel === level;

              let timeline = '';
              if (!isStay) {
                const gap = level - selectedCurrentLevel;
                timeline = gap === 1 ? '6-12 months' : gap === 2 ? '12-18 months' : '12-24 months';
              }

              return (
                <label
                  key={level}
                  className={`flex items-start gap-4 p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                    isSelected ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setTargetLevel(level)}
                >
                  <div className="mt-0.5">
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        isSelected ? 'border-primary' : 'border-gray-400'
                      }`}
                    >
                      {isSelected && <div className="w-3 h-3 rounded-full bg-primary" />}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {isStay ? `Stay at Level ${level} (${meta.name})` : `Move to Level ${level} (${meta.name})`}
                      </span>
                      {isRecommended && (
                        <Badge className="bg-green-100 text-green-800 border-green-200">RECOMMENDED</Badge>
                      )}
                    </div>
                    {!isStay && (
                      <div className="text-sm text-muted-foreground mt-1">
                        Target Score: {meta.range[1]} / 5 | Timeline: {timeline}
                        {level === 4 && ' (significant effort)'}
                      </div>
                    )}
                    {isStay && riskPriority === 'HIGH' && (
                      <p className="text-sm text-orange-600 mt-1">
                        Not recommended for {riskPriority} priority risk
                      </p>
                    )}
                  </div>
                </label>
              );
            })}

            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={() => setCurrentStep(2)}>
                <ChevronLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <Button disabled={!targetLevel} onClick={handleConfirmTarget}>
                Confirm Target: Level {targetLevel}
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  // ============================================================
  // Screen 4: Gap Analysis
  // ============================================================

  const renderStep4 = () => {
    if (!gapAnalysis) return null;
    const currentMeta = MATURITY_LEVEL_META[gapAnalysis.currentLevel];
    const targetMeta = MATURITY_LEVEL_META[gapAnalysis.targetLevel];

    return (
      <div className="space-y-6">
        <Card className="border-orange-200 bg-orange-50/50">
          <CardContent className="pt-6">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-sm text-muted-foreground">Current Level</p>
                <p className="text-2xl font-bold">{gapAnalysis.currentLevel}</p>
                <p className="text-sm">{currentMeta.name}</p>
              </div>
              <div className="flex items-center justify-center">
                <ArrowRight className="h-8 w-8 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Target Level</p>
                <p className="text-2xl font-bold">{gapAnalysis.targetLevel}</p>
                <p className="text-sm">{targetMeta.name}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 gap-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-green-700">What You Have (Level {gapAnalysis.currentLevel})</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {gapAnalysis.existingControls.map(c => (
                  <li key={c.id} className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                    {c.title}
                  </li>
                ))}
              </ul>
              <p className="text-sm text-muted-foreground mt-3">Total: {gapAnalysis.existingControls.length} controls</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-red-700">What You Need for Level {gapAnalysis.targetLevel}</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {gapAnalysis.missingControls.map(t => (
                  <li key={t.id} className="flex items-center gap-2 text-sm">
                    <X className="h-4 w-4 text-red-500 flex-shrink-0" />
                    {t.title}
                  </li>
                ))}
              </ul>
              <p className="text-sm text-muted-foreground mt-3">Missing: {gapAnalysis.gapCount} controls</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Gap Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium mb-2">Missing by Objective:</p>
                {gapAnalysis.missingObjectives.length > 0 ? (
                  <ul className="space-y-1">
                    {gapAnalysis.missingObjectives.map(o => (
                      <li key={o} className="flex items-center gap-2 text-sm">
                        <X className="h-3.5 w-3.5 text-red-500" />
                        <span className="capitalize">{o} controls</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-green-600">All objectives covered</p>
                )}
              </div>
              <div>
                <p className="text-sm font-medium mb-2">Missing by Type:</p>
                {gapAnalysis.missingTypes.length > 0 ? (
                  <ul className="space-y-1">
                    {gapAnalysis.missingTypes.map(t => (
                      <li key={t} className="flex items-center gap-2 text-sm">
                        <X className="h-3.5 w-3.5 text-red-500" />
                        <span className="capitalize">{t} controls</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-green-600">All types covered</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-6 mt-4 pt-4 border-t">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Estimated Effort:</span>
                <Badge variant={
                  gapAnalysis.effortEstimate === 'low' ? 'secondary' :
                  gapAnalysis.effortEstimate === 'medium' ? 'default' : 'destructive'
                }>
                  {gapAnalysis.effortEstimate.toUpperCase()}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Timeline: {gapAnalysis.timelineEstimate}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-between">
          <Button variant="outline" onClick={() => setCurrentStep(3)}>
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <Button onClick={handleProceedToSuggestions}>
            Continue to Control Suggestions
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>
    );
  };

  // ============================================================
  // Screen 5: Review Suggested Controls
  // ============================================================

  const renderStep5 = () => {
    if (suggestedControls.length === 0) {
      return (
        <Card>
          <CardContent className="pt-6 text-center py-12">
            <CheckCircle2 className="h-12 w-12 mx-auto mb-4 text-green-600" />
            <p className="text-lg font-medium">No additional controls needed!</p>
            <p className="text-sm text-muted-foreground">Your current controls already meet the target level.</p>
            <Button className="mt-4" onClick={handleGenerateTimeline}>
              Continue to Implementation
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      );
    }

    const sc = suggestedControls[currentSuggestionIdx];
    if (!sc) return null;
    const template = sc.template;
    const acceptedCount = suggestedControls.filter(s => s.accepted).length;
    const rejectedCount = suggestedControls.filter(s => s.rejected).length;
    const pendingCount = suggestedControls.length - acceptedCount - rejectedCount;

    return (
      <div className="space-y-6">
        <Card className="border-blue-200 bg-blue-50/50">
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center justify-between">
              <div className="text-sm">
                <span className="font-medium">Bridging the Gap: Level {gapAnalysis?.currentLevel} → Level {gapAnalysis?.targetLevel}</span>
                <span className="text-muted-foreground ml-2">
                  AI has identified {suggestedControls.length} controls to add.
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="default">{acceptedCount} accepted</Badge>
                <Badge variant="destructive">{rejectedCount} skipped</Badge>
                <Badge variant="outline">{pendingCount} pending</Badge>
              </div>
            </div>
            <div className="mt-2 bg-gray-200 rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all"
                style={{ width: `${((acceptedCount + rejectedCount) / suggestedControls.length) * 100}%` }}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-2 mb-2">
          {suggestedControls.map((s, idx) => (
            <button
              key={s.templateId}
              className={`w-8 h-8 rounded text-xs font-medium transition-colors ${
                idx === currentSuggestionIdx
                  ? 'bg-primary text-primary-foreground'
                  : s.accepted
                  ? 'bg-green-100 text-green-800 border border-green-300'
                  : s.rejected
                  ? 'bg-red-100 text-red-800 border border-red-300'
                  : 'bg-gray-100 text-gray-600 border border-gray-300'
              }`}
              onClick={() => setCurrentSuggestionIdx(idx)}
            >
              {idx + 1}
            </button>
          ))}
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-lg">Suggested Control #{currentSuggestionIdx + 1} (NEW)</CardTitle>
                <CardDescription>{template.title}</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={sc.priority <= 2 ? 'destructive' : sc.priority <= 4 ? 'default' : 'secondary'}>
                  Priority {sc.priority}
                </Badge>
                <Badge variant="outline">Phase {sc.implementationPhase}</Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h5 className="text-sm font-medium mb-1">Purpose:</h5>
              <p className="text-sm text-muted-foreground">{sc.fillsGap}</p>
            </div>

            <div>
              <h5 className="text-sm font-medium mb-1">Description:</h5>
              <p className="text-sm">{template.description}</p>
            </div>

            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Owner:</span>
                <p className="font-medium">{sc.customizations?.owner || template.defaultOwner}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Frequency:</span>
                <p className="font-medium capitalize">{sc.customizations?.frequency || template.defaultFrequency}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Evidence:</span>
                <p className="font-medium">{template.defaultEvidence}</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Control Type:</span>
                <p className="font-medium capitalize">{template.type}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Objectives:</span>
                <p className="font-medium capitalize">{template.objectives.join(', ')}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Effort:</span>
                <Badge variant={
                  template.implementationEffort === 'low' ? 'secondary' :
                  template.implementationEffort === 'medium' ? 'default' : 'destructive'
                }>
                  {template.implementationEffort.toUpperCase()}
                </Badge>
              </div>
            </div>

            <div className="border rounded-lg p-3 bg-amber-50 border-amber-200">
              <div className="flex items-start gap-2">
                <Info className="h-4 w-4 text-amber-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-amber-800">Why Material:</p>
                  <p className="text-amber-700">{sc.reasoning}</p>
                </div>
              </div>
            </div>

            {customizingControl === sc.templateId && (
              <div className="border rounded-lg p-4 bg-gray-50 space-y-3">
                <h5 className="font-medium">Customize Control</h5>
                <div>
                  <Label>Owner</Label>
                  <Select
                    value={sc.customizations?.owner || template.defaultOwner}
                    onValueChange={v => {
                      const updated = [...suggestedControls];
                      updated[currentSuggestionIdx] = {
                        ...sc,
                        customizations: { ...sc.customizations, owner: v },
                      };
                      setSuggestedControls(updated);
                    }}
                  >
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {['CEO', 'CFO', 'CRO', 'CISO', 'Financial Controller', 'IT Director', 'Operations Director', 'Sales Director', 'HR Director', 'Compliance Officer', 'Department Manager', 'Program Manager'].map(role => (
                        <SelectItem key={role} value={role}>{role}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Frequency</Label>
                  <Select
                    value={(sc.customizations?.frequency as string) || template.defaultFrequency}
                    onValueChange={v => {
                      const updated = [...suggestedControls];
                      updated[currentSuggestionIdx] = {
                        ...sc,
                        customizations: { ...sc.customizations, frequency: v as ControlFrequency },
                      };
                      setSuggestedControls(updated);
                    }}
                  >
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {['continuous', 'daily', 'weekly', 'monthly', 'quarterly', 'annually', 'ad_hoc'].map(f => (
                        <SelectItem key={f} value={f} className="capitalize">{f.replace('_', ' ')}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button size="sm" variant="outline" onClick={() => setCustomizingControl(null)}>
                  Done Customizing
                </Button>
              </div>
            )}

            <div className="flex items-center gap-3 pt-4 border-t">
              <Button
                className="flex-1"
                variant={sc.accepted ? 'default' : 'outline'}
                onClick={() => handleAcceptControl(currentSuggestionIdx)}
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                {sc.accepted ? 'Accepted' : 'Add This Control'}
              </Button>
              <Button
                variant="outline"
                onClick={() => setCustomizingControl(customizingControl === sc.templateId ? null : sc.templateId)}
              >
                <Pencil className="h-4 w-4 mr-2" />
                Customize
              </Button>
              <Button
                variant={sc.rejected ? 'destructive' : 'outline'}
                onClick={() => handleRejectControl(currentSuggestionIdx)}
              >
                <X className="h-4 w-4 mr-2" />
                {sc.rejected ? 'Skipped' : 'Skip'}
              </Button>
            </div>

            {sc.rejected && (
              <div className="flex items-start gap-2 p-2 bg-red-50 border border-red-200 rounded text-sm">
                <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5" />
                <span className="text-red-700">If skipped: Creates gap in {template.objectives[0]} controls for this risk</span>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-between">
          <Button variant="outline" onClick={() => setCurrentStep(4)}>
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Gap Analysis
          </Button>
          <Button
            onClick={handleGenerateTimeline}
            disabled={suggestedControls.some(s => !s.accepted && !s.rejected)}
          >
            Generate Implementation Timeline
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>
    );
  };

  // ============================================================
  // Screen 6: Implementation Timeline
  // ============================================================

  const [editingPhaseTimeline, setEditingPhaseTimeline] = useState<number | null>(null);
  const [customTimeline, setCustomTimeline] = useState<string>('');

  const handleUpdatePhaseTimeline = (phaseNum: number, newTimeline: string) => {
    if (!implementationPlan) return;
    const updatedPlan = { ...implementationPlan };
    updatedPlan.phases = updatedPlan.phases.map(p => {
      if (p.phase === phaseNum) {
        // Update timeline for the phase and all its controls
        const updatedControls = p.controls.map(c => ({
          ...c,
          implementationTimeline: newTimeline
        }));
        return { ...p, timeline: newTimeline, controls: updatedControls };
      }
      return p;
    });
    setImplementationPlan(updatedPlan);
    setEditingPhaseTimeline(null);
    setCustomTimeline('');
  };

  const renderStep6 = () => {
    if (!implementationPlan || !gapAnalysis) return null;

    const phaseColors = ['bg-green-500', 'bg-blue-500', 'bg-purple-500'];
    const phaseTextColors = ['text-green-700', 'text-blue-700', 'text-purple-700'];
    const phaseBgColors = ['bg-green-50', 'bg-blue-50', 'bg-purple-50'];

    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Implementation Plan</CardTitle>
            <CardDescription>
              You've selected {implementationPlan.newControls} new controls to add.
              Here's the recommended implementation timeline (click to edit):
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {implementationPlan.phases.map((phase, idx) => (
              <div key={phase.phase} className={`border rounded-lg overflow-hidden ${phase.controls.length === 0 ? 'opacity-50' : ''}`}>
                <div className={`px-4 py-3 ${phaseBgColors[idx]} flex items-center justify-between`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full ${phaseColors[idx]} text-white flex items-center justify-center text-sm font-bold`}>
                      {phase.phase}
                    </div>
                    <div>
                      <h4 className={`font-semibold ${phaseTextColors[idx]}`}>
                        Phase {phase.phase}: {phase.name}
                      </h4>
                      {editingPhaseTimeline === phase.phase ? (
                        <div className="flex items-center gap-2 mt-1">
                          <Select
                            value={customTimeline || phase.timeline}
                            onValueChange={setCustomTimeline}
                          >
                            <SelectTrigger className="w-48 h-8 text-sm">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Months 1-2">Months 1-2</SelectItem>
                              <SelectItem value="Months 1-3">Months 1-3</SelectItem>
                              <SelectItem value="Months 2-4">Months 2-4</SelectItem>
                              <SelectItem value="Months 3-6">Months 3-6</SelectItem>
                              <SelectItem value="Months 4-6">Months 4-6</SelectItem>
                              <SelectItem value="Months 6-9">Months 6-9</SelectItem>
                              <SelectItem value="Months 7-12">Months 7-12</SelectItem>
                              <SelectItem value="Months 9-12">Months 9-12</SelectItem>
                              <SelectItem value="Months 12-18">Months 12-18</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button size="sm" onClick={() => handleUpdatePhaseTimeline(phase.phase, customTimeline || phase.timeline)}>
                            Save
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => { setEditingPhaseTimeline(null); setCustomTimeline(''); }}>
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <p className="text-sm text-muted-foreground">{phase.timeline}</p>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="h-6 px-2"
                            onClick={() => { setEditingPhaseTimeline(phase.phase); setCustomTimeline(phase.timeline); }}
                          >
                            <Pencil className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      Maturity after Phase {phase.phase}: {phase.targetMaturity.toFixed(1)} / 5
                    </p>
                    {phase.phase === 2 && phase.targetMaturity >= (gapAnalysis?.targetScore || 0) * 0.85 && (
                      <Badge className="bg-green-100 text-green-800">TARGET</Badge>
                    )}
                  </div>
                </div>
                {phase.controls.length > 0 ? (
                  <div className="p-4 space-y-2">
                    {phase.controls.map(control => (
                      <div key={control.id} className="flex items-center justify-between text-sm py-2 border-b last:border-0">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                          <span className="font-medium">{control.id}:</span>
                          <span>{control.title}</span>
                        </div>
                        <Badge variant={
                          control.implementationEffort === 'low' ? 'secondary' :
                          control.implementationEffort === 'medium' ? 'default' : 'destructive'
                        }>
                          {control.implementationEffort?.toUpperCase()}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-sm text-muted-foreground text-center">No controls in this phase</div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-4 text-center">
              <div className="border rounded-lg p-3">
                <p className="text-2xl font-bold">{implementationPlan.totalControls}</p>
                <p className="text-xs text-muted-foreground">Total Controls</p>
              </div>
              <div className="border rounded-lg p-3">
                <p className="text-2xl font-bold">{implementationPlan.existingControls}</p>
                <p className="text-xs text-muted-foreground">Existing</p>
              </div>
              <div className="border rounded-lg p-3">
                <p className="text-2xl font-bold">{implementationPlan.newControls}</p>
                <p className="text-xs text-muted-foreground">New/Enhanced</p>
              </div>
              <div className="border rounded-lg p-3">
                <p className="text-2xl font-bold">{implementationPlan.totalTimelineMonths}m</p>
                <p className="text-xs text-muted-foreground">Timeline</p>
              </div>
            </div>
            <div className="flex items-center justify-center gap-8 mt-4 pt-4 border-t">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Current Maturity</p>
                <p className="text-xl font-bold">{implementationPlan.currentAverageMaturity.toFixed(1)} / 5</p>
              </div>
              <ArrowRight className="h-6 w-6 text-primary" />
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Target Maturity</p>
                <p className="text-xl font-bold text-green-600">{implementationPlan.targetAverageMaturity.toFixed(1)} / 5</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-between">
          <Button variant="outline" onClick={() => setCurrentStep(5)}>
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setCurrentStep(5)}>
              <Pencil className="h-4 w-4 mr-2" />
              Adjust Priorities
            </Button>
            <Button onClick={handleCompleteRisk} disabled={isCompletingRisk}>
              {isCompletingRisk ? (
                <>
                  <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Saving Controls...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Accept & Complete Risk
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    );
  };

  // ============================================================
  // Main Render
  // ============================================================

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
