# Database Migration Guide

## Overview
This migration adds comprehensive Principal Risks and Material Controls workflow support to the application.

## Migration Steps

1. **Update Prisma Schema**
   The schema has been updated with new models. Run:
   ```bash
   cd server
   npx prisma migrate dev --name add_principal_risks_and_material_controls
   npx prisma generate
   ```

2. **Update Existing EffectivenessCriteria**
   Add the categorization field with default value 'B':
   ```sql
   ALTER TABLE "EffectivenessCriteria" 
   ADD COLUMN "categorization" TEXT NOT NULL DEFAULT 'B';
   ```

3. **Verify Migration**
   ```bash
   npx prisma studio
   ```
   Check that all new tables are created:
   - PrincipalRisk
   - Process
   - RiskProcessLink
   - ProcessMaturityAssessment
   - StandardControl
   - AsIsControl
   - Gap
   - ToBeControl
   - RiskControlLink
   - FrameworkDocument

## New Features Enabled

### 1. Effectiveness Criteria Categorization
- **B (Baseline)**: Standard depth, must exist
- **H (High)**: Higher governance attention, more design depth
- **C (Critical)**: Board-level priority, maximum depth

### 2. Principal Risks Module
- Define risks threatening business model, performance, solvency, or liquidity
- Tag with threat lenses and control domains
- Foundation for material controls identification

### 3. Material Controls Workflow (6 Steps)
- Step 1: Select Principal Risk
- Step 2: Map relevant processes
- Step 3: Assess process maturity
- Step 4: Generate expected control baseline
- Step 5: Capture As-Is controls
- Step 6: Gap analysis and To-Be controls

### 4. Framework Builder Enhancement
- Generate comprehensive control framework document
- Board summary generation
- Section-based structure with clause numbering

## Post-Migration Tasks

1. Seed standard controls library (optional)
2. Import existing processes if available
3. Train users on new workflow
4. Configure AI generation context for your organization

## Rollback

If you need to rollback:
```bash
npx prisma migrate reset
```

Then restore from backup and re-run migrations up to the previous version.
