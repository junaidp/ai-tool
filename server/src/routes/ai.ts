import { Router } from 'express';
import * as aiService from '../services/ai';

export const aiRouter = Router();

// Generate effectiveness criteria using AI
aiRouter.post('/generate-criteria', async (req, res) => {
  try {
    const { regulatoryPosture, operatingStage, complexity, governanceMaturity } = req.body;

    if (!regulatoryPosture || !operatingStage || !complexity || !governanceMaturity) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const criteria = await aiService.generateEffectivenessCriteria({
      regulatoryPosture,
      operatingStage,
      complexity,
      governanceMaturity,
    });

    res.json({ criteria });
  } catch (error: any) {
    console.error('AI generation error:', error);
    console.error('Error details:', error.message, error.response?.data);
    res.status(500).json({ 
      error: 'Failed to generate criteria',
      details: error.message 
    });
  }
});

// Score control effectiveness using AI
aiRouter.post('/score-control', async (req, res) => {
  try {
    const { controlName, controlDescription, testResults } = req.body;

    if (!controlName || !controlDescription) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = await aiService.scoreControlEffectiveness(
      controlName,
      controlDescription,
      testResults || 'No test results available'
    );

    res.json(result);
  } catch (error) {
    console.error('AI scoring error:', error);
    res.status(500).json({ error: 'Failed to score control' });
  }
});

// Generate control gaps using AI
aiRouter.post('/generate-gaps', async (req, res) => {
  try {
    const { frameworkType, existingControls } = req.body;

    if (!frameworkType || !Array.isArray(existingControls)) {
      return res.status(400).json({ error: 'Invalid input' });
    }

    const gaps = await aiService.generateControlGaps(frameworkType, existingControls);

    res.json({ gaps });
  } catch (error) {
    console.error('AI gap generation error:', error);
    res.status(500).json({ error: 'Failed to generate gaps' });
  }
});

// Generate risk-control mapping using AI
aiRouter.post('/generate-controls', async (req, res) => {
  try {
    const { riskDescription, riskLevel } = req.body;

    if (!riskDescription || !riskLevel) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const controls = await aiService.generateRiskControlMapping(
      riskDescription,
      riskLevel
    );

    res.json({ controls });
  } catch (error: any) {
    console.error('AI control generation error:', error);
    console.error('Error details:', error.message, error.response?.data);
    res.status(500).json({ 
      error: 'Failed to generate controls',
      details: error.message 
    });
  }
});

// Generate principal risks from business context
aiRouter.post('/generate-principal-risks', async (req, res) => {
  try {
    const { industry, annualRevenue, employeeCount, isProfitable, fundingType, customerDescription, strategicPriorities } = req.body;

    if (!industry || !annualRevenue || !customerDescription) {
      return res.status(400).json({ error: 'Missing required business context fields' });
    }

    const risks = await aiService.generatePrincipalRisks({
      industry,
      annualRevenue,
      employeeCount: employeeCount || '',
      isProfitable: isProfitable || '',
      fundingType: fundingType || '',
      customerDescription,
      strategicPriorities: strategicPriorities || [],
    });

    res.json({ risks });
  } catch (error: any) {
    console.error('AI principal risk generation error:', error);
    res.status(500).json({
      error: 'Failed to generate principal risks',
      details: error.message,
    });
  }
});

// Edit a principal risk definition with AI
aiRouter.post('/edit-risk-definition', async (req, res) => {
  try {
    const { originalRisk, userEdits, businessContext } = req.body;

    if (!originalRisk || !userEdits || !businessContext) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = await aiService.editRiskDefinition(originalRisk, userEdits, businessContext);
    res.json(result);
  } catch (error: any) {
    console.error('AI risk edit error:', error);
    res.status(500).json({
      error: 'Failed to edit risk definition',
      details: error.message,
    });
  }
});

// Score a principal risk
aiRouter.post('/score-risk', async (req, res) => {
  try {
    const { riskTitle, riskDefinition, businessContext } = req.body;

    if (!riskTitle || !riskDefinition || !businessContext) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = await aiService.scoreRisk(riskTitle, riskDefinition, businessContext);
    res.json(result);
  } catch (error: any) {
    console.error('AI risk scoring error:', error);
    res.status(500).json({
      error: 'Failed to score risk',
      details: error.message,
    });
  }
});

// Edit effectiveness criteria using AI conversational prompt
aiRouter.post('/edit-criteria', async (req, res) => {
  try {
    const { currentCriteria, editPrompt } = req.body;

    if (!currentCriteria || !editPrompt) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = await aiService.editCriteriaWithAI(
      currentCriteria,
      editPrompt
    );

    res.json(result);
  } catch (error: any) {
    console.error('AI criteria edit error:', error);
    console.error('Error details:', error.message, error.response?.data);
    res.status(500).json({ 
      error: 'Failed to edit criteria with AI',
      details: error.message 
    });
  }
});
