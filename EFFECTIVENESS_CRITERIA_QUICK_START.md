# Effectiveness Criteria V2 - Quick Start Guide

## Setup Instructions

### 1. Database Migration

```bash
cd server
npx prisma migrate dev --name add_effectiveness_criteria_config
npx prisma generate
```

### 2. Start the Application

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

### 3. Access the Feature

Navigate to: **Effectiveness Criteria** in the sidebar

## User Flow - Guided Pathway (Recommended)

### Step 1: Landing Page
- Click **"Start Guided Setup"** button
- This begins the 7-question assessment (takes ~10 minutes)

### Step 2: Answer 7 Questions

**Q1: Company Stage**
- Options: Early Stage, Growth Stage, Mature, Transformation
- Example: Select "Growth Stage" for a scaling company

**Q2: Ownership Structure**
- Options: Public, Private Equity, Venture Capital, Family/Founder Owned
- Example: Select "Private Equity Owned" if PE-backed

**Q3: Regulatory Environment**
- Options: Heavily Regulated, Moderately Regulated, Lightly Regulated
- Example: Select "Moderately Regulated" for manufacturing

**Q4: Strategic Priorities (Select 3)**
- Choose your top 3 from 10 options
- Example: "Rapid Growth", "Profitability Improvement", "M&A/Integration"

**Q5: Current Maturity**
- Options: Level 1-4
- Example: Select "Level 2 - Basic/Developing" if building framework

**Q6: Risk Appetite**
- Options: Low, Moderate, High
- Example: Select "Moderate" for balanced approach

**Q7: Size & Complexity**
- Revenue range, Employee count, Geographic scope, Business complexity
- Example: £50-100M, 250-1000 employees, Multi-regional, Moderate complexity

### Step 3: Review AI Recommendations

The system will display:
- **7 Criteria** with recommended weightings (totaling 100%)
- **Reasoning** for each weighting based on your profile
- **Sub-criteria** specific to your context
- **Target percentages** for each criterion
- **Overall effectiveness target** (typically 80-90%)

**Highest Priority Criterion** is highlighted with a star ⭐

### Step 4: Accept or Modify

- Click **"Accept AI Recommendation"** to save
- Or click **"Back to Questions"** to modify your answers

### Step 5: View Your Framework

Once saved, you'll see:
- Complete effectiveness criteria framework
- Company profile summary
- All 7 criteria with weightings and targets
- Board approval status
- Option to generate board document

### Step 6: Generate Board Document (Optional)

- Click **"Generate Board Document"**
- AI creates a professional 2-3 page board paper
- Includes executive summary, rationale, and approval request
- Download as PDF (coming in Phase 2)

## Example Output

### Sample Profile
- **Stage**: Growth
- **Ownership**: PE-owned
- **Regulatory**: Moderate
- **Priorities**: Growth, Profitability, M&A
- **Maturity**: Level 2
- **Risk Appetite**: Moderate

### Sample Weightings (AI Recommended)
1. **Risk Identification**: 20% ⭐ (Highest - Growth creates new risks)
2. **Framework Design**: 20% (Building correctly is critical)
3. **Control Operating**: 15% (Realistic for Level 2)
4. **Issue Responsiveness**: 25% ⭐ (PE demands fast response)
5. **Risk Outcome**: 10% (Long-term focus)
6. **Governance**: 5% (PE partner provides oversight)
7. **Continuous Improvement**: 5% (Build first, improve later)

**Overall Target**: 85%

## The 7 Standard Criteria

All companies assess these 7 criteria (weightings vary):

1. **Risk Identification Effectiveness** - "Did we identify the RIGHT risks?"
2. **Framework Design Effectiveness** - "Did we design the RIGHT controls?"
3. **Control Operating Effectiveness** - "Did controls OPERATE as designed?"
4. **Issue Responsiveness Effectiveness** - "Did we RESPOND appropriately?"
5. **Risk Outcome Achievement** - "Are risks being MITIGATED?"
6. **Governance & Oversight Effectiveness** - "Is there effective BOARD OVERSIGHT?"
7. **Continuous Improvement Effectiveness** - "Is the framework IMPROVING?"

## Key Features

### ✅ What's Included
- AI-powered recommendations based on company context
- 7 hardcoded criteria (universal framework)
- Customized weightings (0-40% per criterion)
- Context-specific sub-criteria
- Target percentages based on maturity
- Board approval workflow
- AI-generated board documents
- Professional visualization

### 🔄 Coming in Phase 2
- Custom pathway (manual configuration)
- Weighting adjustment sliders
- Benchmarking data
- PDF export
- Year-over-year comparison
- Templates for common profiles

## Tips for Best Results

1. **Be Honest**: Answer questions based on current state, not aspirations
2. **Consider Context**: Think about what matters most to your stakeholders
3. **Review Reasoning**: Read why AI recommended each weighting
4. **Iterate if Needed**: You can reconfigure at any time
5. **Get Board Buy-in**: Use the generated document for approval

## Troubleshooting

**Issue**: Migration fails
- **Solution**: Check database connection in `.env`
- Ensure PostgreSQL is running

**Issue**: AI recommendations seem off
- **Solution**: Review your answers, especially priorities and maturity level
- Try answering questions again with different selections

**Issue**: Weightings don't match expectations
- **Solution**: This is normal - AI balances multiple factors
- Phase 2 will allow manual adjustment
- Current version focuses on best-practice recommendations

**Issue**: Board document not generating
- **Solution**: Check ANTHROPIC_API_KEY in server `.env`
- Ensure API key has sufficient credits

## API Endpoints (for developers)

```bash
# Generate recommendation
POST /api/effectiveness-criteria-v2/generate-recommendation
Body: { profile: CompanyProfile }

# Save configuration
POST /api/effectiveness-criteria-v2/save-config
Body: { companyProfile, criteria, overallTarget, pathway }

# Get active config
GET /api/effectiveness-criteria-v2/config

# Update config
PUT /api/effectiveness-criteria-v2/config/:id
Body: { companyProfile, criteria, overallTarget, pathway }

# Approve config
POST /api/effectiveness-criteria-v2/approve
Body: { configId, approvedBy }

# Generate board document
POST /api/effectiveness-criteria-v2/generate-board-document
Body: { configId }
```

## Support

For issues or questions:
1. Check `EFFECTIVENESS_CRITERIA_V2_IMPLEMENTATION.md` for technical details
2. Review console logs for error messages
3. Verify database migration completed successfully
4. Ensure all environment variables are set

## Next Steps After Setup

1. Complete the guided assessment
2. Review AI recommendations
3. Accept and save your framework
4. Generate board document
5. Present to board for approval
6. Use criteria to assess your material controls framework

---

**Ready to start?** Navigate to **Effectiveness Criteria** and click **"Start Guided Setup"**! 🚀
