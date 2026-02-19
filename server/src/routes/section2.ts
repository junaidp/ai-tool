import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
export const section2Router = Router();

// Save or update maturity selection for a risk
section2Router.post('/maturity-selection', async (req, res) => {
  try {
    const { riskId, selectedLevel, targetLevel, currentMaturityScore, targetMaturityScore } = req.body;

    if (!riskId || !selectedLevel || !targetLevel) {
      return res.status(400).json({ error: 'Missing required fields: riskId, selectedLevel, targetLevel' });
    }

    const selection = await prisma.maturitySelection.upsert({
      where: { riskId },
      update: {
        selectedLevel,
        targetLevel,
        currentMaturityScore,
        targetMaturityScore,
      },
      create: {
        riskId,
        selectedLevel,
        targetLevel,
        currentMaturityScore,
        targetMaturityScore,
      },
    });

    res.json(selection);
  } catch (error) {
    console.error('Failed to save maturity selection:', error);
    res.status(500).json({ error: 'Failed to save maturity selection' });
  }
});

// Get maturity selection for a risk
section2Router.get('/maturity-selection/:riskId', async (req, res) => {
  try {
    const { riskId } = req.params;
    const selection = await prisma.maturitySelection.findUnique({
      where: { riskId },
    });

    if (!selection) {
      return res.status(404).json({ error: 'No maturity selection found for this risk' });
    }

    res.json(selection);
  } catch (error) {
    console.error('Failed to fetch maturity selection:', error);
    res.status(500).json({ error: 'Failed to fetch maturity selection' });
  }
});

// Save a Section 2 control
section2Router.post('/controls', async (req, res) => {
  try {
    const {
      riskId, title, description, controlType, objectives,
      owner, reviewer, frequency, evidence, evidenceLocation,
      status, maturityLevel, source, templateId,
      implementationPhase, implementationEffort, implementationTimeline,
    } = req.body;

    if (!riskId || !title || !controlType) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const control = await prisma.section2Control.create({
      data: {
        riskId,
        title,
        description: description || '',
        controlType,
        objectives: JSON.stringify(objectives || []),
        owner: owner || '',
        reviewer,
        frequency: frequency || 'monthly',
        evidence: evidence || '',
        evidenceLocation,
        status: status || 'existing',
        maturityLevel: maturityLevel || 1,
        source: source || 'existing_documented',
        templateId,
        implementationPhase,
        implementationEffort,
        implementationTimeline,
      },
    });

    res.json({
      ...control,
      objectives: JSON.parse(control.objectives),
    });
  } catch (error) {
    console.error('Failed to save Section 2 control:', error);
    res.status(500).json({ error: 'Failed to save control' });
  }
});

// Get all Section 2 controls for a risk
section2Router.get('/controls/:riskId', async (req, res) => {
  try {
    const { riskId } = req.params;
    const controls = await prisma.section2Control.findMany({
      where: { riskId },
      orderBy: { createdAt: 'asc' },
    });

    const formatted = controls.map(c => ({
      ...c,
      objectives: JSON.parse(c.objectives),
    }));

    res.json(formatted);
  } catch (error) {
    console.error('Failed to fetch Section 2 controls:', error);
    res.status(500).json({ error: 'Failed to fetch controls' });
  }
});

// Save gap analysis results
section2Router.post('/gap-analysis', async (req, res) => {
  try {
    const {
      riskId, riskType, currentLevel, targetLevel,
      existingControls,
    } = req.body;

    if (!riskId || !currentLevel || !targetLevel) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Gap analysis is computed client-side using the template library.
    // This endpoint persists the result for future reference.
    const gap = await prisma.section2GapAnalysis.upsert({
      where: { riskId },
      update: {
        currentLevel,
        targetLevel,
        currentScore: req.body.currentScore || currentLevel + 0.2,
        targetScore: req.body.targetScore || targetLevel + 0.5,
        missingControls: JSON.stringify(req.body.missingControls || []),
        suggestedControls: JSON.stringify(req.body.suggestedControls || []),
        gapCount: req.body.gapCount || 0,
        effortEstimate: req.body.effortEstimate || 'medium',
        timelineEstimate: req.body.timelineEstimate || '6-12 months',
      },
      create: {
        riskId,
        currentLevel,
        targetLevel,
        currentScore: req.body.currentScore || currentLevel + 0.2,
        targetScore: req.body.targetScore || targetLevel + 0.5,
        missingControls: JSON.stringify(req.body.missingControls || []),
        suggestedControls: JSON.stringify(req.body.suggestedControls || []),
        gapCount: req.body.gapCount || 0,
        effortEstimate: req.body.effortEstimate || 'medium',
        timelineEstimate: req.body.timelineEstimate || '6-12 months',
      },
    });

    res.json({
      ...gap,
      missingControls: JSON.parse(gap.missingControls),
      suggestedControls: JSON.parse(gap.suggestedControls),
    });
  } catch (error) {
    console.error('Failed to save gap analysis:', error);
    res.status(500).json({ error: 'Failed to save gap analysis' });
  }
});

// Accept a suggested control (creates a new Section2Control)
section2Router.post('/accept-control', async (req, res) => {
  try {
    const { riskId, templateId, customizations } = req.body;

    if (!riskId || !templateId) {
      return res.status(400).json({ error: 'Missing required fields: riskId, templateId' });
    }

    const control = await prisma.section2Control.create({
      data: {
        riskId,
        title: customizations?.title || `Control from template ${templateId}`,
        description: customizations?.description || '',
        controlType: customizations?.type || 'detective',
        objectives: JSON.stringify(customizations?.objectives || ['operations']),
        owner: customizations?.owner || '',
        frequency: customizations?.frequency || 'monthly',
        evidence: customizations?.evidence || '',
        status: 'planned',
        maturityLevel: customizations?.maturityLevel || 3,
        source: 'ai_suggested',
        templateId,
        implementationPhase: customizations?.implementationPhase,
        implementationEffort: customizations?.implementationEffort,
        implementationTimeline: customizations?.implementationTimeline,
      },
    });

    res.json({
      ...control,
      objectives: JSON.parse(control.objectives),
    });
  } catch (error) {
    console.error('Failed to accept suggested control:', error);
    res.status(500).json({ error: 'Failed to accept control' });
  }
});

// Get implementation plan (aggregated across all risks)
section2Router.get('/implementation-plan', async (req, res) => {
  try {
    const plans = await prisma.section2ImplementationPlan.findMany({
      orderBy: { createdAt: 'desc' },
      take: 1,
    });

    if (plans.length === 0) {
      return res.json(null);
    }

    const plan = plans[0];
    res.json({
      ...plan,
      phases: JSON.parse(plan.phases),
    });
  } catch (error) {
    console.error('Failed to fetch implementation plan:', error);
    res.status(500).json({ error: 'Failed to fetch implementation plan' });
  }
});

// Generate documentation (placeholder - returns mock URLs)
section2Router.post('/generate-documentation', async (req, res) => {
  try {
    const { documentTypes } = req.body;

    if (!documentTypes || !Array.isArray(documentTypes)) {
      return res.status(400).json({ error: 'Missing documentTypes array' });
    }

    // Placeholder: In production, this would generate actual documents
    const downloadUrls: Record<string, string> = {};
    for (const docType of documentTypes) {
      downloadUrls[docType] = `/api/section2/downloads/${docType}-${Date.now()}.pdf`;
    }

    res.json({ downloadUrls });
  } catch (error) {
    console.error('Failed to generate documentation:', error);
    res.status(500).json({ error: 'Failed to generate documentation' });
  }
});
