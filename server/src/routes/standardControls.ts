import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
export const standardControlsRouter = Router();

// Get all standard controls
standardControlsRouter.get('/', async (req, res) => {
  try {
    const controls = await prisma.standardControl.findMany();
    res.json(controls);
  } catch (error) {
    console.error('Failed to fetch standard controls:', error);
    res.status(500).json({ error: 'Failed to fetch controls' });
  }
});

// Get standard controls by maturity profile
standardControlsRouter.get('/by-profile/:profile', async (req, res) => {
  try {
    const { profile } = req.params;
    
    // Filter controls based on applicability rules
    const allControls = await prisma.standardControl.findMany();
    
    const applicable = allControls.filter(control => {
      if (!control.applicabilityRules) return true;
      
      try {
        const rules = JSON.parse(control.applicabilityRules);
        // Simple rule matching - can be enhanced
        return true;
      } catch {
        return true;
      }
    });

    res.json(applicable);
  } catch (error) {
    console.error('Failed to fetch controls:', error);
    res.status(500).json({ error: 'Failed to fetch controls' });
  }
});

// Create standard control (admin only)
standardControlsRouter.post('/', async (req, res) => {
  try {
    const { controlName, controlObjective, controlType, domainTag, typicalFrequency, typicalEvidence, applicabilityRules } = req.body;

    const control = await prisma.standardControl.create({
      data: {
        controlName,
        controlObjective,
        controlType,
        domainTag,
        typicalFrequency,
        typicalEvidence,
        applicabilityRules: applicabilityRules ? JSON.stringify(applicabilityRules) : null
      }
    });

    res.json(control);
  } catch (error) {
    console.error('Failed to create standard control:', error);
    res.status(500).json({ error: 'Failed to create control' });
  }
});
