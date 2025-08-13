import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaSave, FaTimes, FaSpinner } from 'react-icons/fa';
import { apiService } from '../services/api';
import toast from 'react-hot-toast';
import './InsuranceCases.css';

const EditInsuranceCase = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [formData, setFormData] = useState({
    agent_name: '',
    applicant_name: '',
    email_address: '',
    phone_number: '',
    date_submitted: '',
    insurance_type: '',
    premium_amount: '',
    commission_rate: '',
    commission_amount: '',
    payment_status: 'PENDING',
    case_status: 'OPEN',
    follow_up_date: '',
    notes: '',
    fraud_indicators: '',
    risk_score: '',
    additional_documents_required: false,
    priority_level: 'MEDIUM'
  });

  const insuranceTypes = [
    'Life Insurance',
    'Health Insurance',
    'Auto Insurance',
    'Home Insurance',
    'Travel Insurance',
    'Business Insurance',
    'Disability Insurance',
    'Other'
  ];

  const paymentStatuses = [
    { value: 'PAID', label: 'Paid' },
    { value: 'PENDING', label: 'Pending' },
    { value: 'OVERDUE', label: 'Overdue' },
    { value: 'CANCELLED', label: 'Cancelled' }
  ];

  const caseStatuses = [
    { value: 'OPEN', label: 'Open' },
    { value: 'IN_PROGRESS', label: 'In Progress' },
    { value: 'PENDING_REVIEW', label: 'Pending Review' },
    { value: 'APPROVED', label: 'Approved' },
    { value: 'REJECTED', label: 'Rejected' },
    { value: 'CLOSED', label: 'Closed' }
  ];

  const priorityLevels = [
    { value: 'LOW', label: 'Low' },
    { value: 'MEDIUM', label: 'Medium' },
    { value: 'HIGH', label: 'High' },
    { value: 'URGENT', label: 'Urgent' }
  ];

  useEffect(() => {
    fetchInsuranceCase();
  }, [id]);

  const fetchInsuranceCase = async () => {
    try {
      setFetchLoading(true);
      const response = await apiService.insuranceCases.getById(id);
      const insuranceCase = response.data.data;
      
      // Format the data for the form
      setFormData({
        agent_name: insuranceCase.agent_name || '',
        applicant_name: insuranceCase.applicant_name || '',
        email_address: insuranceCase.email_address || '',
        phone_number: insuranceCase.phone_number || '',
        date_submitted: insuranceCase.date_submitted ? insuranceCase.date_submitted.split('T')[0] : '',
        insurance_type: insuranceCase.insurance_type || '',
        premium_amount: insuranceCase.premium_amount || '',
        commission_rate: insuranceCase.commission_rate || '',
        commission_amount: insuranceCase.commission_amount || '',
        payment_status: insuranceCase.payment_status || 'PENDING',
        case_status: insuranceCase.case_status || 'OPEN',
        follow_up_date: insuranceCase.follow_up_date ? insuranceCase.follow_up_date.split('T')[0] : '',
        notes: insuranceCase.notes || '',
        fraud_indicators: insuranceCase.fraud_indicators || '',
        risk_score: insuranceCase.risk_score || '',
        additional_documents_required: insuranceCase.additional_documents_required || false,
        priority_level: insuranceCase.priority_level || 'MEDIUM'
      });
    } catch (error) {
      console.error('Error fetching insurance case:', error);
      toast.error('Failed to load insurance case');
      navigate('/insurance-cases');
    } finally {
      setFetchLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => {
      const newData = {
        ...prev,
        [field]: value
      };

      // Auto-calculate commission amount when premium amount or commission rate changes
      if (field === 'premium_amount' || field === 'commission_rate') {
        const premiumAmount = parseFloat(field === 'premium_amount' ? value : newData.premium_amount) || 0;
        const commissionRate = parseFloat(field === 'commission_rate' ? value : newData.commission_rate) || 0;
        
        if (premiumAmount > 0 && commissionRate > 0) {
          newData.commission_amount = (premiumAmount * commissionRate / 100).toFixed(2);
        }
      }

      return newData;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.agent_name || !formData.applicant_name || !formData.insurance_type) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      // Format data for submission
      const submitData = {
        ...formData,
        premium_amount: formData.premium_amount ? parseFloat(formData.premium_amount) : null,
        commission_rate: formData.commission_rate ? parseFloat(formData.commission_rate) : null,
        commission_amount: formData.commission_amount ? parseFloat(formData.commission_amount) : null,
        risk_score: formData.risk_score ? parseFloat(formData.risk_score) : null,
        additional_documents_required: formData.additional_documents_required === true || formData.additional_documents_required === 'true'
      };

      const response = await apiService.insuranceCases.update(id, submitData);
      toast.success('Insurance case updated successfully!');
      navigate('/insurance-cases');
    } catch (error) {
      console.error('Error updating insurance case:', error);
      toast.error(error.response?.data?.message || 'Failed to update insurance case');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/insurance-cases');
  };

  if (fetchLoading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p className="loading-text">Loading insurance case...</p>
      </div>
    );
  }

  return (
    <div className="edit-insurance-case">
      <div className="page-header">
        <h1 className="page-title">Edit Insurance Case</h1>
        <p className="page-subtitle">Update insurance case information</p>
      </div>

      <form onSubmit={handleSubmit} className="case-form">
        <div className="form-section">
          <h3 className="section-title">Agent & Applicant Information</h3>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label required">Agent Name</label>
              <input
                type="text"
                className="form-control"
                placeholder="Enter agent name"
                value={formData.agent_name}
                onChange={(e) => handleInputChange('agent_name', e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label required">Applicant Name</label>
              <input
                type="text"
                className="form-control"
                placeholder="Enter applicant full name"
                value={formData.applicant_name}
                onChange={(e) => handleInputChange('applicant_name', e.target.value)}
                required
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                className="form-control"
                placeholder="Enter email address"
                value={formData.email_address}
                onChange={(e) => handleInputChange('email_address', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input
                type="tel"
                className="form-control"
                placeholder="Enter phone number"
                value={formData.phone_number}
                onChange={(e) => handleInputChange('phone_number', e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3 className="section-title">Insurance Details</h3>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label required">Insurance Type</label>
              <select
                className="form-control"
                value={formData.insurance_type}
                onChange={(e) => handleInputChange('insurance_type', e.target.value)}
                required
              >
                <option value="">Select insurance type</option>
                {insuranceTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Date Submitted</label>
              <input
                type="date"
                className="form-control"
                value={formData.date_submitted}
                onChange={(e) => handleInputChange('date_submitted', e.target.value)}
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Premium Amount ($)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                className="form-control"
                placeholder="Enter premium amount"
                value={formData.premium_amount}
                onChange={(e) => handleInputChange('premium_amount', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Commission Rate (%)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="100"
                className="form-control"
                placeholder="Enter commission rate"
                value={formData.commission_rate}
                onChange={(e) => handleInputChange('commission_rate', e.target.value)}
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Commission Amount ($)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                className="form-control"
                placeholder="Auto-calculated or enter manually"
                value={formData.commission_amount}
                onChange={(e) => handleInputChange('commission_amount', e.target.value)}
              />
              <small className="form-help">Automatically calculated from premium amount and commission rate</small>
            </div>
            <div className="form-group">
              <label className="form-label">Follow-up Date</label>
              <input
                type="date"
                className="form-control"
                value={formData.follow_up_date}
                onChange={(e) => handleInputChange('follow_up_date', e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3 className="section-title">Status & Priority</h3>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Payment Status</label>
              <select
                className="form-control"
                value={formData.payment_status}
                onChange={(e) => handleInputChange('payment_status', e.target.value)}
              >
                {paymentStatuses.map(status => (
                  <option key={status.value} value={status.value}>{status.label}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Case Status</label>
              <select
                className="form-control"
                value={formData.case_status}
                onChange={(e) => handleInputChange('case_status', e.target.value)}
              >
                {caseStatuses.map(status => (
                  <option key={status.value} value={status.value}>{status.label}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Priority Level</label>
              <select
                className="form-control"
                value={formData.priority_level}
                onChange={(e) => handleInputChange('priority_level', e.target.value)}
              >
                {priorityLevels.map(priority => (
                  <option key={priority.value} value={priority.value}>{priority.label}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Additional Documents Required</label>
              <div className="checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.additional_documents_required}
                    onChange={(e) => handleInputChange('additional_documents_required', e.target.checked)}
                  />
                  <span className="checkbox-text">Additional documents are required</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3 className="section-title">Risk Assessment</h3>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Risk Score (0-100)</label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.1"
                className="form-control"
                placeholder="Enter risk score"
                value={formData.risk_score}
                onChange={(e) => handleInputChange('risk_score', e.target.value)}
              />
              <small className="form-help">Higher scores indicate higher risk</small>
            </div>
            <div className="form-group">
              <label className="form-label">Fraud Indicators</label>
              <input
                type="text"
                className="form-control"
                placeholder="Enter any fraud indicators"
                value={formData.fraud_indicators}
                onChange={(e) => handleInputChange('fraud_indicators', e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3 className="section-title">Additional Information</h3>
          <div className="form-group">
            <label className="form-label">Notes</label>
            <textarea
              className="form-control"
              rows="4"
              placeholder="Enter any additional notes about this case..."
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
            />
          </div>
        </div>

        <div className="form-actions">
          <button 
            type="button" 
            className="btn btn-secondary" 
            onClick={handleCancel}
            disabled={loading}
          >
            <FaTimes /> Cancel
          </button>
          <button 
            type="submit" 
            className="btn btn-primary" 
            disabled={loading}
          >
            {loading ? (
              <>
                <FaSpinner className="spinning" /> Updating...
              </>
            ) : (
              <>
                <FaSave /> Update Case
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditInsuranceCase;
