// New Effectiveness Criteria Framework Types

export type CompanyStage = 'early' | 'growth' | 'mature' | 'transformation';
export type OwnershipType = 'public' | 'pe' | 'vc' | 'private' | 'other';
export type RegulatoryEnvironment = 'heavy' | 'moderate' | 'light';
export type MaturityLevel = 1 | 2 | 3 | 4;
export type RiskAppetite = 'low' | 'moderate' | 'high';
export type PathwayType = 'guided' | 'custom' | 'ai-framework';

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
  
  // The 6 Criteria (Always Present)
  criteria: {
    riskIdentification: CriterionConfig;
    controlDesign: CriterionConfig;
    controlOperating: CriterionConfig;
    issueResponsiveness: CriterionConfig;
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
    controlDesign: number;
    controlOperating: number;
    issueResponsiveness: number;
    governance: number;
    continuousImprovement: number;
  };
  criteriaConfigs: {
    riskIdentification: CriterionConfig;
    controlDesign: CriterionConfig;
    controlOperating: CriterionConfig;
    issueResponsiveness: CriterionConfig;
    governance: CriterionConfig;
    continuousImprovement: CriterionConfig;
  };
  overallTarget: number;
  reasoning: {
    riskIdentification: string;
    controlDesign: string;
    controlOperating: string;
    issueResponsiveness: string;
    governance: string;
    continuousImprovement: string;
  };
}

// The 6 Hardcoded Criteria Metadata
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

export const SIX_CRITERIA: CriterionMetadata[] = [
  {
    id: 'riskIdentification',
    name: 'C1 - Risk Identification',
    shortName: 'Risk Identification',
    question: 'Are all material risks — including principal, financial reporting, fraud and cyber risks — systematically identified, assessed and kept current?',
    description: 'Are all material risks — including principal, financial reporting, fraud and cyber risks — systematically identified, assessed and kept current?',
    defaultWeight: 15,
    defaultTarget: 85,
    defaultSubCriteria: ['Completeness (no surprises)', 'Accuracy', 'Forward-looking (emerging risks)', 'Stakeholder input']
  },
  {
    id: 'controlDesign',
    name: 'C2 - Control Design',
    shortName: 'Control Design',
    question: 'Is each material control designed to address its risk with sufficient precision, rigour and proportionality?',
    description: 'Is each material control designed to address its risk with sufficient precision, rigour and proportionality?',
    defaultWeight: 20,
    defaultTarget: 85,
    defaultSubCriteria: ['Control type balance (preventive focus)', 'Coverage of risk causes', 'Ownership clarity', 'Design quality']
  },
  {
    id: 'controlOperating',
    name: 'C3 - Control Operational Effectiveness',
    shortName: 'Control Operating',
    question: 'Are controls operating as designed, consistently, by competent people, with evidence — supported by continuous monitoring and AI-based testing?',
    description: 'Are controls operating as designed, consistently, by competent people, with evidence — supported by continuous monitoring and AI-based testing?',
    defaultWeight: 25,
    defaultTarget: 90,
    defaultSubCriteria: ['Operating rate', 'Evidence quality', 'Timeliness', 'Exception handling']
  },
  {
    id: 'issueResponsiveness',
    name: 'C4 - Issue Responsiveness',
    shortName: 'Issue Responsiveness',
    question: 'When control failures or deficiencies are identified, does the organisation respond with appropriate speed, rigour and escalation?',
    description: 'When control failures or deficiencies are identified, does the organisation respond with appropriate speed, rigour and escalation?',
    defaultWeight: 20,
    defaultTarget: 90,
    defaultSubCriteria: ['Detection speed', 'Response timeliness', 'Remediation quality', 'Escalation process']
  },
  {
    id: 'governance',
    name: 'C5 - Governance and Oversight',
    shortName: 'Governance',
    question: 'Does the Board and Audit Committee exercise effective, evidence-based oversight of the entire internal control system?',
    description: 'Does the Board and Audit Committee exercise effective, evidence-based oversight of the entire internal control system?',
    defaultWeight: 15,
    defaultTarget: 85,
    defaultSubCriteria: ['Board engagement', 'Review frequency', 'Challenge quality', 'Decision making']
  },
  {
    id: 'continuousImprovement',
    name: 'C6 - Continuous Improvement',
    shortName: 'Continuous Improvement',
    question: 'Does the organisation systematically learn from experience and strengthen the control system over time?',
    description: 'Does the organisation systematically learn from experience and strengthen the control system over time?',
    defaultWeight: 5,
    defaultTarget: 75,
    defaultSubCriteria: ['Maturity progression', 'Lessons learned', 'Innovation adoption', 'Efficiency gains']
  }
];

// Backward compatibility alias
export const SEVEN_CRITERIA = SIX_CRITERIA;

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

// Custom Framework Types
export interface CustomFrameworkElement {
  id: string;
  title: string;
  content: string;
  order: number;
}

export interface CustomFramework {
  id: string;
  name: string;
  version: string;
  effectiveDate: string;
  companyName: string;
  companyProfile: CompanyProfile;
  effectivenessCriteria: WeightingRecommendation;
  
  // 5 Core Elements
  elements: {
    riskIdentification: CustomFrameworkElement;
    controlDesign: CustomFrameworkElement;
    effectivenessAssessment: CustomFrameworkElement;
    governance: CustomFrameworkElement;
    continuousImprovement: CustomFrameworkElement;
  };
  
  executiveSummary: string;
  currentRiskProfile: string;
  currentControlProfile: string;
  maturityJourney: string;
  
  createdAt: string;
  updatedAt: string;
  approved: boolean;
  approvedBy?: string;
  approvedDate?: string;
}
