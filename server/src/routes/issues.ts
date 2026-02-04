import { Router } from 'express';
import prisma from '../db';

export const issuesRouter = Router();

issuesRouter.get('/', async (req, res) => {
  try {
    const issues = await prisma.issue.findMany({
      orderBy: { discoveredDate: 'desc' },
    });
    res.json(issues);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch issues' });
  }
});

issuesRouter.post('/', async (req, res) => {
  try {
    const data = req.body;
    const issue = await prisma.issue.create({
      data: {
        ...data,
        discoveredDate: new Date(data.discoveredDate),
        dueDate: new Date(data.dueDate),
        retestDate: data.retestDate ? new Date(data.retestDate) : null,
      },
    });
    res.json(issue);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create issue' });
  }
});

issuesRouter.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    
    const updateData: any = { ...data };
    if (data.discoveredDate) updateData.discoveredDate = new Date(data.discoveredDate);
    if (data.dueDate) updateData.dueDate = new Date(data.dueDate);
    if (data.retestDate) updateData.retestDate = new Date(data.retestDate);
    
    const issue = await prisma.issue.update({
      where: { id },
      data: updateData,
    });
    res.json(issue);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update issue' });
  }
});
