import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaDownload, 
  FaFilter,
  FaSearch,
  FaEye
} from 'react-icons/fa';
import { apiService } from '../services/api';
import toast from 'react-hot-toast';
import './InsuranceCases.css';

const InsuranceCases = () => {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    start_date: '',
    end_date: '',
    agent_name: '',
    country: '',
    case_status: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCases, setSelectedCases] = useState([]);

  useEffect(() => {
    fetchCases();
  }, []);

  const fetchCases = async () => {
    try {
      setLoading(true);
      const response = await apiService.insuranceCases.getAll(filters);
      setCases(response.data.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching insurance cases:', err);
      setError('Failed to load insurance cases');
      toast.error('Failed to load insurance cases');
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
    fetchCases();
    setShowFilters(false);
  };

  const clearFilters = () => {
    setFilters({
      start_date: '',
      end_date: '',
      agent_name: '',
      country: '',
      case_status: ''
    });
    fetchCases();
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this insurance case?')) {
      try {
        await apiService.insuranceCases.delete(id);
        toast.success('Insurance case deleted successfully');
        fetchCases();
      } catch (err) {
        console.error('Error deleting case:', err);
        toast.error('Failed to delete insurance case');
      }
    }
  };

  const handleExportCSV = async () => {
    try {
      const response = await apiService.export.insuranceCases(filters);
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `insurance-cases-${new Date().toISOString().split('T')[0]}.csv`;
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

  const getStatusBadge = (status) => {
    if (!status) return <span className="status-badge">-</span>;
    
    const statusClass = status.toLowerCase().includes('open') ? 'open' : 
                       status.toLowerCase().includes('closed') ? 'closed' : 
                       'pending';
    
    return <span className={`status-badge ${statusClass}`}>{status}</span>;
  };

  const getFraudBadge = (isFraud) => {
    const fraudClass = isFraud ? 'fraud' : 'no-fraud';
    const fraudText = isFraud ? 'Yes' : 'No';
    
    return <span className={`status-badge ${fraudClass}`}>{fraudText}</span>;
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p className="loading-text">Loading insurance cases...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <h2 className="error-title">Error</h2>
        <p className="error-message">{error}</p>
        <button className="btn btn-primary" onClick={fetchCases}>
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="insurance-cases">
      <div className="page-header">
        <div>
          <h1 className="page-title">Insurance Cases</h1>
          <p className="page-subtitle">Manage and track all insurance case records</p>
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
          <Link to="/insurance-cases/add" className="btn btn-primary">
            <FaPlus /> Add New Case
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
              <label className="form-label">Case Status</label>
              <select
                className="form-control"
                value={filters.case_status}
                onChange={(e) => handleFilterChange('case_status', e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="Open">Open</option>
                <option value="Closed">Closed</option>
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
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
        <p>Showing {cases.length} insurance case{cases.length !== 1 ? 's' : ''}</p>
      </div>

      {/* Cases Table */}
      {cases.length === 0 ? (
        <div className="empty-state">
          <FaSearch className="empty-state-icon" />
          <h3 className="empty-state-title">No Insurance Cases Found</h3>
          <p className="empty-state-message">
            {Object.values(filters).some(filter => filter) 
              ? 'Try adjusting your filters or clear them to see all cases.'
              : 'Get started by adding your first insurance case.'
            }
          </p>
          <Link to="/insurance-cases/add" className="btn btn-primary">
            <FaPlus /> Add Insurance Case
          </Link>
        </div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Agent Name</th>
                <th>Insured Name</th>
                <th>Country</th>
                <th>Date Received</th>
                <th>Status</th>
                <th>Case Type</th>
                <th>Insurance Company</th>
                <th>Fraud</th>
                <th>Turnaround Time</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {cases.map((caseItem) => (
                <tr key={caseItem.id}>
                  <td>{caseItem.agent_name || '-'}</td>
                  <td>{caseItem.insured_name || '-'}</td>
                  <td>{caseItem.country || '-'}</td>
                  <td>{formatDate(caseItem.date_received)}</td>
                  <td>{getStatusBadge(caseItem.case_status)}</td>
                  <td>{caseItem.case_type || '-'}</td>
                  <td>{caseItem.insurance_company || '-'}</td>
                  <td>{getFraudBadge(caseItem.is_fraud)}</td>
                  <td>{caseItem.turn_around_time ? `${caseItem.turn_around_time} days` : '-'}</td>
                  <td>
                    <div className="table-actions">
                      <Link 
                        to={`/insurance-cases/edit/${caseItem.id}`}
                        className="btn btn-sm btn-secondary"
                        title="Edit"
                      >
                        <FaEdit />
                      </Link>
                      <button 
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDelete(caseItem.id)}
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

export default InsuranceCases;
