import { Router } from 'express';
import prisma from '../db';

export const dashboardRouter = Router();

dashboardRouter.get('/', async (req, res) => {
  try {
    const [criteria, controls, issues] = await Promise.all([
      prisma.effectivenessCriteria.findMany(),
      prisma.materialControl.findMany(),
      prisma.issue.findMany(),
    ]);

    const effectivenessStatus = {
      met: criteria.filter(c => c.status === 'approved').length,
      partially: criteria.filter(c => c.status === 'in_review').length,
      notMet: criteria.filter(c => c.status === 'rejected').length,
    };

    const controlHealth = {
      tested: controls.filter(c => c.lastTested).length,
      effective: controls.filter(c => c.effectiveness === 'effective').length,
      totalMaterial: controls.length,
    };

    const issuesByTheme: { [key: string]: number } = {};
    issues.forEach(issue => {
      const theme = issue.severity;
      issuesByTheme[theme] = (issuesByTheme[theme] || 0) + 1;
    });

    const issuesArray = Object.entries(issuesByTheme).map(([theme, count]) => ({
      theme,
      count,
    }));

    // Calculate remediation progress from actual issue data
    const now = new Date();
    const remediationProgress = [];
    for (let i = 5; i >= 0; i--) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const nextMonthDate = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      const monthName = monthDate.toLocaleString('en-US', { month: 'short' });
      
      const opened = issues.filter(issue => {
        const createdDate = new Date(issue.createdAt);
        return createdDate >= monthDate && createdDate < nextMonthDate;
      }).length;
      
      const closed = issues.filter(issue => {
        const resolvedDate = issue.resolvedAt ? new Date(issue.resolvedAt) : null;
        return resolvedDate && resolvedDate >= monthDate && resolvedDate < nextMonthDate;
      }).length;
      
      remediationProgress.push({ month: monthName, opened, closed });
    }

    res.json({
      effectivenessStatus,
      controlHealth,
      issuesByTheme: issuesArray,
      remediationProgress,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});
