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
    
    const seen = new Set<string>();
    const deduplicated = formatted.filter(risk => {
      const key = risk.riskTitle.toLowerCase().trim();
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
    
    res.json(deduplicated);
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
    
    // Delete related records first to avoid foreign key constraint errors
    await prisma.$transaction([
      // Delete related risk process links
      prisma.riskProcessLink.deleteMany({ where: { riskId: id } }),
      // Delete related gaps
      prisma.gap.deleteMany({ where: { riskId: id } }),
      // Delete related risk control links
      prisma.riskControlLink.deleteMany({ where: { riskId: id } }),
      // Delete related Section2Controls (Material Controls Workflow data)
      prisma.section2Control.deleteMany({ where: { riskId: id } }),
      // Finally delete the principal risk itself
      prisma.principalRisk.delete({ where: { id } })
    ]);
    
    res.json({ success: true });
  } catch (error) {
    console.error('Failed to delete principal risk:', error);
    res.status(500).json({ error: 'Failed to delete principal risk' });
  }
});
