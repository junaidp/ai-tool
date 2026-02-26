import { Router } from 'express';
import prisma from '../db';
import { authenticateToken } from '../middleware/auth';

export const versionsRouter = Router();

// Get version history for an entity
versionsRouter.get('/:entityType/:entityId', authenticateToken, async (req, res) => {
  try {
    const { entityType, entityId } = req.params;

    const versions = await prisma.version.findMany({
      where: {
        entityType,
        entityId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { versionNumber: 'desc' },
    });

    res.json(versions);
  } catch (error) {
    console.error('Error fetching versions:', error);
    res.status(500).json({ error: 'Failed to fetch versions' });
  }
});

// Get specific version
versionsRouter.get('/:entityType/:entityId/:versionNumber', authenticateToken, async (req, res) => {
  try {
    const { entityType, entityId, versionNumber } = req.params;

    const version = await prisma.version.findUnique({
      where: {
        entityType_entityId_versionNumber: {
          entityType,
          entityId,
          versionNumber: parseInt(versionNumber),
        },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!version) {
      return res.status(404).json({ error: 'Version not found' });
    }

    res.json(version);
  } catch (error) {
    console.error('Error fetching version:', error);
    res.status(500).json({ error: 'Failed to fetch version' });
  }
});

// Create new version
versionsRouter.post('/', authenticateToken, async (req, res) => {
  try {
    const { entityType, entityId, data, changes } = req.body;
    const userId = (req as any).user.userId;

    // Get the latest version number
    const latestVersion = await prisma.version.findFirst({
      where: {
        entityType,
        entityId,
      },
      orderBy: { versionNumber: 'desc' },
    });

    const versionNumber = latestVersion ? latestVersion.versionNumber + 1 : 1;

    const version = await prisma.version.create({
      data: {
        entityType,
        entityId,
        versionNumber,
        data: JSON.stringify(data),
        changes,
        createdBy: userId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Log the action
    await prisma.auditLog.create({
      data: {
        userId,
        userEmail: (req as any).user.email,
        userName: (req as any).user.name || (req as any).user.email,
        action: 'VERSION_CREATED',
        entity: entityType,
        entityId,
        changes: `Version ${versionNumber}: ${changes || 'No description'}`,
        ipAddress: req.ip,
      },
    });

    res.status(201).json(version);
  } catch (error) {
    console.error('Error creating version:', error);
    res.status(500).json({ error: 'Failed to create version' });
  }
});

// Restore version (Framework Owner only)
versionsRouter.post('/:entityType/:entityId/:versionNumber/restore', authenticateToken, async (req, res) => {
  try {
    const { entityType, entityId, versionNumber } = req.params;
    const userId = (req as any).user.userId;
    const userRole = (req as any).user.role;

    if (userRole !== 'FRAMEWORK_OWNER') {
      return res.status(403).json({ error: 'Only Framework Owner can restore versions' });
    }

    const version = await prisma.version.findUnique({
      where: {
        entityType_entityId_versionNumber: {
          entityType,
          entityId,
          versionNumber: parseInt(versionNumber),
        },
      },
    });

    if (!version) {
      return res.status(404).json({ error: 'Version not found' });
    }

    // Create a new version with the restored data
    const latestVersion = await prisma.version.findFirst({
      where: {
        entityType,
        entityId,
      },
      orderBy: { versionNumber: 'desc' },
    });

    const newVersionNumber = latestVersion ? latestVersion.versionNumber + 1 : 1;

    const restoredVersion = await prisma.version.create({
      data: {
        entityType,
        entityId,
        versionNumber: newVersionNumber,
        data: version.data,
        changes: `Restored from version ${versionNumber}`,
        createdBy: userId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Log the action
    await prisma.auditLog.create({
      data: {
        userId,
        userEmail: (req as any).user.email,
        userName: (req as any).user.name || (req as any).user.email,
        action: 'VERSION_RESTORED',
        entity: entityType,
        entityId,
        changes: `Restored version ${versionNumber} as version ${newVersionNumber}`,
        ipAddress: req.ip,
      },
    });

    res.json({
      message: 'Version restored successfully',
      version: restoredVersion,
      data: JSON.parse(version.data),
    });
  } catch (error) {
    console.error('Error restoring version:', error);
    res.status(500).json({ error: 'Failed to restore version' });
  }
});

// Helper function to create version snapshot
export async function createVersionSnapshot(
  entityType: string,
  entityId: string,
  data: any,
  changes: string,
  userId: string
) {
  const latestVersion = await prisma.version.findFirst({
    where: {
      entityType,
      entityId,
    },
    orderBy: { versionNumber: 'desc' },
  });

  const versionNumber = latestVersion ? latestVersion.versionNumber + 1 : 1;

  return await prisma.version.create({
    data: {
      entityType,
      entityId,
      versionNumber,
      data: JSON.stringify(data),
      changes,
      createdBy: userId,
    },
  });
}
