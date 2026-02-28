import express from 'express';
import { PrismaClient } from '@prisma/client';
import OpenAI from 'openai';

const router = express.Router();
const prisma = new PrismaClient();
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// AI Weighting Recommendation Engine
function generateWeightingRecommendation(profile: any): any {
  // Start with baseline (equal weights)
  let weights = {
    riskIdentification: 14,
    frameworkDesign: 14,
    controlOperating: 14,
    issueResponsiveness: 15,
    riskOutcome: 14,
    governance: 14,
    continuousImprovement: 15
  };

  // Adjust based on stage
  if (profile.stage === 'early') {
    weights.issueResponsiveness += 15;
    weights.riskIdentification += 10;
    weights.controlOperating -= 10;
    weights.governance -= 9;
    weights.continuousImprovement -= 6;
  } else if (profile.stage === 'growth') {
    weights.issueResponsiveness += 10;
    weights.riskIdentification += 8;
    weights.controlOperating -= 5;
    weights.governance -= 5;
    weights.continuousImprovement -= 3;
  } else if (profile.stage === 'mature') {
    weights.controlOperating += 10;
    weights.frameworkDesign += 8;
    weights.issueResponsiveness -= 5;
    weights.riskIdentification -= 5;
    weights.continuousImprovement -= 3;
  } else if (profile.stage === 'transformation') {
    weights.issueResponsiveness += 12;
    weights.riskIdentification += 8;
    weights.continuousImprovement += 5;
    weights.governance -= 8;
  }

  // Adjust based on ownership
  if (profile.ownership === 'pe') {
    weights.issueResponsiveness += 8;
    weights.riskOutcome += 5;
    weights.governance -= 5;
  } else if (profile.ownership === 'public') {
    weights.controlOperating += 10;
    weights.governance += 5;
    weights.frameworkDesign += 5;
    weights.issueResponsiveness -= 8;
  } else if (profile.ownership === 'vc') {
    weights.riskIdentification += 5;
    weights.issueResponsiveness += 5;
    weights.governance -= 3;
  }

  // Adjust based on regulatory
  if (profile.regulatory === 'heavy') {
    weights.controlOperating += 10;
    weights.frameworkDesign += 8;
    weights.issueResponsiveness -= 5;
    weights.continuousImprovement -= 3;
  } else if (profile.regulatory === 'light') {
    weights.issueResponsiveness += 5;
    weights.riskIdentification += 3;
    weights.controlOperating -= 5;
  }

  // Adjust based on priorities
  if (profile.priorities?.includes('Rapid Growth / Market Expansion')) {
    weights.riskIdentification += 5;
    weights.issueResponsiveness += 3;
  }
  if (profile.priorities?.includes('Operational Excellence')) {
    weights.controlOperating += 8;
    weights.continuousImprovement += 5;
  }
  if (profile.priorities?.includes('M&A / Integration')) {
    weights.riskIdentification += 5;
    weights.issueResponsiveness += 5;
  }
  if (profile.priorities?.includes('Exit Preparation (IPO / Sale)')) {
    weights.frameworkDesign += 8;
    weights.controlOperating += 8;
    weights.governance += 5;
  }
  if (profile.priorities?.includes('Regulatory Compliance')) {
    weights.controlOperating += 8;
    weights.governance += 5;
  }

  // Adjust based on maturity
  if (profile.maturity === 1) {
    weights.frameworkDesign += 8;
    weights.controlOperating -= 5;
    weights.continuousImprovement -= 5;
  } else if (profile.maturity >= 3) {
    weights.controlOperating += 5;
    weights.continuousImprovement += 5;
    weights.frameworkDesign -= 5;
  }

  // Adjust based on risk appetite
  if (profile.riskAppetite === 'low') {
    weights.controlOperating += 8;
    weights.frameworkDesign += 5;
    weights.governance += 3;
  } else if (profile.riskAppetite === 'high') {
    weights.issueResponsiveness += 5;
    weights.controlOperating -= 5;
  }

  // Adjust based on size/complexity
  if (profile.size?.complexity === 'complex' || profile.size?.geographic === 'global') {
    weights.controlOperating += 5;
    weights.governance += 3;
    weights.frameworkDesign += 3;
  }

  // Normalize to 100%
  const total = Object.values(weights).reduce((a, b) => a + b, 0);
  for (let key in weights) {
    weights[key as keyof typeof weights] = Math.round((weights[key as keyof typeof weights] / total) * 100);
  }

  // Ensure total is exactly 100 (handle rounding)
  const actualTotal = Object.values(weights).reduce((a, b) => a + b, 0);
  if (actualTotal !== 100) {
    weights.issueResponsiveness += (100 - actualTotal);
  }

  return weights;
}

// Generate sub-criteria and targets based on profile
function generateCriteriaConfigs(weights: any, profile: any): any {
  const configs: any = {};

  // Risk Identification
  configs.riskIdentification = {
    weight: weights.riskIdentification,
    subCriteria: ['Completeness (no surprises)', 'Accuracy', 'Forward-looking (emerging risks)'],
    target: profile.stage === 'early' || profile.stage === 'growth' ? 90 : 85,
    methods: [
      { type: 'Risk register review', description: 'Quarterly review of identified risks vs. actual incidents' },
      { type: 'Stakeholder interviews', description: 'Annual interviews with key stakeholders' }
    ],
    rationale: profile.stage === 'early' || profile.stage === 'growth' 
      ? 'High growth creates new, emerging risks that must be identified quickly'
      : 'Mature operations require comprehensive risk identification'
  };

  // Framework Design
  configs.frameworkDesign = {
    weight: weights.frameworkDesign,
    subCriteria: ['Control type balance (preventive focus)', 'Coverage of risk causes', 'Ownership at right level'],
    target: profile.maturity === 1 || profile.maturity === 2 ? 85 : 90,
    methods: [
      { type: 'Control design review', description: 'Annual review of control design quality' },
      { type: 'Gap analysis', description: 'Quarterly gap analysis vs. best practice' }
    ],
    rationale: profile.maturity <= 2 
      ? 'Building framework correctly now is critical for future maturity'
      : 'Mature framework requires high design quality'
  };

  // Control Operating
  configs.controlOperating = {
    weight: weights.controlOperating,
    subCriteria: ['Operating rate >90%', 'Evidence quality', 'Timeliness', 'Exception handling'],
    target: profile.maturity <= 2 ? 85 : 95,
    methods: [
      { type: 'Testing results', description: 'Continuous monitoring of control execution' },
      { type: 'Evidence review', description: 'Quarterly review of evidence quality' }
    ],
    rationale: profile.maturity <= 2 
      ? '85% operating rate is realistic for developing maturity'
      : '95%+ operating rate expected for mature controls'
  };

  // Issue Responsiveness
  configs.issueResponsiveness = {
    weight: weights.issueResponsiveness,
    subCriteria: ['Detection within 1 week', 'Action within 2 weeks', '90% appropriate responses', 'Critical issues to board within 24 hours'],
    target: profile.ownership === 'pe' || profile.stage === 'early' ? 95 : 90,
    methods: [
      { type: 'Issue tracking', description: 'Continuous monitoring of issue detection and response times' },
      { type: 'Remediation review', description: 'Monthly review of remediation quality' }
    ],
    rationale: profile.ownership === 'pe' 
      ? 'PE ownership demands quarterly performance - fast issue resolution is critical'
      : 'Timely issue response is essential for effective risk management'
  };

  // Risk Outcome
  configs.riskOutcome = {
    weight: weights.riskOutcome,
    subCriteria: ['70% of strategic objectives achieved', 'No incidents from TOP 5 risks', 'Leading indicators trending right'],
    target: profile.stage === 'early' || profile.maturity <= 2 ? 75 : 85,
    methods: [
      { type: 'Objective tracking', description: 'Quarterly review of strategic objective achievement' },
      { type: 'Incident analysis', description: 'Continuous monitoring of risk incidents' }
    ],
    rationale: profile.stage === 'early' || profile.maturity <= 2 
      ? 'Realistic target for early stage or developing maturity'
      : 'Higher target for mature risk management'
  };

  // Governance
  configs.governance = {
    weight: weights.governance,
    subCriteria: ['Quarterly audit committee reviews', 'Board approves framework', 'Effective challenge'],
    target: profile.ownership === 'public' ? 90 : 80,
    methods: [
      { type: 'Board minutes review', description: 'Quarterly review of board engagement' },
      { type: 'Governance assessment', description: 'Annual governance effectiveness assessment' }
    ],
    rationale: profile.ownership === 'public' 
      ? 'Public companies require strong board oversight'
      : 'Adequate oversight sufficient for private companies'
  };

  // Continuous Improvement
  configs.continuousImprovement = {
    weight: weights.continuousImprovement,
    subCriteria: ['3+ improvements implemented per year', 'Maturity score increases by 0.2+ annually'],
    target: profile.maturity <= 2 ? 70 : 85,
    methods: [
      { type: 'Improvement tracking', description: 'Quarterly tracking of improvements implemented' },
      { type: 'Maturity assessment', description: 'Annual maturity assessment' }
    ],
    rationale: profile.maturity <= 2 
      ? 'Building first, improving second for developing frameworks'
      : 'Continuous improvement is key for mature frameworks'
  };

  return configs;
}

// Generate reasoning for each criterion
function generateReasoning(profile: any): any {
  const reasoning: any = {};

  reasoning.riskIdentification = profile.stage === 'early' || profile.stage === 'growth'
    ? `You selected "${profile.stage}" stage. High growth creates new, emerging risks that must be identified quickly.`
    : `Mature operations require comprehensive risk identification to maintain stability.`;

  reasoning.frameworkDesign = profile.maturity <= 2
    ? `You're at maturity level ${profile.maturity}. Building framework correctly now is critical.`
    : `Mature framework requires high design quality and consistency.`;

  reasoning.controlOperating = profile.regulatory === 'heavy'
    ? `Heavily regulated environment demands high control reliability.`
    : `Control reliability is important but balanced with agility needs.`;

  reasoning.issueResponsiveness = profile.ownership === 'pe'
    ? `PE ownership demands quarterly performance. Fast issue detection and resolution is critical for value creation.`
    : `Timely issue response is essential for effective risk management.`;

  reasoning.riskOutcome = profile.stage === 'early' || profile.maturity <= 2
    ? `Early stage/developing maturity - focus on building framework, outcomes will improve over time.`
    : `Mature framework should demonstrate clear risk reduction outcomes.`;

  reasoning.governance = profile.ownership === 'public'
    ? `Public company status requires strong board oversight and governance.`
    : profile.ownership === 'pe'
    ? `PE partner on board provides strong oversight already.`
    : `Adequate oversight sufficient for your ownership structure.`;

  reasoning.continuousImprovement = profile.maturity <= 2
    ? `Framework still being built. Improvement is secondary to establishment.`
    : `Mature framework should continuously improve and evolve.`;

  return reasoning;
}

// POST /api/effectiveness-criteria-v2/generate-recommendation
router.post('/generate-recommendation', async (req, res) => {
  try {
    const profile = req.body.profile;

    // Generate weights using algorithm
    const weights = generateWeightingRecommendation(profile);

    // Generate detailed configs for each criterion
    const criteriaConfigs = generateCriteriaConfigs(weights, profile);

    // Generate reasoning
    const reasoning = generateReasoning(profile);

    // Calculate overall target based on profile
    let overallTarget = 85; // Default
    if (profile.maturity <= 2) overallTarget = 80;
    if (profile.maturity >= 3) overallTarget = 90;
    if (profile.ownership === 'public') overallTarget = 90;

    res.json({
      weights,
      criteriaConfigs,
      reasoning,
      overallTarget
    });
  } catch (error) {
    console.error('Error generating recommendation:', error);
    res.status(500).json({ error: 'Failed to generate recommendation' });
  }
});

// POST /api/effectiveness-criteria-v2/save-config
router.post('/save-config', async (req, res) => {
  try {
    const { companyProfile, criteria, overallTarget, pathway } = req.body;

    // Deactivate any existing active configs
    await prisma.effectivenessCriteriaConfig.updateMany({
      where: { companyId: 'default', active: true },
      data: { active: false }
    });

    // Create new config
    const config = await prisma.effectivenessCriteriaConfig.create({
      data: {
        companyId: 'default',
        version: '1.0',
        pathway,
        companyProfile: JSON.stringify(companyProfile),
        criteriaConfig: JSON.stringify(criteria),
        overallTarget,
        boardApproved: false,
        active: true
      }
    });

    res.json(config);
  } catch (error) {
    console.error('Error saving config:', error);
    res.status(500).json({ error: 'Failed to save configuration' });
  }
});

// GET /api/effectiveness-criteria-v2/config
router.get('/config', async (req, res) => {
  try {
    const config = await prisma.effectivenessCriteriaConfig.findFirst({
      where: { companyId: 'default', active: true },
      orderBy: { createdAt: 'desc' }
    });

    if (!config) {
      return res.json(null);
    }

    // Parse JSON fields
    const parsed = {
      ...config,
      companyProfile: JSON.parse(config.companyProfile),
      criteriaConfig: JSON.parse(config.criteriaConfig)
    };

    res.json(parsed);
  } catch (error) {
    console.error('Error fetching config:', error);
    res.status(500).json({ error: 'Failed to fetch configuration' });
  }
});

// PUT /api/effectiveness-criteria-v2/config/:id
router.put('/config/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { companyProfile, criteria, overallTarget, pathway } = req.body;

    const config = await prisma.effectivenessCriteriaConfig.update({
      where: { id },
      data: {
        pathway,
        companyProfile: JSON.stringify(companyProfile),
        criteriaConfig: JSON.stringify(criteria),
        overallTarget
      }
    });

    res.json(config);
  } catch (error) {
    console.error('Error updating config:', error);
    res.status(500).json({ error: 'Failed to update configuration' });
  }
});

// POST /api/effectiveness-criteria-v2/approve
router.post('/approve', async (req, res) => {
  try {
    const { configId, approvedBy } = req.body;

    const config = await prisma.effectivenessCriteriaConfig.update({
      where: { id: configId },
      data: {
        boardApproved: true,
        approvedBy,
        approvedDate: new Date()
      }
    });

    res.json(config);
  } catch (error) {
    console.error('Error approving config:', error);
    res.status(500).json({ error: 'Failed to approve configuration' });
  }
});

// POST /api/effectiveness-criteria-v2/generate-custom-framework
router.post('/generate-custom-framework', async (req, res) => {
  try {
    const { companyProfile, effectivenessCriteria, companyName } = req.body;

    // Use AI to generate the complete custom framework
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      max_tokens: 16000,
      temperature: 0.7,
      messages: [{
        role: 'user',
        content: `You are an expert in UK Corporate Governance Code Provision 29 compliance and risk management frameworks.

Generate a complete Material Controls Framework document for the following company:

COMPANY PROFILE:
- Company Name: ${companyName}
- Stage: ${companyProfile.stage}
- Ownership: ${companyProfile.ownership}
- Regulatory Environment: ${companyProfile.regulatory}
- Current Maturity Level: ${companyProfile.maturity}
- Risk Appetite: ${companyProfile.riskAppetite}
- Strategic Priorities: ${companyProfile.priorities?.join(', ')}
- Size: ${companyProfile.size.revenue} revenue, ${companyProfile.size.employees} employees
- Geographic Scope: ${companyProfile.size.geographic}
- Complexity: ${companyProfile.size.complexity}

EFFECTIVENESS CRITERIA (User's Custom Weightings):
- Risk Identification: ${effectivenessCriteria.weights.riskIdentification}%
- Framework Design: ${effectivenessCriteria.weights.frameworkDesign}%
- Control Operating: ${effectivenessCriteria.weights.controlOperating}%
- Issue Responsiveness: ${effectivenessCriteria.weights.issueResponsiveness}% ${effectivenessCriteria.weights.issueResponsiveness >= 20 ? '(HIGH PRIORITY)' : ''}
- Risk Outcome: ${effectivenessCriteria.weights.riskOutcome}%
- Governance: ${effectivenessCriteria.weights.governance}%
- Continuous Improvement: ${effectivenessCriteria.weights.continuousImprovement}%
Overall Target: ${effectivenessCriteria.overallTarget}%

Generate a complete custom framework with these 5 CORE ELEMENTS. Each element should be 2-4 paragraphs of detailed, actionable content tailored to this specific company:

1. RISK IDENTIFICATION APPROACH
   - Methodology for identifying principal risks (FRC's 4 categories: business model, performance, solvency, liquidity)
   - Prioritization criteria (likelihood × impact scoring)
   - Review cycle (quarterly/annual)
   - Tailor to their industry, stage, and priorities

2. CONTROL DESIGN METHODOLOGY
   - Maturity-based approach (current Level ${companyProfile.maturity}, target Level ${Math.min(companyProfile.maturity + 1, 4)})
   - Control design principles (preventive/detective/corrective balance)
   - Implementation timeline (3 phases over 12 months)
   - Emphasize their #1 effectiveness priority

3. EFFECTIVENESS ASSESSMENT CRITERIA
   - How "effective" is defined using THEIR weighted criteria
   - Overall threshold (${effectivenessCriteria.overallTarget}% = effective)
   - Testing methodology (varies by risk priority)
   - Specific metrics for each criterion

4. GOVERNANCE & ACCOUNTABILITY
   - Three lines of defense structure
   - Board oversight responsibilities and meeting cadence
   - Management accountability (CFO as framework owner)
   - Escalation process with timeframes
   - Tailor to their ownership structure (${companyProfile.ownership})

5. CONTINUOUS IMPROVEMENT PROCESS
   - Improvement triggers (new risks, control failures, maturity progression)
   - Review cycles (quarterly, annual, post-incident)
   - Maturity journey roadmap (Level ${companyProfile.maturity} → Level ${Math.min(companyProfile.maturity + 1, 4)} over 2-3 years)
   - Learning capture process

Also generate:
- EXECUTIVE SUMMARY (3-4 paragraphs summarizing the framework)
- CURRENT RISK PROFILE (example: "13 principal risks identified, 8 HIGH priority")
- CURRENT CONTROL PROFILE (example: "58 material controls, average maturity 2.2")
- MATURITY JOURNEY (3-year roadmap from current to target maturity)

IMPORTANT REQUIREMENTS:
- Use plain, professional language (NO COSO jargon)
- Make it specific to THIS company's context
- Reference their priorities, ownership structure, and maturity level throughout
- The framework should feel like THEIR framework, not a generic template
- Focus on practical, actionable guidance
- Emphasize their highest-weighted effectiveness criterion

Return as JSON with this structure:
{
  "frameworkName": "string (e.g., '${companyName} Material Controls Framework')",
  "executiveSummary": "string (3-4 paragraphs)",
  "elements": {
    "riskIdentification": {
      "title": "Risk Identification Approach",
      "content": "string (detailed content)"
    },
    "controlDesign": {
      "title": "Control Design Methodology", 
      "content": "string (detailed content)"
    },
    "effectivenessAssessment": {
      "title": "Effectiveness Assessment Criteria",
      "content": "string (detailed content)"
    },
    "governance": {
      "title": "Governance & Accountability",
      "content": "string (detailed content)"
    },
    "continuousImprovement": {
      "title": "Continuous Improvement Process",
      "content": "string (detailed content)"
    }
  },
  "currentRiskProfile": "string (1-2 paragraphs)",
  "currentControlProfile": "string (1-2 paragraphs)",
  "maturityJourney": "string (3-year roadmap, 2-3 paragraphs)"
}`
      }]
    });

    const responseText = completion.choices[0]?.message?.content || '';
    
    // Parse the JSON response
    let frameworkData;
    try {
      // Extract JSON from markdown code blocks if present
      const jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/) || responseText.match(/```\n([\s\S]*?)\n```/);
      const jsonText = jsonMatch ? jsonMatch[1] : responseText;
      frameworkData = JSON.parse(jsonText);
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      return res.status(500).json({ error: 'Failed to parse framework generation response' });
    }

    // Add metadata
    const framework = {
      id: `framework_${Date.now()}`,
      name: frameworkData.frameworkName,
      version: '1.0',
      effectiveDate: new Date().toISOString().split('T')[0],
      companyName,
      companyProfile,
      effectivenessCriteria,
      elements: {
        riskIdentification: { ...frameworkData.elements.riskIdentification, id: 'risk_id', order: 1 },
        controlDesign: { ...frameworkData.elements.controlDesign, id: 'control_design', order: 2 },
        effectivenessAssessment: { ...frameworkData.elements.effectivenessAssessment, id: 'effectiveness', order: 3 },
        governance: { ...frameworkData.elements.governance, id: 'governance', order: 4 },
        continuousImprovement: { ...frameworkData.elements.continuousImprovement, id: 'improvement', order: 5 }
      },
      executiveSummary: frameworkData.executiveSummary,
      currentRiskProfile: frameworkData.currentRiskProfile,
      currentControlProfile: frameworkData.currentControlProfile,
      maturityJourney: frameworkData.maturityJourney,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      approved: false
    };

    res.json(framework);
  } catch (error) {
    console.error('Error generating custom framework:', error);
    res.status(500).json({ error: 'Failed to generate custom framework' });
  }
});

// POST /api/effectiveness-criteria-v2/generate-board-document
router.post('/generate-board-document', async (req, res) => {
  try {
    const { configId } = req.body;

    const config = await prisma.effectivenessCriteriaConfig.findUnique({
      where: { id: configId }
    });

    if (!config) {
      return res.status(404).json({ error: 'Configuration not found' });
    }

    const profile = JSON.parse(config.companyProfile);
    const criteria = JSON.parse(config.criteriaConfig);

    // Use AI to generate board approval document
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      max_tokens: 4000,
      messages: [{
        role: 'user',
        content: `Generate a professional board approval document for effectiveness criteria.

Company Profile:
- Stage: ${profile.stage}
- Ownership: ${profile.ownership}
- Regulatory: ${profile.regulatory}
- Maturity: Level ${profile.maturity}
- Priorities: ${profile.priorities?.join(', ')}

Effectiveness Criteria Weightings:
- Risk Identification: ${criteria.riskIdentification.weight}%
- Framework Design: ${criteria.frameworkDesign.weight}%
- Control Operating: ${criteria.controlOperating.weight}%
- Issue Responsiveness: ${criteria.issueResponsiveness.weight}%
- Risk Outcome: ${criteria.riskOutcome.weight}%
- Governance: ${criteria.governance.weight}%
- Continuous Improvement: ${criteria.continuousImprovement.weight}%

Overall Target: ${config.overallTarget}%

Generate a 2-3 page board paper with:
1. Executive Summary
2. Background and Context
3. Proposed Effectiveness Criteria Framework
4. Rationale for Weightings
5. Implementation Approach
6. Board Approval Request

Format as markdown.`
      }]
    });

    const document = completion.choices[0]?.message?.content || '';

    res.json({ document });
  } catch (error) {
    console.error('Error generating board document:', error);
    res.status(500).json({ error: 'Failed to generate board document' });
  }
});

export default router;
