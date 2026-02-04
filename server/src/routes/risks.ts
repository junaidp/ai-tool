import { Router } from 'express';
import prisma from '../db';

export const risksRouter = Router();

risksRouter.get('/', async (req, res) => {
  try {
    const risks = await prisma.risk.findMany({
      orderBy: { lastAssessed: 'desc' },
    });
    
    const formatted = risks.map(r => ({
      ...r,
      linkedObjectives: JSON.parse(r.linkedObjectives),
      linkedControls: JSON.parse(r.linkedControls),
    }));
    
    res.json(formatted);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch risks' });
  }
});

risksRouter.post('/', async (req, res) => {
  try {
    const data = req.body;
    const risk = await prisma.risk.create({
      data: {
        ...data,
        linkedObjectives: JSON.stringify(data.linkedObjectives || []),
        linkedControls: JSON.stringify(data.linkedControls || []),
        lastAssessed: new Date(data.lastAssessed),
      },
    });
    res.json(risk);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create risk' });
  }
});
