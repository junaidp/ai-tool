import { Router } from 'express';
import prisma from '../db';

export const integrationsRouter = Router();

integrationsRouter.get('/', async (req, res) => {
  try {
    const integrations = await prisma.integrationStatus.findMany({
      orderBy: { system: 'asc' },
    });
    res.json(integrations);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch integrations' });
  }
});

integrationsRouter.post('/', async (req, res) => {
  try {
    const data = req.body;
    const integration = await prisma.integrationStatus.create({
      data: {
        ...data,
        lastSync: new Date(data.lastSync),
      },
    });
    res.json(integration);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create integration' });
  }
});

integrationsRouter.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    
    const updateData: any = { ...data };
    if (data.lastSync) {
      updateData.lastSync = new Date(data.lastSync);
    }
    
    const integration = await prisma.integrationStatus.update({
      where: { id },
      data: updateData,
    });
    res.json(integration);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update integration' });
  }
});
