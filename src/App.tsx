import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { WebLayout } from './components/layout/WebLayout';
import { SubjectsPage } from './pages/SubjectsPage';
import { ChaptersPage } from './pages/ChaptersPage';
import { TopicsPage } from './pages/TopicsPage';
import { DashboardPage } from './pages/DashboardPage';
import { ProfilePage } from './pages/ProfilePage';
import { AuthPage } from './pages/AuthPage';
import type { ReactNode } from 'react';

// Protected Route wrapper — no full-page loading spinner
const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { user, loading } = useAuth();

  // While checking session, show nothing (instant feel)
  // The layout itself will render, just the auth redirect is deferred
  if (loading) return null;

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
};

function AppRoutes() {
  const { user, loading } = useAuth();

  return (
    <Routes>
      {/* Auth route — renders immediately, no loading check needed */}
      <Route path="/auth" element={
        // If still loading, show auth page anyway (no spinner)
        // Once loaded, redirect if already logged in
        (!loading && user) ? <Navigate to="/" replace /> : <AuthPage />
      } />

      {/* Protected routes */}
      <Route path="/" element={
        <ProtectedRoute>
          <WebLayout />
        </ProtectedRoute>
      }>
        <Route index element={<DashboardPage />} />
        <Route path="subjects" element={<SubjectsPage />} />
        <Route path="subject/:subjectId" element={<ChaptersPage />} />
        <Route path="chapter/:chapterId" element={<TopicsPage />} />
        <Route path="dashboard" element={<Navigate to="/" replace />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
