import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
export const riskProcessLinksRouter = Router();

// Link risk to process
riskProcessLinksRouter.post('/', async (req, res) => {
  try {
    const { riskId, processId, relevance, rationale } = req.body;

    const link = await prisma.riskProcessLink.create({
      data: {
        riskId,
        processId,
        relevance,
        rationale
      }
    });

    res.json(link);
  } catch (error) {
    console.error('Failed to create risk-process link:', error);
    res.status(500).json({ error: 'Failed to create link' });
  }
});

// Get links for a risk
riskProcessLinksRouter.get('/risk/:riskId', async (req, res) => {
  try {
    const { riskId } = req.params;
    
    const links = await prisma.riskProcessLink.findMany({
      where: { riskId },
      include: { process: true }
    });

    res.json(links);
  } catch (error) {
    console.error('Failed to fetch links:', error);
    res.status(500).json({ error: 'Failed to fetch links' });
  }
});

// Delete link
riskProcessLinksRouter.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.riskProcessLink.delete({ where: { id } });
    res.json({ success: true });
  } catch (error) {
    console.error('Failed to delete link:', error);
    res.status(500).json({ error: 'Failed to delete link' });
  }
});
