export type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'in_review';
export type Severity = 'critical' | 'high' | 'medium' | 'low';
export type TestStatus = 'not_started' | 'in_progress' | 'completed' | 'failed';
export type ControlEffectiveness = 'effective' | 'partially_effective' | 'not_effective' | 'not_tested';
export type RiskLevel = 'critical' | 'high' | 'medium' | 'low';
export type Categorization = 'B' | 'H' | 'C';
export type DomainTag = 'ops' | 'reporting' | 'financial' | 'compliance';
export type ThreatLensTag = 'business_model' | 'performance' | 'solvency' | 'liquidity';
export type EffectivenessMeasurementType = 'input_identification' | 'assessment_translation' | 'action_execution' | 'reliability_improvement';

export interface User {
  id: string;
  name: string;
  role: string;
  email: string;
}

export interface EffectivenessCriteria {
  id: string;
  dimension: string;
  criteria: string;
  threshold: string;
  evidenceType: string[];
  frequency: 'continuous' | 'quarterly' | 'annual';
  status: ApprovalStatus;
  categorization: 'B' | 'H' | 'C'; // Baseline, High, Critical
  approvedBy?: string;
  approvedDate?: string;
}

export interface FrameworkComponent {
  id: string;
  type: 'governance' | 'risk_taxonomy' | 'risk_appetite' | 'control_model' | 'three_lines' | 'policy' | 'reporting';
  name: string;
  description: string;
  owner: string;
  status: ApprovalStatus;
  lastReviewed?: string;
}

export interface MaterialControl {
  id: string;
  name: string;
  description: string;
  materialityScore: number;
  rationale: string;
  owner: string;
  evidenceSource: string;
  testingFrequency: string;
  dependencies: string[];
  effectiveness: ControlEffectiveness;
  lastTested?: string;
}

export interface Risk {
  id: string;
  title: string;
  description: string;
  category: string;
  inherentRisk: RiskLevel;
  residualRisk: RiskLevel;
  owner: string;
  linkedObjectives: string[];
  linkedControls: string[];
  lastAssessed: string;
}

export interface Control {
  id: string;
  name: string;
  description: string;
  type: 'preventive' | 'detective' | 'corrective';
  automation: 'manual' | 'automated' | 'semi-automated';
  frequency: string;
  owner: string;
  linkedRisks: string[];
  effectiveness: ControlEffectiveness;
  evidenceSource: string;
}

export interface TestPlan {
  id: string;
  controlId: string;
  controlName: string;
  testType: 'design' | 'operating';
  tester: string;
  scheduledDate: string;
  status: TestStatus;
  results?: string;
  exceptions?: string[];
  remediationRequired: boolean;
}

export interface Issue {
  id: string;
  title: string;
  description: string;
  severity: Severity;
  controlId: string;
  discoveredDate: string;
  status: 'open' | 'in_remediation' | 'closed';
  owner: string;
  dueDate: string;
  remediationPlan?: string;
  retestDate?: string;
}

export interface IntegrationStatus {
  id: string;
  system: string;
  status: 'connected' | 'disconnected' | 'error';
  lastSync: string;
  signalsReceived: number;
  exceptionsRaised: number;
}

export interface ControlGap {
  id: string;
  source: 'internal' | 'external';
  title: string;
  description: string;
  affectedControls: string[];
  riskTheme: string;
  priority: Severity;
  proposedAction: string;
  status: ApprovalStatus;
  identifiedDate: string;
}

export interface ApprovalWorkflow {
  id: string;
  itemType: string;
  itemId: string;
  itemName: string;
  requester: string;
  currentApprover: string;
  status: ApprovalStatus;
  submittedDate: string;
  comments?: string;
}

export interface BoardMetric {
  label: string;
  value: number | string;
  change?: number;
  status: 'good' | 'warning' | 'critical';
}

export interface DashboardData {
  effectivenessStatus: {
    met: number;
    partially: number;
    notMet: number;
  };
  controlHealth: {
    tested: number;
    effective: number;
    totalMaterial: number;
  };
  issuesByTheme: Array<{
    theme: string;
    count: number;
  }>;
  remediationProgress: Array<{
    month: string;
    opened: number;
    closed: number;
  }>;
}

// Principal Risks and Material Controls Workflow Types

export interface PrincipalRisk {
  id: string;
  riskTitle: string;
  riskStatement: string;
  domainTags: string[]; // ops, reporting, financial, compliance
  threatLensTags: string[]; // business_model, performance, solvency, liquidity
  riskOwner: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Process {
  id: string;
  processName: string;
  processScope: string;
  systemsInScope?: string[];
  processOwner: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface RiskProcessLink {
  id: string;
  riskId: string;
  processId: string;
  relevance: 'primary' | 'secondary';
  rationale?: string;
}

export interface ProcessMaturityAssessment {
  id: string;
  processId: string;
  assessmentVersion: number;
  assessmentDate: string;
  answers: Record<string, any>;
  maturityProfile: string;
}

export interface StandardControl {
  id: string;
  controlName: string;
  controlObjective: string;
  controlType: 'preventive' | 'detective' | 'corrective';
  domainTag: 'ops' | 'reporting' | 'financial' | 'compliance';
  typicalFrequency: string;
  typicalEvidence: string;
  applicabilityRules?: any;
}

export interface AsIsControl {
  id: string;
  processId: string;
  controlName: string;
  controlObjective: string;
  controlType: 'preventive' | 'detective' | 'corrective';
  domainTag: string;
  frequency: string;
  evidenceSource?: string;
  owner?: string;
  status: 'exists' | 'partial' | 'not_exist';
  mappedStdControlId?: string;
}

export interface Gap {
  id: string;
  processId: string;
  riskId?: string;
  stdControlId?: string;
  gapType: 'missing' | 'weak_design' | 'weak_operation' | 'no_owner' | 'no_evidence';
  recommendedToBeControlId?: string;
}

export interface ToBeControl {
  id: string;
  processId: string;
  controlObjective: string;
  ownerRole?: string;
  frequency: string;
  evidenceType: string;
  controlType: 'preventive' | 'detective' | 'corrective';
  domainTag: string;
  implementationGuidance?: string;
  targetDate?: string;
  implementationStatus: 'planned' | 'in_progress' | 'live';
}

export interface RiskControlLink {
  id: string;
  riskId: string;
  controlId: string;
  controlSource: 'as_is' | 'to_be';
  linkType: 'mitigates' | 'detects' | 'corrects';
  isMaterial: boolean;
  rationale?: string;
}

export interface FrameworkDocument {
  id: string;
  title: string;
  version: string;
  sections: any;
  boardSummary?: string;
  approvalStatus: string;
  approvedBy?: string;
  approvedDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

// AI-Driven Principal Risk Workflow Types

export type ThreatCategory = 'business_model' | 'performance' | 'solvency' | 'liquidity';

export interface BusinessContext {
  industry: string;
  annualRevenue: string;
  employeeCount: string;
  isProfitable: string;
  fundingType: string;
  customerDescription: string;
  strategicPriorities: string[];
}

export interface CategoryAnswers {
  [questionId: string]: string | string[];
}

export interface AIRiskCandidate {
  id: string;
  category: string;
  title: string;
  definition: string;
  causes: string[];
  impacts: string[];
  threatCategories: string[];
  domainTags: string[];
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  recommendation: 'INCLUDE' | 'CONSIDER' | 'SKIP';
  confidenceReasoning: string;
  likelihoodScore: number;
  likelihoodReasoning: string;
  impactScore: number;
  impactReasoning: string;
  // Client-side state
  selected?: boolean;
  edited?: boolean;
  userLikelihoodScore?: number;
  userImpactScore?: number;
}

export interface RCMEntry {
  riskId: string;
  riskTitle: string;
  controlId: string;
  controlName: string;
  controlObjective: string;
  controlType: string;
  owner: string;
  evidence: string;
  frequency: string;
  process: string;
  domain: string;
  isMaterial: boolean;
  status?: string;
}
