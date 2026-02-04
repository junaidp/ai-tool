import { Router } from 'express';
import prisma from '../db';

export const controlsRouter = Router();

controlsRouter.get('/', async (req, res) => {
  try {
    const controls = await prisma.control.findMany({
      orderBy: { createdAt: 'desc' },
    });
    
    const formatted = controls.map(c => ({
      ...c,
      linkedRisks: JSON.parse(c.linkedRisks),
    }));
    
    res.json(formatted);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch controls' });
  }
});

controlsRouter.post('/', async (req, res) => {
  try {
    const data = req.body;
    const control = await prisma.control.create({
      data: {
        ...data,
        linkedRisks: JSON.stringify(data.linkedRisks || []),
      },
    });
    res.json(control);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create control' });
  }
});
