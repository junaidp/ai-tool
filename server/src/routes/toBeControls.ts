import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
export const toBeControlsRouter = Router();

// Generate to-be controls from gaps
toBeControlsRouter.post('/generate', async (req, res) => {
  try {
    const { processId, riskId } = req.body;

    const gaps = await prisma.gap.findMany({
      where: { processId, riskId },
      include: { stdControl: true }
    });

    const toBeControls = [];
    
    for (const gap of gaps) {
      if (gap.stdControl) {
        const toBe = await prisma.toBeControl.create({
          data: {
            processId,
            controlObjective: gap.stdControl.controlObjective,
            ownerRole: 'Process Owner',
            frequency: gap.stdControl.typicalFrequency,
            evidenceType: gap.stdControl.typicalEvidence,
            controlType: gap.stdControl.controlType,
            domainTag: gap.stdControl.domainTag,
            implementationGuidance: `Implement ${gap.stdControl.controlName} to address ${gap.gapType} gap`,
            implementationStatus: 'planned'
          }
        });

        // Link gap to to-be control
        await prisma.gap.update({
          where: { id: gap.id },
          data: { recommendedToBeControlId: toBe.id }
        });

        toBeControls.push(toBe);
      }
    }

    res.json({ controls: toBeControls, count: toBeControls.length });
  } catch (error) {
    console.error('Failed to generate to-be controls:', error);
    res.status(500).json({ error: 'Failed to generate controls' });
  }
});

// Get to-be controls for a process
toBeControlsRouter.get('/process/:processId', async (req, res) => {
  try {
    const { processId } = req.params;
    
    const controls = await prisma.toBeControl.findMany({
      where: { processId }
    });

    res.json(controls);
  } catch (error) {
    console.error('Failed to fetch to-be controls:', error);
    res.status(500).json({ error: 'Failed to fetch controls' });
  }
});

// Update to-be control
toBeControlsRouter.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;

    const control = await prisma.toBeControl.update({
      where: { id },
      data
    });

    res.json(control);
  } catch (error) {
    console.error('Failed to update control:', error);
    res.status(500).json({ error: 'Failed to update control' });
  }
});
