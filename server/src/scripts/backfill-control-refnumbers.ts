import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function backfillControlRefNumbers() {
  console.log('Starting backfill of control reference numbers...');

  try {
    // Get all unique risk IDs from Section2Control
    const groupedByRisk = await prisma.section2Control.groupBy({
      by: ['riskId'],
      _count: true
    });

    console.log(`Found ${groupedByRisk.length} risks with controls`);

    for (const group of groupedByRisk) {
      // Get all controls for this risk
      const controls = await prisma.section2Control.findMany({
        where: { riskId: group.riskId },
        orderBy: { createdAt: 'asc' }
      });

      console.log(`\nRisk ID: ${group.riskId}`);
      console.log(`  Found ${controls.length} controls`);

      // Update each control with a reference number if it doesn't have one
      let refNumber = 1;
      for (const control of controls) {
        if (!control.refNumber) {
          const newRefNumber = `CTRL-${String(refNumber).padStart(3, '0')}`;
          await prisma.section2Control.update({
            where: { id: control.id },
            data: { refNumber: newRefNumber }
          });
          console.log(`  ✓ Updated "${control.title}" with ${newRefNumber}`);
        } else {
          console.log(`  - "${control.title}" already has ${control.refNumber}`);
        }
        refNumber++;
      }
    }

    console.log('\n✅ Backfill completed successfully!');
  } catch (error) {
    console.error('❌ Error during backfill:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

backfillControlRefNumbers()
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
