import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { LandingPage } from '../pages/LandingPage';
import { Login } from '../pages/auth/Login';
import { Register } from '../pages/auth/Register';
import { ForgotPassword } from '../pages/auth/ForgotPassword';
import { ResetPassword } from '../pages/auth/ResetPassword';
import { EmailVerification } from '../pages/auth/EmailVerification';

import { CitizenDashboard } from '../pages/citizen/CitizenDashboard';
import { SubmitComplaint } from '../pages/citizen/SubmitComplaint';
import { ComplaintHistory } from '../pages/citizen/ComplaintHistory';
import { ComplaintDetails } from '../pages/citizen/ComplaintDetails';
import { TrackComplaint } from '../pages/citizen/TrackComplaint';
import { Proposals } from '../pages/citizen/Proposals';
import { Notices } from '../pages/citizen/Notices';
import { Profile } from '../pages/citizen/Profile';

import { CouncillorDashboard } from '../pages/councillor/CouncillorDashboard';
import { ManageComplaints } from '../pages/councillor/ManageComplaints';
import { ProposalReview } from '../pages/councillor/ProposalReview';
import { Announcements } from '../pages/councillor/Announcements';
import { CouncillorReports } from '../pages/councillor/CouncillorReports';

import { WorkerDashboard } from '../pages/worker/WorkerDashboard';
import { AssignedTasks } from '../pages/worker/AssignedTasks';
import { CompletedTasks } from '../pages/worker/CompletedTasks';

import { AdminDashboard } from '../pages/admin/AdminDashboard';
import { UserManagement } from '../pages/admin/UserManagement';
import { WardManagement } from '../pages/admin/WardManagement';
import { ComplaintMonitoring } from '../pages/admin/ComplaintMonitoring';
import { SystemReports } from '../pages/admin/SystemReports';

import { NotFoundPage, UnauthorizedPage } from '../components/common/NotFoundPage';
import { ProtectedRoute } from './ProtectedRoute';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Auth Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/landing" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/email-verification" element={<EmailVerification />} />

      {/* Citizen Routes */}
      <Route
        path="/citizen/dashboard"
        element={
          <ProtectedRoute allowedRoles={['CITIZEN', 'COUNCILLOR', 'ADMIN']}>
            <CitizenDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/citizen/complaints/submit"
        element={
          <ProtectedRoute allowedRoles={['CITIZEN', 'COUNCILLOR', 'ADMIN']}>
            <SubmitComplaint />
          </ProtectedRoute>
        }
      />
      <Route
        path="/citizen/complaints"
        element={
          <ProtectedRoute allowedRoles={['CITIZEN', 'COUNCILLOR', 'ADMIN']}>
            <ComplaintHistory />
          </ProtectedRoute>
        }
      />
      <Route
        path="/citizen/complaints/:id"
        element={
          <ProtectedRoute allowedRoles={['CITIZEN', 'COUNCILLOR', 'WORKER', 'ADMIN']}>
            <ComplaintDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/citizen/track"
        element={
          <ProtectedRoute allowedRoles={['CITIZEN', 'COUNCILLOR', 'WORKER', 'ADMIN']}>
            <TrackComplaint />
          </ProtectedRoute>
        }
      />
      {/* Fallback Aliases */}
      <Route path="/citizen/history" element={<Navigate to="/citizen/complaints" replace />} />
      <Route path="/citizen/history/:id" element={<Navigate to="/citizen/complaints/:id" replace />} />

      <Route
        path="/citizen/proposals"
        element={
          <ProtectedRoute allowedRoles={['CITIZEN', 'COUNCILLOR', 'ADMIN']}>
            <Proposals />
          </ProtectedRoute>
        }
      />
      <Route
        path="/citizen/notices"
        element={
          <ProtectedRoute allowedRoles={['CITIZEN', 'COUNCILLOR', 'WORKER', 'ADMIN']}>
            <Notices />
          </ProtectedRoute>
        }
      />
      <Route
        path="/citizen/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />

      {/* Councillor Routes */}
      <Route
        path="/councillor/dashboard"
        element={
          <ProtectedRoute allowedRoles={['COUNCILLOR', 'ADMIN']}>
            <CouncillorDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/councillor/complaints"
        element={
          <ProtectedRoute allowedRoles={['COUNCILLOR', 'ADMIN']}>
            <ManageComplaints />
          </ProtectedRoute>
        }
      />
      <Route
        path="/councillor/proposals"
        element={
          <ProtectedRoute allowedRoles={['COUNCILLOR', 'ADMIN']}>
            <ProposalReview />
          </ProtectedRoute>
        }
      />
      <Route
        path="/councillor/announcements"
        element={
          <ProtectedRoute allowedRoles={['COUNCILLOR', 'ADMIN']}>
            <Announcements />
          </ProtectedRoute>
        }
      />
      <Route
        path="/councillor/reports"
        element={
          <ProtectedRoute allowedRoles={['COUNCILLOR', 'ADMIN']}>
            <CouncillorReports />
          </ProtectedRoute>
        }
      />

      {/* Field Worker Routes */}
      <Route
        path="/worker/dashboard"
        element={
          <ProtectedRoute allowedRoles={['WORKER', 'ADMIN']}>
            <WorkerDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/worker/tasks"
        element={
          <ProtectedRoute allowedRoles={['WORKER', 'ADMIN']}>
            <AssignedTasks />
          </ProtectedRoute>
        }
      />
      <Route
        path="/worker/completed"
        element={
          <ProtectedRoute allowedRoles={['WORKER', 'ADMIN']}>
            <CompletedTasks />
          </ProtectedRoute>
        }
      />

      {/* Admin Routes */}
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <UserManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/wards"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <WardManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/complaints"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <ComplaintMonitoring />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/reports"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <SystemReports />
          </ProtectedRoute>
        }
      />

      {/* Error Routes */}
      <Route path="/unauthorized" element={<UnauthorizedPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};
