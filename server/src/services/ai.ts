import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface GenerateCriteriaInput {
  regulatoryPosture: string;
  operatingStage: string;
  complexity: string;
  governanceMaturity: string;
}

export interface EffectivenessCriteria {
  dimension: string;
  criteria: string;
  threshold: string;
  evidenceType: string[];
  frequency: string;
  categorization: string;
  status: string;
}

export async function generateEffectivenessCriteria(
  input: GenerateCriteriaInput
): Promise<EffectivenessCriteria[]> {
  const prompt = `You are an expert in risk management and internal controls. Generate 5-7 effectiveness criteria for a control framework based on the following organization profile:

Regulatory Posture: ${input.regulatoryPosture}
Operating Stage: ${input.operatingStage}
Complexity: ${input.complexity}
Governance Maturity: ${input.governanceMaturity}

For each criterion, provide:
1. Dimension (choose from: Design, Implementation, Operation, Decision-Use, Assurance, Outcomes, Adaptability)
2. Criteria (clear, measurable description)
3. Threshold (quantifiable target, e.g., "95% compliance")
4. Evidence Type (list effectiveness measurement criteria as array):
   - Use these 4 types: "Input/Identification", "Assessment/Translation", "Action/Execution", "Reliability/Improvement"
   - Select 2-3 that are most relevant to the criterion
5. Frequency (continuous, quarterly, or annual)
6. Categorization (B, H, or C):
   - B (Baseline): Standard depth, must exist
   - H (High): Higher governance attention, more design depth, tighter cadence
   - C (Critical): Board-level priority, maximum depth, strict evidence and escalation

CATEGORIZATION LOGIC:
- If Regulated + High-growth/Transformation + Group(complex) + Immature/Developing: More H and C
- If Regulated + Steady-state + Single entity + Mature: More B and some H
- If Unregulated + Steady-state + Single entity + Mature: Mostly B
- Critical (C) should be reserved for compliance-heavy, complex, or high-risk dimensions

Return as valid JSON with a "criteria" array containing objects with these exact fields: dimension, criteria, threshold, evidenceType (array), frequency, categorization.`;

  const completion = await openai.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages: [
      {
        role: 'system',
        content: 'You are an expert in risk management, internal controls, and regulatory compliance. You provide structured, actionable criteria for control effectiveness frameworks with appropriate categorization.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.7,
  });

  const response = completion.choices[0].message.content;
  if (!response) {
    throw new Error('No response from OpenAI');
  }

  console.log('OpenAI Response:', response);
  
  const parsed = JSON.parse(response);
  console.log('Parsed Response:', JSON.stringify(parsed, null, 2));
  
  let criteria = parsed.criteria || parsed.effectivenessCriteria || parsed.items || [];
  
  if (Array.isArray(parsed) && parsed.length > 0) {
    criteria = parsed;
  }
  
  if (!Array.isArray(criteria)) {
    console.error('Criteria is not an array:', criteria);
    throw new Error('OpenAI response does not contain a valid criteria array');
  }

  return criteria.map((c: any) => ({
    dimension: c.dimension,
    criteria: c.criteria,
    threshold: c.threshold,
    evidenceType: Array.isArray(c.evidenceType) ? c.evidenceType : [c.evidenceType],
    frequency: c.frequency,
    categorization: c.categorization || 'B',
    status: 'in_review',
  }));
}

export async function scoreControlEffectiveness(
  controlName: string,
  controlDescription: string,
  testResults: string
): Promise<{ score: number; reasoning: string; recommendations: string[] }> {
  const prompt = `Analyze the effectiveness of this control:

Control Name: ${controlName}
Description: ${controlDescription}
Recent Test Results: ${testResults}

Provide:
1. Effectiveness score (0-100)
2. Brief reasoning for the score
3. 2-3 specific recommendations for improvement

Return as JSON with fields: score, reasoning, recommendations (array).`;

  const completion = await openai.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages: [
      {
        role: 'system',
        content: 'You are an expert in control testing and effectiveness assessment.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.5,
  });

  const response = completion.choices[0].message.content;
  if (!response) {
    throw new Error('No response from OpenAI');
  }

  return JSON.parse(response);
}

export async function generateControlGaps(
  frameworkType: string,
  existingControls: string[]
): Promise<any[]> {
  const prompt = `Analyze potential control gaps for a ${frameworkType} framework.

Existing Controls:
${existingControls.join('\n- ')}

Identify 3-5 potential control gaps with:
1. Title
2. Description
3. Priority (critical, high, medium, low)
4. Affected areas
5. Recommended actions

Return as JSON array with fields: title, description, priority, affectedAreas (array), recommendedAction.`;

  const completion = await openai.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages: [
      {
        role: 'system',
        content: 'You are an expert in control frameworks and gap analysis.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.6,
  });

  const response = completion.choices[0].message.content;
  if (!response) {
    throw new Error('No response from OpenAI');
  }

  const parsed = JSON.parse(response);
  return parsed.gaps || parsed.controlGaps || [];
}

export async function generateRiskControlMapping(
  riskDescription: string,
  riskLevel: string
): Promise<any[]> {
  const prompt = `For this risk, suggest 3-5 appropriate controls:

Risk: ${riskDescription}
Risk Level: ${riskLevel}

For each control, provide:
1. controlId (e.g., AC-001)
2. name
3. description
4. type (preventive, detective, corrective)
5. frequency (daily, weekly, monthly, quarterly, annual)
6. owner (owner role)

Return as valid JSON with a "controls" array containing objects with these exact field names: controlId, name, description, type, frequency, owner.`;

  console.log('Generating controls for risk:', { riskDescription, riskLevel });

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: 'You are an expert in risk management and control design. Always return valid JSON with a "controls" array.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.6,
    });

    const response = completion.choices[0].message.content;
    if (!response) {
      throw new Error('No response from OpenAI');
    }

    console.log('OpenAI Response for controls:', response);

    const parsed = JSON.parse(response);
    console.log('Parsed Response:', JSON.stringify(parsed, null, 2));

    // Handle different possible response structures
    let controls = parsed.controls || parsed.suggestedControls || parsed.items || [];
    
    // If the entire parsed object is an array, use it directly
    if (Array.isArray(parsed) && parsed.length > 0) {
      controls = parsed;
    }
    
    if (!Array.isArray(controls)) {
      console.error('Controls is not an array:', controls);
      throw new Error('OpenAI response does not contain a valid controls array');
    }

    if (controls.length === 0) {
      console.warn('OpenAI returned an empty controls array');
    }

    return controls;
  } catch (error: any) {
    console.error('Error in generateRiskControlMapping:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    if (error.response) {
      console.error('OpenAI API error response:', JSON.stringify(error.response, null, 2));
    }
    throw error;
  }
}

// ==================== PRINCIPAL RISK AI FUNCTIONS ====================

export interface BusinessContext {
  industry: string;
  annualRevenue: string;
  employeeCount: string;
  isProfitable: string;
  fundingType: string;
  customerDescription: string;
  strategicPriorities: string[];
}

export interface AIRiskCandidate {
  id: string;
  category: string;
  title: string;
  definition: string;
  causes: string[];
  impacts: string[];
  threatCategories: string[];
  domainTags: string[];
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  recommendation: 'INCLUDE' | 'CONSIDER' | 'SKIP';
  confidenceReasoning: string;
  likelihoodScore: number;
  likelihoodReasoning: string;
  impactScore: number;
  impactReasoning: string;
}

export async function generatePrincipalRisks(
  context: BusinessContext
): Promise<AIRiskCandidate[]> {
  const prompt = `You are an expert in enterprise risk management, FRC guidance, and principal risk identification for UK companies.

Based on the following business context, generate 10-15 potential PRINCIPAL RISKS with complete, board-quality definitions.

BUSINESS CONTEXT:
- Industry: ${context.industry}
- Annual Revenue: ${context.annualRevenue}
- Number of Employees: ${context.employeeCount}
- Profitable: ${context.isProfitable}
- Funding/Ownership: ${context.fundingType}
- Customer Base: "${context.customerDescription}"
- Strategic Priorities: ${context.strategicPriorities.join(', ')}

REQUIREMENTS FOR EACH RISK:
1. Generate COMPLETE, BOARD-QUALITY risk definitions (not just titles)
2. Each definition should reference specific details from the business context (revenue figures, customer details, industry specifics)
3. Include specific causes/drivers
4. Include specific financial/operational impacts with estimated figures where possible
5. Classify threats using FRC categories: business_model, performance, solvency, liquidity
6. Classify control domains: ops, reporting, financial, compliance
7. Rate confidence (HIGH/MEDIUM/LOW) based on how clearly the context supports this risk
8. Provide likelihood score (1-5) and impact score (1-5) with reasoning
9. Recommend: INCLUDE (clearly relevant), CONSIDER (possibly relevant), SKIP (unlikely relevant)

RISK CATEGORIES TO CONSIDER:
- Customer/Revenue risks (concentration, loss, market changes)
- Operational risks (supply chain, production, technology, infrastructure)
- Financial risks (liquidity, solvency, covenant, currency, commodity)
- People risks (talent, key person dependency, culture)
- Strategic risks (competition, market disruption, failed initiatives)
- Regulatory/Compliance risks (legal, regulatory changes, data protection)
- Technology/Cyber risks (data breach, system failure, digital transformation)
- External risks (economic downturn, geopolitical, pandemic, climate)

Return as JSON with a "risks" array containing objects with these exact fields:
- id (string, e.g. "risk_1", "risk_2")
- category (string, the threat category e.g. "LIQUIDITY THREAT", "PERFORMANCE THREAT", "SOLVENCY THREAT", "BUSINESS MODEL THREAT")
- title (string, concise risk title)
- definition (string, FULL board-quality definition paragraph, 3-5 sentences minimum, referencing specific business details)
- causes (string array, 3-5 specific causes/drivers)
- impacts (string array, 3-5 specific impacts with financial estimates where possible)
- threatCategories (string array from: business_model, performance, solvency, liquidity)
- domainTags (string array from: ops, reporting, financial, compliance)
- confidence (string: HIGH, MEDIUM, or LOW)
- recommendation (string: INCLUDE, CONSIDER, or SKIP)
- confidenceReasoning (string, why this confidence level)
- likelihoodScore (number 1-5)
- likelihoodReasoning (string)
- impactScore (number 1-5)
- impactReasoning (string)`;

  const completion = await openai.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages: [
      {
        role: 'system',
        content: 'You are an expert in enterprise risk management, FRC UK Corporate Governance Code compliance, and principal risk identification. You generate comprehensive, board-quality risk definitions that are specific to the business context provided. Always return valid JSON.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.7,
    max_tokens: 4096,
  });

  const response = completion.choices[0].message.content;
  if (!response) {
    throw new Error('No response from OpenAI');
  }

  console.log('Principal Risk Generation Response length:', response.length);

  const parsed = JSON.parse(response);
  let risks = parsed.risks || parsed.principalRisks || parsed.risk_candidates || [];

  if (Array.isArray(parsed) && parsed.length > 0) {
    risks = parsed;
  }

  if (!Array.isArray(risks)) {
    console.error('Risks is not an array:', risks);
    throw new Error('OpenAI response does not contain a valid risks array');
  }

  return risks.map((r: any, index: number) => ({
    id: r.id || `risk_${index + 1}`,
    category: r.category || 'GENERAL THREAT',
    title: r.title,
    definition: r.definition,
    causes: Array.isArray(r.causes) ? r.causes : [],
    impacts: Array.isArray(r.impacts) ? r.impacts : [],
    threatCategories: Array.isArray(r.threatCategories) ? r.threatCategories : [],
    domainTags: Array.isArray(r.domainTags) ? r.domainTags : [],
    confidence: r.confidence || 'MEDIUM',
    recommendation: r.recommendation || 'CONSIDER',
    confidenceReasoning: r.confidenceReasoning || '',
    likelihoodScore: Number(r.likelihoodScore) || 3,
    likelihoodReasoning: r.likelihoodReasoning || '',
    impactScore: Number(r.impactScore) || 3,
    impactReasoning: r.impactReasoning || '',
  }));
}

export async function editRiskDefinition(
  originalRisk: { title: string; definition: string; causes: string[]; impacts: string[] },
  userEdits: { editType: string; details: string },
  businessContext: BusinessContext
): Promise<{
  title: string;
  definition: string;
  causes: string[];
  impacts: string[];
  explanation: string;
}> {
  const prompt = `You are an expert in enterprise risk management. A user wants to modify a principal risk definition.

ORIGINAL RISK:
Title: ${originalRisk.title}
Definition: ${originalRisk.definition}
Causes: ${originalRisk.causes.join('; ')}
Impacts: ${originalRisk.impacts.join('; ')}

BUSINESS CONTEXT:
- Industry: ${businessContext.industry}
- Revenue: ${businessContext.annualRevenue}
- Employees: ${businessContext.employeeCount}
- Customers: "${businessContext.customerDescription}"

USER'S EDIT REQUEST:
Type: ${userEdits.editType}
Details: "${userEdits.details}"

Regenerate the risk definition incorporating the user's changes. Maintain board-quality language and specificity.

Return as JSON with:
- title (string)
- definition (string, full updated definition)
- causes (string array)
- impacts (string array)
- explanation (string, brief description of what changed)`;

  const completion = await openai.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages: [
      {
        role: 'system',
        content: 'You are an expert in enterprise risk management. You help users refine principal risk definitions while maintaining board-quality language.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.6,
  });

  const response = completion.choices[0].message.content;
  if (!response) {
    throw new Error('No response from OpenAI');
  }

  const parsed = JSON.parse(response);
  return {
    title: parsed.title || originalRisk.title,
    definition: parsed.definition || originalRisk.definition,
    causes: Array.isArray(parsed.causes) ? parsed.causes : originalRisk.causes,
    impacts: Array.isArray(parsed.impacts) ? parsed.impacts : originalRisk.impacts,
    explanation: parsed.explanation || 'Risk updated based on your request.',
  };
}

export async function scoreRisk(
  riskTitle: string,
  riskDefinition: string,
  businessContext: BusinessContext
): Promise<{
  likelihoodScore: number;
  likelihoodReasoning: string;
  impactScore: number;
  impactReasoning: string;
}> {
  const prompt = `Score this principal risk for a business:

RISK: ${riskTitle}
DEFINITION: ${riskDefinition}

BUSINESS CONTEXT:
- Industry: ${businessContext.industry}
- Revenue: ${businessContext.annualRevenue}
- Employees: ${businessContext.employeeCount}
- Profitable: ${businessContext.isProfitable}
- Funding: ${businessContext.fundingType}
- Customers: "${businessContext.customerDescription}"

Score on two dimensions (1-5 scale):
- Likelihood: 1=Rare, 2=Unlikely, 3=Possible, 4=Likely, 5=Almost Certain
- Impact: 1=Insignificant, 2=Minor, 3=Moderate, 4=Major, 5=Catastrophic

Return as JSON with: likelihoodScore, likelihoodReasoning, impactScore, impactReasoning`;

  const completion = await openai.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages: [
      {
        role: 'system',
        content: 'You are an expert in risk assessment and scoring.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.5,
  });

  const response = completion.choices[0].message.content;
  if (!response) {
    throw new Error('No response from OpenAI');
  }

  const parsed = JSON.parse(response);
  return {
    likelihoodScore: Number(parsed.likelihoodScore) || 3,
    likelihoodReasoning: parsed.likelihoodReasoning || '',
    impactScore: Number(parsed.impactScore) || 3,
    impactReasoning: parsed.impactReasoning || '',
  };
}

export async function editCriteriaWithAI(
  currentCriteria: {
    dimension: string;
    criteria: string;
    threshold: string;
    evidenceType: string | string[];
    frequency: string;
  },
  editPrompt: string
): Promise<{
  updatedCriteria: {
    dimension: string;
    criteria: string;
    threshold: string;
    evidenceType: string[];
    frequency: string;
  };
  explanation: string;
}> {
  const evidenceTypeStr = Array.isArray(currentCriteria.evidenceType) 
    ? currentCriteria.evidenceType.join(', ') 
    : currentCriteria.evidenceType;

  const prompt = `You are an expert in risk management and internal controls. A user wants to modify an effectiveness criterion based on their specific requirements.

Current Criterion:
- Dimension: ${currentCriteria.dimension}
- Criteria: ${currentCriteria.criteria}
- Threshold: ${currentCriteria.threshold}
- Evidence Types: ${evidenceTypeStr}
- Frequency: ${currentCriteria.frequency}

User's Edit Request:
"${editPrompt}"

Based on the user's request, provide an updated version of this criterion. Maintain the same structure and ensure all fields are filled appropriately. The dimension should be one of: Design, Implementation, Operation, Decision-Use, Assurance, Outcomes, or Adaptability. The frequency should be one of: continuous, quarterly, or annual.

Return as JSON with:
- updatedCriteria: object with fields (dimension, criteria, threshold, evidenceType as array, frequency)
- explanation: brief explanation of the changes made

Ensure the updated criterion is specific, measurable, and aligned with the user's request.`;

  const completion = await openai.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages: [
      {
        role: 'system',
        content: 'You are an expert in risk management, internal controls, and regulatory compliance. You help users refine and improve their effectiveness criteria based on their specific needs.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.7,
  });

  const response = completion.choices[0].message.content;
  if (!response) {
    throw new Error('No response from OpenAI');
  }

  console.log('AI Edit Response:', response);

  const parsed = JSON.parse(response);
  
  return {
    updatedCriteria: {
      dimension: parsed.updatedCriteria.dimension,
      criteria: parsed.updatedCriteria.criteria,
      threshold: parsed.updatedCriteria.threshold,
      evidenceType: Array.isArray(parsed.updatedCriteria.evidenceType) 
        ? parsed.updatedCriteria.evidenceType 
        : [parsed.updatedCriteria.evidenceType],
      frequency: parsed.updatedCriteria.frequency,
    },
    explanation: parsed.explanation || 'Criteria updated based on your request.',
  };
}
