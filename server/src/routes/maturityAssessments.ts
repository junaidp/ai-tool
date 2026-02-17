import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
export const maturityAssessmentsRouter = Router();

// Submit maturity assessment
maturityAssessmentsRouter.post('/', async (req, res) => {
  try {
    const { processId, answers } = req.body;

    // Derive maturity profile from answers
    const maturityProfile = deriveMaturityProfile(answers);

    const assessment = await prisma.processMaturityAssessment.create({
      data: {
        processId,
        assessmentVersion: 1,
        answers: JSON.stringify(answers),
        maturityProfile
      }
    });

    res.json({
      ...assessment,
      answers: JSON.parse(assessment.answers)
    });
  } catch (error) {
    console.error('Failed to create assessment:', error);
    res.status(500).json({ error: 'Failed to create assessment' });
  }
});

// Get assessments for a process
maturityAssessmentsRouter.get('/process/:processId', async (req, res) => {
  try {
    const { processId } = req.params;
    
    const assessments = await prisma.processMaturityAssessment.findMany({
      where: { processId },
      orderBy: { assessmentDate: 'desc' }
    });

    const formatted = assessments.map(a => ({
      ...a,
      answers: JSON.parse(a.answers)
    }));

    res.json(formatted);
  } catch (error) {
    console.error('Failed to fetch assessments:', error);
    res.status(500).json({ error: 'Failed to fetch assessments' });
  }
});

function deriveMaturityProfile(answers: any): string {
  const profiles: string[] = [];
  
  if (answers.automation === 'automated') profiles.push('automated');
  else if (answers.automation === 'erp') profiles.push('erp-enabled');
  else profiles.push('manual');
  
  if (answers.processStructure === 'centralized') profiles.push('centralized');
  else profiles.push('decentralized');
  
  if (answers.failureImpact === 'high') profiles.push('high-risk');
  
  return profiles.join(',');
}
