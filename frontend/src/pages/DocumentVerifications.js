import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaDownload, 
  FaFilter,
  FaSearch
} from 'react-icons/fa';
import { apiService } from '../services/api';
import toast from 'react-hot-toast';
import './DocumentVerifications.css';

const DocumentVerifications = () => {
  const [verifications, setVerifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    start_date: '',
    end_date: '',
    agent_name: '',
    country: '',
    document_type: '',
    payment_status: ''
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchVerifications();
  }, []);

  const fetchVerifications = async () => {
    try {
      setLoading(true);
      const response = await apiService.documentVerifications.getAll(filters);
      setVerifications(response.data.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching document verifications:', err);
      setError('Failed to load document verifications');
      toast.error('Failed to load document verifications');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const applyFilters = () => {
    fetchVerifications();
    setShowFilters(false);
  };

  const clearFilters = () => {
    setFilters({
      start_date: '',
      end_date: '',
      agent_name: '',
      country: '',
      document_type: '',
      payment_status: ''
    });
    fetchVerifications();
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this document verification?')) {
      try {
        await apiService.documentVerifications.delete(id);
        toast.success('Document verification deleted successfully');
        fetchVerifications();
      } catch (err) {
        console.error('Error deleting verification:', err);
        toast.error('Failed to delete document verification');
      }
    }
  };

  const handleExportCSV = async () => {
    try {
      const response = await apiService.export.documentVerifications(filters);
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `document-verifications-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('CSV exported successfully');
    } catch (err) {
      console.error('Error exporting CSV:', err);
      toast.error('Failed to export CSV');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString();
  };

  const formatCurrency = (amount) => {
    if (!amount) return '-';
    return `$${parseFloat(amount).toLocaleString()}`;
  };

  const getPaymentStatusBadge = (status) => {
    if (!status) return <span className="status-badge">-</span>;
    
    const statusClass = status.toLowerCase() === 'paid' ? 'paid' : 
                       status.toLowerCase() === 'pending' ? 'pending' : 
                       'unpaid';
    
    return <span className={`status-badge ${statusClass}`}>{status}</span>;
  };

  const getStatusBadge = (status) => {
    if (!status) return <span className="status-badge">-</span>;
    
    const statusClass = status.toLowerCase().includes('complete') ? 'closed' : 
                       status.toLowerCase().includes('progress') ? 'pending' : 
                       'open';
    
    return <span className={`status-badge ${statusClass}`}>{status}</span>;
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p className="loading-text">Loading document verifications...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <h2 className="error-title">Error</h2>
        <p className="error-message">{error}</p>
        <button className="btn btn-primary" onClick={fetchVerifications}>
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="document-verifications">
      <div className="page-header">
        <div>
          <h1 className="page-title">Document Verifications</h1>
          <p className="page-subtitle">Manage and track all document verification records</p>
        </div>
        <div className="page-actions">
          <button 
            className="btn btn-secondary" 
            onClick={() => setShowFilters(!showFilters)}
          >
            <FaFilter /> Filter
          </button>
          <button className="btn btn-success" onClick={handleExportCSV}>
            <FaDownload /> Export CSV
          </button>
          <Link to="/document-verifications/add" className="btn btn-primary">
            <FaPlus /> Add New Verification
          </Link>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="filters-container">
          <div className="filters-row">
            <div className="form-group">
              <label className="form-label">Start Date</label>
              <input
                type="date"
                className="form-control"
                value={filters.start_date}
                onChange={(e) => handleFilterChange('start_date', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">End Date</label>
              <input
                type="date"
                className="form-control"
                value={filters.end_date}
                onChange={(e) => handleFilterChange('end_date', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Agent Name</label>
              <input
                type="text"
                className="form-control"
                placeholder="Search by agent name..."
                value={filters.agent_name}
                onChange={(e) => handleFilterChange('agent_name', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Country</label>
              <input
                type="text"
                className="form-control"
                placeholder="Search by country..."
                value={filters.country}
                onChange={(e) => handleFilterChange('country', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Document Type</label>
              <select
                className="form-control"
                value={filters.document_type}
                onChange={(e) => handleFilterChange('document_type', e.target.value)}
              >
                <option value="">All Document Types</option>
                <option value="Passport">Passport</option>
                <option value="Driver License">Driver License</option>
                <option value="Birth Certificate">Birth Certificate</option>
                <option value="ID Card">ID Card</option>
                <option value="Visa">Visa</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Payment Status</label>
              <select
                className="form-control"
                value={filters.payment_status}
                onChange={(e) => handleFilterChange('payment_status', e.target.value)}
              >
                <option value="">All Payment Statuses</option>
                <option value="PAID">Paid</option>
                <option value="PENDING">Pending</option>
                <option value="UNPAID">Unpaid</option>
              </select>
            </div>
          </div>
          <div className="filters-actions">
            <button className="btn btn-secondary" onClick={clearFilters}>
              Clear
            </button>
            <button className="btn btn-primary" onClick={applyFilters}>
              Apply Filters
            </button>
          </div>
        </div>
      )}

      {/* Results Summary */}
      <div className="results-summary">
        <p>Showing {verifications.length} document verification{verifications.length !== 1 ? 's' : ''}</p>
      </div>

      {/* Verifications Table */}
      {verifications.length === 0 ? (
        <div className="empty-state">
          <FaSearch className="empty-state-icon" />
          <h3 className="empty-state-title">No Document Verifications Found</h3>
          <p className="empty-state-message">
            {Object.values(filters).some(filter => filter) 
              ? 'Try adjusting your filters or clear them to see all verifications.'
              : 'Get started by adding your first document verification.'
            }
          </p>
          <Link to="/document-verifications/add" className="btn btn-primary">
            <FaPlus /> Add Document Verification
          </Link>
        </div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Agent Name</th>
                <th>Applicant Name</th>
                <th>Document Type</th>
                <th>Country</th>
                <th>Date Received</th>
                <th>Status</th>
                <th>Processing Fee</th>
                <th>Payment Status</th>
                <th>Turnaround Time</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {verifications.map((verification) => (
                <tr key={verification.id}>
                  <td>{verification.agent_name || '-'}</td>
                  <td>{verification.applicant_name || '-'}</td>
                  <td>{verification.document_type || '-'}</td>
                  <td>{verification.country || '-'}</td>
                  <td>{formatDate(verification.date_received)}</td>
                  <td>{getStatusBadge(verification.turn_around_status)}</td>
                  <td>{formatCurrency(verification.processing_fee)}</td>
                  <td>{getPaymentStatusBadge(verification.payment_status)}</td>
                  <td>{verification.turn_around_time ? `${verification.turn_around_time} days` : '-'}</td>
                  <td>
                    <div className="table-actions">
                      <Link 
                        to={`/document-verifications/edit/${verification.id}`}
                        className="btn btn-sm btn-secondary"
                        title="Edit"
                      >
                        <FaEdit />
                      </Link>
                      <button 
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDelete(verification.id)}
                        title="Delete"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default DocumentVerifications;
