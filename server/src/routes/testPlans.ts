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
    
    // Validate required fields
    if (!data.controlId || !data.controlName || !data.testType || !data.tester || !data.scheduledDate || !data.status) {
      return res.status(400).json({ error: 'Missing required fields: controlId, controlName, testType, tester, scheduledDate, status' });
    }
    
    const testPlan = await prisma.testPlan.create({
      data: {
        controlId: data.controlId,
        controlName: data.controlName,
        testType: data.testType,
        tester: data.tester,
        scheduledDate: new Date(data.scheduledDate),
        status: data.status,
        results: data.results || null,
        exceptions: data.exceptions ? JSON.stringify(data.exceptions) : null,
        remediationRequired: data.remediationRequired || false,
      },
    });
    res.json(testPlan);
  } catch (error: any) {
    console.error('Error creating test plan:', error);
    res.status(500).json({ error: error.message || 'Failed to create test plan' });
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
