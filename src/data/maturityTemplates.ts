import type { MaturityPackage, ControlTemplate, MaturityLevel, SuggestedControl } from '@/types';

// ============================================================
// Maturity Level Metadata
// ============================================================

export const MATURITY_LEVEL_META: Record<MaturityLevel, { name: string; label: string; range: [number, number] }> = {
  1: { name: 'Basic', label: 'Ad Hoc Awareness', range: [1.0, 1.5] },
  2: { name: 'Developing', label: 'Basic Formal', range: [2.0, 2.5] },
  3: { name: 'Defined', label: 'Structured & Consistent', range: [3.0, 3.5] },
  4: { name: 'Advanced', label: 'Optimised & Predictive', range: [4.0, 5.0] },
};

// ============================================================
// Generic fallback templates used when no risk-specific match
// ============================================================

function genericPackages(riskType: string): MaturityPackage[] {
  return [
    {
      id: `${riskType}_L1`,
      riskType,
      level: 1,
      name: 'Basic (Ad Hoc Awareness)',
      maturityRange: [1.0, 1.5],
      description: 'Informal, reactive controls with minimal documentation.',
      characteristics: [
        'No formal program or policy',
        'Reactive management approach',
        'No defined targets or metrics',
        'Informal documentation only',
      ],
      controlTemplates: [
        ct(`${riskType}-L1-001`, riskType, 1, 'Basic Monitoring', 'Informal monitoring of key indicators related to this risk area.', 'detective', ['operations'], 'Department Manager', 'ad_hoc', 'Informal notes, emails', 'low', 1),
        ct(`${riskType}-L1-002`, riskType, 1, 'Ad Hoc Reporting', 'Periodic informal reporting on risk status to senior management.', 'detective', ['reporting'], 'Risk Owner', 'quarterly', 'Email updates, verbal reports', 'low', 2),
        ct(`${riskType}-L1-003`, riskType, 1, 'Reactive Response Procedure', 'Informal procedure for responding to risk events when they occur.', 'corrective', ['operations'], 'Department Manager', 'ad_hoc', 'Incident records', 'low', 3),
      ],
      typicalControlCount: 3,
    },
    {
      id: `${riskType}_L2`,
      riskType,
      level: 2,
      name: 'Developing (Basic Formal)',
      maturityRange: [2.0, 2.5],
      description: 'Basic formal controls with some documentation and regular reporting.',
      characteristics: [
        'Basic formal reporting established',
        'Some targets and metrics defined',
        'Limited systematic tracking',
        'Reactive to threshold breaches',
      ],
      controlTemplates: [
        ct(`${riskType}-L2-001`, riskType, 2, 'Regular Status Reporting', 'Monthly report on key risk indicators distributed to management.', 'detective', ['reporting'], 'Financial Controller', 'monthly', 'Monthly report, distribution records', 'low', 1),
        ct(`${riskType}-L2-002`, riskType, 2, 'Annual Review Process', 'Annual review of risk exposure and control adequacy.', 'detective', ['operations', 'reporting'], 'Risk Owner', 'annually', 'Review document, meeting minutes', 'low', 2),
        ct(`${riskType}-L2-003`, riskType, 2, 'Basic Escalation Procedure', 'Defined escalation process when risk metrics breach thresholds.', 'corrective', ['operations'], 'Department Manager', 'ad_hoc', 'Escalation records', 'medium', 3),
        ct(`${riskType}-L2-004`, riskType, 2, 'Management Variance Review', 'Regular management review of variances against plan.', 'detective', ['financial'], 'CFO', 'monthly', 'Variance reports, meeting minutes', 'low', 4),
      ],
      typicalControlCount: 4,
    },
    {
      id: `${riskType}_L3`,
      riskType,
      level: 3,
      name: 'Defined (Structured & Consistent)',
      maturityRange: [3.0, 3.5],
      description: 'Structured, documented controls with proactive monitoring and clear accountability.',
      characteristics: [
        'Formal documented procedures',
        'Proactive monitoring with KPIs',
        'Clear ownership and accountability',
        'Regular committee oversight',
        'Systematic evidence collection',
      ],
      controlTemplates: [
        ct(`${riskType}-L3-001`, riskType, 3, 'Formal Risk Mitigation Program', 'Documented program with targets, KPIs and accountable owners for mitigating this risk.', 'preventive', ['operations', 'compliance'], 'Risk Owner', 'monthly', 'Program charter, KPI dashboard', 'medium', 1),
        ct(`${riskType}-L3-002`, riskType, 3, 'Monthly KPI Dashboard', 'Monthly dashboard tracking key risk indicators with defined thresholds and triggers.', 'detective', ['reporting', 'financial'], 'Financial Controller', 'monthly', 'Dashboard report, alert log', 'medium', 2),
        ct(`${riskType}-L3-003`, riskType, 3, 'Cross-Functional Oversight Committee', 'Regular committee meetings to review risk status, approve actions and monitor progress.', 'preventive', ['operations'], 'CFO', 'monthly', 'Committee minutes, action tracker', 'medium', 3),
        ct(`${riskType}-L3-004`, riskType, 3, 'Impact Analysis Framework', 'Systematic analysis of financial and operational impact of risk events.', 'detective', ['financial', 'operations'], 'Financial Controller', 'quarterly', 'Impact analysis reports', 'medium', 4),
        ct(`${riskType}-L3-005`, riskType, 3, 'Implementation Accountability Tracker', 'Formal tracking of mitigation actions with owner accountability and deadlines.', 'preventive', ['operations'], 'Risk Owner', 'weekly', 'Action tracker, status reports', 'medium', 5),
        ct(`${riskType}-L3-006`, riskType, 3, 'Compliance & Regulatory Review', 'Regular review against relevant regulatory requirements and industry standards.', 'preventive', ['compliance'], 'Compliance Officer', 'quarterly', 'Review reports, compliance checklist', 'medium', 6),
      ],
      typicalControlCount: 6,
    },
    {
      id: `${riskType}_L4`,
      riskType,
      level: 4,
      name: 'Advanced (Optimised & Predictive)',
      maturityRange: [4.0, 5.0],
      description: 'Optimised, predictive controls with continuous monitoring, automation and strategic integration.',
      characteristics: [
        'Predictive analytics and early warning',
        'Automated monitoring and alerting',
        'Integrated with strategic planning',
        'Continuous improvement culture',
        'External benchmarking',
        'Board-level reporting',
      ],
      controlTemplates: [
        ct(`${riskType}-L4-001`, riskType, 4, 'Predictive Analytics & Early Warning', 'AI/ML-powered early warning system predicting risk materialisation probability.', 'preventive', ['operations', 'reporting'], 'CRO', 'continuous', 'Analytics dashboard, alert logs', 'high', 1),
        ct(`${riskType}-L4-002`, riskType, 4, 'Automated Continuous Monitoring', 'Real-time automated monitoring of risk indicators with instant alerting.', 'detective', ['operations'], 'IT Director', 'continuous', 'System logs, alert records', 'high', 2),
        ct(`${riskType}-L4-003`, riskType, 4, 'Strategic Integration & Scenario Planning', 'Integration of risk management into strategic planning with scenario modelling.', 'preventive', ['operations', 'financial'], 'CEO', 'quarterly', 'Scenario models, strategy documents', 'high', 3),
        ct(`${riskType}-L4-004`, riskType, 4, 'External Benchmarking Program', 'Regular benchmarking against industry peers and best practices.', 'detective', ['compliance', 'operations'], 'CRO', 'annually', 'Benchmark reports, improvement plans', 'high', 4),
        ct(`${riskType}-L4-005`, riskType, 4, 'Board Risk Committee Reporting', 'Comprehensive quarterly reporting to board risk committee with forward-looking analysis.', 'detective', ['reporting'], 'CRO', 'quarterly', 'Board pack, committee minutes', 'high', 5),
      ],
      typicalControlCount: 5,
    },
  ];
}

// ============================================================
// Risk-specific maturity packages
// ============================================================

const customerConcentrationPackages: MaturityPackage[] = [
  {
    id: 'customer_concentration_L1',
    riskType: 'customer_concentration',
    level: 1,
    name: 'Basic (Ad Hoc Awareness)',
    maturityRange: [1.0, 1.5],
    description: 'Informal awareness of customer concentration with no formal tracking.',
    characteristics: [
      'No formal concentration monitoring',
      'Reactive customer management',
      'No defined concentration limits',
      'Informal revenue tracking',
    ],
    controlTemplates: [
      ct('CC-L1-001', 'customer_concentration', 1, 'Revenue Tracking in Accounting System', 'Basic revenue tracking by customer in the accounting system.', 'detective', ['financial'], 'Accountant', 'monthly', 'Accounting reports', 'low', 1),
      ct('CC-L1-002', 'customer_concentration', 1, 'Informal Customer Monitoring', 'Informal monitoring of major customer relationships by sales team.', 'detective', ['operations'], 'Sales Director', 'ad_hoc', 'Informal notes, CRM', 'low', 2),
      ct('CC-L1-003', 'customer_concentration', 1, 'Ad Hoc Relationship Discussions', 'Ad hoc discussions about key customer health in management meetings.', 'detective', ['operations'], 'CEO', 'ad_hoc', 'Meeting notes', 'low', 3),
    ],
    typicalControlCount: 3,
    exampleCompanies: ['Typical for early-stage or <£5M revenue companies'],
  },
  {
    id: 'customer_concentration_L2',
    riskType: 'customer_concentration',
    level: 2,
    name: 'Developing (Basic Formal)',
    maturityRange: [2.0, 2.5],
    description: 'Basic formal tracking of customer concentration with regular reporting.',
    characteristics: [
      'Monthly revenue-by-customer reports',
      'Basic credit limits established',
      'Some diversification discussions',
      'Reactive to customer losses',
    ],
    controlTemplates: [
      ct('CC-L2-001', 'customer_concentration', 2, 'Monthly Revenue Concentration Report', 'Monthly report showing revenue by customer, top 10 customer percentage, and concentration trends.', 'detective', ['reporting', 'financial'], 'Financial Controller', 'monthly', 'Revenue analysis spreadsheet, email distribution', 'low', 1),
      ct('CC-L2-002', 'customer_concentration', 2, 'Credit Limit Policy', 'Formal credit limit policy for major customers with defined maximum exposure.', 'preventive', ['financial'], 'Credit Controller', 'quarterly', 'Credit policy document, limit records', 'low', 2),
      ct('CC-L2-003', 'customer_concentration', 2, 'Quarterly Customer Review', 'Quarterly review of key customer relationships and satisfaction indicators.', 'detective', ['operations'], 'Sales Director', 'quarterly', 'Customer review reports', 'medium', 3),
      ct('CC-L2-004', 'customer_concentration', 2, 'Annual Budget Diversification Planning', 'Annual budget process includes customer diversification targets.', 'preventive', ['operations', 'financial'], 'CFO', 'annually', 'Budget documents', 'low', 4),
    ],
    typicalControlCount: 4,
    exampleCompanies: ['Typical for £5-50M revenue companies'],
  },
  {
    id: 'customer_concentration_L3',
    riskType: 'customer_concentration',
    level: 3,
    name: 'Defined (Structured & Consistent)',
    maturityRange: [3.0, 3.5],
    description: 'Structured concentration management with formal limits, proactive diversification and systematic monitoring.',
    characteristics: [
      'Formal concentration limits and triggers',
      'Proactive diversification strategy',
      'Customer risk scoring system',
      'Regular board reporting',
      'Systematic relationship management',
    ],
    controlTemplates: [
      ct('CC-L3-001', 'customer_concentration', 3, 'Formal Concentration Limit Policy', 'Board-approved policy limiting single customer to max 20% of revenue with defined triggers at 15%.', 'preventive', ['compliance', 'financial'], 'CFO', 'quarterly', 'Policy document, quarterly compliance report', 'medium', 1),
      ct('CC-L3-002', 'customer_concentration', 3, 'Customer Risk Scoring Dashboard', 'Monthly dashboard scoring top 20 customers on financial health, contract status, relationship quality and strategic importance.', 'detective', ['reporting', 'operations'], 'Commercial Director', 'monthly', 'Risk scoring dashboard, trend analysis', 'medium', 2),
      ct('CC-L3-003', 'customer_concentration', 3, 'Proactive Diversification Program', 'Formal program with targets to grow revenue from new customers and reduce dependency on top 5.', 'preventive', ['operations'], 'Sales Director', 'monthly', 'Diversification tracker, pipeline reports', 'medium', 3),
      ct('CC-L3-004', 'customer_concentration', 3, 'Contract Renewal Management', 'Systematic management of contract renewal pipeline with early warning at 12 months before expiry.', 'preventive', ['operations'], 'Commercial Director', 'monthly', 'Contract database, renewal tracker', 'medium', 4),
      ct('CC-L3-005', 'customer_concentration', 3, 'Financial Impact Scenario Analysis', 'Quarterly scenario analysis modelling financial impact of losing top 1, 3 and 5 customers.', 'detective', ['financial'], 'CFO', 'quarterly', 'Scenario model, impact reports', 'medium', 5),
      ct('CC-L3-006', 'customer_concentration', 3, 'Board Concentration Reporting', 'Quarterly board report on concentration metrics, diversification progress and customer risk alerts.', 'detective', ['reporting'], 'CFO', 'quarterly', 'Board pack, committee minutes', 'medium', 6),
    ],
    typicalControlCount: 6,
    exampleCompanies: ['Typical for £50-500M revenue companies or listed entities'],
  },
  {
    id: 'customer_concentration_L4',
    riskType: 'customer_concentration',
    level: 4,
    name: 'Advanced (Optimised & Predictive)',
    maturityRange: [4.0, 5.0],
    description: 'Predictive customer risk management with automated monitoring, strategic integration and continuous optimisation.',
    characteristics: [
      'Predictive customer churn modelling',
      'Real-time concentration monitoring',
      'Integrated with strategic planning',
      'External market intelligence feeds',
      'Automated early warning triggers',
    ],
    controlTemplates: [
      ct('CC-L4-001', 'customer_concentration', 4, 'Predictive Churn Analytics', 'AI-powered churn prediction model analysing payment patterns, order volumes and engagement signals.', 'preventive', ['operations', 'financial'], 'CRO', 'continuous', 'Prediction dashboard, alert logs', 'high', 1),
      ct('CC-L4-002', 'customer_concentration', 4, 'Real-Time Concentration Dashboard', 'Live dashboard showing real-time concentration metrics with automated alerts at defined thresholds.', 'detective', ['reporting'], 'CFO', 'continuous', 'Live dashboard, system alerts', 'high', 2),
      ct('CC-L4-003', 'customer_concentration', 4, 'Customer Health Intelligence Platform', 'Integrated platform combining internal data with external credit ratings, news feeds and market intelligence.', 'detective', ['operations'], 'Commercial Director', 'continuous', 'Intelligence platform, risk scores', 'high', 3),
      ct('CC-L4-004', 'customer_concentration', 4, 'Strategic Portfolio Optimisation', 'Continuous optimisation of customer portfolio aligned with strategic growth plan and risk appetite.', 'preventive', ['operations', 'financial'], 'CEO', 'quarterly', 'Portfolio analysis, strategy documents', 'high', 4),
      ct('CC-L4-005', 'customer_concentration', 4, 'Industry Benchmarking & Best Practice', 'Annual benchmarking of concentration metrics against industry peers with improvement targets.', 'detective', ['compliance'], 'CRO', 'annually', 'Benchmark reports', 'high', 5),
    ],
    typicalControlCount: 5,
    exampleCompanies: ['Typical for FTSE-listed or >£500M revenue companies'],
  },
];

const costReductionPackages: MaturityPackage[] = [
  {
    id: 'cost_reduction_L1',
    riskType: 'cost_reduction',
    level: 1,
    name: 'Basic (Ad Hoc Awareness)',
    maturityRange: [1.0, 1.5],
    description: 'Informal cost awareness with no formal reduction program.',
    characteristics: [
      'No formal cost reduction program',
      'Reactive cost management',
      'No defined targets or metrics',
      'Informal documentation',
    ],
    controlTemplates: [
      ct('CR-L1-001', 'cost_reduction', 1, 'Cost Tracking in Accounting System', 'Basic cost tracking through the accounting system with departmental codes.', 'detective', ['financial'], 'Accountant', 'monthly', 'Accounting reports', 'low', 1),
      ct('CR-L1-002', 'cost_reduction', 1, 'Informal Cost Monitoring', 'Informal monitoring of spending patterns by department heads.', 'detective', ['operations'], 'Department Manager', 'ad_hoc', 'Budget vs actual reports', 'low', 2),
      ct('CR-L1-003', 'cost_reduction', 1, 'Ad Hoc Cost Reduction Discussions', 'Occasional discussions about cost saving opportunities in management meetings.', 'detective', ['operations'], 'CFO', 'ad_hoc', 'Meeting notes', 'low', 3),
    ],
    typicalControlCount: 3,
  },
  {
    id: 'cost_reduction_L2',
    riskType: 'cost_reduction',
    level: 2,
    name: 'Developing (Basic Formal)',
    maturityRange: [2.0, 2.5],
    description: 'Basic formal cost management with regular reporting and some targets.',
    characteristics: [
      'Monthly cost reports by department',
      'Annual budget process',
      'Some cost reduction initiatives',
      'Management review of variances',
    ],
    controlTemplates: [
      ct('CR-L2-001', 'cost_reduction', 2, 'Monthly Departmental Cost Reports', 'Monthly cost report by department showing actual vs budget variances.', 'detective', ['reporting', 'financial'], 'Financial Controller', 'monthly', 'Cost reports, email distribution', 'low', 1),
      ct('CR-L2-002', 'cost_reduction', 2, 'Annual Budget Process', 'Annual budget process with cost reduction targets built into departmental budgets.', 'preventive', ['financial'], 'CFO', 'annually', 'Budget documents, approval records', 'low', 2),
      ct('CR-L2-003', 'cost_reduction', 2, 'Cost Reduction Initiative Tracking', 'Basic tracking of identified cost reduction initiatives and their progress.', 'detective', ['operations'], 'CFO', 'monthly', 'Initiative tracker', 'medium', 3),
      ct('CR-L2-004', 'cost_reduction', 2, 'Management Variance Review', 'Monthly management review of significant budget variances with explanations required.', 'detective', ['financial', 'operations'], 'CFO', 'monthly', 'Variance reports, meeting minutes', 'low', 4),
    ],
    typicalControlCount: 4,
  },
  {
    id: 'cost_reduction_L3',
    riskType: 'cost_reduction',
    level: 3,
    name: 'Defined (Structured & Consistent)',
    maturityRange: [3.0, 3.5],
    description: 'Formal cost reduction program with targets, systematic tracking and cross-functional governance.',
    characteristics: [
      'Formal cost reduction program with targets',
      'Monthly progress tracking against targets',
      'Systematic efficiency opportunity pipeline',
      'Cross-functional cost reduction committee',
      'Financial impact analysis of initiatives',
    ],
    controlTemplates: [
      ct('CR-L3-001', 'cost_reduction', 3, 'Formal Cost Reduction Program', 'Board-approved cost reduction program with defined targets, timelines and accountable owners.', 'preventive', ['operations', 'compliance'], 'CFO', 'monthly', 'Program charter, board approval', 'medium', 1),
      ct('CR-L3-002', 'cost_reduction', 3, 'Monthly Cost Reduction Progress Tracker', 'Monthly dashboard tracking cumulative savings, initiative status and forecast to target.', 'detective', ['financial', 'reporting'], 'CFO', 'monthly', 'Dashboard report, meeting minutes', 'medium', 2),
      ct('CR-L3-003', 'cost_reduction', 3, 'Efficiency Opportunity Pipeline', 'Systematic pipeline of identified cost reduction opportunities with business cases.', 'preventive', ['operations'], 'Operations Director', 'monthly', 'Opportunity pipeline, business cases', 'medium', 3),
      ct('CR-L3-004', 'cost_reduction', 3, 'Cross-Functional Cost Reduction Committee', 'Monthly committee with representatives from all departments to review progress and approve new initiatives.', 'preventive', ['operations'], 'CFO', 'monthly', 'Committee minutes, action tracker', 'medium', 4),
      ct('CR-L3-005', 'cost_reduction', 3, 'Financial Impact Analysis', 'Detailed financial impact analysis for all initiatives above £50k including ROI and payback period.', 'detective', ['financial'], 'Financial Controller', 'monthly', 'Impact analysis reports, ROI calculations', 'medium', 5),
      ct('CR-L3-006', 'cost_reduction', 3, 'Implementation Plan with Accountability', 'Detailed implementation plan for each initiative with milestones, owners and deadlines.', 'preventive', ['operations'], 'Program Manager', 'weekly', 'Implementation plans, status reports', 'medium', 6),
    ],
    typicalControlCount: 6,
  },
  {
    id: 'cost_reduction_L4',
    riskType: 'cost_reduction',
    level: 4,
    name: 'Advanced (Optimised & Predictive)',
    maturityRange: [4.0, 5.0],
    description: 'Continuous cost optimisation with predictive analytics, automation and strategic integration.',
    characteristics: [
      'Predictive cost modelling',
      'Automated spend analytics',
      'Continuous improvement culture',
      'Strategic cost management integration',
      'External benchmarking',
    ],
    controlTemplates: [
      ct('CR-L4-001', 'cost_reduction', 4, 'Predictive Cost Analytics', 'AI-powered cost forecasting and anomaly detection across all cost centres.', 'preventive', ['financial', 'operations'], 'CRO', 'continuous', 'Analytics platform, forecast reports', 'high', 1),
      ct('CR-L4-002', 'cost_reduction', 4, 'Automated Spend Analytics Platform', 'Automated platform categorising and analysing all spend with real-time dashboards.', 'detective', ['financial'], 'CFO', 'continuous', 'Spend analytics platform', 'high', 2),
      ct('CR-L4-003', 'cost_reduction', 4, 'Zero-Based Budgeting Process', 'Annual zero-based budgeting process requiring justification of all spend.', 'preventive', ['financial'], 'CFO', 'annually', 'ZBB documents, justification records', 'high', 3),
      ct('CR-L4-004', 'cost_reduction', 4, 'Industry Benchmarking & Best Practice', 'Regular benchmarking of cost structure against industry peers.', 'detective', ['operations', 'compliance'], 'CFO', 'annually', 'Benchmark reports', 'high', 4),
      ct('CR-L4-005', 'cost_reduction', 4, 'Board Strategic Cost Review', 'Quarterly board-level review integrating cost management with strategic objectives.', 'detective', ['reporting'], 'CEO', 'quarterly', 'Board pack, strategy documents', 'high', 5),
    ],
    typicalControlCount: 5,
  },
];

const cybersecurityPackages: MaturityPackage[] = [
  {
    id: 'cybersecurity_L1',
    riskType: 'cybersecurity',
    level: 1,
    name: 'Basic (Ad Hoc Awareness)',
    maturityRange: [1.0, 1.5],
    description: 'Minimal cybersecurity controls with basic antivirus and firewalls.',
    characteristics: [
      'Basic antivirus and firewall only',
      'No formal security policy',
      'No regular security assessments',
      'Reactive to incidents',
    ],
    controlTemplates: [
      ct('CS-L1-001', 'cybersecurity', 1, 'Basic Antivirus & Firewall', 'Standard antivirus software and basic firewall on all endpoints.', 'preventive', ['operations'], 'IT Manager', 'continuous', 'AV scan reports, firewall logs', 'low', 1),
      ct('CS-L1-002', 'cybersecurity', 1, 'Password Policy', 'Basic password policy requiring minimum complexity and regular changes.', 'preventive', ['compliance'], 'IT Manager', 'continuous', 'Policy document, AD settings', 'low', 2),
      ct('CS-L1-003', 'cybersecurity', 1, 'Backup Procedures', 'Regular data backups to protect against data loss.', 'corrective', ['operations'], 'IT Manager', 'daily', 'Backup logs, restore test records', 'low', 3),
    ],
    typicalControlCount: 3,
  },
  {
    id: 'cybersecurity_L2',
    riskType: 'cybersecurity',
    level: 2,
    name: 'Developing (Basic Formal)',
    maturityRange: [2.0, 2.5],
    description: 'Formal security policies with basic access controls and periodic assessments.',
    characteristics: [
      'Formal security policy in place',
      'Basic access control management',
      'Annual security awareness training',
      'Periodic vulnerability scanning',
    ],
    controlTemplates: [
      ct('CS-L2-001', 'cybersecurity', 2, 'Information Security Policy', 'Formal information security policy approved by management covering key security domains.', 'preventive', ['compliance'], 'IT Director', 'annually', 'Policy document, approval records', 'low', 1),
      ct('CS-L2-002', 'cybersecurity', 2, 'Access Control Management', 'Formal user access provisioning, de-provisioning and periodic review process.', 'preventive', ['operations', 'compliance'], 'IT Manager', 'quarterly', 'Access request forms, review reports', 'medium', 2),
      ct('CS-L2-003', 'cybersecurity', 2, 'Security Awareness Training', 'Annual mandatory cybersecurity awareness training for all staff.', 'preventive', ['operations'], 'HR Director', 'annually', 'Training records, completion rates', 'low', 3),
      ct('CS-L2-004', 'cybersecurity', 2, 'Vulnerability Scanning', 'Quarterly vulnerability scanning of external-facing systems.', 'detective', ['operations'], 'IT Manager', 'quarterly', 'Scan reports, remediation records', 'medium', 4),
    ],
    typicalControlCount: 4,
  },
  {
    id: 'cybersecurity_L3',
    riskType: 'cybersecurity',
    level: 3,
    name: 'Defined (Structured & Consistent)',
    maturityRange: [3.0, 3.5],
    description: 'Comprehensive security framework with continuous monitoring, incident response and regular testing.',
    characteristics: [
      'Security framework aligned to ISO 27001 or NIST',
      'Continuous monitoring and SIEM',
      'Formal incident response plan',
      'Regular penetration testing',
      'Third-party risk management',
    ],
    controlTemplates: [
      ct('CS-L3-001', 'cybersecurity', 3, 'Security Framework Implementation', 'Formal cybersecurity framework aligned to ISO 27001 or NIST with regular compliance assessments.', 'preventive', ['compliance', 'operations'], 'CISO', 'quarterly', 'Framework documentation, compliance reports', 'medium', 1),
      ct('CS-L3-002', 'cybersecurity', 3, 'SIEM & Continuous Monitoring', 'Security information and event management system with 24/7 monitoring and alerting.', 'detective', ['operations'], 'CISO', 'continuous', 'SIEM logs, alert reports', 'high', 2),
      ct('CS-L3-003', 'cybersecurity', 3, 'Incident Response Plan', 'Documented incident response plan with defined roles, escalation procedures and regular testing.', 'corrective', ['operations', 'compliance'], 'CISO', 'annually', 'IRP document, exercise reports', 'medium', 3),
      ct('CS-L3-004', 'cybersecurity', 3, 'Penetration Testing Program', 'Annual penetration testing by external provider with structured remediation tracking.', 'detective', ['operations'], 'CISO', 'annually', 'Pen test reports, remediation tracker', 'medium', 4),
      ct('CS-L3-005', 'cybersecurity', 3, 'Third-Party Security Assessment', 'Formal assessment of cybersecurity posture of critical third parties.', 'preventive', ['compliance'], 'IT Director', 'annually', 'Assessment questionnaires, risk ratings', 'medium', 5),
      ct('CS-L3-006', 'cybersecurity', 3, 'Data Classification & Protection', 'Formal data classification scheme with corresponding protection controls and DLP.', 'preventive', ['compliance', 'operations'], 'CISO', 'quarterly', 'Classification policy, DLP reports', 'medium', 6),
    ],
    typicalControlCount: 6,
  },
  {
    id: 'cybersecurity_L4',
    riskType: 'cybersecurity',
    level: 4,
    name: 'Advanced (Optimised & Predictive)',
    maturityRange: [4.0, 5.0],
    description: 'Advanced security operations with threat intelligence, automated response and zero-trust architecture.',
    characteristics: [
      'Threat intelligence integration',
      'Automated incident response (SOAR)',
      'Zero-trust architecture',
      'Red team exercises',
      'Cyber insurance optimisation',
    ],
    controlTemplates: [
      ct('CS-L4-001', 'cybersecurity', 4, 'Threat Intelligence Platform', 'Integrated threat intelligence platform providing proactive threat detection and early warning.', 'preventive', ['operations'], 'CISO', 'continuous', 'TI platform, threat reports', 'high', 1),
      ct('CS-L4-002', 'cybersecurity', 4, 'Security Orchestration & Automated Response', 'SOAR platform automating incident response for common threat patterns.', 'corrective', ['operations'], 'CISO', 'continuous', 'SOAR logs, response metrics', 'high', 2),
      ct('CS-L4-003', 'cybersecurity', 4, 'Zero-Trust Architecture', 'Implementation of zero-trust security model with micro-segmentation and continuous verification.', 'preventive', ['operations', 'compliance'], 'CISO', 'continuous', 'Architecture documentation, audit reports', 'high', 3),
      ct('CS-L4-004', 'cybersecurity', 4, 'Red Team & Purple Team Exercises', 'Regular red team exercises simulating advanced persistent threats with purple team collaboration.', 'detective', ['operations'], 'CISO', 'quarterly', 'Exercise reports, findings tracker', 'high', 4),
      ct('CS-L4-005', 'cybersecurity', 4, 'Board Cyber Risk Reporting', 'Quarterly board reporting on cyber risk posture, threat landscape and investment effectiveness.', 'detective', ['reporting'], 'CISO', 'quarterly', 'Board cyber report, metrics dashboard', 'high', 5),
    ],
    typicalControlCount: 5,
  },
];

// ============================================================
// Risk type registry — maps risk keywords to template sets
// ============================================================

const RISK_TYPE_PACKAGES: Record<string, MaturityPackage[]> = {
  customer_concentration: customerConcentrationPackages,
  cost_reduction: costReductionPackages,
  cybersecurity: cybersecurityPackages,
};

const RISK_TYPE_KEYWORDS: Record<string, string[]> = {
  customer_concentration: ['customer', 'concentration', 'receivable', 'client', 'revenue dependency', 'credit risk'],
  cost_reduction: ['cost', 'reduction', 'efficiency', 'savings', 'budget', 'expenditure', 'overhead'],
  cybersecurity: ['cyber', 'security', 'breach', 'data', 'hack', 'phishing', 'ransomware', 'IT security'],
  supply_chain: ['supply chain', 'supplier', 'procurement', 'vendor', 'sourcing'],
  talent_loss: ['talent', 'people', 'employee', 'retention', 'key person', 'staff', 'workforce'],
  regulatory_compliance: ['regulatory', 'compliance', 'regulation', 'legal', 'FCA', 'GDPR'],
  liquidity: ['liquidity', 'cash flow', 'covenant', 'working capital', 'funding'],
  product_development: ['product', 'development', 'innovation', 'R&D', 'launch'],
  competitive: ['competitive', 'competition', 'market share', 'disruption', 'displacement'],
  inventory: ['inventory', 'obsolescence', 'stock', 'write-off', 'warehouse'],
};

/**
 * Detect the best-matching risk type from a risk title and statement.
 */
export function detectRiskType(riskTitle: string, riskStatement: string): string {
  const text = `${riskTitle} ${riskStatement}`.toLowerCase();
  let bestMatch = '';
  let bestScore = 0;

  for (const [riskType, keywords] of Object.entries(RISK_TYPE_KEYWORDS)) {
    let score = 0;
    for (const kw of keywords) {
      if (text.includes(kw.toLowerCase())) {
        score += kw.length; // longer keyword matches score higher
      }
    }
    if (score > bestScore) {
      bestScore = score;
      bestMatch = riskType;
    }
  }

  return bestMatch || 'generic';
}

/**
 * Get all 4 maturity packages for a given risk type.
 */
export function getMaturityPackages(riskType: string): MaturityPackage[] {
  return RISK_TYPE_PACKAGES[riskType] || genericPackages(riskType);
}

/**
 * Get a single maturity package by risk type and level.
 */
export function getMaturityPackage(riskType: string, level: MaturityLevel): MaturityPackage | undefined {
  const packages = getMaturityPackages(riskType);
  return packages.find(p => p.level === level);
}

/**
 * Get the recommended target level based on risk priority and current level.
 */
export function getRecommendedTarget(
  riskPriority: 'HIGH' | 'MEDIUM' | 'LOWER',
  currentLevel: MaturityLevel
): MaturityLevel {
  if (riskPriority === 'HIGH' && currentLevel < 3) return 3;
  if (riskPriority === 'MEDIUM' && currentLevel < 3) return 3;
  if (riskPriority === 'LOWER') return Math.min(currentLevel + 1, 3) as MaturityLevel;
  return currentLevel;
}

/**
 * Calculate maturity score based on controls.
 */
export function calculateMaturityScore(controls: { maturityLevel: MaturityLevel }[]): number {
  if (controls.length === 0) return 0;
  const sum = controls.reduce((acc, c) => acc + c.maturityLevel, 0);
  return Math.round((sum / controls.length) * 10) / 10;
}

/**
 * Perform gap analysis between current and target levels.
 */
export function performGapAnalysis(
  riskType: string,
  currentLevel: MaturityLevel,
  targetLevel: MaturityLevel,
  existingControls: { templateId?: string; type: string; objectives: string[] }[]
): {
  missingTemplates: ControlTemplate[];
  missingObjectives: string[];
  missingTypes: string[];
  effortEstimate: 'low' | 'medium' | 'high';
  timelineEstimate: string;
} {
  const packages = getMaturityPackages(riskType);
  const targetPackages = packages.filter(p => p.level > currentLevel && p.level <= targetLevel);

  const allTargetTemplates: ControlTemplate[] = [];
  for (const pkg of targetPackages) {
    allTargetTemplates.push(...pkg.controlTemplates);
  }

  const existingTemplateIds = new Set(existingControls.map(c => c.templateId).filter(Boolean));
  const missingTemplates = allTargetTemplates.filter(t => !existingTemplateIds.has(t.id));

  const existingObjectives = new Set(existingControls.flatMap(c => c.objectives));
  const allObjectives: string[] = ['operations', 'reporting', 'financial', 'compliance'];
  const missingObjectives = allObjectives.filter(o => !existingObjectives.has(o));

  const existingTypes = new Set(existingControls.map(c => c.type));
  const allTypes: string[] = ['preventive', 'detective', 'corrective'];
  const missingTypes = allTypes.filter(t => !existingTypes.has(t));

  const gap = targetLevel - currentLevel;
  const effortEstimate: 'low' | 'medium' | 'high' =
    gap <= 1 && missingTemplates.length <= 4 ? 'low' :
    gap <= 2 && missingTemplates.length <= 8 ? 'medium' : 'high';

  const timelineEstimate =
    effortEstimate === 'low' ? '3-6 months' :
    effortEstimate === 'medium' ? '6-12 months' : '12-24 months';

  return { missingTemplates, missingObjectives, missingTypes, effortEstimate, timelineEstimate };
}

/**
 * Prioritise suggested controls and assign implementation phases.
 */
export function prioritiseSuggestions(
  templates: ControlTemplate[],
  riskPriority: 'HIGH' | 'MEDIUM' | 'LOWER'
): SuggestedControl[] {
  const priorityBoost = riskPriority === 'HIGH' ? 3 : riskPriority === 'MEDIUM' ? 2 : 1;

  return templates
    .map((template, idx) => {
      const typeScore = template.type === 'preventive' ? 2 : template.type === 'detective' ? 1 : 0;
      const effortScore = template.implementationEffort === 'low' ? 2 : template.implementationEffort === 'medium' ? 1 : 0;
      const score = priorityBoost + typeScore + effortScore + (template.priority <= 2 ? 1 : 0);

      let phase: number;
      if (template.implementationEffort === 'low' || template.enhancement) phase = 1;
      else if (template.implementationEffort === 'medium') phase = 2;
      else phase = 3;

      return {
        templateId: template.id,
        template,
        priority: idx + 1,
        implementationPhase: phase,
        reasoning: `${template.type} control addressing ${template.objectives.join(', ')} objectives`,
        fillsGap: `Missing ${template.type} control for ${template.objectives[0] || 'operations'}`,
        _score: score,
      };
    })
    .sort((a, b) => (b as any)._score - (a as any)._score)
    .map(({ _score, ...rest }, idx) => ({ ...rest, priority: idx + 1 }));
}

// ============================================================
// Helper to create ControlTemplate objects concisely
// ============================================================

function ct(
  id: string,
  riskType: string,
  level: MaturityLevel,
  title: string,
  description: string,
  type: 'preventive' | 'detective' | 'corrective',
  objectives: ('operations' | 'reporting' | 'financial' | 'compliance')[],
  defaultOwner: string,
  defaultFrequency: 'continuous' | 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annually' | 'ad_hoc',
  defaultEvidence: string,
  implementationEffort: 'low' | 'medium' | 'high',
  priority: number,
): ControlTemplate {
  return {
    id,
    riskType,
    maturityLevel: level,
    title,
    description,
    type,
    objectives,
    defaultOwner,
    defaultFrequency,
    defaultEvidence,
    applicability: 'always',
    implementationEffort,
    aiConfidence: level <= 2 ? 'very_high' : 'high',
    priority,
  };
}
