import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
export const gapsRouter = Router();

// Analyze gaps for a process
gapsRouter.post('/analyze', async (req, res) => {
  try {
    const { processId, riskId } = req.body;

    // Get process maturity assessment
    const assessment = await prisma.processMaturityAssessment.findFirst({
      where: { processId },
      orderBy: { assessmentDate: 'desc' }
    });

    if (!assessment) {
      return res.status(400).json({ error: 'No maturity assessment found' });
    }

    // Get applicable standard controls based on maturity profile
    const standardControls = await prisma.standardControl.findMany();
    
    // Get existing as-is controls for this process
    const asIsControls = await prisma.asIsControl.findMany({
      where: { processId }
    });

    // Identify gaps
    const gaps = [];
    for (const stdControl of standardControls) {
      const hasAsIs = asIsControls.some(asIs => 
        asIs.mappedStdControlId === stdControl.id && asIs.status === 'exists'
      );

      if (!hasAsIs) {
        const gap = await prisma.gap.create({
          data: {
            processId,
            riskId,
            stdControlId: stdControl.id,
            gapType: 'missing'
          }
        });
        gaps.push(gap);
      }
    }

    res.json({ gaps, count: gaps.length });
  } catch (error) {
    console.error('Failed to analyze gaps:', error);
    res.status(500).json({ error: 'Failed to analyze gaps' });
  }
});

// Get gaps for a process
gapsRouter.get('/process/:processId', async (req, res) => {
  try {
    const { processId } = req.params;
    
    const gaps = await prisma.gap.findMany({
      where: { processId },
      include: {
        stdControl: true,
        toBeControl: true
      }
    });

    res.json(gaps);
  } catch (error) {
    console.error('Failed to fetch gaps:', error);
    res.status(500).json({ error: 'Failed to fetch gaps' });
  }
});
