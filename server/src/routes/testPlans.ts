import { Router } from 'express';
import prisma from '../db';

export const testPlansRouter = Router();

testPlansRouter.get('/', async (req, res) => {
  try {
    const testPlans = await prisma.testPlan.findMany({
      orderBy: { scheduledDate: 'asc' },
    });
    
    const formatted = testPlans.map(t => ({
      ...t,
      exceptions: t.exceptions ? JSON.parse(t.exceptions) : null,
    }));
    
    res.json(formatted);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch test plans' });
  }
});

testPlansRouter.post('/', async (req, res) => {
  try {
    const data = req.body;
    const testPlan = await prisma.testPlan.create({
      data: {
        ...data,
        exceptions: data.exceptions ? JSON.stringify(data.exceptions) : null,
        scheduledDate: new Date(data.scheduledDate),
      },
    });
    res.json(testPlan);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create test plan' });
  }
});

testPlansRouter.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    
    const updateData: any = { ...data };
    if (data.exceptions) {
      updateData.exceptions = JSON.stringify(data.exceptions);
    }
    if (data.scheduledDate) {
      updateData.scheduledDate = new Date(data.scheduledDate);
    }
    
    const testPlan = await prisma.testPlan.update({
      where: { id },
      data: updateData,
    });
    res.json(testPlan);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update test plan' });
  }
});
