import { Router } from 'express';
import prisma from '../db';

export const effectivenessCriteriaRouter = Router();

effectivenessCriteriaRouter.get('/', async (req, res) => {
  try {
    const criteria = await prisma.effectivenessCriteria.findMany({
      orderBy: { createdAt: 'desc' },
    });
    
    const formatted = criteria.map(c => ({
      ...c,
      evidenceType: JSON.parse(c.evidenceType),
    }));
    
    res.json(formatted);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch effectiveness criteria' });
  }
});

effectivenessCriteriaRouter.post('/', async (req, res) => {
  try {
    const data = req.body;
    const criteria = await prisma.effectivenessCriteria.create({
      data: {
        ...data,
        evidenceType: JSON.stringify(data.evidenceType),
      },
    });
    res.json(criteria);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create effectiveness criteria' });
  }
});

effectivenessCriteriaRouter.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    
    const updateData: any = { ...data };
    if (data.evidenceType) {
      updateData.evidenceType = JSON.stringify(data.evidenceType);
    }
    
    const criteria = await prisma.effectivenessCriteria.update({
      where: { id },
      data: updateData,
    });
    res.json(criteria);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update effectiveness criteria' });
  }
});

effectivenessCriteriaRouter.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.effectivenessCriteria.delete({ where: { id } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete effectiveness criteria' });
  }
});
