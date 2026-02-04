import { Router } from 'express';
import prisma from '../db';

export const materialControlsRouter = Router();

materialControlsRouter.get('/', async (req, res) => {
  try {
    const controls = await prisma.materialControl.findMany({
      orderBy: { materialityScore: 'desc' },
    });
    
    const formatted = controls.map(c => ({
      ...c,
      dependencies: JSON.parse(c.dependencies),
    }));
    
    res.json(formatted);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch material controls' });
  }
});

materialControlsRouter.post('/', async (req, res) => {
  try {
    const data = req.body;
    const control = await prisma.materialControl.create({
      data: {
        ...data,
        dependencies: JSON.stringify(data.dependencies || []),
      },
    });
    res.json(control);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create material control' });
  }
});

materialControlsRouter.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    
    const updateData: any = { ...data };
    if (data.dependencies) {
      updateData.dependencies = JSON.stringify(data.dependencies);
    }
    
    const control = await prisma.materialControl.update({
      where: { id },
      data: updateData,
    });
    res.json(control);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update material control' });
  }
});
