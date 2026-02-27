import { Router } from 'express';
import prisma from '../db';
import { authenticateToken, requireRole } from '../middleware/auth';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

export const controlTestingRouter = Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads/evidence');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf|xlsx|xls|docx|doc/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Invalid file type. Only images, PDFs, and Office documents allowed.'));
  }
});

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

// Bulk assign controls for testing
controlTestingRouter.post('/bulk-assign', authenticateToken, requireRole(['CONTROLS_MANAGER', 'FRAMEWORK_OWNER']), async (req, res) => {
  try {
    const { assignments, assessmentPeriod } = req.body;
    const userId = (req as any).user.userId;

    const results = [];
    for (const assignment of assignments) {
      const { controlId, testerId, testerName, dueDate } = assignment;
      
      const result = await prisma.controlTestingResult.upsert({
        where: {
          controlId_assessmentPeriod: {
            controlId,
            assessmentPeriod,
          },
        },
        update: {
          testerId,
          testerName,
          dueDate: dueDate ? new Date(dueDate) : undefined,
        },
        create: {
          controlId,
          assessmentPeriod,
          testerId,
          testerName,
          dueDate: dueDate ? new Date(dueDate) : undefined,
          status: 'NOT_STARTED',
        },
      });

      // Create notification for tester
      await prisma.notification.create({
        data: {
          userId: testerId,
          type: 'TESTING_ASSIGNED',
          title: 'Control Testing Assigned',
          message: `You have been assigned to test control ${controlId} for ${assessmentPeriod}`,
          entityType: 'ControlTestingResult',
          entityId: result.id,
          actionUrl: `/control-testing/${result.id}`,
        },
      });

      results.push(result);
    }

    // Log the bulk assignment
    await prisma.auditLog.create({
      data: {
        userId,
        userEmail: (req as any).user.email,
        userName: (req as any).user.name || (req as any).user.email,
        action: 'BULK_TESTING_ASSIGNED',
        entity: 'ControlTestingResult',
        entityId: assessmentPeriod,
        changes: JSON.stringify({ count: assignments.length, assessmentPeriod }),
        ipAddress: req.ip,
      },
    });

    res.json({ success: true, count: results.length, results });
  } catch (error) {
    console.error('Error bulk assigning tests:', error);
    res.status(500).json({ error: 'Failed to bulk assign tests' });
  }
});

// Upload evidence file
controlTestingRouter.post('/:id/upload-evidence', authenticateToken, upload.single('file'), async (req, res) => {
  try {
    const { id } = req.params;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const result = await prisma.controlTestingResult.findUnique({
      where: { id },
    });

    if (!result) {
      return res.status(404).json({ error: 'Testing result not found' });
    }

    const existingFiles = result.evidenceFiles ? JSON.parse(result.evidenceFiles) : [];
    const newFile = {
      filename: file.filename,
      originalName: file.originalname,
      path: file.path,
      size: file.size,
      uploadedAt: new Date().toISOString(),
      uploadedBy: (req as any).user.name,
    };

    existingFiles.push(newFile);

    const updated = await prisma.controlTestingResult.update({
      where: { id },
      data: {
        evidenceFiles: JSON.stringify(existingFiles),
      },
    });

    res.json({ success: true, file: newFile, result: updated });
  } catch (error) {
    console.error('Error uploading evidence:', error);
    res.status(500).json({ error: 'Failed to upload evidence' });
  }
});

// Delete evidence file
controlTestingRouter.delete('/:id/evidence/:filename', authenticateToken, async (req, res) => {
  try {
    const { id, filename } = req.params;

    const result = await prisma.controlTestingResult.findUnique({
      where: { id },
    });

    if (!result) {
      return res.status(404).json({ error: 'Testing result not found' });
    }

    const existingFiles = result.evidenceFiles ? JSON.parse(result.evidenceFiles) : [];
    const fileToDelete = existingFiles.find((f: any) => f.filename === filename);

    if (fileToDelete && fs.existsSync(fileToDelete.path)) {
      fs.unlinkSync(fileToDelete.path);
    }

    const updatedFiles = existingFiles.filter((f: any) => f.filename !== filename);

    const updated = await prisma.controlTestingResult.update({
      where: { id },
      data: {
        evidenceFiles: JSON.stringify(updatedFiles),
      },
    });

    res.json({ success: true, result: updated });
  } catch (error) {
    console.error('Error deleting evidence:', error);
    res.status(500).json({ error: 'Failed to delete evidence' });
  }
});

// Reject testing (send back for changes)
controlTestingRouter.post('/:id/reject', authenticateToken, requireRole(['CONTROLS_MANAGER', 'FRAMEWORK_OWNER']), async (req, res) => {
  try {
    const { id } = req.params;
    const { comments } = req.body;
    const userId = (req as any).user.userId;

    const result = await prisma.controlTestingResult.update({
      where: { id },
      data: {
        status: 'IN_PROGRESS',
        reviewedBy: userId,
        reviewedAt: new Date(),
        reviewComments: comments,
      },
    });

    // Notify tester
    await prisma.notification.create({
      data: {
        userId: result.testerId,
        type: 'CHANGES_REQUESTED',
        title: 'Testing Changes Requested',
        message: `Changes have been requested for your control testing`,
        entityType: 'ControlTestingResult',
        entityId: id,
        actionUrl: `/control-testing/${id}`,
      },
    });

    res.json(result);
  } catch (error) {
    console.error('Error rejecting testing:', error);
    res.status(500).json({ error: 'Failed to reject testing' });
  }
});

// Get testing configuration options
controlTestingRouter.get('/config/options', authenticateToken, async (req, res) => {
  try {
    const testers = await prisma.user.findMany({
      where: {
        isActive: true,
        role: { in: ['CONTROL_OWNER', 'CONTROLS_MANAGER', 'FRAMEWORK_OWNER'] },
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    res.json({ testers });
  } catch (error) {
    console.error('Error fetching config options:', error);
    res.status(500).json({ error: 'Failed to fetch config options' });
  }
});

// Get progress by tester
controlTestingRouter.get('/progress/by-tester/:assessmentPeriod', authenticateToken, async (req, res) => {
  try {
    const { assessmentPeriod } = req.params;

    const results = await prisma.controlTestingResult.findMany({
      where: { assessmentPeriod },
    });

    const byTester = results.reduce((acc: any, result) => {
      if (!acc[result.testerId]) {
        acc[result.testerId] = {
          testerId: result.testerId,
          testerName: result.testerName,
          total: 0,
          notStarted: 0,
          inProgress: 0,
          submitted: 0,
          approved: 0,
        };
      }
      acc[result.testerId].total++;
      if (result.status === 'NOT_STARTED') acc[result.testerId].notStarted++;
      if (result.status === 'IN_PROGRESS') acc[result.testerId].inProgress++;
      if (result.status === 'SUBMITTED') acc[result.testerId].submitted++;
      if (result.status === 'APPROVED') acc[result.testerId].approved++;
      return acc;
    }, {});

    res.json(Object.values(byTester));
  } catch (error) {
    console.error('Error fetching progress by tester:', error);
    res.status(500).json({ error: 'Failed to fetch progress by tester' });
  }
});
