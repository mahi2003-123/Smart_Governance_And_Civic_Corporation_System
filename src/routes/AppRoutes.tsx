import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate, useParams } from 'react-router-dom';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { NotFoundPage, UnauthorizedPage } from '../components/common/NotFoundPage';
import { ProtectedRoute } from './ProtectedRoute';
import { PublicOnlyRoute } from './PublicOnlyRoute';

// Helper component to resolve parametric alias redirects without literal ':id' string in URL
const CitizenHistoryIdRedirect: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  return <Navigate to={id ? `/citizen/complaints/${id}` : '/citizen/complaints'} replace />;
};

// Lazy-loaded pages for high-speed code-split routing
const LandingPage = lazy(() => import('../pages/LandingPage').then((m) => ({ default: m.LandingPage })));
const Login = lazy(() => import('../pages/auth/Login').then((m) => ({ default: m.Login })));
const Register = lazy(() => import('../pages/auth/Register').then((m) => ({ default: m.Register })));
const ForgotPassword = lazy(() => import('../pages/auth/ForgotPassword').then((m) => ({ default: m.ForgotPassword })));
const ResetPassword = lazy(() => import('../pages/auth/ResetPassword').then((m) => ({ default: m.ResetPassword })));
const EmailVerification = lazy(() => import('../pages/auth/EmailVerification').then((m) => ({ default: m.EmailVerification })));

const CitizenDashboard = lazy(() => import('../pages/citizen/CitizenDashboard').then((m) => ({ default: m.CitizenDashboard })));
const SubmitComplaint = lazy(() => import('../pages/citizen/SubmitComplaint').then((m) => ({ default: m.SubmitComplaint })));
const ComplaintHistory = lazy(() => import('../pages/citizen/ComplaintHistory').then((m) => ({ default: m.ComplaintHistory })));
const ComplaintDetails = lazy(() => import('../pages/citizen/ComplaintDetails').then((m) => ({ default: m.ComplaintDetails })));
const TrackComplaint = lazy(() => import('../pages/citizen/TrackComplaint').then((m) => ({ default: m.TrackComplaint })));
const Proposals = lazy(() => import('../pages/citizen/Proposals').then((m) => ({ default: m.Proposals })));
const Notices = lazy(() => import('../pages/citizen/Notices').then((m) => ({ default: m.Notices })));
const Profile = lazy(() => import('../pages/citizen/Profile').then((m) => ({ default: m.Profile })));

const CouncillorDashboard = lazy(() => import('../pages/councillor/CouncillorDashboard').then((m) => ({ default: m.CouncillorDashboard })));
const ManageComplaints = lazy(() => import('../pages/councillor/ManageComplaints').then((m) => ({ default: m.ManageComplaints })));
const ProposalReview = lazy(() => import('../pages/councillor/ProposalReview').then((m) => ({ default: m.ProposalReview })));
const Announcements = lazy(() => import('../pages/councillor/Announcements').then((m) => ({ default: m.Announcements })));
const CouncillorReports = lazy(() => import('../pages/councillor/CouncillorReports').then((m) => ({ default: m.CouncillorReports })));

const WorkerDashboard = lazy(() => import('../pages/worker/WorkerDashboard').then((m) => ({ default: m.WorkerDashboard })));
const AssignedTasks = lazy(() => import('../pages/worker/AssignedTasks').then((m) => ({ default: m.AssignedTasks })));
const CompletedTasks = lazy(() => import('../pages/worker/CompletedTasks').then((m) => ({ default: m.CompletedTasks })));

const AdminDashboard = lazy(() => import('../pages/admin/AdminDashboard').then((m) => ({ default: m.AdminDashboard })));
const UserManagement = lazy(() => import('../pages/admin/UserManagement').then((m) => ({ default: m.UserManagement })));
const CouncillorManagement = lazy(() => import('../pages/admin/CouncillorManagement').then((m) => ({ default: m.CouncillorManagement })));
const WorkerManagement = lazy(() => import('../pages/admin/WorkerManagement').then((m) => ({ default: m.WorkerManagement })));
const WardManagement = lazy(() => import('../pages/admin/WardManagement').then((m) => ({ default: m.WardManagement })));
const ComplaintMonitoring = lazy(() => import('../pages/admin/ComplaintMonitoring').then((m) => ({ default: m.ComplaintMonitoring })));
const ProposalMonitoring = lazy(() => import('../pages/admin/ProposalMonitoring').then((m) => ({ default: m.ProposalMonitoring })));
const NoticeManagement = lazy(() => import('../pages/admin/NoticeManagement').then((m) => ({ default: m.NoticeManagement })));
const SystemActivity = lazy(() => import('../pages/admin/SystemActivity').then((m) => ({ default: m.SystemActivity })));
const SystemReports = lazy(() => import('../pages/admin/SystemReports').then((m) => ({ default: m.SystemReports })));

export const AppRoutes: React.FC = () => {
  return (
    <Suspense fallback={<LoadingSpinner message="Loading SGCS Portal..." minHeight="60vh" />}>
      <Routes>
        {/* Public Auth Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/landing" element={<LandingPage />} />
        <Route path="/login" element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
        <Route path="/register" element={<PublicOnlyRoute><Register /></PublicOnlyRoute>} />
        <Route path="/forgot-password" element={<PublicOnlyRoute><ForgotPassword /></PublicOnlyRoute>} />
        <Route path="/reset-password" element={<PublicOnlyRoute><ResetPassword /></PublicOnlyRoute>} />
        <Route path="/email-verification" element={<PublicOnlyRoute><EmailVerification /></PublicOnlyRoute>} />

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
        <Route path="/citizen/history/:id" element={<CitizenHistoryIdRedirect />} />

        {/* Multi-role Direct Complaint Details Routes */}
        <Route
          path="/councillor/complaints/:id"
          element={
            <ProtectedRoute allowedRoles={['COUNCILLOR', 'ADMIN']}>
              <ComplaintDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/worker/tasks/:id"
          element={
            <ProtectedRoute allowedRoles={['WORKER', 'ADMIN']}>
              <ComplaintDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/complaints/:id"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <ComplaintDetails />
            </ProtectedRoute>
          }
        />

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
            <ProtectedRoute allowedRoles={['CITIZEN', 'COUNCILLOR', 'ADMIN']}>
              <Notices />
            </ProtectedRoute>
          }
        />
        <Route
          path="/citizen/profile"
          element={
            <ProtectedRoute allowedRoles={['CITIZEN', 'COUNCILLOR', 'WORKER', 'ADMIN']}>
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

        {/* Worker Routes */}
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
          path="/admin/councillors"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <CouncillorManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/workers"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <WorkerManagement />
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
          path="/admin/proposals"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <ProposalMonitoring />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/notices"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <NoticeManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/activity"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <SystemActivity />
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
        <Route
          path="/admin/profile"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <Navigate to="/citizen/profile" replace />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/notifications"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <Navigate to="/admin/activity" replace />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/settings"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <Navigate to="/admin/dashboard" replace />
            </ProtectedRoute>
          }
        />

        {/* Error Routes */}
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
