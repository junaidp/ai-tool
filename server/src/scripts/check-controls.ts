import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkControls() {
  console.log('Checking Section2Control table...');

  try {
    const controls = await prisma.section2Control.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' }
    });

    console.log(`\nFound ${controls.length} controls in Section2Control table`);
    
    if (controls.length > 0) {
      console.log('\nSample controls:');
      controls.forEach((control, idx) => {
        console.log(`\n${idx + 1}. ${control.title}`);
        console.log(`   Risk ID: ${control.riskId}`);
        console.log(`   Ref Number: ${control.refNumber || 'NOT SET'}`);
        console.log(`   Created: ${control.createdAt}`);
      });
    }

    // Check total count
    const totalCount = await prisma.section2Control.count();
    console.log(`\n\nTotal Section2Controls: ${totalCount}`);

    // Group by riskId
    const groupedByRisk = await prisma.section2Control.groupBy({
      by: ['riskId'],
      _count: true
    });

    console.log(`\nControls grouped by risk:`);
    groupedByRisk.forEach(group => {
      console.log(`  Risk ${group.riskId}: ${group._count} controls`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkControls();
