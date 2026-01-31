import React, { Component } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AnimatePresence } from 'framer-motion';
import GlobalStyles from './styles/GlobalStyles';
import { ClerkProvider, SignedIn, SignedOut, useUser } from '@clerk/clerk-react';

// Components
import Dashboard from './pages/Dashboard';
import PrintJobSubmission from './pages/PrintJobSubmission';
import PrintJobQueue from './pages/PrintJobQueue';
import PrinterManagement from './pages/PrinterManagement';
import UserManagement from './pages/UserManagement';
import Authentication from './pages/Authentication';
import PrintRelease from './pages/PrintRelease';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import Chat from './pages/Chat';
import Onboarding from './pages/Onboarding';
import ShopDiscovery from './pages/ShopDiscovery';
import RequireRole from './components/RequireRole';
import Layout from './components/Layout';

// Context
import { PrintJobProvider } from './context/PrintJobContext';
import { ChatProvider } from './context/ChatContext';
import { UserProvider } from './context/UserContext';

if (!process.env.REACT_APP_CLERK_PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key")
}
const clerkPubKey = process.env.REACT_APP_CLERK_PUBLISHABLE_KEY;

// Protected Route Component (Simple Auth Check)
const RequireAuth = ({ children }) => {
  return (
    <RequireRole allowedRoles={['user', 'printer', 'admin']}>
      {children}
    </RequireRole>
  );
};

// Root redirect component - handles navigation after login
const RootRedirect = () => {
  const { user, isLoaded } = useUser();

  if (!isLoaded) {
    return null; // Loading
  }

  const userRole = user?.unsafeMetadata?.role;

  // If no role, go to onboarding
  if (!userRole) {
    return <Navigate to="/onboarding" replace />;
  }

  // If has role, go to dashboard
  return <Navigate to="/dashboard" replace />;
};

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    // You can log error info here if needed
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ color: 'red', padding: 32, textAlign: 'center' }}>
          <h2>Something went wrong.</h2>
          <pre>{this.state.error && this.state.error.toString()}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

function App() {
  return (
    <ClerkProvider publishableKey={clerkPubKey}>
      <UserProvider>
        <PrintJobProvider>
          <ChatProvider>
            <GlobalStyles />
            <ErrorBoundary>
              <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                <AnimatePresence mode="wait">
                  <Routes>
                    <Route
                      path="/login"
                      element={
                        <SignedOut>
                          <Authentication />
                        </SignedOut>
                      }
                    />
                    <Route
                      path="/onboarding"
                      element={
                        <SignedIn>
                          <Onboarding />
                        </SignedIn>
                      }
                    />
                    <Route
                      path="/dashboard"
                      element={
                        <RequireRole allowedRoles={['user', 'printer', 'admin']}>
                          <Layout>
                            <Dashboard />
                          </Layout>
                        </RequireRole>
                      }
                    />
                    <Route
                      path="/shop-discovery"
                      element={
                        <RequireRole allowedRoles={['user']}>
                          <Layout>
                            <ShopDiscovery />
                          </Layout>
                        </RequireRole>
                      }
                    />
                    <Route
                      path="/print-job-submission"
                      element={
                        <RequireAuth>
                          <Layout>
                            <PrintJobSubmission />
                          </Layout>
                        </RequireAuth>
                      }
                    />
                    <Route
                      path="/submit-job"
                      element={
                        <RequireAuth>
                          <Layout>
                            <PrintJobSubmission />
                          </Layout>
                        </RequireAuth>
                      }
                    />
                    <Route
                      path="/print-job-queue"
                      element={
                        <RequireRole allowedRoles={['user', 'printer', 'admin']}>
                          <Layout>
                            <PrintJobQueue />
                          </Layout>
                        </RequireRole>
                      }
                    />
                    <Route
                      path="/printer-management"
                      element={
                        <RequireRole allowedRoles={['printer', 'admin']}>
                          <Layout>
                            <PrinterManagement />
                          </Layout>
                        </RequireRole>
                      }
                    />
                    <Route
                      path="/user-management"
                      element={
                        <RequireRole allowedRoles={['admin']}>
                          <Layout>
                            <UserManagement />
                          </Layout>
                        </RequireRole>
                      }
                    />
                    <Route
                      path="/release/:jobId"
                      element={<PrintRelease />}
                    />
                    <Route
                      path="/print-release"
                      element={
                        <RequireRole allowedRoles={['printer', 'admin']}>
                          <Layout>
                            <PrintRelease />
                          </Layout>
                        </RequireRole>
                      }
                    />
                    <Route
                      path="/reports"
                      element={
                        <RequireRole allowedRoles={['printer', 'admin']}>
                          <Layout>
                            <Reports />
                          </Layout>
                        </RequireRole>
                      }
                    />
                    <Route
                      path="/settings"
                      element={
                        <RequireRole allowedRoles={['user', 'printer', 'admin']}>
                          <Layout>
                            <Settings />
                          </Layout>
                        </RequireRole>
                      }
                    />
                    <Route
                      path="/chat"
                      element={
                        <RequireRole allowedRoles={['user', 'printer', 'admin']}>
                          <Layout>
                            <Chat />
                          </Layout>
                        </RequireRole>
                      }
                    />
                    <Route
                      path="/"
                      element={
                        <SignedIn>
                          <RootRedirect />
                        </SignedIn>
                      }
                    />
                    <Route
                      path="/"
                      element={
                        <SignedOut>
                          <Navigate to="/login" replace />
                        </SignedOut>
                      }
                    />

                  </Routes>
                </AnimatePresence>
              </Router>
            </ErrorBoundary>
            <ToastContainer position="bottom-right" theme="dark" />
          </ChatProvider>
        </PrintJobProvider>
      </UserProvider>
    </ClerkProvider>
  );
}

export default App;
