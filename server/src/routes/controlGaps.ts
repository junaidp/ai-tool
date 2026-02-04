import { Router } from 'express';
import prisma from '../db';

export const controlGapsRouter = Router();

controlGapsRouter.get('/', async (req, res) => {
  try {
    const gaps = await prisma.controlGap.findMany({
      orderBy: { identifiedDate: 'desc' },
    });
    
    const formatted = gaps.map(g => ({
      ...g,
      affectedControls: JSON.parse(g.affectedControls),
    }));
    
    res.json(formatted);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch control gaps' });
  }
});

controlGapsRouter.post('/', async (req, res) => {
  try {
    const data = req.body;
    const gap = await prisma.controlGap.create({
      data: {
        ...data,
        affectedControls: JSON.stringify(data.affectedControls || []),
        identifiedDate: new Date(data.identifiedDate),
      },
    });
    res.json(gap);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create control gap' });
  }
});

controlGapsRouter.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    
    const updateData: any = { ...data };
    if (data.affectedControls) {
      updateData.affectedControls = JSON.stringify(data.affectedControls);
    }
    if (data.identifiedDate) {
      updateData.identifiedDate = new Date(data.identifiedDate);
    }
    
    const gap = await prisma.controlGap.update({
      where: { id },
      data: updateData,
    });
    res.json(gap);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update control gap' });
  }
});
