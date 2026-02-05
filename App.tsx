
import React, { useEffect, useCallback } from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { VaultProvider, useVault } from './context/VaultContext';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import SmartBriefView from './pages/SmartBriefView';
import LegalPage from './pages/LegalPage';
import Profile from './pages/Profile';
import SupportPage from './pages/SupportPage';
import VerifyEmail from './pages/VerifyEmail';
import Admin from './pages/Admin';

const INACTIVITY_LIMIT = 15 * 60 * 1000;

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useVault();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, user } = useVault();
  // Silent redirection for unauthorized attempts
  if (!isAuthenticated || !user?.isAdmin) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

const SecurityManager: React.FC = () => {
  const { isAuthenticated, logout, currentDocument } = useVault();
  const navigate = useNavigate();
  const location = useLocation();

  const handleInactivity = useCallback(() => {
    if (isAuthenticated) {
      logout();
      navigate('/login', { state: { message: "Session expired due to inactivity." } });
    }
  }, [isAuthenticated, logout, navigate]);

  useEffect(() => {
    let timeout: number;
    const resetTimer = () => {
      clearTimeout(timeout);
      timeout = window.setTimeout(handleInactivity, INACTIVITY_LIMIT);
    };

    if (isAuthenticated) {
      window.addEventListener('mousemove', resetTimer);
      window.addEventListener('keydown', resetTimer);
      resetTimer();
    }

    return () => {
      window.removeEventListener('mousemove', resetTimer);
      window.removeEventListener('keydown', resetTimer);
      clearTimeout(timeout);
    };
  }, [isAuthenticated, handleInactivity]);

  useEffect(() => {
    if (isAuthenticated && location.pathname === '/brief' && !currentDocument) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, location, currentDocument, navigate]);

  return null;
};

const App: React.FC = () => {
  return (
    <VaultProvider>
      <HashRouter>
        <SecurityManager />
        <div className="min-h-screen bg-zinc-950 text-zinc-50 selection:bg-emerald-500/30">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/verify" element={<VerifyEmail />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/legal/:slug" element={<LegalPage />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/brief" element={<ProtectedRoute><SmartBriefView /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/support" element={<ProtectedRoute><SupportPage /></ProtectedRoute>} />
            <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </HashRouter>
    </VaultProvider>
  );
};

export default App;
