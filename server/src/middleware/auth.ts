import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../db';

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: string;
    name?: string;
  };
}

export const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any;
    
    // Verify user still exists and is active
    const user = await prisma.user.findUnique({ 
      where: { id: decoded.userId },
      select: { id: true, email: true, role: true, name: true, isActive: true }
    });

    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'Invalid or inactive user' });
    }

    (req as AuthRequest).user = {
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    };

    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

export const requireRole = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const authReq = req as AuthRequest;
    
    if (!authReq.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    if (!allowedRoles.includes(authReq.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
};

export const requirePermission = (permission: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const authReq = req as AuthRequest;
    
    if (!authReq.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    // Permission checking logic based on role
    const hasPermission = checkPermission(authReq.user.role, permission);
    
    if (!hasPermission) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
};

// Permission mapping based on roles
const ROLE_PERMISSIONS: Record<string, string[]> = {
  SYSTEM_ADMIN: [
    'MANAGE_USERS',
    'ASSIGN_ROLES',
    'CONFIGURE_SYSTEM',
    'VIEW_ALL_DATA',
    'VIEW_AUDIT_TRAIL',
    'EXPORT_DATA',
  ],
  FRAMEWORK_OWNER: [
    'CONFIGURE_EFFECTIVENESS_CRITERIA',
    'APPROVE_EFFECTIVENESS_CRITERIA',
    'CREATE_PRINCIPAL_RISKS',
    'EDIT_PRINCIPAL_RISKS',
    'DELETE_PRINCIPAL_RISKS',
    'APPROVE_RISKS',
    'CREATE_CONTROLS',
    'EDIT_ALL_CONTROLS',
    'DELETE_CONTROLS',
    'ASSIGN_CONTROLS',
    'UPLOAD_EVIDENCE',
    'COMPLETE_TESTING',
    'REVIEW_TESTING',
    'SUBMIT_FOR_REVIEW',
    'APPROVE_SECTIONS',
    'BOARD_APPROVAL',
    'LOCK_FRAMEWORK',
    'CREATE_NEW_VERSION',
    'ADD_COMMENTS',
    'RESOLVE_COMMENTS',
    'VIEW_AUDIT_TRAIL',
    'EXPORT_DATA',
    'GENERATE_REPORTS',
    'VIEW_ALL_DATA',
  ],
  CONTROLS_MANAGER: [
    'CREATE_PRINCIPAL_RISKS',
    'EDIT_PRINCIPAL_RISKS',
    'CREATE_CONTROLS',
    'EDIT_ALL_CONTROLS',
    'ASSIGN_CONTROLS',
    'UPLOAD_EVIDENCE',
    'COMPLETE_TESTING',
    'REVIEW_TESTING',
    'SUBMIT_FOR_REVIEW',
    'ADD_COMMENTS',
    'VIEW_AUDIT_TRAIL',
    'EXPORT_DATA',
    'GENERATE_REPORTS',
  ],
  CONTROL_OWNER: [
    'EDIT_OWN_CONTROLS',
    'UPLOAD_EVIDENCE',
    'COMPLETE_TESTING',
    'ADD_COMMENTS',
  ],
  REVIEWER: [
    'ADD_COMMENTS',
    'RESOLVE_COMMENTS',
    'APPROVE_SECTIONS',
    'VIEW_AUDIT_TRAIL',
    'EXPORT_DATA',
  ],
  BOARD_MEMBER: [
    'BOARD_APPROVAL',
    'VIEW_AUDIT_TRAIL',
    'EXPORT_DATA',
  ],
};

function checkPermission(role: string, permission: string): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) || false;
}
