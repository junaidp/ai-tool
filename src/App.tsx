import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import EffectivenessCriteria from './pages/EffectivenessCriteria';
import FrameworkBuilder from './pages/FrameworkBuilder';
import MaterialControls from './pages/MaterialControls';
import RiskControlLibrary from './pages/RiskControlLibrary';
import Integrations from './pages/Integrations';
import ControlGapRadar from './pages/ControlGapRadar';
import TestingCoordination from './pages/TestingCoordination';
import Approvals from './pages/Approvals';
import BoardReporting from './pages/BoardReporting';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="effectiveness-criteria" element={<EffectivenessCriteria />} />
          <Route path="framework-builder" element={<FrameworkBuilder />} />
          <Route path="material-controls" element={<MaterialControls />} />
          <Route path="risk-control-library" element={<RiskControlLibrary />} />
          <Route path="integrations" element={<Integrations />} />
          <Route path="control-gaps" element={<ControlGapRadar />} />
          <Route path="testing" element={<TestingCoordination />} />
          <Route path="approvals" element={<Approvals />} />
          <Route path="board-reporting" element={<BoardReporting />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
