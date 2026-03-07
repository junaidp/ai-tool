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
      model: 'gpt-4o-mini',
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

Generate a complete custom framework with these 5 CORE ELEMENTS. Each element should be 3-5 paragraphs of DETAILED, COMPREHENSIVE content with:
- Specific responsibilities for each role (Board, Management, Process Owners)
- Detailed methodologies and processes (step-by-step where applicable)
- Clear workflow descriptions and decision points
- Concrete examples specific to ${companyName}'s context
- Timelines, frequencies, and cadences
- Escalation paths and thresholds

Make the content MUCH MORE DETAILED than a typical template:

1. RISK IDENTIFICATION APPROACH (3-5 detailed paragraphs)
   - DETAILED methodology for identifying principal risks (FRC's 4 categories: business model, performance, solvency, liquidity)
   - Specific responsibilities: Who identifies risks (process owners, risk managers, executive team), how they collect inputs (workshops, data analysis, stakeholder interviews)
   - Detailed prioritization process: likelihood × impact scoring methodology with specific criteria for each score (1-5), who scores, approval process
   - Review cycle with specific cadence: monthly risk reviews, quarterly deep dives, annual comprehensive assessment
   - Risk taxonomy structure and how it's maintained
   - Integration with strategic planning and business change processes
   - Tools and systems used for risk tracking
   - Tailor ALL details to ${companyName}'s industry, stage, size, and priorities

2. CONTROL DESIGN METHODOLOGY (3-5 detailed paragraphs)
   - DETAILED maturity-based approach (current Level ${companyProfile.maturity}, target Level ${Math.min(companyProfile.maturity + 1, 4)})
   - Specific responsibilities: Control design owners (risk teams, process owners), reviewers (internal audit, compliance), approvers (risk committee)
   - Comprehensive control design process: How controls are identified for each principal risk, design workshops, testing before rollout
   - Control design principles with specific examples: preventive controls (what types, when to use), detective controls (monitoring frequency, thresholds), corrective controls (remediation timeframes)
   - Control documentation standards: what must be documented (owner, frequency, evidence, test approach)
   - Implementation methodology: 3 phases over 12 months with specific activities in each phase, resource requirements, dependencies
   - How control effectiveness is built into the design (automation, segregation of duties, system controls)
   - Emphasize their #1 effectiveness priority: ${effectivenessCriteria.weights.issueResponsiveness >= 20 ? 'rapid issue detection and response' : 'systematic risk mitigation'}

3. EFFECTIVENESS ASSESSMENT CRITERIA (3-5 detailed paragraphs)
   - COMPREHENSIVE definition of "effective" using THEIR weighted criteria
   - Detailed scoring methodology: How each of the 7 criteria is measured, who measures it, evidence required, calculation methods
   - Overall threshold explanation (${effectivenessCriteria.overallTarget}% = effective) with examples of what "effective" looks like for ${companyName}
   - Testing methodology that varies by risk priority: HIGH priority risks (quarterly testing, larger samples), MEDIUM priority (semi-annual), LOWER priority (annual)
   - Specific responsibilities: First line testing (process owners), second line review (risk/compliance), third line assurance (internal audit)
   - Detailed metrics for each criterion with measurement approach:
     * Risk Identification (${effectivenessCriteria.weights.riskIdentification}%): completeness metrics, forward-looking indicators
     * Framework Design (${effectivenessCriteria.weights.frameworkDesign}%): control coverage %, design quality scores
     * Control Operating (${effectivenessCriteria.weights.controlOperating}%): operating rate %, exception frequency
     * Issue Responsiveness (${effectivenessCriteria.weights.issueResponsiveness}%): detection time, remediation speed
     * Risk Outcome (${effectivenessCriteria.weights.riskOutcome}%): objectives achieved %, incidents prevented
     * Governance (${effectivenessCriteria.weights.governance}%): board engagement metrics, challenge quality
     * Continuous Improvement (${effectivenessCriteria.weights.continuousImprovement}%): improvements implemented, maturity progression
   - Assessment frequency and reporting cycles
   - Aggregation methodology to calculate overall effectiveness score

4. GOVERNANCE & ACCOUNTABILITY (3-5 detailed paragraphs)
   - DETAILED three lines of defense structure with specific responsibilities:
     * First Line (Business/Process Owners): Daily risk/control execution, exception handling, self-assessment, evidence retention. Specific roles and reporting lines.
     * Second Line (Risk/Compliance): Framework design, policy setting, independent review, challenge, aggregated reporting. Team structure and authorities.
     * Third Line (Internal Audit): Independent assurance, deep-dive testing, maturity assessment. Audit plan and approach.
   - Board oversight structure tailored to ${companyProfile.ownership}:
     * Board/Audit Committee: Specific responsibilities (framework approval, quarterly reviews, material weakness oversight), meeting cadence (quarterly deep dives, annual comprehensive review)
     * Risk Committee: Monthly risk profile reviews, control effectiveness trends, emerging risks, investment decisions
     * Executive Management: Weekly/bi-weekly risk discussions, monthly detailed reviews, accountability for remediation
   - Detailed accountability framework:
     * Framework Owner (CFO/CRO): overall accountability, resource allocation, board reporting
     * Risk Owners: specific accountability for their principal risks, control effectiveness, remediation
     * Control Owners: day-to-day execution, evidence management, issue escalation
   - COMPREHENSIVE escalation process with specific thresholds and timeframes:
     * Critical issues: immediate escalation to CRO + notification to Audit Committee within 24 hours
     * High priority issues: escalation within 48 hours, management review within 1 week
     * Medium issues: weekly escalation, monthly management review
   - Clear decision rights and approval authorities at each level
   - Regular governance forum structure (meeting cadence, attendees, agendas, outputs)

5. CONTINUOUS IMPROVEMENT PROCESS (3-5 detailed paragraphs)
   - DETAILED improvement triggers with specific criteria and processes:
     * New/emerging risks: How identified, assessment process, control design, implementation timeline
     * Control failures: Root cause analysis methodology (5-whys, fishbone), remediation approach, retesting requirements
     * Maturity progression: Criteria for moving to next level, investment cases, board approval process
     * Regulatory changes: Monitoring process, impact assessment, control updates
     * Business changes: M&A integration, new products/markets, system changes - how framework adapts
   - Comprehensive review cycles with specific activities:
     * Quarterly reviews: Control operating effectiveness, issue trends, metrics review, minor updates
     * Annual comprehensive reviews: Full risk reassessment, control rationalization, maturity assessment, strategic alignment
     * Post-incident reviews: Detailed RCA, framework gaps, systemic improvements, lessons learned distribution
   - DETAILED maturity journey roadmap (Level ${companyProfile.maturity} → Level ${Math.min(companyProfile.maturity + 1, 4)} over 2-3 years):
     * Year 1: Specific capabilities to build, controls to implement, processes to establish
     * Year 2: Enhancement areas, automation opportunities, efficiency gains
     * Year 3: Target state achievement, advanced capabilities, industry benchmarking
     * Investment requirements (FTEs, systems, consulting) for each year
   - Learning capture and knowledge management:
     * Lessons learned database with search capability
     * Monthly knowledge sharing sessions
     * Best practice documentation and templates
     * Training program for new risks/controls
   - Innovation and efficiency initiatives:
     * Control automation roadmap
     * Process improvement targets (% reduction in manual effort)
     * Technology enablement (GRC systems, data analytics)

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
      model: 'gpt-4o-mini',
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

// POST /api/effectiveness-criteria-v2/save-custom-framework
router.post('/save-custom-framework', async (req, res) => {
  try {
    const frameworkData = req.body;

    // Deactivate any existing active custom frameworks
    await prisma.customFramework.updateMany({
      where: { active: true },
      data: { active: false }
    });

    // Create new custom framework
    const customFramework = await prisma.customFramework.create({
      data: {
        name: frameworkData.name,
        version: frameworkData.version,
        effectiveDate: frameworkData.effectiveDate,
        companyName: frameworkData.companyName,
        companyProfile: JSON.stringify(frameworkData.companyProfile),
        effectivenessCriteria: JSON.stringify(frameworkData.effectivenessCriteria),
        elements: JSON.stringify(frameworkData.elements),
        executiveSummary: frameworkData.executiveSummary,
        currentRiskProfile: frameworkData.currentRiskProfile,
        currentControlProfile: frameworkData.currentControlProfile,
        maturityJourney: frameworkData.maturityJourney,
        approved: false,
        active: true
      }
    });

    res.json(customFramework);
  } catch (error) {
    console.error('Error saving custom framework:', error);
    res.status(500).json({ error: 'Failed to save custom framework' });
  }
});

// GET /api/effectiveness-criteria-v2/custom-framework
router.get('/custom-framework', async (req, res) => {
  try {
    const customFramework = await prisma.customFramework.findFirst({
      where: { active: true },
      orderBy: { createdAt: 'desc' }
    });

    if (!customFramework) {
      return res.json(null);
    }

    // Parse JSON fields
    const parsed = {
      ...customFramework,
      companyProfile: JSON.parse(customFramework.companyProfile),
      effectivenessCriteria: JSON.parse(customFramework.effectivenessCriteria),
      elements: JSON.parse(customFramework.elements)
    };

    res.json(parsed);
  } catch (error) {
    console.error('Error fetching custom framework:', error);
    res.status(500).json({ error: 'Failed to fetch custom framework' });
  }
});

export default router;
