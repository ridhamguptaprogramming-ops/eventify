import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Toaster } from 'sonner';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LandingPage from './pages/LandingPage';
import EventsPage from './pages/EventsPage';
import EventDetailsPage from './pages/EventDetailsPage';
import DashboardPage from './pages/DashboardPage';
import AdminPage from './pages/AdminPage';
import AboutPage from './pages/AboutPage';

const ProtectedRoute = ({ children, adminOnly = false }: { children: React.ReactNode, adminOnly?: boolean }) => {
  const { user, profile, loading, isAdmin } = useAuth();

  if (loading) return <div className="min-h-screen bg-[#0F172A] flex items-center justify-center text-white">Loading...</div>;
  if (!user) return <Navigate to="/" />;
  if (adminOnly && !isAdmin) return <Navigate to="/dashboard" />;

  return <>{children}</>;
};

function AppContent() {
  return (
    <div className="min-h-screen bg-[#0F172A] text-white selection:bg-indigo-500/30 flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/events/:id" element={<EventDetailsPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute adminOnly>
                <AdminPage />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </main>
      <Footer />
      <Toaster position="bottom-right" theme="dark" richColors closeButton />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}
