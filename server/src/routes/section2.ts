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
    console.log('=== Section2 Control Save Request ===');
    console.log('Request body:', JSON.stringify(req.body, null, 2));

    const {
      riskId, title, description, controlType, objectives,
      owner, reviewer, frequency, evidence, evidenceLocation,
      status, maturityLevel, source, templateId,
      implementationPhase, implementationEffort, implementationTimeline,
    } = req.body;

    if (!riskId || !title || !controlType) {
      console.error('Missing required fields:', { riskId, title, controlType });
      return res.status(400).json({ error: 'Missing required fields: riskId, title, controlType' });
    }

    const controlData: any = {
      riskId,
      title,
      description: description || '',
      controlType,
      objectives: JSON.stringify(objectives || []),
      owner: owner || '',
      frequency: frequency || 'monthly',
      evidence: evidence || '',
      status: status || 'existing',
      maturityLevel: maturityLevel || 1,
      source: source || 'existing_documented',
    };

    // Only add optional fields if they have values (not empty strings)
    if (reviewer && reviewer.trim() !== '') {
      controlData.reviewer = reviewer;
      console.log('Adding reviewer:', reviewer);
    } else {
      console.log('Skipping empty reviewer field');
    }
    
    if (evidenceLocation && evidenceLocation.trim() !== '') {
      controlData.evidenceLocation = evidenceLocation;
    }
    
    if (templateId && templateId.trim() !== '') {
      controlData.templateId = templateId;
    }
    
    if (implementationPhase !== undefined && implementationPhase !== null) {
      controlData.implementationPhase = implementationPhase;
      console.log('Adding implementationPhase:', implementationPhase);
    }
    
    if (implementationEffort && implementationEffort.trim() !== '') {
      controlData.implementationEffort = implementationEffort;
    }
    
    if (implementationTimeline && implementationTimeline.trim() !== '') {
      controlData.implementationTimeline = implementationTimeline;
    }

    console.log('Final control data to save:', JSON.stringify(controlData, null, 2));

    const control = await prisma.section2Control.create({
      data: controlData,
    });

    console.log('Control saved successfully:', control.id);

    res.json({
      ...control,
      objectives: JSON.parse(control.objectives),
    });
  } catch (error: any) {
    console.error('=== ERROR saving Section 2 control ===');
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('Error code:', error.code);
    console.error('Request body:', JSON.stringify(req.body, null, 2));
    
    res.status(500).json({ 
      error: 'Failed to save control',
      details: error.message,
      code: error.code 
    });
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

// Get all Section 2 controls with risk information
section2Router.get('/controls', async (req, res) => {
  try {
    const controls = await prisma.section2Control.findMany({
      orderBy: { createdAt: 'desc' },
    });

    const risks = await prisma.principalRisk.findMany();
    const riskMap = new Map(risks.map(r => [r.id, r]));

    const formatted = controls.map(c => ({
      ...c,
      objectives: JSON.parse(c.objectives),
      riskTitle: riskMap.get(c.riskId)?.riskTitle || 'Unknown Risk',
    }));

    res.json(formatted);
  } catch (error) {
    console.error('Failed to fetch Section 2 controls:', error);
    res.status(500).json({ error: 'Failed to fetch controls' });
  }
});

// Update a Section 2 control
section2Router.put('/controls/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log('=== Section2 Control Update Request ===');
    console.log('Control ID:', id);
    console.log('Update data:', JSON.stringify(req.body, null, 2));

    const updateData: any = {};

    // Only update fields that are provided
    if (req.body.status !== undefined) updateData.status = req.body.status;
    if (req.body.implementedDate !== undefined) updateData.implementedAt = req.body.implementedDate;
    if (req.body.title !== undefined) updateData.title = req.body.title;
    if (req.body.description !== undefined) updateData.description = req.body.description;
    if (req.body.owner !== undefined) updateData.owner = req.body.owner;
    if (req.body.reviewer !== undefined) updateData.reviewer = req.body.reviewer;
    if (req.body.frequency !== undefined) updateData.frequency = req.body.frequency;
    if (req.body.evidence !== undefined) updateData.evidence = req.body.evidence;
    if (req.body.evidenceLocation !== undefined) updateData.evidenceLocation = req.body.evidenceLocation;
    if (req.body.maturityLevel !== undefined) updateData.maturityLevel = req.body.maturityLevel;

    console.log('Final update data:', JSON.stringify(updateData, null, 2));

    const control = await prisma.section2Control.update({
      where: { id },
      data: updateData,
    });

    console.log('Control updated successfully:', control.id);

    res.json({
      ...control,
      objectives: JSON.parse(control.objectives),
    });
  } catch (error: any) {
    console.error('=== ERROR updating Section 2 control ===');
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    res.status(500).json({ 
      error: 'Failed to update control',
      details: error.message 
    });
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

// Save risk completion status
section2Router.post('/risk-completion', async (req, res) => {
  try {
    const {
      riskId,
      riskTitle,
      status,
      currentLevel,
      targetLevel,
      controlCount,
      currentScore,
      targetScore,
    } = req.body;

    if (!riskId) {
      return res.status(400).json({ error: 'Missing riskId' });
    }

    const completion = await prisma.section2RiskCompletion.upsert({
      where: { riskId },
      update: {
        riskTitle,
        status,
        currentLevel,
        targetLevel,
        controlCount,
        currentScore,
        targetScore,
      },
      create: {
        riskId,
        riskTitle,
        status,
        currentLevel,
        targetLevel,
        controlCount,
        currentScore,
        targetScore,
      },
    });

    res.json(completion);
  } catch (error: any) {
    console.error('Failed to save risk completion:', error);
    res.status(500).json({ error: 'Failed to save risk completion', details: error.message });
  }
});

// Get all completed risks
section2Router.get('/risk-completion', async (req, res) => {
  try {
    const completions = await prisma.section2RiskCompletion.findMany({
      orderBy: { completedAt: 'desc' },
    });
    res.json(completions);
  } catch (error) {
    console.error('Failed to fetch risk completions:', error);
    res.status(500).json({ error: 'Failed to fetch risk completions' });
  }
});
