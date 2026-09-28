import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const client = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

export const api = {
  // Health & System
  getHealth: () => client.get('/health').then(r => r.data),
  getSystemStatus: () => client.get('/api/system/status').then(r => r.data),

  // Dashboard
  getDashboardStats: () => client.get('/api/dashboard/stats').then(r => r.data),

  // Incidents
  getIncidents: (params = {}) => client.get('/api/incidents', { params }).then(r => r.data),
  getIncidentById: (id) => client.get(`/api/incidents/${id}`).then(r => r.data),
  updateIncidentStatus: (id, status, reason = null, actor = 'Operator') => 
    client.post(`/api/incidents/${id}/status`, { status, reason, actor }).then(r => r.data),
  approveIncident: (id, reason = null, approved_by = 'Commander') => 
    client.post(`/api/incidents/${id}/approve`, { reason, approved_by }).then(r => r.data),
  rejectIncident: (id, reason = null, approved_by = 'Commander') => 
    client.post(`/api/incidents/${id}/reject`, { reason, approved_by }).then(r => r.data),
  assignTeam: (id, team_name, actor = 'Dispatch Coordinator') => 
    client.post(`/api/incidents/${id}/assign-team`, { team_name, actor }).then(r => r.data),
  getIncidentTimeline: (id) => client.get(`/api/incidents/${id}/timeline`).then(r => r.data),

  // Messages
  getMessages: (params = {}) => client.get('/api/messages', { params }).then(r => r.data),

  // Approvals
  getApprovals: (status = null) => client.get('/api/approvals', { params: { status } }).then(r => r.data),
  submitApprovalDecision: (approval_id, decision, reason = null, decided_by = 'Chief Operator') =>
    client.post(`/api/approvals/${approval_id}/decision`, { decision, reason, decided_by }).then(r => r.data),

  // Emergency Intake
  submitEmergencyReport: (data) => client.post('/api/emergency/report', data).then(r => r.data),
  uploadCSV: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return client.post('/api/emergency/csv-upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then(r => r.data);
  },

  // Response Activity
  getResponseTasks: () => client.get('/api/response-tasks').then(r => r.data),

  // Analytics
  getAnalytics: () => client.get('/api/analytics').then(r => r.data),

  // Audit Logs
  getAuditLogs: (params = {}) => client.get('/api/audit-logs', { params }).then(r => r.data),

  // Demo Simulation Controls
  runDemoScenario: (key) => client.post(`/api/simulate/scenario/${key}`).then(r => r.data),
  resetDemoData: () => client.post('/api/simulate/reset-demo-data').then(r => r.data),

  // Base URL helper
  getBaseUrl: () => API_BASE_URL,
};

export default api;
