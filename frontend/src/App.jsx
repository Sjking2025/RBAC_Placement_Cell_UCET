import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Layout from './components/layout/Layout';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Main Pages
import Dashboard from './pages/Dashboard';
import Jobs from './pages/jobs/Jobs';
import JobDetails from './pages/jobs/JobDetails';
import Companies from './pages/companies/Companies';
import Students from './pages/students/Students';
import Applications from './pages/applications/Applications';
import Interviews from './pages/interviews/Interviews';
import Announcements from './pages/announcements/Announcements';
import Analytics from './pages/analytics/Analytics';
import Profile from './pages/profile/Profile';
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
        
        {/* Students - Admin/Officer/Coordinator */}
        <Route 
          path="students" 
          element={
            <ProtectedRoute roles={['admin', 'dept_officer', 'coordinator']}>
              <Students />
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
        
        {/* Interviews */}
        <Route path="interviews" element={<Interviews />} />
        
        {/* Announcements */}
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
