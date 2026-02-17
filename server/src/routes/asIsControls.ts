import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
export const asIsControlsRouter = Router();

// Get as-is controls for a process
asIsControlsRouter.get('/process/:processId', async (req, res) => {
  try {
    const { processId } = req.params;
    
    const controls = await prisma.asIsControl.findMany({
      where: { processId },
      include: { mappedStdControl: true }
    });

    res.json(controls);
  } catch (error) {
    console.error('Failed to fetch as-is controls:', error);
    res.status(500).json({ error: 'Failed to fetch controls' });
  }
});

// Create as-is control
asIsControlsRouter.post('/', async (req, res) => {
  try {
    const { processId, controlName, controlObjective, controlType, domainTag, frequency, evidenceSource, owner, status, mappedStdControlId } = req.body;

    const control = await prisma.asIsControl.create({
      data: {
        processId,
        controlName,
        controlObjective,
        controlType,
        domainTag,
        frequency,
        evidenceSource,
        owner,
        status,
        mappedStdControlId
      }
    });

    res.json(control);
  } catch (error) {
    console.error('Failed to create as-is control:', error);
    res.status(500).json({ error: 'Failed to create control' });
  }
});

// Update as-is control
asIsControlsRouter.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;

    const control = await prisma.asIsControl.update({
      where: { id },
      data
    });

    res.json(control);
  } catch (error) {
    console.error('Failed to update control:', error);
    res.status(500).json({ error: 'Failed to update control' });
  }
});
