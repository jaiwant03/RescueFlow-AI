import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SystemProvider } from './context/SystemContext';
import { MainLayout } from './layouts/MainLayout';

// Pages
import { DashboardPage } from './pages/DashboardPage';
import { LiveIncidentsPage } from './pages/LiveIncidentsPage';
import { IncidentDetailPage } from './pages/IncidentDetailPage';
import { EmergencyReportPage } from './pages/EmergencyReportPage';
import { ApprovalCenterPage } from './pages/ApprovalCenterPage';
import { ResponseActivityPage } from './pages/ResponseActivityPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { AuditLogsPage } from './pages/AuditLogsPage';
import { SystemStatusPage } from './pages/SystemStatusPage';
import { LoginPage } from './pages/LoginPage';

export function App() {
  return (
    <AuthProvider>
      <SystemProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<LoginPage />} />

            {/* Main Application Layout with Navigation */}
            <Route path="/" element={<MainLayout />}>
              <Route index element={<DashboardPage />} />
              <Route path="incidents" element={<LiveIncidentsPage />} />
              <Route path="incidents/:id" element={<IncidentDetailPage />} />
              <Route path="report" element={<EmergencyReportPage />} />
              <Route path="approvals" element={<ApprovalCenterPage />} />
              <Route path="activity" element={<ResponseActivityPage />} />
              <Route path="analytics" element={<AnalyticsPage />} />
              <Route path="audit" element={<AuditLogsPage />} />
              <Route path="status" element={<SystemStatusPage />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </SystemProvider>
    </AuthProvider>
  );
}

export default App;
