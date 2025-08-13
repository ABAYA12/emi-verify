import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import InsuranceCases from './pages/InsuranceCases';
import DocumentVerifications from './pages/DocumentVerifications';
import Analytics from './pages/Analytics';
import AddInsuranceCase from './pages/AddInsuranceCase';
import AddDocumentVerification from './pages/AddDocumentVerification';
import EditInsuranceCase from './pages/EditInsuranceCase';
import EditDocumentVerification from './pages/EditDocumentVerification';
import './App.css';

function App() {
  return (
    <div className="App">
      <Navbar />
      <main className="main-content">
        <div className="container">
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
        </div>
      </main>
    </div>
  );
}

export default App;
