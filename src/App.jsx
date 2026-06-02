import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { ProjectProvider } from './hooks/useProject';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import UploadPage from './pages/UploadPage';
import AnalysisPage from './pages/AnalysisPage';
import ResultsPage from './pages/ResultsPage';
import DocumentPreviewPage from './pages/DocumentPreviewPage';
import SettingsPage from './pages/SettingsPage';
import HistoryPage from './pages/HistoryPage';
import DocumentsPage from './pages/DocumentsPage';
import ChatPage from './pages/ChatPage';
import { motion, AnimatePresence } from 'framer-motion';

function AnimatedRoutes() {
  const location = useLocation();
  
  // Decide whether to show global top Navbar
  // Since our dashboard layouts start at top-16 bottom-0 and have sidebar borders, keeping the top Navbar present is extremely convenient and matches premium platforms perfectly.
  const showNavbar = true;

  return (
    <div className="relative min-h-screen bg-[#09090B] flex flex-col justify-between">
      {showNavbar && <Navbar />}
      
      <main className="flex-1 w-full relative">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={
              <PageWrapper>
                <LandingPage />
              </PageWrapper>
            } />
            <Route path="/login" element={
              <PageWrapper>
                <LoginPage />
              </PageWrapper>
            } />
            <Route path="/register" element={
              <PageWrapper>
                <RegisterPage />
              </PageWrapper>
            } />
            <Route path="/dashboard" element={
              <PageWrapper>
                <DashboardPage />
              </PageWrapper>
            } />
            <Route path="/upload" element={
              <PageWrapper>
                <UploadPage />
              </PageWrapper>
            } />
            <Route path="/analyze" element={
              <PageWrapper>
                <AnalysisPage />
              </PageWrapper>
            } />
            <Route path="/results" element={
              <PageWrapper>
                <ResultsPage />
              </PageWrapper>
            } />
            <Route path="/preview" element={
              <PageWrapper>
                <DocumentPreviewPage />
              </PageWrapper>
            } />
            <Route path="/settings" element={
              <PageWrapper>
                <SettingsPage />
              </PageWrapper>
            } />
            <Route path="/chat" element={
              <PageWrapper>
                <ChatPage />
              </PageWrapper>
            } />
            <Route path="/history" element={
              <PageWrapper>
                <HistoryPage />
              </PageWrapper>
            } />
            <Route path="/documents" element={
              <PageWrapper>
                <DocumentsPage />
              </PageWrapper>
            } />
          </Routes>
        </AnimatePresence>
      </main>
    </div>
  );
}

// Global premium page transition wrapper
function PageWrapper({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.35, ease: 'easeInOut' }}
      className="w-full"
    >
      {children}
    </motion.div>
  );
}

export default function App() {
  return (
    <ProjectProvider>
      <Router>
        <AnimatedRoutes />
      </Router>
    </ProjectProvider>
  );
}
