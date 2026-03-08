import type {
  FinancialReportingQuestionFlow,
  FraudQuestionFlow,
  CyberSecurityQuestionFlow,
} from '@/types';

// Financial Reporting Question Flows
export const financialReportingFlows: FinancialReportingQuestionFlow[] = [
  {
    area: 'revenue_recognition',
    questions: [
      {
        id: 'rev_001',
        text: 'Do you have multiple revenue streams or complex revenue arrangements?',
        type: 'yes_no',
        riskIndicator: 'high',
      },
      {
        id: 'rev_002',
        text: 'Do you recognize revenue over time (e.g., subscriptions, long-term contracts)?',
        type: 'yes_no',
        conditionalOn: { questionId: 'rev_001', answer: 'yes' },
        riskIndicator: 'high',
      },
      {
        id: 'rev_003',
        text: 'What is the annual revenue volume?',
        type: 'multiple_choice',
        options: ['< $1M', '$1M - $10M', '$10M - $50M', '> $50M'],
        riskIndicator: 'medium',
      },
      {
        id: 'rev_004',
        text: 'Do you have significant customer concentrations (>10% revenue from single customer)?',
        type: 'yes_no',
        riskIndicator: 'medium',
      },
    ],
    riskLogic: [
      {
        conditions: [
          { questionId: 'rev_001', answer: 'yes' },
          { questionId: 'rev_002', answer: 'yes' },
        ],
        riskTitle: 'Complex Revenue Recognition',
        riskDescription: 'Risk of material misstatement in revenue due to complex recognition patterns and timing',
        materialityLevel: 'high',
        suggestedControls: ['Revenue recognition policy review', 'Contract review controls', 'Cut-off procedures'],
      },
    ],
  },
  {
    area: 'inventory',
    questions: [
      {
        id: 'inv_001',
        text: 'Do you hold physical inventory?',
        type: 'yes_no',
        riskIndicator: 'high',
      },
      {
        id: 'inv_002',
        text: 'What is the inventory value relative to total assets?',
        type: 'multiple_choice',
        options: ['< 10%', '10% - 30%', '30% - 50%', '> 50%'],
        conditionalOn: { questionId: 'inv_001', answer: 'yes' },
        riskIndicator: 'high',
      },
      {
        id: 'inv_003',
        text: 'Is inventory subject to obsolescence or spoilage?',
        type: 'yes_no',
        conditionalOn: { questionId: 'inv_001', answer: 'yes' },
        riskIndicator: 'high',
      },
    ],
    riskLogic: [
      {
        conditions: [
          { questionId: 'inv_001', answer: 'yes' },
          { questionId: 'inv_002', answer: ['30% - 50%', '> 50%'] },
        ],
        riskTitle: 'Material Inventory Valuation',
        riskDescription: 'Risk of material misstatement in inventory valuation and existence',
        materialityLevel: 'high',
        suggestedControls: ['Periodic inventory counts', 'Obsolescence reviews', 'Inventory reconciliations'],
      },
    ],
  },
];

// Fraud Risk Question Flows
export const fraudRiskFlows: FraudQuestionFlow[] = [
  {
    category: 'asset_misappropriation',
    questions: [
      {
        id: 'fraud_asset_001',
        text: 'Do employees have access to cash or liquid assets?',
        type: 'yes_no',
      },
      {
        id: 'fraud_asset_002',
        text: 'Are there segregation of duties controls over cash handling?',
        type: 'yes_no',
        conditionalOn: { questionId: 'fraud_asset_001', answer: 'yes' },
      },
      {
        id: 'fraud_asset_003',
        text: 'How frequently are cash reconciliations performed?',
        type: 'multiple_choice',
        options: ['Daily', 'Weekly', 'Monthly', 'Quarterly', 'Never'],
        conditionalOn: { questionId: 'fraud_asset_001', answer: 'yes' },
      },
    ],
    riskLogic: [
      {
        conditions: [
          { questionId: 'fraud_asset_001', answer: 'yes' },
          { questionId: 'fraud_asset_002', answer: 'no' },
        ],
        riskTitle: 'Cash Theft Risk',
        riskDescription: 'Risk of employee theft of cash due to weak segregation of duties',
        fraudScheme: 'Direct cash theft or skimming',
        likelihoodScore: 4,
        impactScore: 3,
        redFlags: ['Missing receipts', 'Unexplained cash shortages', 'Lifestyle beyond means'],
        suggestedControls: ['Segregation of duties', 'Daily cash reconciliations', 'Surprise cash counts'],
      },
    ],
  },
  {
    category: 'procurement_fraud',
    questions: [
      {
        id: 'fraud_proc_001',
        text: 'What is your annual procurement spend?',
        type: 'multiple_choice',
        options: ['< $500K', '$500K - $5M', '$5M - $20M', '> $20M'],
      },
      {
        id: 'fraud_proc_002',
        text: 'Do you have a formal vendor approval process?',
        type: 'yes_no',
      },
      {
        id: 'fraud_proc_003',
        text: 'Are purchase orders required for all purchases above a threshold?',
        type: 'yes_no',
      },
    ],
    riskLogic: [
      {
        conditions: [
          { questionId: 'fraud_proc_001', answer: ['$5M - $20M', '> $20M'] },
          { questionId: 'fraud_proc_002', answer: 'no' },
        ],
        riskTitle: 'Procurement Fraud Risk',
        riskDescription: 'Risk of fraudulent vendor schemes and kickbacks',
        fraudScheme: 'Shell companies, bid rigging, kickbacks',
        likelihoodScore: 3,
        impactScore: 4,
        redFlags: ['Vendors with similar addresses', 'Split purchases', 'Sole-source justifications'],
        suggestedControls: ['Vendor due diligence', 'Competitive bidding', 'PO approval workflows'],
      },
    ],
  },
];

// Cyber Security Question Flows
export const cyberSecurityFlows: CyberSecurityQuestionFlow[] = [
  {
    domain: 'ransomware',
    questions: [
      {
        id: 'cyber_ransom_001',
        text: 'Do you have offline/air-gapped backups of critical data?',
        type: 'yes_no',
      },
      {
        id: 'cyber_ransom_002',
        text: 'How frequently are backups tested for restoration?',
        type: 'multiple_choice',
        options: ['Weekly', 'Monthly', 'Quarterly', 'Annually', 'Never'],
      },
      {
        id: 'cyber_ransom_003',
        text: 'Do you have endpoint detection and response (EDR) deployed?',
        type: 'yes_no',
      },
    ],
    riskLogic: [
      {
        conditions: [
          { questionId: 'cyber_ransom_001', answer: 'no' },
        ],
        riskTitle: 'Ransomware Attack Risk',
        riskDescription: 'High risk of business disruption from ransomware with limited recovery options',
        threatVector: ['Phishing emails', 'Compromised credentials', 'Unpatched vulnerabilities'],
        likelihoodScore: 4,
        impactScore: 5,
        regulatoryRequirements: ['GDPR Article 32', 'NIS Directive'],
        suggestedControls: ['Offline backups', 'EDR deployment', 'Email filtering', 'User awareness training'],
      },
    ],
  },
  {
    domain: 'identity_access_management',
    questions: [
      {
        id: 'cyber_iam_001',
        text: 'Is multi-factor authentication (MFA) enforced for all users?',
        type: 'yes_no',
      },
      {
        id: 'cyber_iam_002',
        text: 'Do you have a formal user access review process?',
        type: 'yes_no',
      },
      {
        id: 'cyber_iam_003',
        text: 'How frequently are access rights reviewed?',
        type: 'multiple_choice',
        options: ['Monthly', 'Quarterly', 'Semi-annually', 'Annually', 'Never'],
        conditionalOn: { questionId: 'cyber_iam_002', answer: 'yes' },
      },
    ],
    riskLogic: [
      {
        conditions: [
          { questionId: 'cyber_iam_001', answer: 'no' },
        ],
        riskTitle: 'Unauthorized Access Risk',
        riskDescription: 'Risk of unauthorized access to systems and data due to weak authentication',
        threatVector: ['Credential stuffing', 'Brute force attacks', 'Phishing'],
        likelihoodScore: 5,
        impactScore: 4,
        regulatoryRequirements: ['GDPR Article 32', 'PCI DSS 8.3', 'SOC 2'],
        suggestedControls: ['MFA enforcement', 'Password policies', 'Access reviews', 'Privileged access management'],
      },
    ],
  },
];
