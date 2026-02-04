export type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'in_review';
export type Severity = 'critical' | 'high' | 'medium' | 'low';
export type TestStatus = 'not_started' | 'in_progress' | 'completed' | 'failed';
export type ControlEffectiveness = 'effective' | 'partially_effective' | 'not_effective' | 'not_tested';
export type RiskLevel = 'critical' | 'high' | 'medium' | 'low';

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
