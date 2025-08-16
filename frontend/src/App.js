import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import InsuranceCases from './pages/InsuranceCases';
import DocumentVerifications from './pages/DocumentVerifications';
import Analytics from './pages/Analytics';
import AddInsuranceCase from './pages/AddInsuranceCase';
import AddDocumentVerification from './pages/AddDocumentVerification';
import EditInsuranceCase from './pages/EditInsuranceCase';
import EditDocumentVerification from './pages/EditDocumentVerification';

// Authentication pages
import Signup from './pages/Signup';
import Login from './pages/Login';
import VerifyEmail from './pages/VerifyEmail';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

import './App.css';

function App() {
  return (
    <AuthProvider>
      <div className="App">
        <Routes>
          {/* Public routes - Authentication */}
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Protected routes - Main application */}
          <Route path="/*" element={
            <ProtectedRoute>
              <Navbar />
              <main className="main-content">
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/insurance-cases" element={<InsuranceCases />} />
                  <Route path="/insurance-cases/add" element={<AddInsuranceCase />} />
                  <Route path="/insurance-cases/edit/:id" element={<EditInsuranceCase />} />
                  <Route path="/document-verifications" element={<DocumentVerifications />} />
                  <Route path="/document-verifications/add" element={<AddDocumentVerification />} />
                  <Route path="/document-verifications/edit/:id" element={<EditDocumentVerification />} />
                  <Route path="/analytics" element={<Analytics />} />
                </Routes>
              </main>
            </ProtectedRoute>
          } />
        </Routes>
      </div>
    </AuthProvider>
  );
}

export default App;
