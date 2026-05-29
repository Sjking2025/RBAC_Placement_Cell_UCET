import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Layout from './components/layout/Layout';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';

// Main Pages
import Dashboard from './pages/Dashboard';
import Jobs from './pages/jobs/Jobs';
import JobDetails from './pages/jobs/JobDetails';
import CreateJob from './pages/jobs/CreateJob';
import Companies from './pages/companies/Companies';
import CompanyDetails from './pages/companies/CompanyDetails';
import CreateCompany from './pages/companies/CreateCompany';
import Students from './pages/students/Students';
import StudentDetails from './pages/students/StudentDetails';
import Users from './pages/users/Users';
import CreateUser from './pages/users/CreateUser';
import UserEdit from './pages/users/UserEdit';
import Applications from './pages/applications/Applications';
import MyApplications from './pages/applications/MyApplications';
import Interviews from './pages/interviews/Interviews';
import ScheduleInterview from './pages/interviews/ScheduleInterview';
import Announcements from './pages/announcements/Announcements';
import CreateAnnouncement from './pages/announcements/CreateAnnouncement';
import Analytics from './pages/analytics/Analytics';
import Profile from './pages/profile/Profile';
import ProfileSetup from './pages/profile/ProfileSetup';
import Settings from './pages/settings/Settings';

// Protected Route Component
const ProtectedRoute = ({ children, roles }) => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (roles && !roles.includes(user?.role)) {
    return <Navigate to="/dashboard" />;
  }

  return children;
};

// Public Route Component (redirects to dashboard if already logged in)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return null;
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" />;
  }

  return children;
};

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        }
      />
      <Route
        path="/forgot-password"
        element={
          <PublicRoute>
            <ForgotPassword />
          </PublicRoute>
        }
      />
      <Route
        path="/reset-password"
        element={
          <PublicRoute>
            <ResetPassword />
          </PublicRoute>
        }
      />

      {/* Protected Routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" />} />
        <Route path="dashboard" element={<Dashboard />} />
        
        {/* Jobs */}
        <Route path="jobs" element={<Jobs />} />
        {/* IMPORTANT: /jobs/new must come BEFORE /jobs/:id */}
        <Route 
          path="jobs/new" 
          element={
            <ProtectedRoute roles={['admin', 'dept_officer', 'coordinator']}>
              <CreateJob />
            </ProtectedRoute>
          } 
        />
        <Route path="jobs/:id" element={<JobDetails />} />
        
        {/* Companies - Admin/Officer/Coordinator */}
        <Route 
          path="companies" 
          element={
            <ProtectedRoute roles={['admin', 'dept_officer', 'coordinator']}>
              <Companies />
            </ProtectedRoute>
          } 
        />
        {/* IMPORTANT: /companies/new must come BEFORE /companies/:id */}
        <Route 
          path="companies/new" 
          element={
            <ProtectedRoute roles={['admin', 'dept_officer']}>
              <CreateCompany />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="companies/:id" 
          element={
            <ProtectedRoute roles={['admin', 'dept_officer', 'coordinator']}>
              <CompanyDetails />
            </ProtectedRoute>
          } 
        />
        {/* Students - Admin/Officer/Coordinator */}
        <Route 
          path="students" 
          element={
            <ProtectedRoute roles={['admin', 'dept_officer', 'coordinator']}>
              <Students />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="students/:id" 
          element={
            <ProtectedRoute roles={['admin', 'dept_officer', 'coordinator']}>
              <StudentDetails />
            </ProtectedRoute>
          } 
        />
        {/* Users - Admin only */}
        <Route 
          path="users" 
          element={
            <ProtectedRoute roles={['admin']}>
              <Users />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="users/create" 
          element={
            <ProtectedRoute roles={['admin']}>
              <CreateUser />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="users/:id/edit" 
          element={
            <ProtectedRoute roles={['admin']}>
              <UserEdit />
            </ProtectedRoute>
          } 
        />
        {/* Applications (Student view) */}
        <Route 
          path="applications" 
          element={
            <ProtectedRoute roles={['student']}>
              <Applications />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="my-applications" 
          element={
            <ProtectedRoute roles={['student']}>
              <MyApplications />
            </ProtectedRoute>
          } 
        />


        {/* Interviews */}
        <Route path="interviews" element={<Interviews />} />
        <Route 
          path="interviews/schedule" 
          element={
            <ProtectedRoute roles={['admin', 'dept_officer', 'coordinator']}>
              <ScheduleInterview />
            </ProtectedRoute>
          } 
        />
        
        {/* Announcements */}
        <Route
          path="announcements/new"
          element={
            <ProtectedRoute roles={['admin', 'dept_officer', 'coordinator']}>
              <CreateAnnouncement />
            </ProtectedRoute>
          }
        />
        <Route path="announcements" element={<Announcements />} />
        
        {/* Analytics - Admin/Officer */}
        <Route 
          path="analytics" 
          element={
            <ProtectedRoute roles={['admin', 'dept_officer']}>
              <Analytics />
            </ProtectedRoute>
          } 
        />
        
        {/* Profile */}
        <Route path="profile" element={<Profile />} />
        <Route path="profile/setup" element={<ProfileSetup />} />
        
        {/* Settings */}
        <Route path="settings" element={<Settings />} />
      </Route>

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/dashboard" />} />
    </Routes>
  );
}

// Placeholder for pages not yet implemented
const ComingSoon = ({ title }) => (
  <div className="flex flex-col items-center justify-center py-20">
    <h1 className="text-2xl font-bold mb-2">{title}</h1>
    <p className="text-muted-foreground">This page is under development</p>
  </div>
);

export default App;
