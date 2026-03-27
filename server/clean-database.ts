import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanDatabase() {
  console.log('🧹 Starting database cleanup...\n');

  try {
    // Delete in order to respect foreign key constraints
    console.log('Deleting IntegrationException...');
    await prisma.integrationException.deleteMany({});
    
    console.log('Deleting IntegrationSignal...');
    await prisma.integrationSignal.deleteMany({});
    
    console.log('Deleting BoardDeclaration...');
    await prisma.boardDeclaration.deleteMany({});
    
    console.log('Deleting Deficiency...');
    await prisma.deficiency.deleteMany({});
    
    console.log('Deleting FrameworkAssessment...');
    await prisma.frameworkAssessment.deleteMany({});
    
    console.log('Deleting ControlTestingResult...');
    await prisma.controlTestingResult.deleteMany({});
    
    console.log('Deleting ControlAssignment...');
    await prisma.controlAssignment.deleteMany({});
    
    console.log('Deleting Version...');
    await prisma.version.deleteMany({});
    
    console.log('Deleting Notification...');
    await prisma.notification.deleteMany({});
    
    console.log('Deleting Comment...');
    await prisma.comment.deleteMany({});
    
    console.log('Deleting WorkflowState...');
    await prisma.workflowState.deleteMany({});
    
    console.log('Deleting Section2RiskCompletion...');
    await prisma.section2RiskCompletion.deleteMany({});
    
    console.log('Deleting Section2ImplementationPlan...');
    await prisma.section2ImplementationPlan.deleteMany({});
    
    console.log('Deleting Section2GapAnalysis...');
    await prisma.section2GapAnalysis.deleteMany({});
    
    console.log('Deleting Section2Control...');
    await prisma.section2Control.deleteMany({});
    
    console.log('Deleting MaturitySelection...');
    await prisma.maturitySelection.deleteMany({});
    
    console.log('Deleting CustomFramework...');
    await prisma.customFramework.deleteMany({});
    
    console.log('Deleting FrameworkDocument...');
    await prisma.frameworkDocument.deleteMany({});
    
    console.log('Deleting RiskControlLink...');
    await prisma.riskControlLink.deleteMany({});
    
    console.log('Deleting Gap...');
    await prisma.gap.deleteMany({});
    
    console.log('Deleting ToBeControl...');
    await prisma.toBeControl.deleteMany({});
    
    console.log('Deleting AsIsControl...');
    await prisma.asIsControl.deleteMany({});
    
    console.log('Deleting StandardControl...');
    await prisma.standardControl.deleteMany({});
    
    console.log('Deleting ProcessMaturityAssessment...');
    await prisma.processMaturityAssessment.deleteMany({});
    
    console.log('Deleting RiskProcessLink...');
    await prisma.riskProcessLink.deleteMany({});
    
    console.log('Deleting Process...');
    await prisma.process.deleteMany({});
    
    console.log('Deleting PrincipalRisk...');
    await prisma.principalRisk.deleteMany({});
    
    console.log('Deleting AuditLog...');
    await prisma.auditLog.deleteMany({});
    
    console.log('Deleting ApprovalWorkflow...');
    await prisma.approvalWorkflow.deleteMany({});
    
    console.log('Deleting ControlGap...');
    await prisma.controlGap.deleteMany({});
    
    console.log('Deleting IntegrationStatus...');
    await prisma.integrationStatus.deleteMany({});
    
    console.log('Deleting Issue...');
    await prisma.issue.deleteMany({});
    
    console.log('Deleting TestPlan...');
    await prisma.testPlan.deleteMany({});
    
    console.log('Deleting Control...');
    await prisma.control.deleteMany({});
    
    console.log('Deleting Risk...');
    await prisma.risk.deleteMany({});
    
    console.log('Deleting MaterialControl...');
    await prisma.materialControl.deleteMany({});
    
    console.log('Deleting FrameworkComponent...');
    await prisma.frameworkComponent.deleteMany({});
    
    console.log('Deleting EffectivenessCriteria...');
    await prisma.effectivenessCriteria.deleteMany({});
    
    console.log('Deleting EffectivenessCriteriaConfig...');
    await prisma.effectivenessCriteriaConfig.deleteMany({});
    
    console.log('Deleting User...');
    await prisma.user.deleteMany({});
    
    console.log('Deleting Company...');
    await prisma.company.deleteMany({});

    console.log('\n✅ Database cleaned successfully!');
    console.log('All data has been deleted from all tables.\n');
  } catch (error) {
    console.error('❌ Error cleaning database:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

cleanDatabase()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
