import { Router } from 'express';
import prisma from '../db';

export const frameworkComponentsRouter = Router();

frameworkComponentsRouter.get('/', async (req, res) => {
  try {
    const components = await prisma.frameworkComponent.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.json(components);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch framework components' });
  }
});

frameworkComponentsRouter.post('/', async (req, res) => {
  try {
    const component = await prisma.frameworkComponent.create({
      data: req.body,
    });
    res.json(component);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create framework component' });
  }
});

frameworkComponentsRouter.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const component = await prisma.frameworkComponent.update({
      where: { id },
      data: req.body,
    });
    res.json(component);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update framework component' });
  }
});
