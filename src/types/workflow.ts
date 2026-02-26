export enum WorkflowStatus {
  DRAFT = 'DRAFT',
  IN_REVIEW = 'IN_REVIEW',
  CHANGES_REQUESTED = 'CHANGES_REQUESTED',
  APPROVED = 'APPROVED',
  BOARD_APPROVED = 'BOARD_APPROVED',
  LOCKED = 'LOCKED',
  ARCHIVED = 'ARCHIVED',
}

export enum CommentStatus {
  OPEN = 'OPEN',
  RESOLVED = 'RESOLVED',
  REOPENED = 'REOPENED',
}

export enum NotificationType {
  CONTROL_ASSIGNED = 'CONTROL_ASSIGNED',
  TESTING_ASSIGNED = 'TESTING_ASSIGNED',
  REVIEW_REQUESTED = 'REVIEW_REQUESTED',
  CHANGES_REQUESTED = 'CHANGES_REQUESTED',
  APPROVAL_GRANTED = 'APPROVAL_GRANTED',
  DEADLINE_APPROACHING = 'DEADLINE_APPROACHING',
  DEADLINE_MISSED = 'DEADLINE_MISSED',
  COMMENT_ADDED = 'COMMENT_ADDED',
  COMMENT_RESOLVED = 'COMMENT_RESOLVED',
  EVIDENCE_UPLOADED = 'EVIDENCE_UPLOADED',
  DEFICIENCY_ASSIGNED = 'DEFICIENCY_ASSIGNED',
  REMEDIATION_DUE = 'REMEDIATION_DUE',
  BOARD_APPROVAL_REQUIRED = 'BOARD_APPROVAL_REQUIRED',
}

export enum AssignmentRole {
  DOCUMENTER = 'DOCUMENTER',
  TESTER = 'TESTER',
  REVIEWER = 'REVIEWER',
  APPROVER = 'APPROVER',
}

export enum AssignmentStatus {
  ASSIGNED = 'ASSIGNED',
  IN_PROGRESS = 'IN_PROGRESS',
  SUBMITTED = 'SUBMITTED',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export enum ControlEffectiveness {
  EFFECTIVE = 'EFFECTIVE',
  PARTIALLY_EFFECTIVE = 'PARTIALLY_EFFECTIVE',
  INEFFECTIVE = 'INEFFECTIVE',
}

export enum TestingStatus {
  NOT_STARTED = 'NOT_STARTED',
  IN_PROGRESS = 'IN_PROGRESS',
  SUBMITTED = 'SUBMITTED',
  APPROVED = 'APPROVED',
  FLAGGED_AS_DEFICIENCY = 'FLAGGED_AS_DEFICIENCY',
}

export enum DeficiencyType {
  CONTROL_DESIGN = 'CONTROL_DESIGN',
  CONTROL_OPERATING = 'CONTROL_OPERATING',
  CONTROL_EVIDENCE = 'CONTROL_EVIDENCE',
  CONTROL_RESPONSIVENESS = 'CONTROL_RESPONSIVENESS',
  CONTROL_COMPETENCE = 'CONTROL_COMPETENCE',
  FRAMEWORK_INCIDENT = 'FRAMEWORK_INCIDENT',
  OBJECTIVE_MISSED = 'OBJECTIVE_MISSED',
}

export enum DeficiencySeverity {
  SIGNIFICANT = 'SIGNIFICANT',
  MINOR = 'MINOR',
}

export enum DeficiencyStatus {
  IDENTIFIED = 'IDENTIFIED',
  REMEDIATION_PLANNED = 'REMEDIATION_PLANNED',
  IN_REMEDIATION = 'IN_REMEDIATION',
  PENDING_VERIFICATION = 'PENDING_VERIFICATION',
  CLOSED = 'CLOSED',
}

export enum DeclarationType {
  CLEAN = 'CLEAN',
  WITH_DISCLOSED_DEFICIENCIES = 'WITH_DISCLOSED_DEFICIENCIES',
  QUALIFIED_MATERIAL_WEAKNESS = 'QUALIFIED_MATERIAL_WEAKNESS',
}

export interface WorkflowState {
  id: string;
  entityType: string;
  entityId: string;
  status: WorkflowStatus;
  submittedBy?: string;
  submittedAt?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  approvedBy?: string;
  approvedAt?: string;
  lockedBy?: string;
  lockedAt?: string;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: string;
  entityType: string;
  entityId: string;
  userId: string;
  userName?: string;
  userEmail?: string;
  content: string;
  parentId?: string;
  status: CommentStatus;
  resolvedBy?: string;
  resolvedAt?: string;
  createdAt: string;
  updatedAt: string;
  replies?: Comment[];
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  entityType?: string;
  entityId?: string;
  actionUrl?: string;
  read: boolean;
  emailSent: boolean;
  createdAt: string;
}

export interface Version {
  id: string;
  entityType: string;
  entityId: string;
  versionNumber: number;
  data: string;
  changes?: string;
  createdBy: string;
  createdByName?: string;
  createdAt: string;
}

export interface ControlAssignment {
  id: string;
  controlId: string;
  userId: string;
  userName?: string;
  assignedBy: string;
  assignedByName?: string;
  role: AssignmentRole;
  status: AssignmentStatus;
  dueDate?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ControlTestingResult {
  id: string;
  controlId: string;
  assessmentPeriod: string;
  testerId: string;
  testerName: string;
  
  // Test 1: Design Effectiveness
  designEffective?: boolean;
  designNotes?: string;
  designScore?: number;
  
  // Test 2: Operating Effectiveness
  operatingEffective?: boolean;
  operatingRate?: number;
  instancesTested?: number;
  instancesPassed?: number;
  operatingNotes?: string;
  operatingScore?: number;
  
  // Test 3: Evidence Effectiveness
  evidenceEffective?: boolean;
  evidenceNotes?: string;
  evidenceScore?: number;
  
  // Test 4: Responsiveness Effectiveness
  responsivenessEffective?: boolean;
  issuesIdentified?: number;
  issuesActioned?: number;
  responsivenessNotes?: string;
  responsivenessScore?: number;
  
  // Test 5: Competence Effectiveness
  competenceEffective?: boolean;
  competenceNotes?: string;
  competenceScore?: number;
  
  // Overall Rating
  overallRating?: ControlEffectiveness;
  totalScore?: number;
  rationale?: string;
  evidenceFiles?: string[];
  
  status: TestingStatus;
  submittedAt?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FrameworkAssessment {
  id: string;
  riskId: string;
  assessmentPeriod: string;
  
  // Layer 1: Risk Trending
  priorYearScore?: number;
  currentYearScore?: number;
  trendEvidence?: any;
  
  // Layer 2: Incidents
  incidentsOccurred: boolean;
  incidentCount: number;
  incidentDetails?: any;
  nearMisses?: any;
  
  // Layer 3: Leading Indicators
  indicatorData?: any;
  percentToTarget?: number;
  
  // Layer 4: Objectives
  objectives?: any;
  achievementPercent?: number;
  
  overallScore?: number;
  status: string;
  completedBy?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Deficiency {
  id: string;
  controlId?: string;
  riskId?: string;
  type: DeficiencyType;
  severity: DeficiencySeverity;
  title: string;
  description: string;
  rootCause?: string;
  identifiedDate: string;
  identifiedBy: string;
  
  remediationPlan?: string;
  responsibleOwner?: string;
  targetDate?: string;
  verificationMethod?: string;
  
  status: DeficiencyStatus;
  closedDate?: string;
  closedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BoardDeclaration {
  id: string;
  assessmentPeriod: string;
  declarationType: DeclarationType;
  effectivenessScore?: number;
  deficiencyCount: number;
  significantDeficiencies?: any;
  boardMinutes?: string;
  declaredBy: string;
  declaredDate: string;
  createdAt: string;
}

export interface AuditLogEntry {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  action: string;
  entity: string;
  entityId: string;
  field?: string;
  oldValue?: string;
  newValue?: string;
  changes?: any;
  ipAddress?: string;
  timestamp: string;
}

export const WORKFLOW_STATUS_LABELS: Record<WorkflowStatus, string> = {
  [WorkflowStatus.DRAFT]: 'Draft',
  [WorkflowStatus.IN_REVIEW]: 'In Review',
  [WorkflowStatus.CHANGES_REQUESTED]: 'Changes Requested',
  [WorkflowStatus.APPROVED]: 'Approved',
  [WorkflowStatus.BOARD_APPROVED]: 'Board Approved',
  [WorkflowStatus.LOCKED]: 'Locked',
  [WorkflowStatus.ARCHIVED]: 'Archived',
};

export const NOTIFICATION_TYPE_LABELS: Record<NotificationType, string> = {
  [NotificationType.CONTROL_ASSIGNED]: 'Control Assigned',
  [NotificationType.TESTING_ASSIGNED]: 'Testing Assigned',
  [NotificationType.REVIEW_REQUESTED]: 'Review Requested',
  [NotificationType.CHANGES_REQUESTED]: 'Changes Requested',
  [NotificationType.APPROVAL_GRANTED]: 'Approval Granted',
  [NotificationType.DEADLINE_APPROACHING]: 'Deadline Approaching',
  [NotificationType.DEADLINE_MISSED]: 'Deadline Missed',
  [NotificationType.COMMENT_ADDED]: 'Comment Added',
  [NotificationType.COMMENT_RESOLVED]: 'Comment Resolved',
  [NotificationType.EVIDENCE_UPLOADED]: 'Evidence Uploaded',
  [NotificationType.DEFICIENCY_ASSIGNED]: 'Deficiency Assigned',
  [NotificationType.REMEDIATION_DUE]: 'Remediation Due',
  [NotificationType.BOARD_APPROVAL_REQUIRED]: 'Board Approval Required',
};
