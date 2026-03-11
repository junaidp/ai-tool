import { Router } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../db';
import { authenticateToken, requireRole, AuthRequest } from '../middleware/auth';

export const usersRouter = Router();

// Get all users (System Admin only) - filtered by company
usersRouter.get('/', authenticateToken, requireRole(['SYSTEM_ADMIN', 'FRAMEWORK_OWNER']), async (req, res) => {
  try {
    const authReq = req as AuthRequest;
    const users = await prisma.user.findMany({
      where: {
        companyId: authReq.user!.companyId,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        department: true,
        isActive: true,
        companyId: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Get user by ID
usersRouter.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const authReq = req as AuthRequest;
    const user = await prisma.user.findFirst({
      where: { 
        id,
        companyId: authReq.user!.companyId,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        department: true,
        isActive: true,
        companyId: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Create new user (System Admin only)
usersRouter.post('/', authenticateToken, requireRole(['SYSTEM_ADMIN']), async (req, res) => {
  try {
    const { email, password, name, role, department } = req.body;
    const authReq = req as AuthRequest;

    const existingUser = await prisma.user.findFirst({ 
      where: { 
        email,
        companyId: authReq.user!.companyId,
      } 
    });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists in this company' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role,
        department,
        companyId: authReq.user!.companyId,
        isActive: true,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        department: true,
        isActive: true,
        companyId: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Log the action
    await prisma.auditLog.create({
      data: {
        userId: authReq.user!.userId,
        userEmail: authReq.user!.email,
        userName: authReq.user!.name || authReq.user!.email,
        action: 'CREATED',
        entity: 'User',
        entityId: user.id,
        changes: JSON.stringify({ email, name, role, department }),
        ipAddress: req.ip,
      },
    });

    res.status(201).json(user);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// Update user (System Admin only)
usersRouter.put('/:id', authenticateToken, requireRole(['SYSTEM_ADMIN']), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role, department, isActive } = req.body;
    const authReq = req as AuthRequest;

    const existingUser = await prisma.user.findFirst({ 
      where: { 
        id,
        companyId: authReq.user!.companyId,
      } 
    });
    if (!existingUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (role !== undefined) updateData.role = role;
    if (department !== undefined) updateData.department = department;
    if (isActive !== undefined) updateData.isActive = isActive;

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        department: true,
        isActive: true,
        companyId: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Log the action
    await prisma.auditLog.create({
      data: {
        userId: authReq.user!.userId,
        userEmail: authReq.user!.email,
        userName: authReq.user!.name || authReq.user!.email,
        action: 'EDITED',
        entity: 'User',
        entityId: user.id,
        changes: JSON.stringify(updateData),
        ipAddress: req.ip,
      },
    });

    res.json(user);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// Delete user (System Admin only)
usersRouter.delete('/:id', authenticateToken, requireRole(['SYSTEM_ADMIN']), async (req, res) => {
  try {
    const { id } = req.params;
    const authReq = req as AuthRequest;

    const user = await prisma.user.findFirst({ 
      where: { 
        id,
        companyId: authReq.user!.companyId,
      } 
    });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Soft delete by deactivating
    await prisma.user.update({
      where: { id },
      data: { isActive: false },
    });

    // Log the action
    await prisma.auditLog.create({
      data: {
        userId: authReq.user!.userId,
        userEmail: authReq.user!.email,
        userName: authReq.user!.name || authReq.user!.email,
        action: 'DELETED',
        entity: 'User',
        entityId: id,
        changes: JSON.stringify({ isActive: false }),
        ipAddress: req.ip,
      },
    });

    res.json({ message: 'User deactivated successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// Get users by role
usersRouter.get('/by-role/:role', authenticateToken, async (req, res) => {
  try {
    const { role } = req.params;
    const authReq = req as AuthRequest;

    const users = await prisma.user.findMany({
      where: { 
        role: role as any,
        isActive: true,
        companyId: authReq.user!.companyId,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        department: true,
      },
      orderBy: { name: 'asc' },
    });

    res.json(users);
  } catch (error) {
    console.error('Error fetching users by role:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});
