import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface GenerateCriteriaInput {
  sector: string;
  operatingModel: string;
  riskProfile: string;
  regulations: string;
}

export interface EffectivenessCriteria {
  dimension: string;
  criteria: string;
  threshold: string;
  evidenceType: string[];
  frequency: string;
  status: string;
}

export async function generateEffectivenessCriteria(
  input: GenerateCriteriaInput
): Promise<EffectivenessCriteria[]> {
  const prompt = `You are an expert in risk management and internal controls. Generate 3-5 effectiveness criteria for a control framework based on the following organization profile:

Industry Sector: ${input.sector}
Operating Model: ${input.operatingModel}
Risk Profile: ${input.riskProfile}
Regulatory Obligations: ${input.regulations}

For each criterion, provide:
1. Dimension (choose from: Design, Implementation, Operation, Decision-Use, Assurance, Outcomes, Adaptability)
2. Criteria (clear, measurable description)
3. Threshold (quantifiable target, e.g., "95% compliance")
4. Evidence Type (list 2-3 types of evidence needed)
5. Frequency (continuous, quarterly, or annual)

Return the response as a valid JSON array of objects with these exact fields: dimension, criteria, threshold, evidenceType (array), frequency.
Make the criteria specific to the provided sector and regulations.`;

  const completion = await openai.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages: [
      {
        role: 'system',
        content: 'You are an expert in risk management, internal controls, and regulatory compliance. You provide structured, actionable criteria for control effectiveness frameworks.',
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
  
  // Handle different possible response structures
  let criteria = parsed.criteria || parsed.effectivenessCriteria || parsed.items || [];
  
  // If the entire parsed object is an array, use it directly
  if (Array.isArray(parsed) && parsed.length > 0) {
    criteria = parsed;
  }
  
  // Ensure criteria is an array
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
1. Control ID (e.g., AC-001)
2. Name
3. Description
4. Type (preventive, detective, corrective)
5. Frequency
6. Owner role

Return as JSON array with these fields.`;

  const completion = await openai.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages: [
      {
        role: 'system',
        content: 'You are an expert in risk management and control design.',
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
  return parsed.controls || parsed.suggestedControls || [];
}
