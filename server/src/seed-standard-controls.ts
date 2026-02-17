import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const standardControls = [
  // OPERATIONS CONTROLS
  {
    controlName: 'Segregation of Duties - Transaction Initiation and Approval',
    controlObjective: 'Prevent unauthorized transactions by ensuring different individuals initiate and approve transactions',
    controlType: 'preventive',
    domainTag: 'ops',
    typicalFrequency: 'continuous',
    typicalEvidence: 'System access logs, approval workflows, user role matrices',
    applicabilityRules: JSON.stringify({ maturityProfile: ['erp-enabled', 'automated'] })
  },
  {
    controlName: 'Access Control - Logical Access to Critical Systems',
    controlObjective: 'Ensure only authorized personnel have access to critical systems and data',
    controlType: 'preventive',
    domainTag: 'ops',
    typicalFrequency: 'continuous',
    typicalEvidence: 'Access control lists, user access reviews, provisioning/de-provisioning logs',
    applicabilityRules: JSON.stringify({ always: true })
  },
  {
    controlName: 'Change Management - System Configuration Changes',
    controlObjective: 'Ensure all system changes are authorized, tested, and documented',
    controlType: 'preventive',
    domainTag: 'ops',
    typicalFrequency: 'per change',
    typicalEvidence: 'Change tickets, approval records, test results, deployment logs',
    applicabilityRules: JSON.stringify({ maturityProfile: ['erp-enabled', 'automated'] })
  },
  {
    controlName: 'Data Backup and Recovery',
    controlObjective: 'Ensure critical data can be recovered in case of system failure or data loss',
    controlType: 'corrective',
    domainTag: 'ops',
    typicalFrequency: 'daily',
    typicalEvidence: 'Backup logs, recovery test results, backup retention policies',
    applicabilityRules: JSON.stringify({ always: true })
  },
  {
    controlName: 'Reconciliation - Key Account Balances',
    controlObjective: 'Detect and correct discrepancies between systems and source data',
    controlType: 'detective',
    domainTag: 'ops',
    typicalFrequency: 'monthly',
    typicalEvidence: 'Reconciliation workpapers, variance analysis, sign-offs',
    applicabilityRules: JSON.stringify({ always: true })
  },
  {
    controlName: 'Approval Workflow - High-Value Transactions',
    controlObjective: 'Ensure high-value or high-risk transactions receive appropriate management approval',
    controlType: 'preventive',
    domainTag: 'ops',
    typicalFrequency: 'per transaction',
    typicalEvidence: 'Approval records, delegation of authority matrix, transaction logs',
    applicabilityRules: JSON.stringify({ always: true })
  },
  {
    controlName: 'Monitoring - Exception Reports Review',
    controlObjective: 'Identify and investigate unusual transactions or system exceptions',
    controlType: 'detective',
    domainTag: 'ops',
    typicalFrequency: 'weekly',
    typicalEvidence: 'Exception reports, investigation notes, resolution tracking',
    applicabilityRules: JSON.stringify({ always: true })
  },
  {
    controlName: 'Physical Security - Access to Data Centers',
    controlObjective: 'Prevent unauthorized physical access to critical infrastructure',
    controlType: 'preventive',
    domainTag: 'ops',
    typicalFrequency: 'continuous',
    typicalEvidence: 'Badge access logs, visitor logs, security camera footage',
    applicabilityRules: JSON.stringify({ maturityProfile: ['centralized'] })
  },

  // REPORTING CONTROLS
  {
    controlName: 'Data Validation - Input Controls',
    controlObjective: 'Ensure data entered into systems is complete, accurate, and valid',
    controlType: 'preventive',
    domainTag: 'reporting',
    typicalFrequency: 'continuous',
    typicalEvidence: 'System validation rules, error logs, data quality reports',
    applicabilityRules: JSON.stringify({ always: true })
  },
  {
    controlName: 'Management Review - Financial Reports',
    controlObjective: 'Ensure financial reports are reviewed for accuracy and completeness before distribution',
    controlType: 'detective',
    domainTag: 'reporting',
    typicalFrequency: 'monthly',
    typicalEvidence: 'Review sign-offs, variance analysis, management comments',
    applicabilityRules: JSON.stringify({ always: true })
  },
  {
    controlName: 'Cut-off Procedures - Period-End Transactions',
    controlObjective: 'Ensure transactions are recorded in the correct accounting period',
    controlType: 'preventive',
    domainTag: 'reporting',
    typicalFrequency: 'monthly',
    typicalEvidence: 'Cut-off checklists, transaction date analysis, period-end procedures',
    applicabilityRules: JSON.stringify({ always: true })
  },
  {
    controlName: 'Disclosure Review - Financial Statement Footnotes',
    controlObjective: 'Ensure all required disclosures are complete and accurate',
    controlType: 'detective',
    domainTag: 'reporting',
    typicalFrequency: 'quarterly',
    typicalEvidence: 'Disclosure checklists, review memos, management sign-offs',
    applicabilityRules: JSON.stringify({ regulated: true })
  },
  {
    controlName: 'Journal Entry Review - Non-Standard Entries',
    controlObjective: 'Detect and prevent inappropriate or unauthorized journal entries',
    controlType: 'detective',
    domainTag: 'reporting',
    typicalFrequency: 'monthly',
    typicalEvidence: 'Journal entry reports, review notes, approval records',
    applicabilityRules: JSON.stringify({ always: true })
  },
  {
    controlName: 'System-Generated Reports Validation',
    controlObjective: 'Ensure automated reports produce accurate and complete information',
    controlType: 'detective',
    domainTag: 'reporting',
    typicalFrequency: 'quarterly',
    typicalEvidence: 'Report validation tests, reconciliations to source data, sign-offs',
    applicabilityRules: JSON.stringify({ maturityProfile: ['automated', 'erp-enabled'] })
  },

  // FINANCIAL CONTROLS
  {
    controlName: 'Cash Management - Bank Reconciliations',
    controlObjective: 'Ensure bank balances agree with general ledger and identify discrepancies',
    controlType: 'detective',
    domainTag: 'financial',
    typicalFrequency: 'monthly',
    typicalEvidence: 'Bank reconciliations, variance explanations, preparer/reviewer sign-offs',
    applicabilityRules: JSON.stringify({ always: true })
  },
  {
    controlName: 'Fixed Assets - Physical Verification',
    controlObjective: 'Verify existence and condition of fixed assets',
    controlType: 'detective',
    domainTag: 'financial',
    typicalFrequency: 'annual',
    typicalEvidence: 'Physical count sheets, variance reports, asset register updates',
    applicabilityRules: JSON.stringify({ always: true })
  },
  {
    controlName: 'Revenue Recognition - Contract Review',
    controlObjective: 'Ensure revenue is recognized in accordance with accounting standards',
    controlType: 'preventive',
    domainTag: 'financial',
    typicalFrequency: 'per contract',
    typicalEvidence: 'Contract review memos, revenue recognition analysis, accounting policy documentation',
    applicabilityRules: JSON.stringify({ regulated: true })
  },
  {
    controlName: 'Accounts Payable - Three-Way Match',
    controlObjective: 'Prevent payment for goods/services not received or authorized',
    controlType: 'preventive',
    domainTag: 'financial',
    typicalFrequency: 'per invoice',
    typicalEvidence: 'Purchase orders, receiving reports, invoices, match exception reports',
    applicabilityRules: JSON.stringify({ always: true })
  },
  {
    controlName: 'Inventory - Cycle Counts',
    controlObjective: 'Ensure inventory records are accurate and identify shrinkage',
    controlType: 'detective',
    domainTag: 'financial',
    typicalFrequency: 'monthly',
    typicalEvidence: 'Cycle count sheets, variance reports, inventory adjustments',
    applicabilityRules: JSON.stringify({ inventoryHeavy: true })
  },
  {
    controlName: 'Payroll - Time and Attendance Approval',
    controlObjective: 'Ensure employees are paid only for time worked and approved',
    controlType: 'preventive',
    domainTag: 'financial',
    typicalFrequency: 'per pay period',
    typicalEvidence: 'Timesheet approvals, payroll registers, exception reports',
    applicabilityRules: JSON.stringify({ always: true })
  },
  {
    controlName: 'Expense Reimbursement - Policy Compliance Review',
    controlObjective: 'Ensure expense reimbursements comply with company policy',
    controlType: 'preventive',
    domainTag: 'financial',
    typicalFrequency: 'per claim',
    typicalEvidence: 'Expense reports, receipts, approval records, policy documentation',
    applicabilityRules: JSON.stringify({ always: true })
  },

  // COMPLIANCE CONTROLS
  {
    controlName: 'Regulatory Monitoring - Changes in Laws and Regulations',
    controlObjective: 'Ensure organization is aware of and responds to regulatory changes',
    controlType: 'detective',
    domainTag: 'compliance',
    typicalFrequency: 'quarterly',
    typicalEvidence: 'Regulatory update summaries, impact assessments, action plans',
    applicabilityRules: JSON.stringify({ regulated: true })
  },
  {
    controlName: 'Training - Compliance and Ethics',
    controlObjective: 'Ensure employees understand compliance requirements and ethical standards',
    controlType: 'preventive',
    domainTag: 'compliance',
    typicalFrequency: 'annual',
    typicalEvidence: 'Training records, completion certificates, training materials, assessments',
    applicabilityRules: JSON.stringify({ always: true })
  },
  {
    controlName: 'Policy Attestation - Code of Conduct',
    controlObjective: 'Ensure employees acknowledge and commit to following company policies',
    controlType: 'preventive',
    domainTag: 'compliance',
    typicalFrequency: 'annual',
    typicalEvidence: 'Attestation records, policy documents, acknowledgment forms',
    applicabilityRules: JSON.stringify({ always: true })
  },
  {
    controlName: 'Whistleblower Hotline - Investigation Process',
    controlObjective: 'Provide mechanism for reporting concerns and ensure proper investigation',
    controlType: 'detective',
    domainTag: 'compliance',
    typicalFrequency: 'continuous',
    typicalEvidence: 'Hotline reports, investigation files, resolution tracking',
    applicabilityRules: JSON.stringify({ regulated: true })
  },
  {
    controlName: 'Vendor Due Diligence - Third-Party Risk Assessment',
    controlObjective: 'Ensure third parties meet compliance and risk standards',
    controlType: 'preventive',
    domainTag: 'compliance',
    typicalFrequency: 'per vendor',
    typicalEvidence: 'Due diligence questionnaires, risk assessments, approval records',
    applicabilityRules: JSON.stringify({ regulated: true })
  },
  {
    controlName: 'Data Privacy - Personal Data Protection',
    controlObjective: 'Ensure personal data is collected, processed, and stored in compliance with privacy laws',
    controlType: 'preventive',
    domainTag: 'compliance',
    typicalFrequency: 'continuous',
    typicalEvidence: 'Privacy policies, consent records, data processing agreements, privacy impact assessments',
    applicabilityRules: JSON.stringify({ dataIntensive: true })
  },
  {
    controlName: 'Conflict of Interest - Disclosure and Review',
    controlObjective: 'Identify and manage potential conflicts of interest',
    controlType: 'detective',
    domainTag: 'compliance',
    typicalFrequency: 'annual',
    typicalEvidence: 'Disclosure forms, review memos, mitigation plans',
    applicabilityRules: JSON.stringify({ always: true })
  },

  // IT GENERAL CONTROLS
  {
    controlName: 'Password Policy - Complexity and Rotation',
    controlObjective: 'Ensure strong authentication practices to prevent unauthorized access',
    controlType: 'preventive',
    domainTag: 'ops',
    typicalFrequency: 'continuous',
    typicalEvidence: 'Password policy documentation, system configuration, compliance reports',
    applicabilityRules: JSON.stringify({ always: true })
  },
  {
    controlName: 'Incident Response - Security Incident Management',
    controlObjective: 'Ensure security incidents are detected, responded to, and resolved promptly',
    controlType: 'corrective',
    domainTag: 'ops',
    typicalFrequency: 'per incident',
    typicalEvidence: 'Incident tickets, response procedures, post-incident reviews',
    applicabilityRules: JSON.stringify({ always: true })
  },
  {
    controlName: 'Vulnerability Management - Patch Management',
    controlObjective: 'Ensure systems are protected against known vulnerabilities',
    controlType: 'preventive',
    domainTag: 'ops',
    typicalFrequency: 'monthly',
    typicalEvidence: 'Vulnerability scan reports, patch deployment logs, exception tracking',
    applicabilityRules: JSON.stringify({ always: true })
  },
  {
    controlName: 'Business Continuity - Disaster Recovery Testing',
    controlObjective: 'Ensure critical systems can be recovered within acceptable timeframes',
    controlType: 'corrective',
    domainTag: 'ops',
    typicalFrequency: 'annual',
    typicalEvidence: 'DR test plans, test results, lessons learned, plan updates',
    applicabilityRules: JSON.stringify({ high_risk: true })
  }
];

async function seed() {
  console.log('🌱 Seeding standard controls...');

  for (const control of standardControls) {
    await prisma.standardControl.create({
      data: control
    });
  }

  console.log(`✅ Seeded ${standardControls.length} standard controls`);
  console.log('\nBreakdown:');
  console.log(`  - Operations: ${standardControls.filter(c => c.domainTag === 'ops').length}`);
  console.log(`  - Reporting: ${standardControls.filter(c => c.domainTag === 'reporting').length}`);
  console.log(`  - Financial: ${standardControls.filter(c => c.domainTag === 'financial').length}`);
  console.log(`  - Compliance: ${standardControls.filter(c => c.domainTag === 'compliance').length}`);
}

seed()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
