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
        id: 'rev_004',
        text: 'Do you have significant customer concentrations (>10% revenue from single customer)?',
        type: 'yes_no',
        riskIndicator: 'medium',
      },
      {
        id: 'rev_005',
        text: 'Do you have performance obligations that span multiple periods?',
        type: 'yes_no',
        riskIndicator: 'high',
      },
      {
        id: 'rev_006',
        text: 'How do you determine standalone selling prices for bundled products/services?',
        type: 'multiple_choice',
        options: ['Observable prices', 'Cost-plus margin', 'Residual approach', 'Not applicable'],
        conditionalOn: { questionId: 'rev_001', answer: 'yes' },
        riskIndicator: 'high',
      },
      {
        id: 'rev_007',
        text: 'Do you have variable consideration (discounts, rebates, refunds, penalties)?',
        type: 'yes_no',
        riskIndicator: 'high',
      },
      {
        id: 'rev_008',
        text: 'Are your systems integrated or do you use multiple standalone systems for revenue processing?',
        type: 'multiple_choice',
        options: ['Fully integrated ERP', 'Partially integrated', 'Multiple standalone systems', 'Manual spreadsheets'],
        riskIndicator: 'high',
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
      {
        conditions: [
          { questionId: 'rev_008', answer: ['Multiple standalone systems', 'Manual spreadsheets'] },
        ],
        riskTitle: 'Revenue System Integration Risk',
        riskDescription: 'Risk of errors due to non-integrated systems for revenue processing',
        materialityLevel: 'high',
        suggestedControls: ['System integration', 'Automated revenue recognition', 'Data validation controls', 'Reconciliation procedures'],
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
      {
        id: 'inv_004',
        text: 'How frequently do you perform physical inventory counts?',
        type: 'multiple_choice',
        options: ['Continuous/cycle counting', 'Quarterly', 'Semi-annually', 'Annually', 'Never'],
        conditionalOn: { questionId: 'inv_001', answer: 'yes' },
        riskIndicator: 'high',
      },
      {
        id: 'inv_005',
        text: 'Do you have a formal obsolescence review process?',
        type: 'yes_no',
        conditionalOn: { questionId: 'inv_003', answer: 'yes' },
        riskIndicator: 'high',
      },
      {
        id: 'inv_006',
        text: 'Is inventory stored in multiple locations or held by third parties?',
        type: 'yes_no',
        conditionalOn: { questionId: 'inv_001', answer: 'yes' },
        riskIndicator: 'medium',
      },
      {
        id: 'inv_007',
        text: 'What costing method do you use?',
        type: 'multiple_choice',
        options: ['FIFO', 'LIFO', 'Weighted Average', 'Specific Identification'],
        conditionalOn: { questionId: 'inv_001', answer: 'yes' },
        riskIndicator: 'medium',
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
  {
    area: 'fixed_assets',
    questions: [
      {
        id: 'fa_001',
        text: 'What is the value of fixed assets relative to total assets?',
        type: 'multiple_choice',
        options: ['< 10%', '10% - 30%', '30% - 50%', '> 50%'],
        riskIndicator: 'medium',
      },
      {
        id: 'fa_002',
        text: 'Do you capitalize software development costs or other intangibles?',
        type: 'yes_no',
        riskIndicator: 'high',
      },
      {
        id: 'fa_003',
        text: 'How frequently do you review assets for impairment?',
        type: 'multiple_choice',
        options: ['Quarterly', 'Annually', 'Only when triggered', 'Never'],
        riskIndicator: 'high',
      },
    ],
    riskLogic: [
      {
        conditions: [
          { questionId: 'fa_002', answer: 'yes' },
        ],
        riskTitle: 'Capitalization and Amortization Risk',
        riskDescription: 'Risk of improper capitalization of costs and incorrect amortization patterns',
        materialityLevel: 'high',
        suggestedControls: ['Capitalization policy', 'Project tracking', 'Amortization schedules', 'Impairment testing'],
      },
      {
        conditions: [
          { questionId: 'fa_003', answer: ['Only when triggered', 'Never'] },
        ],
        riskTitle: 'Asset Impairment Risk',
        riskDescription: 'Risk of carrying impaired assets at values exceeding recoverable amounts',
        materialityLevel: 'medium',
        suggestedControls: ['Regular impairment reviews', 'Asset utilization monitoring', 'Market value assessments'],
      },
    ],
  },
  {
    area: 'payroll',
    questions: [
      {
        id: 'pay_001',
        text: 'How many employees do you have?',
        type: 'multiple_choice',
        options: ['< 10', '10 - 50', '50 - 200', '> 200'],
        riskIndicator: 'medium',
      },
      {
        id: 'pay_002',
        text: 'Do you have complex compensation arrangements (bonuses, equity, commissions)?',
        type: 'yes_no',
        riskIndicator: 'high',
      },
      {
        id: 'pay_003',
        text: 'What payroll systems do you use?',
        type: 'multiple_choice',
        options: ['Integrated payroll system', 'Third-party payroll service', 'Standalone payroll software', 'Manual processing'],
        riskIndicator: 'high',
      },
    ],
    riskLogic: [
      {
        conditions: [
          { questionId: 'pay_002', answer: 'yes' },
        ],
        riskTitle: 'Complex Compensation Accounting',
        riskDescription: 'Risk of errors in accruals and expense recognition for variable compensation',
        materialityLevel: 'high',
        suggestedControls: ['Bonus accrual calculations', 'Equity compensation tracking', 'Commission reconciliations'],
      },
      {
        conditions: [
          { questionId: 'pay_003', answer: ['Standalone payroll software', 'Manual processing'] },
        ],
        riskTitle: 'Payroll System Integration Risk',
        riskDescription: 'Risk of errors due to manual data transfers and lack of system integration',
        materialityLevel: 'medium',
        suggestedControls: ['Segregation of duties', 'Approval workflows', 'Payroll reconciliations', 'System integration'],
      },
    ],
  },
  {
    area: 'treasury',
    questions: [
      {
        id: 'treas_001',
        text: 'Do you have debt or credit facilities?',
        type: 'yes_no',
        riskIndicator: 'high',
      },
      {
        id: 'treas_002',
        text: 'Do you hold investments or derivatives?',
        type: 'yes_no',
        riskIndicator: 'high',
      },
      {
        id: 'treas_003',
        text: 'How many bank accounts and investment accounts do you maintain?',
        type: 'multiple_choice',
        options: ['1-5 accounts', '6-15 accounts', '16-30 accounts', 'More than 30 accounts'],
        riskIndicator: 'medium',
      },
      {
        id: 'treas_004',
        text: 'Are your treasury systems integrated with your general ledger?',
        type: 'yes_no',
        riskIndicator: 'high',
      },
    ],
    riskLogic: [
      {
        conditions: [
          { questionId: 'treas_001', answer: 'yes' },
        ],
        riskTitle: 'Debt Covenant Compliance',
        riskDescription: 'Risk of debt covenant violations and improper debt classification',
        materialityLevel: 'high',
        suggestedControls: ['Covenant monitoring', 'Debt schedule maintenance', 'Classification reviews'],
      },
      {
        conditions: [
          { questionId: 'treas_002', answer: 'yes' },
        ],
        riskTitle: 'Investment Valuation and Accounting',
        riskDescription: 'Risk of incorrect fair value measurements and classification',
        materialityLevel: 'high',
        suggestedControls: ['Fair value assessments', 'Investment policy', 'Hedge accounting documentation'],
      },
      {
        conditions: [
          { questionId: 'treas_003', answer: ['16-30 accounts', 'More than 30 accounts'] },
          { questionId: 'treas_004', answer: 'no' },
        ],
        riskTitle: 'Treasury Complexity and Integration Risk',
        riskDescription: 'Risk of errors due to high volume of accounts and lack of system integration',
        materialityLevel: 'medium',
        suggestedControls: ['System integration', 'Automated reconciliations', 'Centralized treasury management'],
      },
    ],
  },
  {
    area: 'financial_close',
    questions: [
      {
        id: 'close_001',
        text: 'How long does your month-end close process take?',
        type: 'multiple_choice',
        options: ['< 5 days', '5 - 10 days', '10 - 15 days', '> 15 days'],
        riskIndicator: 'medium',
      },
      {
        id: 'close_002',
        text: 'How many legal entities or business units do you consolidate?',
        type: 'multiple_choice',
        options: ['Single entity', '2-5 entities', '6-15 entities', 'More than 15 entities'],
        riskIndicator: 'high',
      },
      {
        id: 'close_003',
        text: 'What is the level of manual journal entries during the close process?',
        type: 'multiple_choice',
        options: ['Minimal (< 20 entries)', 'Moderate (20-50 entries)', 'High (50-100 entries)', 'Very high (> 100 entries)'],
        riskIndicator: 'high',
      },
      {
        id: 'close_004',
        text: 'Are your financial systems integrated or do you use multiple standalone systems?',
        type: 'multiple_choice',
        options: ['Fully integrated ERP', 'Partially integrated', 'Multiple standalone systems', 'Heavy reliance on spreadsheets'],
        riskIndicator: 'high',
      },
    ],
    riskLogic: [
      {
        conditions: [
          { questionId: 'close_002', answer: ['6-15 entities', 'More than 15 entities'] },
        ],
        riskTitle: 'Complex Consolidation Process',
        riskDescription: 'Risk of errors in consolidation, intercompany eliminations, and reporting due to entity complexity',
        materialityLevel: 'high',
        suggestedControls: ['Consolidation software', 'Intercompany reconciliation procedures', 'Standardized chart of accounts'],
      },
      {
        conditions: [
          { questionId: 'close_001', answer: ['10 - 15 days', '> 15 days'] },
          { questionId: 'close_003', answer: ['High (50-100 entries)', 'Very high (> 100 entries)'] },
        ],
        riskTitle: 'Extended Close with High Manual Activity',
        riskDescription: 'Risk of errors due to prolonged close process and high volume of manual adjustments',
        materialityLevel: 'high',
        suggestedControls: ['Close calendar', 'Process automation', 'Standardized procedures', 'Early close activities', 'Journal entry controls'],
      },
      {
        conditions: [
          { questionId: 'close_004', answer: ['Multiple standalone systems', 'Heavy reliance on spreadsheets'] },
        ],
        riskTitle: 'System Integration and Automation Risk',
        riskDescription: 'Risk of errors due to manual data transfers and lack of system integration',
        materialityLevel: 'medium',
        suggestedControls: ['System integration project', 'Automated data feeds', 'Reconciliation controls', 'Data validation'],
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
  {
    category: 'financial_reporting_fraud',
    questions: [
      {
        id: 'fraud_fr_001',
        text: 'Are there significant pressures to meet financial targets or analyst expectations?',
        type: 'yes_no',
      },
      {
        id: 'fraud_fr_002',
        text: 'Does management have significant equity-based compensation?',
        type: 'yes_no',
      },
      {
        id: 'fraud_fr_003',
        text: 'Are there frequent adjusting journal entries near period-end?',
        type: 'yes_no',
      },
      {
        id: 'fraud_fr_004',
        text: 'Is there independent review of significant accounting estimates and judgments?',
        type: 'yes_no',
      },
    ],
    riskLogic: [
      {
        conditions: [
          { questionId: 'fraud_fr_001', answer: 'yes' },
          { questionId: 'fraud_fr_002', answer: 'yes' },
        ],
        riskTitle: 'Financial Statement Manipulation Risk',
        riskDescription: 'Risk of intentional misstatement of financial results to meet targets',
        fraudScheme: 'Revenue manipulation, expense deferral, cookie jar reserves',
        likelihoodScore: 3,
        impactScore: 5,
        redFlags: ['Unusual revenue patterns', 'Aggressive accounting policies', 'Frequent restatements'],
        suggestedControls: ['Independent audit committee', 'Whistleblower hotline', 'Forensic analytics', 'Management certifications'],
      },
    ],
  },
  {
    category: 'payroll_fraud',
    questions: [
      {
        id: 'fraud_pay_001',
        text: 'How many employees do you have?',
        type: 'multiple_choice',
        options: ['< 50', '50 - 200', '200 - 1000', '> 1000'],
      },
      {
        id: 'fraud_pay_002',
        text: 'Are payroll additions and changes independently approved?',
        type: 'yes_no',
      },
      {
        id: 'fraud_pay_003',
        text: 'Do you perform periodic verification of employee existence?',
        type: 'yes_no',
      },
      {
        id: 'fraud_pay_004',
        text: 'Are timesheets independently reviewed and approved?',
        type: 'yes_no',
      },
    ],
    riskLogic: [
      {
        conditions: [
          { questionId: 'fraud_pay_001', answer: ['200 - 1000', '> 1000'] },
          { questionId: 'fraud_pay_002', answer: 'no' },
        ],
        riskTitle: 'Payroll Fraud Risk',
        riskDescription: 'Risk of ghost employees, timesheet fraud, or unauthorized payroll changes',
        fraudScheme: 'Ghost employees, timesheet manipulation, unauthorized rate changes',
        likelihoodScore: 3,
        impactScore: 3,
        redFlags: ['Employees without tax withholdings', 'Duplicate addresses', 'Manual checks', 'Timesheet anomalies'],
        suggestedControls: ['Segregation of duties', 'Payroll analytics', 'Employee verification', 'Approval workflows'],
      },
    ],
  },
  {
    category: 'cyber_enabled_fraud',
    questions: [
      {
        id: 'fraud_cyber_001',
        text: 'Do you process electronic payments or wire transfers?',
        type: 'yes_no',
      },
      {
        id: 'fraud_cyber_002',
        text: 'Is multi-person approval required for payment changes or large transfers?',
        type: 'yes_no',
      },
      {
        id: 'fraud_cyber_003',
        text: 'Do you have controls to verify payment instruction changes?',
        type: 'yes_no',
      },
      {
        id: 'fraud_cyber_004',
        text: 'Have employees received training on business email compromise (BEC) schemes?',
        type: 'yes_no',
      },
    ],
    riskLogic: [
      {
        conditions: [
          { questionId: 'fraud_cyber_001', answer: 'yes' },
          { questionId: 'fraud_cyber_002', answer: 'no' },
        ],
        riskTitle: 'Business Email Compromise Risk',
        riskDescription: 'Risk of fraudulent payment diversion through email compromise',
        fraudScheme: 'BEC, payment diversion, invoice fraud, CEO fraud',
        likelihoodScore: 4,
        impactScore: 4,
        redFlags: ['Urgent payment requests', 'Email address variations', 'Unusual payment instructions'],
        suggestedControls: ['Dual approval for payments', 'Out-of-band verification', 'Email authentication', 'User awareness training'],
      },
    ],
  },
  {
    category: 'bribery_corruption',
    questions: [
      {
        id: 'fraud_brib_001',
        text: 'Do you operate in high-risk jurisdictions for corruption?',
        type: 'yes_no',
      },
      {
        id: 'fraud_brib_002',
        text: 'Do you use third-party agents, intermediaries, or consultants?',
        type: 'yes_no',
      },
      {
        id: 'fraud_brib_003',
        text: 'Do you have a formal anti-bribery and corruption policy?',
        type: 'yes_no',
      },
      {
        id: 'fraud_brib_004',
        text: 'Are gifts, hospitality, and entertainment tracked and approved?',
        type: 'yes_no',
      },
      {
        id: 'fraud_brib_005',
        text: 'Do you conduct due diligence on third-party intermediaries?',
        type: 'yes_no',
      },
    ],
    riskLogic: [
      {
        conditions: [
          { questionId: 'fraud_brib_001', answer: 'yes' },
          { questionId: 'fraud_brib_003', answer: 'no' },
        ],
        riskTitle: 'Bribery and Corruption Risk',
        riskDescription: 'Risk of improper payments to government officials or business partners',
        fraudScheme: 'Facilitation payments, kickbacks, conflicts of interest, improper gifts',
        likelihoodScore: 3,
        impactScore: 5,
        redFlags: ['Unusual consulting fees', 'Payments to shell companies', 'Lack of documentation', 'Conflicts of interest'],
        suggestedControls: ['ABC policy', 'Third-party due diligence', 'Gift registers', 'Whistleblower hotline', 'Training'],
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
  {
    domain: 'phishing_social_engineering',
    questions: [
      {
        id: 'cyber_phish_001',
        text: 'Do you have email security controls (spam filters, link protection)?',
        type: 'yes_no',
      },
      {
        id: 'cyber_phish_002',
        text: 'How frequently do employees receive security awareness training?',
        type: 'multiple_choice',
        options: ['Monthly', 'Quarterly', 'Annually', 'Never'],
      },
      {
        id: 'cyber_phish_003',
        text: 'Do you conduct simulated phishing exercises?',
        type: 'yes_no',
      },
      {
        id: 'cyber_phish_004',
        text: 'Is there a process for employees to report suspicious emails?',
        type: 'yes_no',
      },
    ],
    riskLogic: [
      {
        conditions: [
          { questionId: 'cyber_phish_002', answer: ['Annually', 'Never'] },
        ],
        riskTitle: 'Phishing and Social Engineering Risk',
        riskDescription: 'Risk of credential theft and malware infection through phishing attacks',
        threatVector: ['Spear phishing', 'Credential harvesting', 'Malware delivery', 'CEO fraud'],
        likelihoodScore: 5,
        impactScore: 4,
        regulatoryRequirements: ['GDPR Article 32', 'ISO 27001'],
        suggestedControls: ['Security awareness training', 'Email filtering', 'Phishing simulations', 'Incident reporting'],
      },
    ],
  },
  {
    domain: 'data_protection',
    questions: [
      {
        id: 'cyber_data_001',
        text: 'Is sensitive data encrypted at rest?',
        type: 'yes_no',
      },
      {
        id: 'cyber_data_002',
        text: 'Is sensitive data encrypted in transit?',
        type: 'yes_no',
      },
      {
        id: 'cyber_data_003',
        text: 'Do you have data loss prevention (DLP) controls?',
        type: 'yes_no',
      },
      {
        id: 'cyber_data_004',
        text: 'Is data classified based on sensitivity?',
        type: 'yes_no',
      },
      {
        id: 'cyber_data_005',
        text: 'Do you have a data retention and disposal policy?',
        type: 'yes_no',
      },
    ],
    riskLogic: [
      {
        conditions: [
          { questionId: 'cyber_data_001', answer: 'no' },
        ],
        riskTitle: 'Data Breach Risk',
        riskDescription: 'Risk of unauthorized disclosure of sensitive data due to inadequate encryption',
        threatVector: ['Data theft', 'Insider threats', 'Lost devices', 'Unauthorized access'],
        likelihoodScore: 4,
        impactScore: 5,
        regulatoryRequirements: ['GDPR Article 32', 'PCI DSS 3.4', 'HIPAA'],
        suggestedControls: ['Encryption at rest', 'Encryption in transit', 'DLP', 'Data classification', 'Access controls'],
      },
    ],
  },
  {
    domain: 'third_party_vendor',
    questions: [
      {
        id: 'cyber_vendor_001',
        text: 'Do third-party vendors have access to your systems or data?',
        type: 'yes_no',
      },
      {
        id: 'cyber_vendor_002',
        text: 'Do you conduct security assessments of vendors before engagement?',
        type: 'yes_no',
        conditionalOn: { questionId: 'cyber_vendor_001', answer: 'yes' },
      },
      {
        id: 'cyber_vendor_003',
        text: 'Are vendor security requirements included in contracts?',
        type: 'yes_no',
        conditionalOn: { questionId: 'cyber_vendor_001', answer: 'yes' },
      },
      {
        id: 'cyber_vendor_004',
        text: 'Do you monitor vendor security posture on an ongoing basis?',
        type: 'yes_no',
        conditionalOn: { questionId: 'cyber_vendor_001', answer: 'yes' },
      },
    ],
    riskLogic: [
      {
        conditions: [
          { questionId: 'cyber_vendor_001', answer: 'yes' },
          { questionId: 'cyber_vendor_002', answer: 'no' },
        ],
        riskTitle: 'Third-Party Security Risk',
        riskDescription: 'Risk of security incidents through vendor access and supply chain vulnerabilities',
        threatVector: ['Supply chain attacks', 'Vendor breaches', 'Unauthorized access', 'Data leakage'],
        likelihoodScore: 4,
        impactScore: 4,
        regulatoryRequirements: ['GDPR Article 28', 'SOC 2', 'ISO 27001'],
        suggestedControls: ['Vendor security assessments', 'Contract requirements', 'Access controls', 'Continuous monitoring'],
      },
    ],
  },
  {
    domain: 'ot_security',
    questions: [
      {
        id: 'cyber_ot_001',
        text: 'Do you operate industrial control systems (ICS), SCADA, or IoT devices?',
        type: 'yes_no',
      },
      {
        id: 'cyber_ot_002',
        text: 'Are OT networks segmented from IT networks?',
        type: 'yes_no',
        conditionalOn: { questionId: 'cyber_ot_001', answer: 'yes' },
      },
      {
        id: 'cyber_ot_003',
        text: 'Do you have visibility into OT network traffic and devices?',
        type: 'yes_no',
        conditionalOn: { questionId: 'cyber_ot_001', answer: 'yes' },
      },
      {
        id: 'cyber_ot_004',
        text: 'Are OT systems regularly patched and updated?',
        type: 'yes_no',
        conditionalOn: { questionId: 'cyber_ot_001', answer: 'yes' },
      },
    ],
    riskLogic: [
      {
        conditions: [
          { questionId: 'cyber_ot_001', answer: 'yes' },
          { questionId: 'cyber_ot_002', answer: 'no' },
        ],
        riskTitle: 'OT Security Risk',
        riskDescription: 'Risk of operational disruption through attacks on industrial control systems',
        threatVector: ['Ransomware', 'Nation-state attacks', 'Malware propagation', 'Unauthorized access'],
        likelihoodScore: 3,
        impactScore: 5,
        regulatoryRequirements: ['IEC 62443', 'NERC CIP', 'NIST CSF'],
        suggestedControls: ['Network segmentation', 'OT monitoring', 'Patch management', 'Access controls', 'Incident response'],
      },
    ],
  },
  {
    domain: 'cloud_security',
    questions: [
      {
        id: 'cyber_cloud_001',
        text: 'Do you use cloud services (SaaS, IaaS, PaaS)?',
        type: 'yes_no',
      },
      {
        id: 'cyber_cloud_002',
        text: 'Are cloud configurations regularly reviewed for security misconfigurations?',
        type: 'yes_no',
        conditionalOn: { questionId: 'cyber_cloud_001', answer: 'yes' },
      },
      {
        id: 'cyber_cloud_003',
        text: 'Do you use cloud security posture management (CSPM) tools?',
        type: 'yes_no',
        conditionalOn: { questionId: 'cyber_cloud_001', answer: 'yes' },
      },
      {
        id: 'cyber_cloud_004',
        text: 'Are cloud access permissions reviewed regularly?',
        type: 'yes_no',
        conditionalOn: { questionId: 'cyber_cloud_001', answer: 'yes' },
      },
      {
        id: 'cyber_cloud_005',
        text: 'Do you have visibility into shadow IT and unauthorized cloud usage?',
        type: 'yes_no',
        conditionalOn: { questionId: 'cyber_cloud_001', answer: 'yes' },
      },
    ],
    riskLogic: [
      {
        conditions: [
          { questionId: 'cyber_cloud_001', answer: 'yes' },
          { questionId: 'cyber_cloud_002', answer: 'no' },
        ],
        riskTitle: 'Cloud Misconfiguration Risk',
        riskDescription: 'Risk of data exposure through cloud security misconfigurations',
        threatVector: ['Misconfigured storage', 'Excessive permissions', 'Unpatched services', 'Data leakage'],
        likelihoodScore: 4,
        impactScore: 4,
        regulatoryRequirements: ['GDPR Article 32', 'SOC 2', 'ISO 27001'],
        suggestedControls: ['Configuration reviews', 'CSPM tools', 'Access governance', 'Cloud security training', 'Shadow IT detection'],
      },
    ],
  },
];
