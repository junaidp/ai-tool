import { Router } from 'express';
import prisma from '../db';

export const approvalsRouter = Router();

approvalsRouter.get('/', async (req, res) => {
  try {
    const approvals = await prisma.approvalWorkflow.findMany({
      orderBy: { submittedDate: 'desc' },
      include: {
        requester: { select: { name: true, email: true } },
        currentApprover: { select: { name: true, email: true } },
      },
    });
    
    const formatted = approvals.map(a => ({
      ...a,
      requester: a.requester.name,
      currentApprover: a.currentApprover.name,
    }));
    
    res.json(formatted);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch approvals' });
  }
});

approvalsRouter.post('/', async (req, res) => {
  try {
    const data = req.body;
    const approval = await prisma.approvalWorkflow.create({
      data: {
        ...data,
        submittedDate: new Date(data.submittedDate),
      },
    });
    res.json(approval);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create approval' });
  }
});

approvalsRouter.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    
    const approval = await prisma.approvalWorkflow.update({
      where: { id },
      data,
    });
    res.json(approval);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update approval' });
  }
});
