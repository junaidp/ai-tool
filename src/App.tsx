import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute';
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
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route 
          path="/login" 
          element={isAuthenticated ? <Navigate to="/" replace /> : <Login />} 
        />
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
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
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
