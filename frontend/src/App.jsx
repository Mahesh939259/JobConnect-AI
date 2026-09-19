import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import MainLayout from './layouts/MainLayout';
import DashboardLayout from './layouts/DashboardLayout';

// Common Components
import ProtectedRoute from './components/common/ProtectedRoute';

// Public Pages
import LandingPage from './pages/LandingPage';
import JobsList from './pages/jobs/JobsList';
import JobDetails from './pages/jobs/JobDetails';
import CompaniesList from './pages/companies/CompaniesList';
import CompanyDetails from './pages/companies/CompanyDetails';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';

// Student Pages
import StudentDashboard from './pages/student/StudentDashboard';
import StudentProfile from './pages/student/StudentProfile';
import MyApplications from './pages/student/MyApplications';
import SavedJobs from './pages/student/SavedJobs';
import RecommendedJobs from './pages/student/RecommendedJobs';
import ResumeAnalysis from './pages/student/ResumeAnalysis';

// Recruiter Pages
import RecruiterDashboard from './pages/recruiter/RecruiterDashboard';
import RecruiterJobs from './pages/recruiter/RecruiterJobs';
import JobCreateEdit from './pages/recruiter/JobCreateEdit';
import ApplicantsList from './pages/recruiter/ApplicantsList';
import RecruiterInterviews from './pages/recruiter/RecruiterInterviews';
import CompanyProfile from './pages/recruiter/CompanyProfile';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminJobs from './pages/admin/AdminJobs';
import AdminCompanies from './pages/admin/AdminCompanies';

function App() {
  return (
    <Routes>
      {/* Public Pages with Main Layout (Navbar + Footer) */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/jobs" element={<JobsList />} />
        <Route path="/jobs/:id" element={<JobDetails />} />
        <Route path="/companies" element={<CompaniesList />} />
        <Route path="/companies/:id" element={<CompanyDetails />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
      </Route>

      {/* Protected Student Dashboard Routes */}
      <Route
        path="/student"
        element={
          <ProtectedRoute allowedRoles={['student']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/student/dashboard" replace />} />
        <Route path="dashboard" element={<StudentDashboard />} />
        <Route path="profile" element={<StudentProfile />} />
        <Route path="applications" element={<MyApplications />} />
        <Route path="saved-jobs" element={<SavedJobs />} />
        <Route path="recommended-jobs" element={<RecommendedJobs />} />
        <Route path="resume-analysis" element={<ResumeAnalysis />} />
      </Route>

      {/* Protected Recruiter Dashboard Routes */}
      <Route
        path="/recruiter"
        element={
          <ProtectedRoute allowedRoles={['recruiter', 'admin']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/recruiter/dashboard" replace />} />
        <Route path="dashboard" element={<RecruiterDashboard />} />
        <Route path="jobs" element={<RecruiterJobs />} />
        <Route path="jobs/create" element={<JobCreateEdit />} />
        <Route path="jobs/:id/edit" element={<JobCreateEdit />} />
        <Route path="jobs/:jobId/applicants" element={<ApplicantsList />} />
        <Route path="interviews" element={<RecruiterInterviews />} />
        <Route path="company" element={<CompanyProfile />} />
      </Route>

      {/* Protected Admin Console Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="jobs" element={<AdminJobs />} />
        <Route path="companies" element={<AdminCompanies />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
