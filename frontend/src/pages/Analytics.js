import React, { useState, useEffect } from 'react';
import { 
  FaChartLine, 
  FaDownload, 
  FaSync,
  FaFileInvoiceDollar,
  FaUsers,
  FaClock,
  FaExclamationTriangle,
  FaCheckCircle,
  FaArrowUp,
  FaShieldAlt,
  FaGlobe,
  FaFileAlt
} from 'react-icons/fa';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { apiService } from '../services/api';
import toast from 'react-hot-toast';
import './Analytics.css';

const Analytics = () => {
  const [loading, setLoading] = useState(true);
  const [insuranceKPIs, setInsuranceKPIs] = useState(null);
  const [documentKPIs, setDocumentKPIs] = useState(null);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState({
    start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days ago
    end_date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch both insurance and document KPIs
      const [insuranceResponse, documentResponse] = await Promise.all([
        apiService.analytics.insuranceKPIs(dateRange),
        apiService.analytics.documentKPIs(dateRange)
      ]);

      setInsuranceKPIs(insuranceResponse.data.data);
      setDocumentKPIs(documentResponse.data.data);
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError('Failed to load analytics data');
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const handleDateRangeChange = (field, value) => {
    setDateRange(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleRefresh = () => {
    fetchAnalytics();
  };

  const handleExportReport = async () => {
    try {
      const response = await apiService.analytics.exportReport(dateRange);
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `analytics-report-${dateRange.start_date}-to-${dateRange.end_date}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('Report exported successfully');
    } catch (err) {
      console.error('Error exporting report:', err);
      toast.error('Failed to export report');
    }
  };

  const formatCurrency = (value) => {
    if (!value) return '$0';
    return `$${parseFloat(value).toLocaleString()}`;
  };

  const formatPercentage = (value) => {
    if (!value) return '0%';
    return `${parseFloat(value).toFixed(1)}%`;
  };

  const formatNumber = (value) => {
    if (!value) return '0';
    return parseInt(value).toLocaleString();
  };

  // Colors for charts
  const chartColors = {
    primary: '#3b82f6',
    secondary: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    info: '#6366f1',
    success: '#059669'
  };

  const pieColors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#6366f1', '#8b5cf6'];

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p className="loading-text">Loading analytics data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <h2 className="error-title">Error</h2>
        <p className="error-message">{error}</p>
        <button className="btn btn-primary" onClick={fetchAnalytics}>
          <FaSync /> Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="analytics">
      <div className="page-header">
        <div>
          <h1 className="page-title">KPI Analytics Dashboard</h1>
          <p className="page-subtitle">Comprehensive insights and key performance indicators</p>
        </div>
        <div className="page-actions">
          <div className="date-range-selector">
            <input
              type="date"
              value={dateRange.start_date}
              onChange={(e) => handleDateRangeChange('start_date', e.target.value)}
              className="form-control"
            />
            <span className="date-separator">to</span>
            <input
              type="date"
              value={dateRange.end_date}
              onChange={(e) => handleDateRangeChange('end_date', e.target.value)}
              className="form-control"
            />
          </div>
          <button className="btn btn-secondary" onClick={handleRefresh}>
            <FaSync /> Refresh
          </button>
          <button className="btn btn-success" onClick={handleExportReport}>
            <FaDownload /> Export Report
          </button>
        </div>
      </div>

      {/* Insurance Cases KPIs */}
      {insuranceKPIs && (
        <div className="analytics-section">
          <h2 className="section-title">
            <FaFileInvoiceDollar /> KPI Analytics — Insurance Cases
          </h2>
          
          {/* Core KPI Cards */}
          <div className="kpi-grid">
            <div className="kpi-card primary">
              <div className="kpi-icon">
                <FaFileInvoiceDollar />
              </div>
              <div className="kpi-content">
                <h3 className="kpi-title">Total Cases Received</h3>
                <p className="kpi-value">{formatNumber(insuranceKPIs.total_cases_received)}</p>
                <small className="kpi-subtitle">All insurance cases</small>
              </div>
            </div>

            <div className="kpi-card success">
              <div className="kpi-icon">
                <FaCheckCircle />
              </div>
              <div className="kpi-content">
                <h3 className="kpi-title">Total Cases Closed</h3>
                <p className="kpi-value">{formatNumber(insuranceKPIs.total_cases_closed)}</p>
                <small className="kpi-subtitle">Completed cases</small>
              </div>
            </div>

            <div className="kpi-card warning">
              <div className="kpi-icon">
                <FaClock />
              </div>
              <div className="kpi-content">
                <h3 className="kpi-title">Average Turnaround Time</h3>
                <p className="kpi-value">{insuranceKPIs.average_turnaround_time || 0} days</p>
                <small className="kpi-subtitle">Processing time</small>
              </div>
            </div>

            <div className="kpi-card info">
              <div className="kpi-icon">
                <FaCheckCircle />
              </div>
              <div className="kpi-content">
                <h3 className="kpi-title">% Cases Closed On Time</h3>
                <p className="kpi-value">{formatPercentage(insuranceKPIs.percentage_cases_closed_on_time)}</p>
                <small className="kpi-subtitle">On-time completion</small>
              </div>
            </div>

            <div className="kpi-card secondary">
              <div className="kpi-icon">
                <FaClock />
              </div>
              <div className="kpi-content">
                <h3 className="kpi-title">Pending Cases</h3>
                <p className="kpi-value">{formatNumber(insuranceKPIs.pending_cases)}</p>
                <small className="kpi-subtitle">Awaiting completion</small>
              </div>
            </div>

            <div className="kpi-card danger">
              <div className="kpi-icon">
                <FaShieldAlt />
              </div>
              <div className="kpi-content">
                <h3 className="kpi-title">Total Fraud Cases</h3>
                <p className="kpi-value">{formatNumber(insuranceKPIs.total_fraud_cases)}</p>
                <small className="kpi-subtitle">Fraudulent cases</small>
              </div>
            </div>

            <div className="kpi-card danger">
              <div className="kpi-icon">
                <FaExclamationTriangle />
              </div>
              <div className="kpi-content">
                <h3 className="kpi-title">% Fraudulent Cases</h3>
                <p className="kpi-value">{formatPercentage(insuranceKPIs.percentage_fraudulent_cases)}</p>
                <small className="kpi-subtitle">Fraud rate</small>
              </div>
            </div>
          </div>

          {/* Charts */}
          <div className="charts-grid">
            {/* Case Volume by Country */}
            {insuranceKPIs.case_volume_by_country && insuranceKPIs.case_volume_by_country.length > 0 && (
              <div className="chart-container">
                <h3 className="chart-title">Case Volume by Country</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={insuranceKPIs.case_volume_by_country}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="country" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="case_count" fill={chartColors.primary} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Case Volume by Case Type */}
            {insuranceKPIs.case_volume_by_case_type && insuranceKPIs.case_volume_by_case_type.length > 0 && (
              <div className="chart-container">
                <h3 className="chart-title">Case Volume by Case Type</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={insuranceKPIs.case_volume_by_case_type}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ case_type, percent }) => `${case_type} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="case_count"
                    >
                      {insuranceKPIs.case_volume_by_case_type.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Fraud Cases by Type */}
            {insuranceKPIs.fraud_cases_by_type && insuranceKPIs.fraud_cases_by_type.length > 0 && (
              <div className="chart-container">
                <h3 className="chart-title">Fraud Cases by Type</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={insuranceKPIs.fraud_cases_by_type}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="fraud_type" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="fraud_count" fill={chartColors.danger} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Fraud Cases by Source */}
            {insuranceKPIs.fraud_cases_by_source && insuranceKPIs.fraud_cases_by_source.length > 0 && (
              <div className="chart-container">
                <h3 className="chart-title">Fraud Cases by Source</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={insuranceKPIs.fraud_cases_by_source}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ fraud_source, percent }) => `${fraud_source} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="fraud_count"
                    >
                      {insuranceKPIs.fraud_cases_by_source.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Fraud Rate by Insurance Company */}
            {insuranceKPIs.fraud_rate_by_insurance_company && insuranceKPIs.fraud_rate_by_insurance_company.length > 0 && (
              <div className="chart-container">
                <h3 className="chart-title">Fraud Rate by Insurance Company</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={insuranceKPIs.fraud_rate_by_insurance_company}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="insurance_company" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`${value}%`, 'Fraud Rate']} />
                    <Bar dataKey="fraud_rate" fill={chartColors.warning} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Country Risk Assessment */}
            {insuranceKPIs.country_risk_assessment && insuranceKPIs.country_risk_assessment.length > 0 && (
              <div className="chart-container full-width">
                <h3 className="chart-title">Country Risk Assessment (Total Cases, Fraud Cases, Avg Turnaround)</h3>
                <div className="table-container">
                  <table className="analytics-table">
                    <thead>
                      <tr>
                        <th>Country</th>
                        <th>Total Cases</th>
                        <th>Fraud Cases</th>
                        <th>Fraud Rate</th>
                        <th>Avg Turnaround (days)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {insuranceKPIs.country_risk_assessment.map((country, index) => (
                        <tr key={index}>
                          <td>{country.country}</td>
                          <td>{formatNumber(country.total_cases)}</td>
                          <td>{formatNumber(country.fraud_cases)}</td>
                          <td>{formatPercentage(country.fraud_rate)}</td>
                          <td>{country.avg_turnaround || 'N/A'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Document Verification KPIs */}
      {documentKPIs && (
        <div className="analytics-section">
          <h2 className="section-title">
            <FaFileAlt /> KPI Analytics — Document Verification
          </h2>
          
          {/* Core KPI Cards */}
          <div className="kpi-grid">
            <div className="kpi-card primary">
              <div className="kpi-icon">
                <FaFileAlt />
              </div>
              <div className="kpi-content">
                <h3 className="kpi-title">Total Verifications Received</h3>
                <p className="kpi-value">{formatNumber(documentKPIs.total_verifications_received)}</p>
                <small className="kpi-subtitle">All documents received</small>
              </div>
            </div>

            <div className="kpi-card success">
              <div className="kpi-icon">
                <FaCheckCircle />
              </div>
              <div className="kpi-content">
                <h3 className="kpi-title">Total Completed Verifications</h3>
                <p className="kpi-value">{formatNumber(documentKPIs.total_completed_verifications)}</p>
                <small className="kpi-subtitle">Completed verifications</small>
              </div>
            </div>

            <div className="kpi-card warning">
              <div className="kpi-icon">
                <FaClock />
              </div>
              <div className="kpi-content">
                <h3 className="kpi-title">Average Turnaround Time</h3>
                <p className="kpi-value">{documentKPIs.average_turnaround_time || 0} days</p>
                <small className="kpi-subtitle">Processing time</small>
              </div>
            </div>

            <div className="kpi-card info">
              <div className="kpi-icon">
                <FaCheckCircle />
              </div>
              <div className="kpi-content">
                <h3 className="kpi-title">% On-Time Verifications</h3>
                <p className="kpi-value">{formatPercentage(documentKPIs.percentage_on_time_verifications)}</p>
                <small className="kpi-subtitle">On-time completion</small>
              </div>
            </div>

            <div className="kpi-card secondary">
              <div className="kpi-icon">
                <FaClock />
              </div>
              <div className="kpi-content">
                <h3 className="kpi-title">Pending Verifications</h3>
                <p className="kpi-value">{formatNumber(documentKPIs.pending_verifications)}</p>
                <small className="kpi-subtitle">Awaiting completion</small>
              </div>
            </div>

            <div className="kpi-card success">
              <div className="kpi-icon">
                <FaArrowUp />
              </div>
              <div className="kpi-content">
                <h3 className="kpi-title">Total Processing Fees Collected</h3>
                <p className="kpi-value">{formatCurrency(documentKPIs.total_processing_fees_collected)}</p>
                <small className="kpi-subtitle">Processing fees</small>
              </div>
            </div>

            <div className="kpi-card info">
              <div className="kpi-icon">
                <FaUsers />
              </div>
              <div className="kpi-content">
                <h3 className="kpi-title">Total Agent Payments</h3>
                <p className="kpi-value">{formatCurrency(documentKPIs.total_agent_payments)}</p>
                <small className="kpi-subtitle">Agent compensation</small>
              </div>
            </div>
          </div>

          {/* Charts */}
          <div className="charts-grid">
            {/* Verification Volume by Document Type */}
            {documentKPIs.verification_volume_by_document_type && documentKPIs.verification_volume_by_document_type.length > 0 && (
              <div className="chart-container">
                <h3 className="chart-title">Verification Volume by Document Type</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={documentKPIs.verification_volume_by_document_type}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="document_type" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="verification_count" fill={chartColors.primary} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Verification Volume by Country/Region */}
            {documentKPIs.verification_volume_by_country_region && documentKPIs.verification_volume_by_country_region.length > 0 && (
              <div className="chart-container">
                <h3 className="chart-title">Verification Volume by Country/Region</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={documentKPIs.verification_volume_by_country_region}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="country" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="verification_count" fill={chartColors.secondary} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Agent Performance Table */}
            {documentKPIs.agent_performance && documentKPIs.agent_performance.length > 0 && (
              <div className="chart-container full-width">
                <h3 className="chart-title">Agent Performance (Total Handled, Completion Rate, Avg Turnaround)</h3>
                <div className="table-container">
                  <table className="analytics-table">
                    <thead>
                      <tr>
                        <th>Agent Name</th>
                        <th>Total Handled</th>
                        <th>Completed</th>
                        <th>Completion Rate</th>
                        <th>Avg Turnaround (days)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {documentKPIs.agent_performance.map((agent, index) => (
                        <tr key={index}>
                          <td>{agent.agent_name}</td>
                          <td>{formatNumber(agent.total_verifications)}</td>
                          <td>{formatNumber(agent.completed_verifications)}</td>
                          <td>{formatPercentage(agent.completion_rate)}</td>
                          <td>{agent.avg_turnaround || 'N/A'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Analytics;
