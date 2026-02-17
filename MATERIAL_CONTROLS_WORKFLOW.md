# Material Controls Workflow - Complete Implementation Guide

## Overview
The Material Controls 6-step workflow transforms principal risks into comprehensive control frameworks with gap analysis and implementation roadmaps.

## Workflow Steps

### Step 0: Select Principal Risk
**Purpose**: Choose which principal risk to build a mitigation blueprint for.

**User Actions**:
- View list of all principal risks from the register
- Click "Build Mitigation Blueprint" on selected risk
- System loads risk details and proceeds to Step 1

**Backend**: `GET /api/principal-risks`

---

### Step 1: Process Mapping
**Purpose**: Identify which business processes materially mitigate the selected risk.

**User Actions**:
- Browse existing processes from process library
- Tag each as "Primary" or "Secondary" relevance
- Add new processes if needed (name, scope, owner)
- Optionally add rationale for each link

**AI Assistance** (Future):
- Suggest relevant processes based on risk domain tags
- Flag missing process coverage

**Backend**:
- `GET /api/processes` - Load process library
- `POST /api/processes` - Create new process
- `POST /api/risk-process-links` - Link risk to process

**Data Stored**: `RiskProcessLink[]`

---

### Step 2: Process Maturity Assessment
**Purpose**: Understand process context to generate appropriate control baseline.

**Questionnaire** (11 questions per process):
1. **Process Structure**: Centralized / Distributed
2. **Standardized Procedure Exists**: Yes / Partial / No
3. **Roles Clearly Defined**: Yes / Partial / No
4. **Automation Level**: Manual / ERP Workflow / Automated
5. **Key Data Sources**: ERP / Spreadsheets / Multiple Systems
6. **Interfaces Significant**: Yes / No
7. **Volume/Criticality**: High Volume / High Value / High Judgement
8. **Failure Impact**: High / Medium / Low
9. **Process Changes**: Low / Medium / High Frequency
10. **Regular Monitoring Exists**: Yes / Partial / No
11. **Prior Significant Issues**: Yes / No

**Maturity Profile Derivation**:
- Manual/ERP/Automated
- Centralized/Decentralized
- High-Risk flag
- Regulated/Unregulated

**Backend**:
- `POST /api/maturity-assessments` - Submit answers
- System derives maturity profile from answers

**Data Stored**: `ProcessMaturityAssessment` with maturity profile

---

### Step 3: Generate Expected Standard Controls Baseline
**Purpose**: AI generates "should exist" control set based on maturity profile.

**System Actions**:
- Query `StandardControl` library filtered by applicability rules
- Match controls to maturity profile
- Group by type: Preventive / Detective / Corrective

**User Actions**:
- Review generated controls
- Mark as "Applicable" or "Not Applicable" with reason
- Adjust frequency if needed (optional)

**Backend**:
- `GET /api/standard-controls/by-profile/:profile` - Get applicable controls
- Filter based on maturity profile + domain tags

**Output**: List of expected standard controls (baseline)

---

### Step 4: Capture As-Is Controls
**Purpose**: Document current controls in place and map to baseline.

**User Actions**:
- For each expected control:
  - Mark as: Exists / Partially Exists / Not Exist
  - If exists: provide owner, frequency, evidence source
- Option to upload SOPs (AI extracts controls)
- Add extra controls not in baseline

**AI Assistance** (Future):
- Parse uploaded SOPs to auto-suggest controls
- Deduplicate similar controls
- Map to standard controls

**Backend**:
- `POST /api/as-is-controls` - Create as-is control
- `GET /api/as-is-controls/process/:processId` - List current controls

**Data Stored**: `AsIsControl[]` with mapping to `StandardControl`

---

### Step 5: Gap Analysis (Auto)
**Purpose**: Identify missing, weak, or inadequate controls.

**System Rules**:
- **Missing**: Expected control doesn't exist
- **Weak Design**: Control exists but inadequate design
- **Weak Operation**: Control exists but not operating effectively
- **No Owner**: Control exists but no clear owner
- **No Evidence**: Control exists but no evidence defined

**Calculation**:
```
For each StandardControl in baseline:
  If marked "Applicable":
    If no AsIsControl mapped OR status = "not_exist":
      → Gap (type: missing)
    If AsIsControl.status = "partial":
      → Gap (type: weak_design)
    If owner undefined:
      → Gap (type: no_owner)
    If evidence undefined:
      → Gap (type: no_evidence)
```

**Backend**:
- `POST /api/gaps/analyze` - Run gap analysis
- `GET /api/gaps/process/:processId` - Get identified gaps

**Data Stored**: `Gap[]` register

---

### Step 6: Generate To-Be Controls & RCM
**Purpose**: Create implementation roadmap and risk-control matrix.

**System Actions**:
- For each Gap:
  - Generate `ToBeControl` spec:
    - Control objective (from StandardControl)
    - Owner role (recommended)
    - Frequency (from StandardControl)
    - Evidence type
    - Control type
    - Domain tag
    - Implementation guidance
    - Target date (optional)
    - Status: Planned / In Progress / Live

**User Actions**:
- Review To-Be controls
- Edit implementation guidance
- Assign target dates
- Assign actual owners
- Approve for implementation

**RCM Outputs**:

**As-Is RCM**:
| Risk | Process | Control | Type | Owner | Evidence | Frequency | Domain | Material? | Status |
|------|---------|---------|------|-------|----------|-----------|--------|-----------|--------|

**To-Be RCM**:
| Risk | Process | Control | Type | Owner Role | Evidence | Frequency | Domain | Gap Type | Target Date | Status |
|------|---------|---------|------|------------|----------|-----------|--------|----------|-------------|--------|

**Backend**:
- `POST /api/to-be-controls/generate` - Generate from gaps
- `GET /api/to-be-controls/process/:processId` - List to-be controls
- `PATCH /api/to-be-controls/:id` - Update implementation details

**Data Stored**: `ToBeControl[]` + `RiskControlLink[]`

---

## Backend Routes Summary

### Principal Risks
- `GET /api/principal-risks`
- `POST /api/principal-risks`
- `PATCH /api/principal-risks/:id`
- `DELETE /api/principal-risks/:id`

### Processes
- `GET /api/processes`
- `POST /api/processes`
- `GET /api/processes/:id`

### Risk-Process Links
- `POST /api/risk-process-links`
- `GET /api/risk-process-links/risk/:riskId`
- `DELETE /api/risk-process-links/:id`

### Maturity Assessments
- `POST /api/maturity-assessments`
- `GET /api/maturity-assessments/process/:processId`

### Standard Controls
- `GET /api/standard-controls`
- `GET /api/standard-controls/by-profile/:profile`
- `POST /api/standard-controls` (admin)

### As-Is Controls
- `GET /api/as-is-controls/process/:processId`
- `POST /api/as-is-controls`
- `PATCH /api/as-is-controls/:id`

### Gaps
- `POST /api/gaps/analyze`
- `GET /api/gaps/process/:processId`

### To-Be Controls
- `POST /api/to-be-controls/generate`
- `GET /api/to-be-controls/process/:processId`
- `PATCH /api/to-be-controls/:id`

---

## Material Control Determination

**Rule**: A control is "Material" if:
1. It is mapped to a Principal Risk, AND
2. It is a key control with no easy substitute, OR
3. It is a gap remediation control needed to keep risk within appetite

**Flagging in UI**:
- Add "Material?" column in RCM
- System recommendation + user override
- Require rationale for materiality decision

---

## AI Integration Points

### 1. Process Suggestion (Step 1)
**Input**: Risk title + risk statement + domain tags + threat lens tags
**Output**: Suggested processes with relevance scores

### 2. Standard Controls Generation (Step 3)
**Input**: Maturity profile + process description + risk context
**Output**: Tailored baseline control set

### 3. Control Extraction (Step 4)
**Input**: Uploaded SOP/policy documents
**Output**: Extracted control statements with suggested mapping

### 4. To-Be Control Generation (Step 6)
**Input**: Gap type + standard control + process context
**Output**: Detailed control spec with implementation guidance

### 5. Coverage Pattern Analysis (Cross-step)
**Input**: Current control set + risk profile
**Output**: Flags for missing coverage patterns (e.g., "No monitoring controls for high-impact risk")

---

## Testing Checklist

- [ ] Can select principal risk and proceed to process mapping
- [ ] Can add new process and link to risk
- [ ] Can toggle process relevance (primary/secondary)
- [ ] Maturity questionnaire saves answers per process
- [ ] Standard controls generate based on maturity profile
- [ ] Can mark controls as applicable/not applicable
- [ ] As-is controls save with owner and evidence
- [ ] Gap analysis identifies missing controls
- [ ] To-be controls generate from gaps
- [ ] RCM exports work (As-Is and To-Be)
- [ ] Can navigate back through steps without losing data
- [ ] Can restart workflow for new risk

---

## Standard Controls Seed Data Required

Minimum 30-50 standard controls across:
- **Operations** (15-20): Access, segregation of duties, approvals, reconciliations
- **Reporting** (10-15): Data validation, review procedures, cut-off, disclosure
- **Financial** (10-15): Cash management, fixed assets, revenue recognition
- **Compliance** (5-10): Regulatory monitoring, training, policy adherence

Each with:
- Control name
- Objective
- Type (preventive/detective/corrective)
- Domain tag
- Typical frequency
- Typical evidence
- Applicability rules (JSON conditions)

---

## Files Created/Modified

### Frontend
- `/src/pages/MaterialControlsWorkflow.tsx` ⭐ NEW - Complete 6-step UI
- `/src/App.tsx` - Updated import

### Backend Routes
- `/server/src/routes/riskProcessLinks.ts` ⭐ NEW
- `/server/src/routes/maturityAssessments.ts` ⭐ NEW
- `/server/src/routes/standardControls.ts` ⭐ NEW
- `/server/src/routes/asIsControls.ts` ⭐ NEW
- `/server/src/routes/gaps.ts` ⭐ NEW
- `/server/src/routes/toBeControls.ts` ⭐ NEW
- `/server/src/index.ts` - Registered new routes

### Database
- All models already defined in Prisma schema
- Run migration to create tables

---

## Next Steps

1. **Run Database Migration**
   ```bash
   cd server
   npx prisma migrate dev --name add_material_controls_workflow
   npx prisma generate
   ```

2. **Seed Standard Controls Library**
   - Create seed script with baseline controls
   - Categorize by domain and type
   - Add applicability rules

3. **Test Workflow End-to-End**
   - Create a principal risk
   - Walk through all 6 steps
   - Verify data persists
   - Test RCM export

4. **Add AI Services** (Optional Phase 2)
   - Process suggestion AI
   - Control extraction from documents
   - Coverage pattern analysis

---

This workflow provides a systematic, auditable approach to building material control frameworks from principal risks, with built-in gap analysis and implementation planning.
