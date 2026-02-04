const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

class ApiService {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('auth_token');
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
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
    const data = await this.request<{ token: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    this.setToken(data.token);
    return data;
  }

  async register(email: string, password: string, name: string, role: string) {
    const data = await this.request<{ token: string; user: any }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name, role }),
    });
    this.setToken(data.token);
    return data;
  }

  async getCurrentUser() {
    return this.request<any>('/auth/me');
  }

  getEffectivenessCriteria() {
    return this.request<any[]>('/effectiveness-criteria');
  }

  createEffectivenessCriteria(data: any) {
    return this.request('/effectiveness-criteria', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  updateEffectivenessCriteria(id: string, data: any) {
    return this.request(`/effectiveness-criteria/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  getFrameworkComponents() {
    return this.request<any[]>('/framework-components');
  }

  getMaterialControls() {
    return this.request<any[]>('/material-controls');
  }

  createMaterialControl(data: any) {
    return this.request('/material-controls', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  updateMaterialControl(id: string, data: any) {
    return this.request(`/material-controls/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  getRisks() {
    return this.request<any[]>('/risks');
  }

  getControls() {
    return this.request<any[]>('/controls');
  }

  getTestPlans() {
    return this.request<any[]>('/test-plans');
  }

  createTestPlan(data: any) {
    return this.request('/test-plans', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  updateTestPlan(id: string, data: any) {
    return this.request(`/test-plans/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  getIssues() {
    return this.request<any[]>('/issues');
  }

  createIssue(data: any) {
    return this.request('/issues', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  updateIssue(id: string, data: any) {
    return this.request(`/issues/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  getIntegrations() {
    return this.request<any[]>('/integrations');
  }

  updateIntegration(id: string, data: any) {
    return this.request(`/integrations/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  getControlGaps() {
    return this.request<any[]>('/control-gaps');
  }

  createControlGap(data: any) {
    return this.request('/control-gaps', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  updateControlGap(id: string, data: any) {
    return this.request(`/control-gaps/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  getApprovals() {
    return this.request<any[]>('/approvals');
  }

  createApproval(data: any) {
    return this.request('/approvals', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  updateApproval(id: string, data: any) {
    return this.request(`/approvals/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  getDashboardData() {
    return this.request<any>('/dashboard');
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
