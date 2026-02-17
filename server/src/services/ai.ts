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
