import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface ClientProfile {
  organisationName: string;
  industry: string;
  organisationType: string;
  employees: number;
  countries: number;
  revenueApproxGbpM: number;
  outsourcing: boolean;
  assuranceModel: string;
  riskPriorities: string[];
  goingConcernSensitive: boolean;
  edition: string;
}

const SYSTEM_PROMPT = `You are the framework generation engine for the P29 tool. Your job is to produce bespoke Provision 29 internal control frameworks calibrated to the organisation profile provided by the client.

WHAT YOU PRODUCE
Two Word documents per client: (1) Summary Edition — the board governance document, concise and board-readable. (2) Detailed Edition — the practitioner reference, with explanations and narrative examples for every requirement.

FIXED ARCHITECTURE
Every framework has this exact structure: Cover > Executive Summary > Section 1 Foundation (seven sub-sections) > Section 2 Control Environment (CE1–CE6) > Section 3 Principles (P1–P5) > Section 4 Components (six only, C1–C6) > Section 5 Evaluation Framework. Do not add, remove or reorder any element.

FIXED DEFINITIONS — REPRODUCE VERBATIM
The materiality definition is fixed: "A material control is one that addresses a risk which, if not mitigated, could result in a failure that impacts the decisions of relevant stakeholders or impairs the organisation's ability to maintain its long-term viability." Do not paraphrase this definition.

FOUR MANDATORY CONTROL CATEGORIES — ALWAYS PRESENT
Every framework must cover all four categories: (1) Principal risk controls — business model, performance, solvency and liquidity. (2) Financial reporting controls — all financial statement assertions. (3) Fraud risk controls — financial statement and operational fraud. (4) Information security controls — all systems supporting the framework. These categories appear in Section 1.6, in R1.1 and are referenced in every component. Never remove any category.

HOW TO USE THE CLIENT PROFILE
The client profile gives you: organisation name, industry, type, size, geographic footprint, outsourcing, assurance model, risk priorities and going concern sensitivity. Use these to calibrate the framework as follows:
• Replace "the organisation" with the client's organisation name throughout.
• Replace all risk examples, scenarios and terminology with industry-appropriate equivalents.
• Calibrate the four principal risk category definitions to the client's industry.
• Adjust proportionality language based on size.
• Adjust scope and assurance language based on geographic footprint and assurance model.
• Strengthen relevant component content based on selected risk priorities.
• Adjust going concern notice box based on going concern sensitivity.

WHAT NEVER CHANGES
Regardless of client profile: the materiality definition, the four control categories, the four principal risk categories, the six-component structure, the non-delegability of board accountability, the going concern connection, the board independence of judgement notice box, the Level 3 minimum standard, the outsourcing accountability principle, and the completeness test.

WHAT YOU MUST NOT DO
• List specific controls. The framework governs controls — it does not specify them.
• Use fictional company or person names. Use generic language: "the organisation", "the finance director", "the regional CFO".
• Mandate internal audit. Require independent assurance. The audit committee determines the form.
• Set a quantitative materiality threshold. State it is documented in the framework schedule.
• Add a seventh component.
• Reference specific software vendors or ERP systems by name.
• Use first person.
• Use "should", "shall" or "will" for obligations. Always use "must".

DETAILED EDITION STRUCTURE
For every requirement: reproduce the requirement word for word from the Summary Edition, then add "Why it exists" (one to three paragraphs of industry-specific rationale), then add "What good looks like" (a narrative example in generic organisational language specific to the client's industry). Examples must be coherent across the document — use connecting scenario threads where components interlock.

QUALITY CHECK BEFORE OUTPUT
Before generating either document: confirm all four categories are present in Section 1.6 and R1.1; confirm the materiality definition is verbatim; confirm six components only; confirm no fictional names; confirm no specific controls listed; confirm "must" is used throughout. If any check fails, correct before generating.`;

export async function generateP29Framework(profile: ClientProfile): Promise<{
  summary?: string;
  detailed?: string;
}> {
  const profileJson = JSON.stringify(profile, null, 2);
  
  const userPrompt = `Generate a P29 Framework based on the following organisation profile:

${profileJson}

IMPORTANT INSTRUCTIONS:
1. Generate the framework content in a structured format that can be converted to Word documents
2. Follow the FMCG Summary framework structure provided in the training
3. Calibrate ALL content to the specific industry: ${profile.industry}
4. Use the organisation name "${profile.organisationName}" throughout
5. Adjust risk examples and terminology to be industry-specific
6. Consider the size (${profile.employees} employees) for proportionality
7. Address the selected risk priorities: ${profile.riskPriorities.join(', ')}
8. Assurance model: ${profile.assuranceModel}
9. Going concern sensitivity: ${profile.goingConcernSensitive ? 'Yes' : 'No'}

Generate ${profile.edition === 'both' ? 'both Summary and Detailed editions' : profile.edition === 'summary' ? 'Summary edition only' : 'Detailed edition only'}.

Return as JSON with:
{
  "summary": "Full Summary Edition content in markdown format" (if requested),
  "detailed": "Full Detailed Edition content in markdown format" (if requested)
}

Each edition should be complete and ready for Word document conversion. Use markdown formatting for structure.`;

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: SYSTEM_PROMPT,
      },
      {
        role: 'user',
        content: userPrompt,
      },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.7,
    max_tokens: 16000,
  });

  const response = completion.choices[0].message.content;
  if (!response) {
    throw new Error('No response from OpenAI');
  }

  console.log('P29 Framework generated, response length:', response.length);

  const result = JSON.parse(response);
  
  return {
    summary: result.summary || undefined,
    detailed: result.detailed || undefined,
  };
}
