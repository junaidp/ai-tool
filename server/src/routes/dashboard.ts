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

    const remediationProgress = [
      { month: 'Sep', opened: 8, closed: 6 },
      { month: 'Oct', opened: 12, closed: 10 },
      { month: 'Nov', opened: 7, closed: 9 },
      { month: 'Dec', opened: 10, closed: 8 },
      { month: 'Jan', opened: 9, closed: 11 },
      { month: 'Feb', opened: 5, closed: 3 },
    ];

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
