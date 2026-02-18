import type {
  User,
  EffectivenessCriteria,
  FrameworkComponent,
  MaterialControl,
  Risk,
  Control,
  TestPlan,
  Issue,
  IntegrationStatus,
  ControlGap,
  ApprovalWorkflow,
  DashboardData,
  AuthResponse,
  AIGenerateCriteriaResponse,
  AIScoreControlResponse,
  AIGenerateGapsResponse,
  AIGenerateControlsResponse,
  AIEditCriteriaResponse,
} from '../types/api.types';
//'http://localhost:3001/api'
const API_URL = import.meta.env.VITE_API_URL || 'https://ai-tool-9o3q.onrender.com/api';

class ApiService {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('auth_token');
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(error.error || 'Request failed');
    }

    return response.json();
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('auth_token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('auth_token');
  }

  async login(email: string, password: string) {
    const data = await this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    this.setToken(data.token);
    return data;
  }

  async register(email: string, password: string, name: string, role: string) {
    const data = await this.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name, role }),
    });
    this.setToken(data.token);
    return data;
  }

  async getCurrentUser() {
    return this.request<User>('/auth/me');
  }

  getEffectivenessCriteria() {
    return this.request<EffectivenessCriteria[]>('/effectiveness-criteria');
  }

  createEffectivenessCriteria(data: Omit<EffectivenessCriteria, 'id' | 'createdAt' | 'updatedAt'>) {
    return this.request('/effectiveness-criteria', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  updateEffectivenessCriteria(id: string, data: Partial<EffectivenessCriteria>) {
    return this.request(`/effectiveness-criteria/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  getFrameworkComponents() {
    return this.request<FrameworkComponent[]>('/framework-components');
  }

  createFrameworkComponent(data: Omit<FrameworkComponent, 'id' | 'createdAt' | 'updatedAt'>) {
    return this.request('/framework-components', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  updateFrameworkComponent(id: string, data: Partial<FrameworkComponent>) {
    return this.request(`/framework-components/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  getMaterialControls() {
    return this.request<MaterialControl[]>('/material-controls');
  }

  createMaterialControl(data: Omit<MaterialControl, 'id' | 'createdAt' | 'updatedAt'>) {
    return this.request('/material-controls', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  updateMaterialControl(id: string, data: Partial<MaterialControl>) {
    return this.request(`/material-controls/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  getRisks() {
    return this.request<Risk[]>('/risks');
  }

  createRisk(data: Omit<Risk, 'id' | 'createdAt' | 'updatedAt'>) {
    return this.request<Risk>('/risks', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  getControls() {
    return this.request<Control[]>('/controls');
  }

  createControl(data: Omit<Control, 'id' | 'createdAt' | 'updatedAt'>) {
    return this.request<Control>('/controls', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  getTestPlans() {
    return this.request<TestPlan[]>('/test-plans');
  }

  createTestPlan(data: Omit<TestPlan, 'id' | 'createdAt' | 'updatedAt'>) {
    return this.request('/test-plans', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  updateTestPlan(id: string, data: Partial<TestPlan>) {
    return this.request(`/test-plans/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  getIssues() {
    return this.request<Issue[]>('/issues');
  }

  createIssue(data: Omit<Issue, 'id' | 'createdAt' | 'updatedAt'>) {
    return this.request('/issues', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  updateIssue(id: string, data: Partial<Issue>) {
    return this.request(`/issues/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  getIntegrations() {
    return this.request<IntegrationStatus[]>('/integrations');
  }

  updateIntegration(id: string, data: Partial<IntegrationStatus>) {
    return this.request(`/integrations/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  getControlGaps() {
    return this.request<ControlGap[]>('/control-gaps');
  }

  createControlGap(data: Omit<ControlGap, 'id' | 'createdAt' | 'updatedAt'>) {
    return this.request('/control-gaps', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  updateControlGap(id: string, data: Partial<ControlGap>) {
    return this.request(`/control-gaps/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  getApprovals() {
    return this.request<ApprovalWorkflow[]>('/approvals');
  }

  createApproval(data: Omit<ApprovalWorkflow, 'id' | 'createdAt' | 'updatedAt'>) {
    return this.request('/approvals', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  updateApproval(id: string, data: Partial<ApprovalWorkflow>) {
    return this.request(`/approvals/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  getDashboardData() {
    return this.request<DashboardData>('/dashboard');
  }

  // AI-powered features
  generateCriteriaWithAI(data: {
    regulatoryPosture: string;
    operatingStage: string;
    complexity: string;
    governanceMaturity: string;
  }) {
    return this.request<AIGenerateCriteriaResponse>('/ai/generate-criteria', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  scoreControlWithAI(data: {
    controlName: string;
    controlDescription: string;
    testResults?: string;
  }) {
    return this.request<AIScoreControlResponse>('/ai/score-control', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  generateGapsWithAI(data: {
    frameworkType: string;
    existingControls: string[];
  }) {
    return this.request<AIGenerateGapsResponse>('/ai/generate-gaps', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  generateControlsWithAI(data: {
    riskDescription: string;
    riskLevel: string;
  }) {
    return this.request<AIGenerateControlsResponse>('/ai/generate-controls', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  editCriteriaWithAI(data: {
    criteriaId: string;
    currentCriteria: {
      dimension: string;
      criteria: string;
      threshold: string;
      evidenceType: string | string[];
      frequency: string;
    };
    editPrompt: string;
  }) {
    return this.request<AIEditCriteriaResponse>('/ai/edit-criteria', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // AI Principal Risk Workflow
  generatePrincipalRisksWithAI(data: {
    industry: string;
    annualRevenue: string;
    employeeCount: string;
    isProfitable: string;
    fundingType: string;
    customerDescription: string;
    strategicPriorities: string[];
  }) {
    return this.request<{ risks: any[] }>('/ai/generate-principal-risks', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  editRiskDefinitionWithAI(data: {
    originalRisk: { title: string; definition: string; causes: string[]; impacts: string[] };
    userEdits: { editType: string; details: string };
    businessContext: {
      industry: string;
      annualRevenue: string;
      employeeCount: string;
      customerDescription: string;
    };
  }) {
    return this.request<{
      title: string;
      definition: string;
      causes: string[];
      impacts: string[];
      explanation: string;
    }>('/ai/edit-risk-definition', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  scoreRiskWithAI(data: {
    riskTitle: string;
    riskDefinition: string;
    businessContext: {
      industry: string;
      annualRevenue: string;
      employeeCount: string;
      isProfitable: string;
      fundingType: string;
      customerDescription: string;
    };
  }) {
    return this.request<{
      likelihoodScore: number;
      likelihoodReasoning: string;
      impactScore: number;
      impactReasoning: string;
    }>('/ai/score-risk', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Principal Risks
  getPrincipalRisks() {
    return this.request<any[]>('/principal-risks');
  }

  createPrincipalRisk(data: any) {
    return this.request('/principal-risks', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  updatePrincipalRisk(id: string, data: any) {
    return this.request(`/principal-risks/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  deletePrincipalRisk(id: string) {
    return this.request(`/principal-risks/${id}`, {
      method: 'DELETE',
    });
  }

  // Processes
  getProcesses() {
    return this.request<any[]>('/processes');
  }

  createProcess(data: any) {
    return this.request('/processes', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Risk-Process Links
  linkRiskToProcess(data: any) {
    return this.request('/risk-process-links', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  getRiskProcessLinks(riskId: string) {
    return this.request<any[]>(`/risk-process-links/risk/${riskId}`);
  }
}

export const apiService = new ApiService();

export const mockApiService = {
  getEffectivenessCriteria: () => apiService.getEffectivenessCriteria(),
  getFrameworkComponents: () => apiService.getFrameworkComponents(),
  getMaterialControls: () => apiService.getMaterialControls(),
  getRisks: () => apiService.getRisks(),
  getControls: () => apiService.getControls(),
  getTestPlans: () => apiService.getTestPlans(),
  getIssues: () => apiService.getIssues(),
  getIntegrations: () => apiService.getIntegrations(),
  getControlGaps: () => apiService.getControlGaps(),
  getApprovals: () => apiService.getApprovals(),
  getDashboardData: () => apiService.getDashboardData(),
};
