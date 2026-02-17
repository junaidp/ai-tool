import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
export const principalRisksRouter = Router();

// Get all principal risks
principalRisksRouter.get('/', async (req, res) => {
  try {
    const risks = await prisma.principalRisk.findMany({
      orderBy: { createdAt: 'desc' }
    });
    
    const formatted = risks.map(risk => ({
      ...risk,
      domainTags: JSON.parse(risk.domainTags),
      threatLensTags: JSON.parse(risk.threatLensTags)
    }));
    
    res.json(formatted);
  } catch (error) {
    console.error('Failed to fetch principal risks:', error);
    res.status(500).json({ error: 'Failed to fetch principal risks' });
  }
});

// Create principal risk
principalRisksRouter.post('/', async (req, res) => {
  try {
    const { riskTitle, riskStatement, domainTags, threatLensTags, riskOwner } = req.body;

    const risk = await prisma.principalRisk.create({
      data: {
        riskTitle,
        riskStatement,
        domainTags: JSON.stringify(domainTags || []),
        threatLensTags: JSON.stringify(threatLensTags || []),
        riskOwner
      }
    });

    res.json({
      ...risk,
      domainTags: JSON.parse(risk.domainTags),
      threatLensTags: JSON.parse(risk.threatLensTags)
    });
  } catch (error) {
    console.error('Failed to create principal risk:', error);
    res.status(500).json({ error: 'Failed to create principal risk' });
  }
});

// Update principal risk
principalRisksRouter.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { riskTitle, riskStatement, domainTags, threatLensTags, riskOwner } = req.body;

    const risk = await prisma.principalRisk.update({
      where: { id },
      data: {
        riskTitle,
        riskStatement,
        domainTags: JSON.stringify(domainTags || []),
        threatLensTags: JSON.stringify(threatLensTags || []),
        riskOwner
      }
    });

    res.json({
      ...risk,
      domainTags: JSON.parse(risk.domainTags),
      threatLensTags: JSON.parse(risk.threatLensTags)
    });
  } catch (error) {
    console.error('Failed to update principal risk:', error);
    res.status(500).json({ error: 'Failed to update principal risk' });
  }
});

// Delete principal risk
principalRisksRouter.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.principalRisk.delete({ where: { id } });
    res.json({ success: true });
  } catch (error) {
    console.error('Failed to delete principal risk:', error);
    res.status(500).json({ error: 'Failed to delete principal risk' });
  }
});
