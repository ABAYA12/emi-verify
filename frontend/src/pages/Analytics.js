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
  FaArrowUp
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
          <h1 className="page-title">Analytics Dashboard</h1>
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
            <FaFileInvoiceDollar /> Insurance Cases Analytics
          </h2>
          
          {/* KPI Cards */}
          <div className="kpi-grid">
            <div className="kpi-card primary">
              <div className="kpi-icon">
                <FaFileInvoiceDollar />
              </div>
              <div className="kpi-content">
                <h3 className="kpi-title">Total Cases</h3>
                <p className="kpi-value">{insuranceKPIs.totalCases || 0}</p>
                <small className="kpi-subtitle">Total insurance cases</small>
              </div>
            </div>

            <div className="kpi-card success">
              <div className="kpi-icon">
                <FaArrowUp />
              </div>
              <div className="kpi-content">
                <h3 className="kpi-title">Total Revenue</h3>
                <p className="kpi-value">{formatCurrency(insuranceKPIs.totalRevenue)}</p>
                <small className="kpi-subtitle">Commission earnings</small>
              </div>
            </div>

            <div className="kpi-card warning">
              <div className="kpi-icon">
                <FaClock />
              </div>
              <div className="kpi-content">
                <h3 className="kpi-title">Avg Processing Time</h3>
                <p className="kpi-value">{insuranceKPIs.avgProcessingTime || 0} days</p>
                <small className="kpi-subtitle">Average case duration</small>
              </div>
            </div>

            <div className="kpi-card info">
              <div className="kpi-icon">
                <FaCheckCircle />
              </div>
              <div className="kpi-content">
                <h3 className="kpi-title">Conversion Rate</h3>
                <p className="kpi-value">{formatPercentage(insuranceKPIs.conversionRate)}</p>
                <small className="kpi-subtitle">Applications to approvals</small>
              </div>
            </div>
          </div>

          {/* Charts */}
          <div className="charts-grid">
            {/* Revenue Trend */}
            {insuranceKPIs.revenueTrend && insuranceKPIs.revenueTrend.length > 0 && (
              <div className="chart-container">
                <h3 className="chart-title">Revenue Trend</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={insuranceKPIs.revenueTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip formatter={(value) => [formatCurrency(value), 'Revenue']} />
                    <Area 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke={chartColors.primary} 
                      fill={chartColors.primary}
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Case Status Distribution */}
            {insuranceKPIs.statusDistribution && insuranceKPIs.statusDistribution.length > 0 && (
              <div className="chart-container">
                <h3 className="chart-title">Case Status Distribution</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={insuranceKPIs.statusDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {insuranceKPIs.statusDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Top Agents */}
            {insuranceKPIs.topAgents && insuranceKPIs.topAgents.length > 0 && (
              <div className="chart-container">
                <h3 className="chart-title">Top Performing Agents</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={insuranceKPIs.topAgents}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="agent_name" />
                    <YAxis />
                    <Tooltip formatter={(value) => [formatCurrency(value), 'Revenue']} />
                    <Bar dataKey="revenue" fill={chartColors.success} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Insurance Type Distribution */}
            {insuranceKPIs.typeDistribution && insuranceKPIs.typeDistribution.length > 0 && (
              <div className="chart-container">
                <h3 className="chart-title">Insurance Type Distribution</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={insuranceKPIs.typeDistribution}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="insurance_type" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill={chartColors.info} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Document Verifications KPIs */}
      {documentKPIs && (
        <div className="analytics-section">
          <h2 className="section-title">
            <FaUsers /> Document Verification Analytics
          </h2>
          
          {/* KPI Cards */}
          <div className="kpi-grid">
            <div className="kpi-card primary">
              <div className="kpi-icon">
                <FaUsers />
              </div>
              <div className="kpi-content">
                <h3 className="kpi-title">Total Verifications</h3>
                <p className="kpi-value">{documentKPIs.totalVerifications || 0}</p>
                <small className="kpi-subtitle">Documents processed</small>
              </div>
            </div>

            <div className="kpi-card success">
              <div className="kpi-icon">
                <FaArrowUp />
              </div>
              <div className="kpi-content">
                <h3 className="kpi-title">Processing Revenue</h3>
                <p className="kpi-value">{formatCurrency(documentKPIs.totalRevenue)}</p>
                <small className="kpi-subtitle">Processing fees collected</small>
              </div>
            </div>

            <div className="kpi-card warning">
              <div className="kpi-icon">
                <FaClock />
              </div>
              <div className="kpi-content">
                <h3 className="kpi-title">Avg Turnaround</h3>
                <p className="kpi-value">{documentKPIs.avgTurnaroundTime || 0} days</p>
                <small className="kpi-subtitle">Average processing time</small>
              </div>
            </div>

            <div className="kpi-card info">
              <div className="kpi-icon">
                <FaCheckCircle />
              </div>
              <div className="kpi-content">
                <h3 className="kpi-title">Completion Rate</h3>
                <p className="kpi-value">{formatPercentage(documentKPIs.completionRate)}</p>
                <small className="kpi-subtitle">Successfully completed</small>
              </div>
            </div>
          </div>

          {/* Charts */}
          <div className="charts-grid">
            {/* Processing Volume Trend */}
            {documentKPIs.volumeTrend && documentKPIs.volumeTrend.length > 0 && (
              <div className="chart-container">
                <h3 className="chart-title">Processing Volume Trend</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={documentKPIs.volumeTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="count" 
                      stroke={chartColors.primary} 
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Document Type Distribution */}
            {documentKPIs.typeDistribution && documentKPIs.typeDistribution.length > 0 && (
              <div className="chart-container">
                <h3 className="chart-title">Document Type Distribution</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={documentKPIs.typeDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {documentKPIs.typeDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Country Distribution */}
            {documentKPIs.countryDistribution && documentKPIs.countryDistribution.length > 0 && (
              <div className="chart-container">
                <h3 className="chart-title">Top Countries by Volume</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={documentKPIs.countryDistribution.slice(0, 10)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="country" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill={chartColors.warning} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Payment Status Distribution */}
            {documentKPIs.paymentDistribution && documentKPIs.paymentDistribution.length > 0 && (
              <div className="chart-container">
                <h3 className="chart-title">Payment Status Distribution</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={documentKPIs.paymentDistribution}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="payment_status" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill={chartColors.secondary} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Combined Summary */}
      <div className="analytics-section">
        <h2 className="section-title">
          <FaChartLine /> Combined Business Summary
        </h2>
        <div className="summary-grid">
          <div className="summary-card">
            <h3>Total Business Revenue</h3>
            <p className="summary-value">
              {formatCurrency(
                (insuranceKPIs?.totalRevenue || 0) + (documentKPIs?.totalRevenue || 0)
              )}
            </p>
            <small>Insurance + Document Processing</small>
          </div>
          <div className="summary-card">
            <h3>Total Active Cases</h3>
            <p className="summary-value">
              {(insuranceKPIs?.totalCases || 0) + (documentKPIs?.totalVerifications || 0)}
            </p>
            <small>Combined cases and verifications</small>
          </div>
          <div className="summary-card">
            <h3>Business Efficiency</h3>
            <p className="summary-value">
              {formatPercentage(
                ((insuranceKPIs?.conversionRate || 0) + (documentKPIs?.completionRate || 0)) / 2
              )}
            </p>
            <small>Average success rate</small>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
