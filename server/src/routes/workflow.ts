import { Router } from 'express';
import prisma from '../db';
import { authenticateToken, requireRole } from '../middleware/auth';

export const workflowRouter = Router();

// Get workflow state for an entity
workflowRouter.get('/:entityType/:entityId', authenticateToken, async (req, res) => {
  try {
    const { entityType, entityId } = req.params;

    const workflowState = await prisma.workflowState.findUnique({
      where: {
        entityType_entityId: {
          entityType,
          entityId,
        },
      },
    });

    if (!workflowState) {
      // Return default draft state if not found
      return res.json({
        entityType,
        entityId,
        status: 'DRAFT',
        version: 1,
      });
    }

    res.json(workflowState);
  } catch (error) {
    console.error('Error fetching workflow state:', error);
    res.status(500).json({ error: 'Failed to fetch workflow state' });
  }
});

// Create or update workflow state
workflowRouter.post('/:entityType/:entityId', authenticateToken, async (req, res) => {
  try {
    const { entityType, entityId } = req.params;
    const { status, submittedBy, reviewedBy, approvedBy, lockedBy } = req.body;
    const userId = (req as any).user.userId;

    const updateData: any = { status };
    
    if (status === 'IN_REVIEW' && submittedBy) {
      updateData.submittedBy = submittedBy;
      updateData.submittedAt = new Date();
    }
    
    if (status === 'APPROVED' && approvedBy) {
      updateData.approvedBy = approvedBy;
      updateData.approvedAt = new Date();
    }
    
    if (status === 'LOCKED' && lockedBy) {
      updateData.lockedBy = lockedBy;
      updateData.lockedAt = new Date();
    }

    const workflowState = await prisma.workflowState.upsert({
      where: {
        entityType_entityId: {
          entityType,
          entityId,
        },
      },
      update: updateData,
      create: {
        entityType,
        entityId,
        ...updateData,
      },
    });

    // Log the action
    await prisma.auditLog.create({
      data: {
        userId,
        userEmail: (req as any).user.email,
        userName: (req as any).user.name || (req as any).user.email,
        action: 'WORKFLOW_UPDATED',
        entity: entityType,
        entityId,
        field: 'status',
        newValue: status,
        ipAddress: req.ip,
      },
    });

    res.json(workflowState);
  } catch (error) {
    console.error('Error updating workflow state:', error);
    res.status(500).json({ error: 'Failed to update workflow state' });
  }
});

// Submit for review
workflowRouter.post('/:entityType/:entityId/submit', authenticateToken, async (req, res) => {
  try {
    const { entityType, entityId } = req.params;
    const userId = (req as any).user.userId;

    const workflowState = await prisma.workflowState.upsert({
      where: {
        entityType_entityId: {
          entityType,
          entityId,
        },
      },
      update: {
        status: 'IN_REVIEW',
        submittedBy: userId,
        submittedAt: new Date(),
      },
      create: {
        entityType,
        entityId,
        status: 'IN_REVIEW',
        submittedBy: userId,
        submittedAt: new Date(),
      },
    });

    // Create notification for reviewers
    const reviewers = await prisma.user.findMany({
      where: {
        role: { in: ['REVIEWER', 'FRAMEWORK_OWNER'] },
        isActive: true,
      },
    });

    for (const reviewer of reviewers) {
      await prisma.notification.create({
        data: {
          userId: reviewer.id,
          type: 'REVIEW_REQUESTED',
          title: 'Review Requested',
          message: `${(req as any).user.name} has submitted ${entityType} for review`,
          entityType,
          entityId,
          actionUrl: `/review/${entityType}/${entityId}`,
        },
      });
    }

    // Log the action
    await prisma.auditLog.create({
      data: {
        userId,
        userEmail: (req as any).user.email,
        userName: (req as any).user.name || (req as any).user.email,
        action: 'SUBMITTED',
        entity: entityType,
        entityId,
        ipAddress: req.ip,
      },
    });

    res.json(workflowState);
  } catch (error) {
    console.error('Error submitting for review:', error);
    res.status(500).json({ error: 'Failed to submit for review' });
  }
});

// Approve
workflowRouter.post('/:entityType/:entityId/approve', authenticateToken, requireRole(['FRAMEWORK_OWNER', 'REVIEWER']), async (req, res) => {
  try {
    const { entityType, entityId } = req.params;
    const userId = (req as any).user.userId;

    const workflowState = await prisma.workflowState.update({
      where: {
        entityType_entityId: {
          entityType,
          entityId,
        },
      },
      data: {
        status: 'APPROVED',
        approvedBy: userId,
        approvedAt: new Date(),
      },
    });

    // Create notification for submitter
    if (workflowState.submittedBy) {
      await prisma.notification.create({
        data: {
          userId: workflowState.submittedBy,
          type: 'APPROVAL_GRANTED',
          title: 'Approval Granted',
          message: `Your ${entityType} has been approved`,
          entityType,
          entityId,
          actionUrl: `/${entityType.toLowerCase()}/${entityId}`,
        },
      });
    }

    // Log the action
    await prisma.auditLog.create({
      data: {
        userId,
        userEmail: (req as any).user.email,
        userName: (req as any).user.name || (req as any).user.email,
        action: 'APPROVED',
        entity: entityType,
        entityId,
        ipAddress: req.ip,
      },
    });

    res.json(workflowState);
  } catch (error) {
    console.error('Error approving:', error);
    res.status(500).json({ error: 'Failed to approve' });
  }
});

// Request changes
workflowRouter.post('/:entityType/:entityId/request-changes', authenticateToken, requireRole(['FRAMEWORK_OWNER', 'REVIEWER']), async (req, res) => {
  try {
    const { entityType, entityId } = req.params;
    const { comments } = req.body;
    const userId = (req as any).user.userId;

    const workflowState = await prisma.workflowState.update({
      where: {
        entityType_entityId: {
          entityType,
          entityId,
        },
      },
      data: {
        status: 'CHANGES_REQUESTED',
        reviewedBy: userId,
        reviewedAt: new Date(),
      },
    });

    // Create notification for submitter
    if (workflowState.submittedBy) {
      await prisma.notification.create({
        data: {
          userId: workflowState.submittedBy,
          type: 'CHANGES_REQUESTED',
          title: 'Changes Requested',
          message: `Changes have been requested for your ${entityType}`,
          entityType,
          entityId,
          actionUrl: `/${entityType.toLowerCase()}/${entityId}`,
        },
      });
    }

    // Log the action
    await prisma.auditLog.create({
      data: {
        userId,
        userEmail: (req as any).user.email,
        userName: (req as any).user.name || (req as any).user.email,
        action: 'CHANGES_REQUESTED',
        entity: entityType,
        entityId,
        changes: comments,
        ipAddress: req.ip,
      },
    });

    res.json(workflowState);
  } catch (error) {
    console.error('Error requesting changes:', error);
    res.status(500).json({ error: 'Failed to request changes' });
  }
});

// Lock entity
workflowRouter.post('/:entityType/:entityId/lock', authenticateToken, requireRole(['FRAMEWORK_OWNER']), async (req, res) => {
  try {
    const { entityType, entityId } = req.params;
    const userId = (req as any).user.userId;

    const workflowState = await prisma.workflowState.update({
      where: {
        entityType_entityId: {
          entityType,
          entityId,
        },
      },
      data: {
        status: 'LOCKED',
        lockedBy: userId,
        lockedAt: new Date(),
      },
    });

    // Log the action
    await prisma.auditLog.create({
      data: {
        userId,
        userEmail: (req as any).user.email,
        userName: (req as any).user.name || (req as any).user.email,
        action: 'LOCKED',
        entity: entityType,
        entityId,
        ipAddress: req.ip,
      },
    });

    res.json(workflowState);
  } catch (error) {
    console.error('Error locking:', error);
    res.status(500).json({ error: 'Failed to lock' });
  }
});
