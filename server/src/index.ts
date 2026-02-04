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

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: 'http://localhost:5174',
  credentials: true
}));
app.use(express.json());

app.use('/api/auth', authRouter);
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

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 API available at http://localhost:${PORT}/api`);
});
