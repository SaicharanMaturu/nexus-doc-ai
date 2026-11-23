import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import WorkspaceLayout from './layouts/WorkspaceLayout';
import ProtectedRoute from './components/ProtectedRoute';

// Authentication Gateway Page
import LoginPage from './pages/LoginPage';

// 11 Complete Application Pages
import LandingPage from './pages/LandingPage';
import DashboardPage from './pages/DashboardPage';
import UploadPage from './pages/UploadPage';
import WorkspaceOverviewPage from './pages/WorkspaceOverviewPage';
import ExtractionResultsPage from './pages/ExtractionResultsPage';
import PerceptionVerificationPage from './pages/PerceptionVerificationPage';
import LayoutVerificationPage from './pages/LayoutVerificationPage';
import ConstraintValidationPage from './pages/ConstraintValidationPage';
import RiskAssessmentPage from './pages/RiskAssessmentPage';
import HumanVerificationPage from './pages/HumanVerificationPage';
import VerificationReportPage from './pages/VerificationReportPage';

export default function App() {
  return (
    <Routes>
      {/* Standalone Authentication Gateway Routes */}
      <Route path="/login" element={<LoginPage initialMode="login" />} />
      <Route path="/register" element={<LoginPage initialMode="register" />} />
      <Route path="/forgot-password" element={<LoginPage initialMode="forgot" />} />

      {/* Main Application with Global Layout */}
      <Route element={<MainLayout />}>
        {/* 1. Public Landing Page */}
        <Route path="/" element={<LandingPage />} />

        {/* 2. Protected Dashboard */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />

        {/* 3. Protected Invoice Upload */}
        <Route
          path="/upload"
          element={
            <ProtectedRoute>
              <UploadPage />
            </ProtectedRoute>
          }
        />

        {/* Protected Workspace Routes (4 through 11) */}
        <Route
          element={
            <ProtectedRoute>
              <WorkspaceLayout />
            </ProtectedRoute>
          }
        >
          {/* 4. AI Processing Workspace */}
          <Route path="/workspace/:id" element={<WorkspaceOverviewPage />} />
          <Route path="/workspace" element={<Navigate to="/workspace/DOC-ASTR-8841" replace />} />

          {/* 5. Extraction Results */}
          <Route path="/results/:id" element={<ExtractionResultsPage />} />
          <Route path="/results" element={<Navigate to="/results/DOC-ASTR-8841" replace />} />

          {/* 6. Perception Verification */}
          <Route path="/perception/:id" element={<PerceptionVerificationPage />} />
          <Route path="/perception" element={<Navigate to="/perception/DOC-ASTR-8841" replace />} />

          {/* 7. Layout Verification */}
          <Route path="/layout/:id" element={<LayoutVerificationPage />} />
          <Route path="/layout" element={<Navigate to="/layout/DOC-ASTR-8841" replace />} />

          {/* 8. Constraint Validation */}
          <Route path="/validation/:id" element={<ConstraintValidationPage />} />
          <Route path="/validation" element={<Navigate to="/validation/DOC-ASTR-8841" replace />} />

          {/* 9. Confidence and Risk Assessment */}
          <Route path="/risk-assessment/:id" element={<RiskAssessmentPage />} />
          <Route path="/risk-assessment" element={<Navigate to="/risk-assessment/DOC-ASTR-8841" replace />} />

          {/* 10. Human Verification */}
          <Route path="/human-review/:id" element={<HumanVerificationPage />} />
          <Route path="/human-review" element={<Navigate to="/human-review/DOC-ASTR-8841" replace />} />

          {/* 11. Final Verification Report */}
          <Route path="/report/:id" element={<VerificationReportPage />} />
          <Route path="/report" element={<Navigate to="/report/DOC-ASTR-8841" replace />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
