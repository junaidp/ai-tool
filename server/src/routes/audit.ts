import { Router } from 'express';
import prisma from '../db';
import { authenticateToken, requireRole } from '../middleware/auth';

export const auditRouter = Router();

// Get audit logs (restricted access)
auditRouter.get('/', authenticateToken, requireRole(['SYSTEM_ADMIN', 'FRAMEWORK_OWNER', 'CONTROLS_MANAGER', 'REVIEWER', 'BOARD_MEMBER']), async (req, res) => {
  try {
    const { 
      userId, 
      entity, 
      entityId, 
      action, 
      startDate, 
      endDate,
      limit = '100',
      offset = '0'
    } = req.query;

    const where: any = {};
    
    if (userId) where.userId = userId as string;
    if (entity) where.entity = entity as string;
    if (entityId) where.entityId = entityId as string;
    if (action) where.action = action as string;
    
    if (startDate || endDate) {
      where.timestamp = {};
      if (startDate) where.timestamp.gte = new Date(startDate as string);
      if (endDate) where.timestamp.lte = new Date(endDate as string);
    }

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        orderBy: { timestamp: 'desc' },
        take: parseInt(limit as string),
        skip: parseInt(offset as string),
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
        },
      }),
      prisma.auditLog.count({ where }),
    ]);

    res.json({
      logs,
      total,
      limit: parseInt(limit as string),
      offset: parseInt(offset as string),
    });
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    res.status(500).json({ error: 'Failed to fetch audit logs' });
  }
});

// Get audit logs for specific entity
auditRouter.get('/:entityType/:entityId', authenticateToken, async (req, res) => {
  try {
    const { entityType, entityId } = req.params;

    const logs = await prisma.auditLog.findMany({
      where: {
        entity: entityType,
        entityId,
      },
      orderBy: { timestamp: 'desc' },
      take: 100,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    res.json(logs);
  } catch (error) {
    console.error('Error fetching entity audit logs:', error);
    res.status(500).json({ error: 'Failed to fetch audit logs' });
  }
});

// Export audit logs (CSV)
auditRouter.get('/export/csv', authenticateToken, requireRole(['SYSTEM_ADMIN', 'FRAMEWORK_OWNER']), async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const where: any = {};
    if (startDate || endDate) {
      where.timestamp = {};
      if (startDate) where.timestamp.gte = new Date(startDate as string);
      if (endDate) where.timestamp.lte = new Date(endDate as string);
    }

    const logs = await prisma.auditLog.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    // Generate CSV
    const csvHeader = 'Timestamp,User,Email,Role,Action,Entity,Entity ID,Field,Old Value,New Value,IP Address\n';
    const csvRows = logs.map(log => {
      return [
        log.timestamp.toISOString(),
        log.userName,
        log.userEmail,
        log.user.role,
        log.action,
        log.entity,
        log.entityId,
        log.field || '',
        log.oldValue || '',
        log.newValue || '',
        log.ipAddress || '',
      ].map(field => `"${String(field).replace(/"/g, '""')}"`).join(',');
    }).join('\n');

    const csv = csvHeader + csvRows;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=audit-log-${new Date().toISOString()}.csv`);
    res.send(csv);
  } catch (error) {
    console.error('Error exporting audit logs:', error);
    res.status(500).json({ error: 'Failed to export audit logs' });
  }
});

// Helper function to create audit log entry
export async function createAuditLog(data: {
  userId: string;
  userEmail: string;
  userName: string;
  action: string;
  entity: string;
  entityId: string;
  field?: string;
  oldValue?: string;
  newValue?: string;
  changes?: any;
  ipAddress?: string;
}) {
  return await prisma.auditLog.create({
    data: {
      userId: data.userId,
      userEmail: data.userEmail,
      userName: data.userName,
      action: data.action,
      entity: data.entity,
      entityId: data.entityId,
      field: data.field,
      oldValue: data.oldValue,
      newValue: data.newValue,
      changes: data.changes ? JSON.stringify(data.changes) : undefined,
      ipAddress: data.ipAddress,
    },
  });
}
