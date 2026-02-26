import { Router } from 'express';
import prisma from '../db';
import { authenticateToken, requireRole } from '../middleware/auth';

export const controlTestingRouter = Router();

// Get all control testing results for an assessment period
controlTestingRouter.get('/period/:assessmentPeriod', authenticateToken, async (req, res) => {
  try {
    const { assessmentPeriod } = req.params;

    const results = await prisma.controlTestingResult.findMany({
      where: { assessmentPeriod },
      orderBy: { createdAt: 'desc' },
    });

    res.json(results);
  } catch (error) {
    console.error('Error fetching control testing results:', error);
    res.status(500).json({ error: 'Failed to fetch control testing results' });
  }
});

// Get testing results for a specific control
controlTestingRouter.get('/control/:controlId', authenticateToken, async (req, res) => {
  try {
    const { controlId } = req.params;
    const { assessmentPeriod } = req.query;

    const where: any = { controlId };
    if (assessmentPeriod) {
      where.assessmentPeriod = assessmentPeriod as string;
    }

    const results = await prisma.controlTestingResult.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    res.json(results);
  } catch (error) {
    console.error('Error fetching control testing results:', error);
    res.status(500).json({ error: 'Failed to fetch control testing results' });
  }
});

// Get testing results assigned to current user
controlTestingRouter.get('/my-assignments', authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).user.userId;
    const { assessmentPeriod } = req.query;

    const where: any = { testerId: userId };
    if (assessmentPeriod) {
      where.assessmentPeriod = assessmentPeriod as string;
    }

    const results = await prisma.controlTestingResult.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    res.json(results);
  } catch (error) {
    console.error('Error fetching my testing assignments:', error);
    res.status(500).json({ error: 'Failed to fetch testing assignments' });
  }
});

// Create or update control testing result
controlTestingRouter.post('/', authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).user.userId;
    const userName = (req as any).user.name;
    const {
      controlId,
      assessmentPeriod,
      designEffective,
      designNotes,
      designScore,
      operatingEffective,
      operatingRate,
      instancesTested,
      instancesPassed,
      operatingNotes,
      operatingScore,
      evidenceEffective,
      evidenceNotes,
      evidenceScore,
      responsivenessEffective,
      issuesIdentified,
      issuesActioned,
      responsivenessNotes,
      responsivenessScore,
      competenceEffective,
      competenceNotes,
      competenceScore,
      evidenceFiles,
      status,
    } = req.body;

    // Calculate overall rating based on scores
    const scores = [designScore, operatingScore, evidenceScore, responsivenessScore, competenceScore].filter(s => s !== null && s !== undefined);
    const totalScore = scores.reduce((sum, score) => sum + score, 0);
    const avgScore = scores.length > 0 ? totalScore / scores.length : 0;

    let overallRating;
    if (avgScore >= 4) {
      overallRating = 'EFFECTIVE';
    } else if (avgScore >= 3) {
      overallRating = 'PARTIALLY_EFFECTIVE';
    } else {
      overallRating = 'INEFFECTIVE';
    }

    const result = await prisma.controlTestingResult.upsert({
      where: {
        controlId_assessmentPeriod: {
          controlId,
          assessmentPeriod,
        },
      },
      update: {
        designEffective,
        designNotes,
        designScore,
        operatingEffective,
        operatingRate,
        instancesTested,
        instancesPassed,
        operatingNotes,
        operatingScore,
        evidenceEffective,
        evidenceNotes,
        evidenceScore,
        responsivenessEffective,
        issuesIdentified,
        issuesActioned,
        responsivenessNotes,
        responsivenessScore,
        competenceEffective,
        competenceNotes,
        competenceScore,
        overallRating: overallRating as any,
        totalScore,
        evidenceFiles: evidenceFiles ? JSON.stringify(evidenceFiles) : undefined,
        status: status as any,
      },
      create: {
        controlId,
        assessmentPeriod,
        testerId: userId,
        testerName: userName,
        designEffective,
        designNotes,
        designScore,
        operatingEffective,
        operatingRate,
        instancesTested,
        instancesPassed,
        operatingNotes,
        operatingScore,
        evidenceEffective,
        evidenceNotes,
        evidenceScore,
        responsivenessEffective,
        issuesIdentified,
        issuesActioned,
        responsivenessNotes,
        responsivenessScore,
        competenceEffective,
        competenceNotes,
        competenceScore,
        overallRating: overallRating as any,
        totalScore,
        evidenceFiles: evidenceFiles ? JSON.stringify(evidenceFiles) : undefined,
        status: status as any || 'IN_PROGRESS',
      },
    });

    // Log the action
    await prisma.auditLog.create({
      data: {
        userId,
        userEmail: (req as any).user.email,
        userName: (req as any).user.name || (req as any).user.email,
        action: 'CONTROL_TESTING_UPDATED',
        entity: 'ControlTestingResult',
        entityId: result.id,
        changes: JSON.stringify({ controlId, assessmentPeriod, overallRating, totalScore }),
        ipAddress: req.ip,
      },
    });

    res.json(result);
  } catch (error) {
    console.error('Error saving control testing result:', error);
    res.status(500).json({ error: 'Failed to save control testing result' });
  }
});

// Submit testing for review
controlTestingRouter.post('/:id/submit', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.userId;

    const result = await prisma.controlTestingResult.update({
      where: { id },
      data: {
        status: 'SUBMITTED',
        submittedAt: new Date(),
      },
    });

    // Notify managers
    const managers = await prisma.user.findMany({
      where: {
        role: { in: ['CONTROLS_MANAGER', 'FRAMEWORK_OWNER'] },
        isActive: true,
      },
    });

    for (const manager of managers) {
      await prisma.notification.create({
        data: {
          userId: manager.id,
          type: 'TESTING_ASSIGNED',
          title: 'Control Testing Submitted',
          message: `${(req as any).user.name} has submitted control testing for review`,
          entityType: 'ControlTestingResult',
          entityId: id,
          actionUrl: `/control-testing/${id}`,
        },
      });
    }

    res.json(result);
  } catch (error) {
    console.error('Error submitting testing:', error);
    res.status(500).json({ error: 'Failed to submit testing' });
  }
});

// Approve testing
controlTestingRouter.post('/:id/approve', authenticateToken, requireRole(['CONTROLS_MANAGER', 'FRAMEWORK_OWNER']), async (req, res) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.userId;

    const result = await prisma.controlTestingResult.update({
      where: { id },
      data: {
        status: 'APPROVED',
        reviewedBy: userId,
        reviewedAt: new Date(),
      },
    });

    // Notify tester
    await prisma.notification.create({
      data: {
        userId: result.testerId,
        type: 'APPROVAL_GRANTED',
        title: 'Testing Approved',
        message: `Your control testing has been approved`,
        entityType: 'ControlTestingResult',
        entityId: id,
        actionUrl: `/control-testing/${id}`,
      },
    });

    res.json(result);
  } catch (error) {
    console.error('Error approving testing:', error);
    res.status(500).json({ error: 'Failed to approve testing' });
  }
});

// Flag as deficiency
controlTestingRouter.post('/:id/flag-deficiency', authenticateToken, requireRole(['CONTROLS_MANAGER', 'FRAMEWORK_OWNER']), async (req, res) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.userId;

    const result = await prisma.controlTestingResult.update({
      where: { id },
      data: {
        status: 'FLAGGED_AS_DEFICIENCY',
        reviewedBy: userId,
        reviewedAt: new Date(),
      },
    });

    // Create deficiency record
    const deficiencyType = 
      result.designScore && result.designScore < 3 ? 'CONTROL_DESIGN' :
      result.operatingScore && result.operatingScore < 3 ? 'CONTROL_OPERATING' :
      result.evidenceScore && result.evidenceScore < 3 ? 'CONTROL_EVIDENCE' :
      result.responsivenessScore && result.responsivenessScore < 3 ? 'CONTROL_RESPONSIVENESS' :
      'CONTROL_COMPETENCE';

    const severity = result.totalScore && result.totalScore < 10 ? 'SIGNIFICANT' : 'MINOR';

    await prisma.deficiency.create({
      data: {
        controlId: result.controlId,
        type: deficiencyType as any,
        severity: severity as any,
        title: `Control Testing Deficiency - ${result.controlId}`,
        description: result.rationale || 'Control testing identified deficiencies',
        identifiedBy: userId,
      },
    });

    res.json(result);
  } catch (error) {
    console.error('Error flagging deficiency:', error);
    res.status(500).json({ error: 'Failed to flag deficiency' });
  }
});

// Get testing summary/dashboard
controlTestingRouter.get('/summary/:assessmentPeriod', authenticateToken, async (req, res) => {
  try {
    const { assessmentPeriod } = req.params;

    const results = await prisma.controlTestingResult.findMany({
      where: { assessmentPeriod },
    });

    const summary = {
      total: results.length,
      notStarted: results.filter(r => r.status === 'NOT_STARTED').length,
      inProgress: results.filter(r => r.status === 'IN_PROGRESS').length,
      submitted: results.filter(r => r.status === 'SUBMITTED').length,
      approved: results.filter(r => r.status === 'APPROVED').length,
      flagged: results.filter(r => r.status === 'FLAGGED_AS_DEFICIENCY').length,
      effective: results.filter(r => r.overallRating === 'EFFECTIVE').length,
      partiallyEffective: results.filter(r => r.overallRating === 'PARTIALLY_EFFECTIVE').length,
      ineffective: results.filter(r => r.overallRating === 'INEFFECTIVE').length,
    };

    res.json(summary);
  } catch (error) {
    console.error('Error fetching testing summary:', error);
    res.status(500).json({ error: 'Failed to fetch testing summary' });
  }
});
