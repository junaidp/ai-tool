import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
export const processesRouter = Router();

// Get all processes
processesRouter.get('/', async (req, res) => {
  try {
    const processes = await prisma.process.findMany({
      orderBy: { processName: 'asc' }
    });
    
    const formatted = processes.map(process => ({
      ...process,
      systemsInScope: process.systemsInScope ? JSON.parse(process.systemsInScope) : []
    }));
    
    res.json(formatted);
  } catch (error) {
    console.error('Failed to fetch processes:', error);
    res.status(500).json({ error: 'Failed to fetch processes' });
  }
});

// Create process
processesRouter.post('/', async (req, res) => {
  try {
    const { processName, processScope, systemsInScope, processOwner } = req.body;

    const process = await prisma.process.create({
      data: {
        processName,
        processScope,
        systemsInScope: JSON.stringify(systemsInScope || []),
        processOwner
      }
    });

    res.json({
      ...process,
      systemsInScope: JSON.parse(process.systemsInScope || '[]')
    });
  } catch (error) {
    console.error('Failed to create process:', error);
    res.status(500).json({ error: 'Failed to create process' });
  }
});

// Get process by ID with related data
processesRouter.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const process = await prisma.process.findUnique({
      where: { id },
      include: {
        maturityAssessments: true,
        asIsControls: true,
        gaps: true,
        toBeControls: true
      }
    });

    if (!process) {
      return res.status(404).json({ error: 'Process not found' });
    }

    res.json({
      ...process,
      systemsInScope: process.systemsInScope ? JSON.parse(process.systemsInScope) : []
    });
  } catch (error) {
    console.error('Failed to fetch process:', error);
    res.status(500).json({ error: 'Failed to fetch process' });
  }
});
