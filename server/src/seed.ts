import prisma from './db';
import bcrypt from 'bcryptjs';

async function main() {
  console.log('🌱 Seeding database...');

  // Clear existing data
  console.log('🧹 Clearing existing data...');
  await prisma.approvalWorkflow.deleteMany();
  await prisma.controlGap.deleteMany();
  await prisma.integrationStatus.deleteMany();
  await prisma.issue.deleteMany();
  await prisma.testPlan.deleteMany();
  await prisma.materialControl.deleteMany();
  await prisma.control.deleteMany();
  await prisma.risk.deleteMany();
  await prisma.frameworkComponent.deleteMany();
  await prisma.effectivenessCriteria.deleteMany();
  await prisma.user.deleteMany();
  console.log('✅ Cleared existing data');

  const hashedPassword = await bcrypt.hash('demo123', 10);
  
  // Create 5 demo users with different roles
  const demoUsers = [
    {
      email: 'board@company.com',
      name: 'Sarah Thompson',
      role: 'board',
    },
    {
      email: 'owner@company.com',
      name: 'Michael Chen',
      role: 'control_owner',
    },
    {
      email: 'risk@company.com',
      name: 'David Martinez',
      role: 'risk_compliance',
    },
    {
      email: 'audit@company.com',
      name: 'Emily Johnson',
      role: 'internal_audit',
    },
    {
      email: 'admin@company.com',
      name: 'Rachel Adams',
      role: 'framework_admin',
    },
  ];

  for (const userData of demoUsers) {
    const user = await prisma.user.upsert({
      where: { email: userData.email },
      update: {},
      create: {
        ...userData,
        password: hashedPassword,
      },
    });
    console.log('✅ Created user:', user.email, '-', user.name, `(${user.role})`);
  }

  await prisma.effectivenessCriteria.createMany({
    data: [
      {
        dimension: 'Risk Coverage',
        criteria: 'Objective and Principal Risk Coverage',
        threshold: 'The framework consistently identifies and maintains a clear view of the principal risks that could prevent achievement of strategic and operational objectives across financial, operational, reporting, and compliance domains. Risks are linked to objectives, owned, and reviewed through governance.',
        evidenceType: JSON.stringify(['Risk register', 'Risk-objective mappings', 'Governance minutes']),
        frequency: 'quarterly',
        status: 'approved',
        approvedBy: 'Board Risk Committee',
        approvedDate: new Date('2024-01-15'),
      },
      {
        dimension: 'Control Definition',
        criteria: 'Material Control Definition and Ownership',
        threshold: 'For principal risks, the framework defines material controls that are proportionate and clear in terms of control objective, design, owner, frequency, and evidence. Accountability is clear across the lines of defence, including where controls are automated or outsourced.',
        evidenceType: JSON.stringify(['Control documentation', 'RACI matrices', 'Three lines of defence model']),
        frequency: 'annual',
        status: 'approved',
        approvedBy: 'Board Risk Committee',
        approvedDate: new Date('2024-01-15'),
      },
      {
        dimension: 'Monitoring',
        criteria: 'Operation, Monitoring, and Timely Escalation',
        threshold: 'The framework ensures controls operate as intended, establishes monitoring to detect exceptions, and defines clear escalation triggers and routes so significant issues are promptly raised to management and, where needed, the Audit Committee/Board.',
        evidenceType: JSON.stringify(['Monitoring dashboards', 'Exception reports', 'Escalation logs']),
        frequency: 'continuous',
        status: 'approved',
        approvedBy: 'Board Risk Committee',
        approvedDate: new Date('2024-01-15'),
      },
      {
        dimension: 'Remediation',
        criteria: 'Remediation, Retesting, and Prevention of Recurrence',
        threshold: 'The framework ensures issues are triaged, assigned owners, remediated through time-bound action plans, and validated/retested. Root causes are addressed to reduce repeated control failures, recurring incidents, reporting errors, and non-compliance.',
        evidenceType: JSON.stringify(['Action plans', 'Retest results', 'Root cause analysis']),
        frequency: 'quarterly',
        status: 'approved',
        approvedBy: 'Board Risk Committee',
        approvedDate: new Date('2024-01-15'),
      },
      {
        dimension: 'Integration',
        criteria: 'Decision Integration and Adaptation to Change',
        threshold: 'The framework is embedded in key decisions and change activities (projects, investments, outsourcing, system changes, new markets) so risk/control impacts are considered upfront. It also adapts through defined triggers and periodic reviews to remain fit for purpose as business conditions change.',
        evidenceType: JSON.stringify(['Change approval records', 'Project risk assessments', 'Framework review reports']),
        frequency: 'annual',
        status: 'approved',
        approvedBy: 'Board Risk Committee',
        approvedDate: new Date('2024-01-15'),
      },
    ],
  });

  console.log('✅ Created effectiveness criteria');

  await prisma.frameworkComponent.createMany({
    data: [
      {
        type: 'governance',
        name: 'Risk Committee Structure',
        description: 'Board-level and executive committees with clear decision rights',
        owner: 'Chief Risk Officer',
        status: 'approved',
        lastReviewed: new Date('2024-01-10'),
      },
      {
        type: 'risk_taxonomy',
        name: 'Enterprise Risk Taxonomy',
        description: 'Standardized risk categories aligned to strategic objectives',
        owner: 'Risk Management Team',
        status: 'approved',
        lastReviewed: new Date('2024-01-05'),
      },
      {
        type: 'risk_appetite',
        name: 'Risk Appetite Framework',
        description: 'Board-approved risk appetite statements with tolerances and triggers',
        owner: 'Chief Risk Officer',
        status: 'approved',
        lastReviewed: new Date('2023-12-20'),
      },
      {
        type: 'three_lines',
        name: 'Three Lines of Defence Model',
        description: 'RACI matrix and assurance mapping across business, risk, and audit',
        owner: 'Chief Audit Executive',
        status: 'in_review',
      },
    ],
  });

  console.log('✅ Created framework components');

  const materialControls = await prisma.materialControl.createMany({
    data: [
      {
        name: 'Segregation of Duties - Payments',
        description: 'Separation between payment initiator and approver roles',
        materialityScore: 92,
        rationale: 'Critical for fraud prevention; regulatory requirement; high financial exposure',
        owner: 'Finance Director',
        evidenceSource: 'ERP system logs',
        testingFrequency: 'Quarterly',
        dependencies: JSON.stringify(['ERP', 'IAM']),
        effectiveness: 'effective',
        lastTested: new Date('2024-01-20'),
      },
      {
        name: 'Access Control - Financial Systems',
        description: 'Role-based access controls for financial reporting systems',
        materialityScore: 88,
        rationale: 'Material to financial statement integrity; SOX requirement',
        owner: 'IT Security Manager',
        evidenceSource: 'Azure AD logs',
        testingFrequency: 'Quarterly',
        dependencies: JSON.stringify(['Azure AD', 'ERP']),
        effectiveness: 'effective',
        lastTested: new Date('2024-01-18'),
      },
      {
        name: 'Vendor Due Diligence',
        description: 'Risk assessment before vendor onboarding',
        materialityScore: 76,
        rationale: 'Prevents supply chain disruption; compliance requirement',
        owner: 'Procurement Head',
        evidenceSource: 'Vendor management system',
        testingFrequency: 'Annual',
        dependencies: JSON.stringify(['Vendor Portal']),
        effectiveness: 'partially_effective',
        lastTested: new Date('2023-11-15'),
      },
      {
        name: 'Data Backup & Recovery',
        description: 'Automated daily backups with quarterly recovery testing',
        materialityScore: 85,
        rationale: 'Business continuity; data protection regulation',
        owner: 'IT Operations Manager',
        evidenceSource: 'Backup logs',
        testingFrequency: 'Quarterly',
        dependencies: JSON.stringify(['Backup System']),
        effectiveness: 'effective',
        lastTested: new Date('2024-01-25'),
      },
    ],
  });

  console.log('✅ Created material controls');

  await prisma.integrationStatus.createMany({
    data: [
      {
        system: 'SAP ERP',
        status: 'connected',
        lastSync: new Date('2024-02-04T09:30:00'),
        signalsReceived: 15234,
        exceptionsRaised: 12,
      },
      {
        system: 'Azure Active Directory',
        status: 'connected',
        lastSync: new Date('2024-02-04T09:45:00'),
        signalsReceived: 8921,
        exceptionsRaised: 3,
      },
      {
        system: 'ServiceNow',
        status: 'connected',
        lastSync: new Date('2024-02-04T09:20:00'),
        signalsReceived: 4532,
        exceptionsRaised: 7,
      },
      {
        system: 'Vendor Portal',
        status: 'error',
        lastSync: new Date('2024-02-03T14:20:00'),
        signalsReceived: 0,
        exceptionsRaised: 0,
      },
    ],
  });

  console.log('✅ Created integrations');

  await prisma.controlGap.createMany({
    data: [
      {
        source: 'external',
        title: 'New GDPR Enforcement Guidance',
        description: 'EU regulator issued new guidance on data retention requiring enhanced controls',
        affectedControls: JSON.stringify(['mc-2']),
        riskTheme: 'Data Privacy',
        priority: 'high',
        proposedAction: 'Implement automated data retention policy enforcement',
        status: 'pending',
        identifiedDate: new Date('2024-01-28'),
      },
      {
        source: 'internal',
        title: 'Repeated Reconciliation Exceptions',
        description: 'Same account showing exceptions for 3 consecutive months',
        affectedControls: JSON.stringify(['c-2']),
        riskTheme: 'Financial Accuracy',
        priority: 'medium',
        proposedAction: 'Review and update reconciliation control; consider automation',
        status: 'in_review',
        identifiedDate: new Date('2024-01-20'),
      },
      {
        source: 'external',
        title: 'Industry Ransomware Trend',
        description: 'Increased ransomware attacks in sector; peer company impacted',
        affectedControls: JSON.stringify(['mc-4', 'c-3']),
        riskTheme: 'Cybersecurity',
        priority: 'critical',
        proposedAction: 'Enhance backup encryption; implement network segmentation',
        status: 'approved',
        identifiedDate: new Date('2024-02-01'),
      },
    ],
  });

  console.log('✅ Created control gaps');

  console.log('🎉 Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
