import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { effectivenessCriteriaRouter } from './routes/effectivenessCriteria';
import { frameworkComponentsRouter } from './routes/frameworkComponents';
import { materialControlsRouter } from './routes/materialControls';
import { risksRouter } from './routes/risks';
import { controlsRouter } from './routes/controls';
import { testPlansRouter } from './routes/testPlans';
import { issuesRouter } from './routes/issues';
import { integrationsRouter } from './routes/integrations';
import { controlGapsRouter } from './routes/controlGaps';
import { approvalsRouter } from './routes/approvals';
import { dashboardRouter } from './routes/dashboard';
import { authRouter } from './routes/auth';
import { aiRouter } from './routes/ai';
import { principalRisksRouter } from './routes/principalRisks';
import { processesRouter } from './routes/processes';
import { riskProcessLinksRouter } from './routes/riskProcessLinks';
import { maturityAssessmentsRouter } from './routes/maturityAssessments';
import { standardControlsRouter } from './routes/standardControls';
import { asIsControlsRouter } from './routes/asIsControls';
import { gapsRouter } from './routes/gaps';
import { toBeControlsRouter } from './routes/toBeControls';
import { section2Router } from './routes/section2';

dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || '3001', 10);

app.use(cors({
  origin: ['http://localhost:5175', 'https://risk-tlmk.onrender.com'],
  credentials: true
}));
app.use(express.json());

app.use('/api/auth', authRouter);
app.use('/api/ai', aiRouter);
app.use('/api/effectiveness-criteria', effectivenessCriteriaRouter);
app.use('/api/framework-components', frameworkComponentsRouter);
app.use('/api/material-controls', materialControlsRouter);
app.use('/api/risks', risksRouter);
app.use('/api/controls', controlsRouter);
app.use('/api/test-plans', testPlansRouter);
app.use('/api/issues', issuesRouter);
app.use('/api/integrations', integrationsRouter);
app.use('/api/control-gaps', controlGapsRouter);
app.use('/api/approvals', approvalsRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/principal-risks', principalRisksRouter);
app.use('/api/processes', processesRouter);
app.use('/api/risk-process-links', riskProcessLinksRouter);
app.use('/api/maturity-assessments', maturityAssessmentsRouter);
app.use('/api/standard-controls', standardControlsRouter);
app.use('/api/as-is-controls', asIsControlsRouter);
app.use('/api/gaps', gapsRouter);
app.use('/api/to-be-controls', toBeControlsRouter);
app.use('/api/section2', section2Router);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 API available at /api`);
});
