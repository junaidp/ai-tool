# P29 Framework Development

## Overview

The P29 Framework Development module generates bespoke Provision 29 internal control frameworks calibrated to your organisation's specific profile, aligned with the UK Corporate Governance Code (2024).

## Features

### Client Profile Collection
- **Organisation Details**: Name, industry, type, size
- **Operating Characteristics**: Geographic footprint, outsourcing, assurance model
- **Risk Priorities**: Supply chain, fraud, cyber, regulatory compliance, etc.
- **Going Concern Sensitivity**: Tailored framework content based on assessment complexity

### Framework Generation
The AI generates two editions based on your profile:

1. **Summary Edition** - Board governance document
   - Concise and board-readable
   - Executive summary with 6-row table
   - Complete framework structure in ~30-40 pages
   - Designed for board approval and reference

2. **Detailed Edition** - Practitioner reference
   - Full explanations for every requirement
   - Industry-specific narrative examples
   - "Why it exists" and "What good looks like" sections
   - Typically 80-100 pages with comprehensive guidance

### Fixed Architecture

Every framework follows this exact structure:
- **Cover**: Version control, governing standard, organisation type
- **Executive Summary**: Six-row table defining framework essentials
- **Section 1 - Foundation**: 7 sub-sections (Purpose, Scope, Ownership, Materiality, Principal Risks, Control Categories, Version Control)
- **Section 2 - Control Environment**: 6 elements (CE1-CE6)
- **Section 3 - Principles**: 5 principles (P1-P5)
- **Section 4 - Components**: 6 components only (C1-C6)
- **Section 5 - Evaluation Framework**: Maturity scale, assessment cycle, consequences

### Four Mandatory Control Categories

Every framework covers:
1. **Principal Risk Controls** - Business model, performance, solvency, liquidity
2. **Financial Reporting Controls** - All financial statement assertions
3. **Fraud Risk Controls** - Financial statement and operational fraud
4. **Information Security Controls** - All systems supporting the framework

## Industry Calibration

The framework is calibrated for these industries:
- FMCG / Consumer Goods
- Healthcare / Pharma
- Financial Services
- Construction / Infrastructure
- Technology / SaaS
- Retail
- Manufacturing / Industrial
- Professional Services

Each industry receives:
- Industry-specific risk examples
- Appropriate terminology and language
- Relevant control scenarios
- Sector-appropriate principal risk definitions

## Organisation Type Support

- **Listed Company**: Full Provision 29 disclosure obligations
- **Large Private**: Simplified disclosure context
- **Family-Owned**: Strengthened management override prevention
- **PE-Backed**: Enhanced covenant monitoring controls
- **Subsidiary of Listed Group**: Group-level considerations

## Size-Based Proportionality

- **Under 500 employees**: Strengthened proportionality language, combined roles acknowledged
- **500-5,000 employees**: Mid-size calibration
- **Over 5,000 employees**: Group-level architecture, regional oversight emphasis

## Key Principles

### What Never Changes
- Materiality definition (verbatim)
- Four mandatory control categories
- Four principal risk categories
- Six-component structure
- Board accountability (non-delegable)
- Level 3 minimum standard
- Outsourcing accountability principle

### What Gets Calibrated
- Organisation name throughout
- Risk examples and scenarios
- Industry-specific terminology
- Principal risk definitions
- Proportionality language
- Scope and assurance requirements
- Component emphasis based on risk priorities

## Quality Assurance

Before generation, the AI verifies:
- ✓ All four categories present in Section 1.6 and R1.1
- ✓ Materiality definition verbatim
- ✓ Six components only (no seventh)
- ✓ No fictional company names
- ✓ No specific controls listed
- ✓ "Must" used for all obligations (not "should", "shall", "will")

## Usage

1. Navigate to **Framework Development** in the left menu
2. Complete the organisation profile form
3. Select risk priorities relevant to your organisation
4. Choose framework edition (Summary, Detailed, or Both)
5. Click **Generate P29 Framework**
6. Wait for AI generation (typically 2-5 minutes)
7. Download generated Word documents

## Technical Implementation

### Frontend
- **Component**: `/src/pages/P29FrameworkDevelopment.tsx`
- **Route**: `/p29-framework`
- **Menu**: After "Framework Builder"

### Backend
- **API Route**: `/api/p29-framework/generate`
- **Service**: `/server/src/services/p29-generator.ts`
- **Model**: GPT-4o with structured JSON output

### API Request Format
```json
{
  "organisationName": "Acme Group plc",
  "industry": "FMCG / Consumer Goods",
  "organisationType": "Listed Company",
  "employees": 4200,
  "countries": 12,
  "revenueApproxGbpM": 850,
  "outsourcing": true,
  "assuranceModel": "Co-sourced",
  "riskPriorities": ["commercial_fraud", "supply_chain"],
  "goingConcernSensitive": false,
  "edition": "both"
}
```

### API Response Format
```json
{
  "summary": "Full Summary Edition content in markdown",
  "detailed": "Full Detailed Edition content in markdown"
}
```

## Governing Standard

All frameworks align with:
- **UK Corporate Governance Code (2024), Provision 29**
- FRC guidance on principal risks
- Board accountability requirements
- Going concern and viability assessment obligations

## Document Output

Generated frameworks are provided as:
- Markdown-formatted content
- Ready for Word document conversion
- Includes all required sections and formatting
- Industry-calibrated examples throughout

## Best Practices

1. **Complete Profile Accurately**: The more accurate your profile, the better the calibration
2. **Select All Relevant Risk Priorities**: Don't limit selections - include all applicable areas
3. **Review Both Editions**: Summary for board, Detailed for practitioners
4. **Customize After Generation**: Use generated content as a foundation, then refine
5. **Version Control**: Maintain framework versions as your organisation evolves

## Limitations

The AI does NOT:
- List specific controls (framework governs, doesn't specify)
- Use fictional company names
- Mandate internal audit (requires independent assurance)
- Set quantitative materiality thresholds
- Add a seventh component
- Reference specific software vendors
- Use first person language
- Use "should" instead of "must"

## Support

For questions or issues with P29 Framework Development:
1. Verify your organisation profile is complete
2. Check that risk priorities are selected
3. Ensure OpenAI API key is configured in backend
4. Review browser console for any errors
5. Check server logs for generation issues

## Future Enhancements

Planned improvements:
- Framework versioning and history
- Comparison between framework versions
- Direct Word document generation (not just markdown)
- Framework templates library
- Collaborative editing features
- Integration with Material Controls workflow
