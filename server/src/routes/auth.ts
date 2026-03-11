import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../db';
import { UserRole } from '@prisma/client';

export const authRouter = Router();

authRouter.post('/signup', async (req, res) => {
  try {
    const { companyName, adminName, adminEmail, password } = req.body;

    if (!companyName || !adminName || !adminEmail || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const existingCompany = await prisma.company.findUnique({ 
      where: { name: companyName } 
    });
    
    if (existingCompany) {
      return res.status(400).json({ error: 'Company name already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const company = await prisma.company.create({
      data: {
        name: companyName,
        isActive: true,
      },
    });

    const user = await prisma.user.create({
      data: {
        email: adminEmail,
        password: hashedPassword,
        name: adminName,
        role: UserRole.SYSTEM_ADMIN,
        companyId: company.id,
        isActive: true,
      },
    });

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role, companyId: company.id },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: { 
        id: user.id, 
        email: user.email, 
        name: user.name, 
        role: user.role,
        companyId: company.id,
        companyName: company.name,
      },
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Failed to create company and admin user' });
  }
});

authRouter.post('/register', async (req, res) => {
  try {
    const { email, password, name, role, companyId } = req.body;

    if (!companyId) {
      return res.status(400).json({ error: 'Company ID is required' });
    }

    const company = await prisma.company.findUnique({ where: { id: companyId } });
    if (!company || !company.isActive) {
      return res.status(400).json({ error: 'Invalid or inactive company' });
    }

    const existingUser = await prisma.user.findFirst({ 
      where: { email, companyId } 
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
        role: role || UserRole.CONTROL_OWNER,
        companyId,
      },
    });

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role, companyId: user.companyId },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: { 
        id: user.id, 
        email: user.email, 
        name: user.name, 
        role: user.role,
        companyId: user.companyId,
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Failed to register user' });
  }
});

authRouter.post('/login', async (req, res) => {
  try {
    const { email, password, companyName } = req.body;

    if (!companyName) {
      return res.status(400).json({ error: 'Company name is required' });
    }

    const company = await prisma.company.findUnique({ 
      where: { name: companyName } 
    });
    
    if (!company) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (!company.isActive) {
      return res.status(401).json({ error: 'Company account is inactive' });
    }

    const user = await prisma.user.findFirst({ 
      where: { 
        email,
        companyId: company.id 
      },
      include: {
        company: true,
      },
    });
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (!user.isActive) {
      return res.status(401).json({ error: 'User account is inactive' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role, companyId: user.companyId },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: { 
        id: user.id, 
        email: user.email, 
        name: user.name, 
        role: user.role,
        companyId: user.companyId,
        companyName: user.company.name,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Failed to login' });
  }
});

authRouter.get('/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as any;
    const user = await prisma.user.findUnique({ 
      where: { id: decoded.userId },
      include: {
        company: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!user.isActive || !user.company.isActive) {
      return res.status(401).json({ error: 'User or company is inactive' });
    }

    res.json({ 
      id: user.id, 
      email: user.email, 
      name: user.name, 
      role: user.role,
      companyId: user.companyId,
      companyName: user.company.name,
      isActive: user.isActive,
    });
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
});
