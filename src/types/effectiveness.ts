// New Effectiveness Criteria Framework Types

export type CompanyStage = 'early' | 'growth' | 'mature' | 'transformation';
export type OwnershipType = 'public' | 'pe' | 'vc' | 'private' | 'other';
export type RegulatoryEnvironment = 'heavy' | 'moderate' | 'light';
export type MaturityLevel = 1 | 2 | 3 | 4;
export type RiskAppetite = 'low' | 'moderate' | 'high';
export type PathwayType = 'guided' | 'custom';

export interface CompanySize {
  revenue: string; // "<£10M" | "£10-50M" | "£50-100M" | "£100-500M" | ">£500M"
  employees: string; // "<50" | "50-250" | "250-1000" | "1000-5000" | ">5000"
  geographic: 'single' | 'multi_regional' | 'global';
  complexity: 'simple' | 'moderate' | 'complex';
}

export interface CompanyProfile {
  stage: CompanyStage;
  ownership: OwnershipType;
  ownershipOther?: string;
  regulatory: RegulatoryEnvironment;
  priorities: string[]; // Max 3
  maturity: MaturityLevel;
  riskAppetite: RiskAppetite;
  size: CompanySize;
}

export interface MeasurementMethod {
  type: string;
  description: string;
}

export interface CriterionConfig {
  weight: number; // 0-40 (as percentage)
  subCriteria: string[];
  target: number; // 0-100
  methods: MeasurementMethod[];
  rationale?: string;
}

export interface EffectivenessCriteriaConfig {
  id: string;
  companyId: string;
  version: string;
  pathway: PathwayType;
  
  // Company Profile
  companyProfile: CompanyProfile;
  
  // The 7 Criteria (Always Present)
  criteria: {
    riskIdentification: CriterionConfig;
    frameworkDesign: CriterionConfig;
    controlOperating: CriterionConfig;
    issueResponsiveness: CriterionConfig;
    riskOutcome: CriterionConfig;
    governance: CriterionConfig;
    continuousImprovement: CriterionConfig;
  };
  
  // Overall Target
  overallTarget: number; // Default 85
  
  // Approval
  boardApproved: boolean;
  approvedBy?: string[];
  approvedDate?: string;
  
  // Version tracking
  active: boolean;
  supersedesId?: string;
  
  createdAt: string;
  updatedAt: string;
}

// Context Assessment Question Types
export interface ContextQuestion {
  id: number;
  question: string;
  description?: string;
  type: 'single' | 'multiple' | 'text';
  options?: QuestionOption[];
  maxSelections?: number;
}

export interface QuestionOption {
  value: string;
  label: string;
  description?: string;
}

export interface ContextAnswers {
  stage?: CompanyStage;
  ownership?: OwnershipType;
  ownershipOther?: string;
  regulatory?: RegulatoryEnvironment;
  priorities?: string[];
  maturity?: MaturityLevel;
  riskAppetite?: RiskAppetite;
  revenue?: string;
  employees?: string;
  geographic?: 'single' | 'multi_regional' | 'global';
  complexity?: 'simple' | 'moderate' | 'complex';
}

// AI Recommendation Types
export interface WeightingRecommendation {
  weights: {
    riskIdentification: number;
    frameworkDesign: number;
    controlOperating: number;
    issueResponsiveness: number;
    riskOutcome: number;
    governance: number;
    continuousImprovement: number;
  };
  criteriaConfigs: {
    riskIdentification: CriterionConfig;
    frameworkDesign: CriterionConfig;
    controlOperating: CriterionConfig;
    issueResponsiveness: CriterionConfig;
    riskOutcome: CriterionConfig;
    governance: CriterionConfig;
    continuousImprovement: CriterionConfig;
  };
  overallTarget: number;
  reasoning: {
    riskIdentification: string;
    frameworkDesign: string;
    controlOperating: string;
    issueResponsiveness: string;
    riskOutcome: string;
    governance: string;
    continuousImprovement: string;
  };
}

// The 7 Hardcoded Criteria Metadata
export interface CriterionMetadata {
  id: string;
  name: string;
  shortName: string;
  question: string;
  description: string;
  defaultWeight: number;
  defaultTarget: number;
  defaultSubCriteria: string[];
}

export const SEVEN_CRITERIA: CriterionMetadata[] = [
  {
    id: 'riskIdentification',
    name: 'Risk Identification Effectiveness',
    shortName: 'Risk Identification',
    question: 'Did we identify the RIGHT risks?',
    description: 'Measures the completeness, accuracy, and forward-looking nature of risk identification',
    defaultWeight: 15,
    defaultTarget: 85,
    defaultSubCriteria: ['Completeness', 'Accuracy', 'Forward-looking', 'Stakeholder input']
  },
  {
    id: 'frameworkDesign',
    name: 'Framework Design Effectiveness',
    shortName: 'Framework Design',
    question: 'Did we design the RIGHT controls?',
    description: 'Measures the quality of control design, coverage, and alignment to risks',
    defaultWeight: 15,
    defaultTarget: 85,
    defaultSubCriteria: ['Control type balance', 'Coverage of risk causes', 'Ownership clarity', 'Design quality']
  },
  {
    id: 'controlOperating',
    name: 'Control Operating Effectiveness',
    shortName: 'Control Operating',
    question: 'Did controls OPERATE as designed?',
    description: 'Measures the reliability and consistency of control execution',
    defaultWeight: 20,
    defaultTarget: 90,
    defaultSubCriteria: ['Operating rate', 'Evidence quality', 'Timeliness', 'Exception handling']
  },
  {
    id: 'issueResponsiveness',
    name: 'Issue Responsiveness Effectiveness',
    shortName: 'Issue Responsiveness',
    question: 'Did we RESPOND to issues appropriately and timely?',
    description: 'Measures the speed and quality of issue detection and remediation',
    defaultWeight: 20,
    defaultTarget: 90,
    defaultSubCriteria: ['Detection speed', 'Response timeliness', 'Remediation quality', 'Escalation process']
  },
  {
    id: 'riskOutcome',
    name: 'Risk Outcome Achievement',
    shortName: 'Risk Outcome',
    question: 'Are risks actually being MITIGATED?',
    description: 'Measures actual risk reduction and achievement of risk objectives',
    defaultWeight: 15,
    defaultTarget: 80,
    defaultSubCriteria: ['Objective achievement', 'Incident prevention', 'Leading indicators', 'Risk trend']
  },
  {
    id: 'governance',
    name: 'Governance & Oversight Effectiveness',
    shortName: 'Governance',
    question: 'Is there effective BOARD OVERSIGHT?',
    description: 'Measures the quality and effectiveness of board and management oversight',
    defaultWeight: 10,
    defaultTarget: 85,
    defaultSubCriteria: ['Board engagement', 'Review frequency', 'Challenge quality', 'Decision making']
  },
  {
    id: 'continuousImprovement',
    name: 'Continuous Improvement Effectiveness',
    shortName: 'Continuous Improvement',
    question: 'Is the framework IMPROVING over time?',
    description: 'Measures the maturity progression and learning from experience',
    defaultWeight: 5,
    defaultTarget: 75,
    defaultSubCriteria: ['Maturity progression', 'Lessons learned', 'Innovation adoption', 'Efficiency gains']
  }
];

// Strategic Priority Options
export const STRATEGIC_PRIORITIES = [
  'Rapid Growth / Market Expansion',
  'Profitability Improvement',
  'Operational Excellence',
  'M&A / Integration',
  'Innovation / R&D',
  'Risk Reduction / Stability',
  'Regulatory Compliance',
  'Exit Preparation (IPO / Sale)',
  'Digital Transformation',
  'Cost Reduction'
];
