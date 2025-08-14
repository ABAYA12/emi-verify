import React, { useState, useEffect } from 'react';
import { 
  FaFileAlt, 
  FaClipboardCheck, 
  FaChartLine, 
  FaDollarSign,
  FaExclamationTriangle,
  FaClock,
  FaUsers,
  FaGlobe
} from 'react-icons/fa';
import { apiService } from '../services/api';
import StatCard from '../components/StatCard';
import ChartCard from '../components/ChartCard';
import './Dashboard.css';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateFilter, setDateFilter] = useState({
    start_date: '',
    end_date: ''
  });

  useEffect(() => {
    fetchDashboardData();
  }, [dateFilter]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await apiService.analytics.dashboard(dateFilter);
      setDashboardData(response.data.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleDateFilterChange = (field, value) => {
    setDateFilter(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const clearFilters = () => {
    setDateFilter({
      start_date: '',
      end_date: ''
    });
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p className="loading-text">Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <h2 className="error-title">Error</h2>
        <p className="error-message">{error}</p>
        <button className="btn btn-primary" onClick={fetchDashboardData}>
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Overview of your insurance cases and document verifications</p>
        </div>
      </div>

      {/* Date Filters */}
      <div className="filters-container">
        <div className="filters-row">
          <div className="form-group">
            <label className="form-label">Start Date</label>
            <input
              type="date"
              className="form-control"
              value={dateFilter.start_date}
              onChange={(e) => handleDateFilterChange('start_date', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label">End Date</label>
            <input
              type="date"
              className="form-control"
              value={dateFilter.end_date}
              onChange={(e) => handleDateFilterChange('end_date', e.target.value)}
            />
          </div>
        </div>
        <div className="filters-actions">
          <button className="btn btn-secondary" onClick={clearFilters}>
            Clear Filters
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="stats-grid">
        <StatCard
          title="Total Records"
          value={dashboardData?.summary?.total_records || 0}
          icon={<FaFileAlt />}
          color="primary"
          subtitle="All cases and verifications"
        />
        <StatCard
          title="Completed"
          value={dashboardData?.summary?.total_completed || 0}
          icon={<FaClipboardCheck />}
          color="success"
          subtitle="Closed cases and completed verifications"
        />
        <StatCard
          title="Pending"
          value={dashboardData?.summary?.total_pending || 0}
          icon={<FaClock />}
          color="warning"
          subtitle="Open cases and in-progress verifications"
        />
        <StatCard
          title="Total Revenue"
          value={`$${(dashboardData?.financial_overview?.total_revenue || 0).toLocaleString()}`}
          icon={<FaDollarSign />}
          color="success"
          subtitle="Processing fees + amount paid"
        />
      </div>

      {/* Insurance Cases Overview */}
      <div className="overview-section">
        <div className="overview-card">
          <div className="card-header">
            <h3 className="card-title">
              <FaFileAlt style={{marginRight: '8px'}} />
              Insurance Cases
            </h3>
          </div>
          <div className="card-body">
            <div className="mini-stats">
              <div className="mini-stat">
                <div className="mini-stat-value">{dashboardData?.insurance_cases?.total || 0}</div>
                <div className="mini-stat-label">Total Cases</div>
              </div>
              <div className="mini-stat">
                <div className="mini-stat-value">{dashboardData?.insurance_cases?.closed || 0}</div>
                <div className="mini-stat-label">Closed</div>
              </div>
              <div className="mini-stat">
                <div className="mini-stat-value">{dashboardData?.insurance_cases?.pending || 0}</div>
                <div className="mini-stat-label">Pending</div>
              </div>
              <div className="mini-stat">
                <div className="mini-stat-value text-danger">{dashboardData?.insurance_cases?.fraud_cases || 0}</div>
                <div className="mini-stat-label">Fraud Cases</div>
              </div>
            </div>
            
            <div className="progress-section">
              <div className="progress-label">
                <span>Fraud Rate</span>
                <span className="text-danger">{dashboardData?.insurance_cases?.fraud_rate || 0}%</span>
              </div>
              <div className="progress">
                <div 
                  className="progress-bar bg-danger" 
                  style={{ width: `${dashboardData?.insurance_cases?.fraud_rate || 0}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        <div className="overview-card">
          <div className="card-header">
            <h3 className="card-title">
              <FaClipboardCheck style={{marginRight: '8px'}} />
              Document Verifications
            </h3>
          </div>
          <div className="card-body">
            <div className="mini-stats">
              <div className="mini-stat">
                <div className="mini-stat-value">{dashboardData?.document_verifications?.total || 0}</div>
                <div className="mini-stat-label">Total Verifications</div>
              </div>
              <div className="mini-stat">
                <div className="mini-stat-value">{dashboardData?.document_verifications?.completed || 0}</div>
                <div className="mini-stat-label">Completed</div>
              </div>
              <div className="mini-stat">
                <div className="mini-stat-value">{dashboardData?.document_verifications?.pending || 0}</div>
                <div className="mini-stat-label">Pending</div>
              </div>
            </div>

            <div className="progress-section">
              <div className="progress-label">
                <span>Completion Rate</span>
                <span className="text-success">{dashboardData?.document_verifications?.completion_rate || 0}%</span>
              </div>
              <div className="progress">
                <div 
                  className="progress-bar bg-success" 
                  style={{ width: `${dashboardData?.document_verifications?.completion_rate || 0}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Financial Overview */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Financial Overview</h3>
        </div>
        <div className="card-body">
          <div className="financial-stats">
            <div className="financial-stat">
              <FaDollarSign className="financial-icon text-success" />
              <div>
                <div className="financial-value">
                  ${(dashboardData?.financial_overview?.total_processing_fees || 0).toLocaleString()}
                </div>
                <div className="financial-label">Total Processing Fees</div>
              </div>
            </div>
            <div className="financial-stat">
              <FaUsers className="financial-icon text-primary" />
              <div>
                <div className="financial-value">
                  ${(dashboardData?.financial_overview?.total_amount_paid || 0).toLocaleString()}
                </div>
                <div className="financial-label">Total Amount Paid</div>
              </div>
            </div>
            <div className="financial-stat">
              <FaChartLine className="financial-icon text-success" />
              <div>
                <div className="financial-value">
                  ${(dashboardData?.financial_overview?.total_revenue || 0).toLocaleString()}
                </div>
                <div className="financial-label">Total Revenue</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <h3>Quick Actions</h3>
        <div className="action-grid">
          <a href="/insurance-cases/add" className="action-card">
            <FaFileAlt className="action-icon" />
            <div className="action-title">Add Insurance Case</div>
            <div className="action-subtitle">Create a new insurance case record</div>
          </a>
          <a href="/document-verifications/add" className="action-card">
            <FaClipboardCheck className="action-icon" />
            <div className="action-title">Add Document Verification</div>
            <div className="action-subtitle">Create a new verification record</div>
          </a>
          <a href="/analytics" className="action-card">
            <FaChartLine className="action-icon" />
            <div className="action-title">View Analytics</div>
            <div className="action-subtitle">Detailed reports and insights</div>
          </a>
          <a href="/insurance-cases" className="action-card">
            <FaGlobe className="action-icon" />
            <div className="action-title">Export Data</div>
            <div className="action-subtitle">Download CSV reports</div>
          </a>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
