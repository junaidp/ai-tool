export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

export interface EffectivenessCriteria {
  id: string;
  dimension: string;
  criteria: string;
  threshold: string;
  evidenceType: string;
  frequency: string;
  status: string;
  approvedBy?: string | null;
  approvedDate?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface FrameworkComponent {
  id: string;
  type: string;
  name: string;
  description: string;
  owner: string;
  status: string;
  lastReviewed?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface MaterialControl {
  id: string;
  name: string;
  description: string;
  materialityScore: number;
  rationale: string;
  owner: string;
  ownerId?: string | null;
  evidenceSource: string;
  testingFrequency: string;
  dependencies: string;
  effectiveness: string;
  lastTested?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Risk {
  id: string;
  title: string;
  description: string;
  category: string;
  inherentRisk: string;
  residualRisk: string;
  owner: string;
  ownerId?: string | null;
  linkedObjectives: string;
  linkedControls: string;
  lastAssessed: string;
  createdAt: string;
  updatedAt: string;
}

export interface Control {
  id: string;
  name: string;
  description: string;
  type: string;
  automation: string;
  frequency: string;
  owner: string;
  linkedRisks: string;
  effectiveness: string;
  evidenceSource: string;
  createdAt: string;
  updatedAt: string;
}

export interface TestPlan {
  id: string;
  controlId: string;
  controlName: string;
  testType: string;
  tester: string;
  scheduledDate: string;
  status: string;
  results?: string | null;
  exceptions?: string | null;
  remediationRequired: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Issue {
  id: string;
  title: string;
  description: string;
  severity: string;
  controlId: string;
  discoveredDate: string;
  status: string;
  owner: string;
  ownerId?: string | null;
  dueDate: string;
  remediationPlan?: string | null;
  retestDate?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface IntegrationStatus {
  id: string;
  system: string;
  status: string;
  lastSync: string;
  signalsReceived: number;
  exceptionsRaised: number;
  createdAt: string;
  updatedAt: string;
}

export interface ControlGap {
  id: string;
  source: string;
  title: string;
  description: string;
  affectedControls: string;
  riskTheme: string;
  priority: string;
  proposedAction: string;
  status: string;
  identifiedDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApprovalWorkflow {
  id: string;
  itemType: string;
  itemId: string;
  itemName: string;
  requesterId: string;
  currentApproverId: string;
  status: string;
  submittedDate: string;
  comments?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardData {
  [key: string]: unknown;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface AIGenerateCriteriaResponse {
  criteria: EffectivenessCriteria[];
}

export interface AIScoreControlResponse {
  score: number;
  reasoning: string;
  recommendations: string[];
}

export interface AIGenerateGapsResponse {
  gaps: ControlGap[];
}

export interface AIGenerateControlsResponse {
  controls: Control[];
}
