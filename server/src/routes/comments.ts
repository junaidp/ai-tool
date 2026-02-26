import { Router } from 'express';
import prisma from '../db';
import { authenticateToken } from '../middleware/auth';

export const commentsRouter = Router();

// Get comments for an entity
commentsRouter.get('/:entityType/:entityId', authenticateToken, async (req, res) => {
  try {
    const { entityType, entityId } = req.params;

    const comments = await prisma.comment.findMany({
      where: {
        entityType,
        entityId,
        parentId: null, // Only get top-level comments
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        replies: {
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
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(comments);
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
});

// Create comment
commentsRouter.post('/', authenticateToken, async (req, res) => {
  try {
    const { entityType, entityId, content, parentId } = req.body;
    const userId = (req as any).user.userId;

    const comment = await prisma.comment.create({
      data: {
        entityType,
        entityId,
        userId,
        content,
        parentId,
      },
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

    // Create notification for entity owner or parent comment author
    if (parentId) {
      const parentComment = await prisma.comment.findUnique({
        where: { id: parentId },
      });
      
      if (parentComment && parentComment.userId !== userId) {
        await prisma.notification.create({
          data: {
            userId: parentComment.userId,
            type: 'COMMENT_ADDED',
            title: 'New Reply',
            message: `${(req as any).user.name} replied to your comment`,
            entityType,
            entityId,
            actionUrl: `/${entityType.toLowerCase()}/${entityId}#comment-${comment.id}`,
          },
        });
      }
    }

    // Log the action
    await prisma.auditLog.create({
      data: {
        userId,
        userEmail: (req as any).user.email,
        userName: (req as any).user.name || (req as any).user.email,
        action: 'COMMENTED',
        entity: entityType,
        entityId,
        changes: content,
        ipAddress: req.ip,
      },
    });

    res.status(201).json(comment);
  } catch (error) {
    console.error('Error creating comment:', error);
    res.status(500).json({ error: 'Failed to create comment' });
  }
});

// Update comment
commentsRouter.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const userId = (req as any).user.userId;

    const existingComment = await prisma.comment.findUnique({
      where: { id },
    });

    if (!existingComment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    if (existingComment.userId !== userId) {
      return res.status(403).json({ error: 'Not authorized to edit this comment' });
    }

    const comment = await prisma.comment.update({
      where: { id },
      data: { content },
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

    res.json(comment);
  } catch (error) {
    console.error('Error updating comment:', error);
    res.status(500).json({ error: 'Failed to update comment' });
  }
});

// Resolve comment
commentsRouter.post('/:id/resolve', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.userId;

    const comment = await prisma.comment.update({
      where: { id },
      data: {
        status: 'RESOLVED',
        resolvedBy: userId,
        resolvedAt: new Date(),
      },
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

    // Notify comment author
    if (comment.userId !== userId) {
      await prisma.notification.create({
        data: {
          userId: comment.userId,
          type: 'COMMENT_RESOLVED',
          title: 'Comment Resolved',
          message: `${(req as any).user.name} resolved your comment`,
          entityType: comment.entityType,
          entityId: comment.entityId,
          actionUrl: `/${comment.entityType.toLowerCase()}/${comment.entityId}#comment-${comment.id}`,
        },
      });
    }

    // Log the action
    await prisma.auditLog.create({
      data: {
        userId,
        userEmail: (req as any).user.email,
        userName: (req as any).user.name || (req as any).user.email,
        action: 'COMMENT_RESOLVED',
        entity: comment.entityType,
        entityId: comment.entityId,
        ipAddress: req.ip,
      },
    });

    res.json(comment);
  } catch (error) {
    console.error('Error resolving comment:', error);
    res.status(500).json({ error: 'Failed to resolve comment' });
  }
});

// Reopen comment
commentsRouter.post('/:id/reopen', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const comment = await prisma.comment.update({
      where: { id },
      data: {
        status: 'REOPENED',
        resolvedBy: null,
        resolvedAt: null,
      },
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

    res.json(comment);
  } catch (error) {
    console.error('Error reopening comment:', error);
    res.status(500).json({ error: 'Failed to reopen comment' });
  }
});

// Delete comment
commentsRouter.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.userId;
    const userRole = (req as any).user.role;

    const comment = await prisma.comment.findUnique({
      where: { id },
    });

    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    // Only comment author or admin can delete
    if (comment.userId !== userId && userRole !== 'SYSTEM_ADMIN' && userRole !== 'FRAMEWORK_OWNER') {
      return res.status(403).json({ error: 'Not authorized to delete this comment' });
    }

    await prisma.comment.delete({
      where: { id },
    });

    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({ error: 'Failed to delete comment' });
  }
});
