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
    insured_name: '',
    country: '',
    date_received: '',
    date_closed: '',
    policy_number: '',
    case_type: '',
    insurance_company: '',
    is_fraud: false,
    fraud_type: '',
    comment: '',
    fraud_source: '',
    expected_days: 7,
    processing_fee: 0,
    amount_paid: 0
  });

  const caseTypes = [
    'Death Claim',
    'Disability Claim',
    'Health Claim',
    'Auto Claim',
    'Property Claim',
    'Travel Claim',
    'Liability Claim',
    'Other'
  ];

  const fraudTypes = [
    'Application Fraud',
    'Claim Fraud',
    'Identity Fraud',
    'Premium Fraud',
    'Medical Fraud',
    'Staged Accident',
    'Other'
  ];

  const fraudSources = [
    'Internal Investigation',
    'Customer Report',
    'Partner Report',
    'Data Analysis',
    'External Tip',
    'Audit Finding',
    'Other'
  ];

  const countries = [
    'Nigeria', 'Ghana', 'Kenya', 'South Africa', 'Uganda', 'Tanzania',
    'Rwanda', 'Botswana', 'Zambia', 'Malawi', 'Zimbabwe', 'Other'
  ];

  useEffect(() => {
    fetchInsuranceCase();
  }, [id]);

  const fetchInsuranceCase = async () => {
    try {
      setFetchLoading(true);
      const response = await apiService.insuranceCases.getForEdit(id);
      const insuranceCase = response.data.data;
      
      // Pre-fill the form with exact database values
      setFormData({
        agent_name: insuranceCase.agent_name || '',
        insured_name: insuranceCase.insured_name || '',
        country: insuranceCase.country || '',
        date_received: insuranceCase.date_received || '',
        date_closed: insuranceCase.date_closed || '',
        policy_number: insuranceCase.policy_number || '',
        case_type: insuranceCase.case_type || '',
        insurance_company: insuranceCase.insurance_company || '',
        is_fraud: insuranceCase.is_fraud || false,
        fraud_type: insuranceCase.fraud_type || '',
        comment: insuranceCase.comment || '',
        fraud_source: insuranceCase.fraud_source || '',
        expected_days: insuranceCase.expected_days || 7,
        processing_fee: insuranceCase.processing_fee || 0,
        amount_paid: insuranceCase.amount_paid || 0
      });
    } catch (error) {
      console.error('Error fetching insurance case:', error);
      toast.error('Failed to load insurance case for editing');
      navigate('/insurance-cases');
    } finally {
      setFetchLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.agent_name || !formData.insured_name) {
      toast.error('Agent name and insured name are required');
      return;
    }

    try {
      setLoading(true);
      
      // Prepare data for submission (remove empty strings and convert numbers)
      const submitData = {
        ...formData,
        expected_days: parseInt(formData.expected_days) || 7,
        processing_fee: parseFloat(formData.processing_fee) || 0,
        amount_paid: parseFloat(formData.amount_paid) || 0,
        // Convert empty strings to null for optional fields
        date_received: formData.date_received || null,
        date_closed: formData.date_closed || null,
        policy_number: formData.policy_number || null,
        case_type: formData.case_type || null,
        insurance_company: formData.insurance_company || null,
        fraud_type: formData.fraud_type || null,
        comment: formData.comment || null,
        fraud_source: formData.fraud_source || null,
        country: formData.country || null
      };

      await apiService.insuranceCases.update(id, submitData);
      toast.success('Insurance case updated successfully');
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
      <div className="page-container">
        <div className="loading-spinner">
          <FaSpinner className="fa-spin" />
          <p>Loading insurance case...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>Edit Insurance Case</h2>
        <p>Update the insurance case information below</p>
      </div>

      <div className="form-container">
        <form onSubmit={handleSubmit} className="insurance-form">
          <div className="form-grid">
            {/* Basic Information */}
            <div className="form-section">
              <h3>Basic Information</h3>
              
              <div className="form-group">
                <label htmlFor="agent_name">Agent Name *</label>
                <input
                  type="text"
                  id="agent_name"
                  name="agent_name"
                  value={formData.agent_name}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter agent name"
                />
              </div>

              <div className="form-group">
                <label htmlFor="insured_name">Insured Name *</label>
                <input
                  type="text"
                  id="insured_name"
                  name="insured_name"
                  value={formData.insured_name}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter insured person's name"
                />
              </div>

              <div className="form-group">
                <label htmlFor="country">Country</label>
                <select
                  id="country"
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                >
                  <option value="">Select Country</option>
                  {countries.map(country => (
                    <option key={country} value={country}>{country}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Case Details */}
            <div className="form-section">
              <h3>Case Details</h3>
              
              <div className="form-group">
                <label htmlFor="policy_number">Policy Number</label>
                <input
                  type="text"
                  id="policy_number"
                  name="policy_number"
                  value={formData.policy_number}
                  onChange={handleInputChange}
                  placeholder="Enter policy number"
                />
              </div>

              <div className="form-group">
                <label htmlFor="case_type">Case Type</label>
                <select
                  id="case_type"
                  name="case_type"
                  value={formData.case_type}
                  onChange={handleInputChange}
                >
                  <option value="">Select Case Type</option>
                  {caseTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="insurance_company">Insurance Company</label>
                <input
                  type="text"
                  id="insurance_company"
                  name="insurance_company"
                  value={formData.insurance_company}
                  onChange={handleInputChange}
                  placeholder="Enter insurance company name"
                />
              </div>
            </div>

            {/* Dates and Timeline */}
            <div className="form-section">
              <h3>Timeline</h3>
              
              <div className="form-group">
                <label htmlFor="date_received">Date Received</label>
                <input
                  type="date"
                  id="date_received"
                  name="date_received"
                  value={formData.date_received}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="date_closed">Date Closed</label>
                <input
                  type="date"
                  id="date_closed"
                  name="date_closed"
                  value={formData.date_closed}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="expected_days">Expected Days</label>
                <input
                  type="number"
                  id="expected_days"
                  name="expected_days"
                  value={formData.expected_days}
                  onChange={handleInputChange}
                  min="1"
                  max="365"
                  placeholder="Expected processing days"
                />
              </div>
            </div>

            {/* Financial Information */}
            <div className="form-section">
              <h3>Financial Information</h3>
              
              <div className="form-group">
                <label htmlFor="processing_fee">Processing Fee</label>
                <input
                  type="number"
                  id="processing_fee"
                  name="processing_fee"
                  value={formData.processing_fee}
                  onChange={handleInputChange}
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                />
              </div>

              <div className="form-group">
                <label htmlFor="amount_paid">Amount Paid</label>
                <input
                  type="number"
                  id="amount_paid"
                  name="amount_paid"
                  value={formData.amount_paid}
                  onChange={handleInputChange}
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                />
              </div>
            </div>

            {/* Fraud Information */}
            <div className="form-section">
              <h3>Fraud Assessment</h3>
              
              <div className="form-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    name="is_fraud"
                    checked={formData.is_fraud}
                    onChange={handleInputChange}
                  />
                  Mark as Fraud Case
                </label>
              </div>

              {formData.is_fraud && (
                <>
                  <div className="form-group">
                    <label htmlFor="fraud_type">Fraud Type</label>
                    <select
                      id="fraud_type"
                      name="fraud_type"
                      value={formData.fraud_type}
                      onChange={handleInputChange}
                    >
                      <option value="">Select Fraud Type</option>
                      {fraudTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="fraud_source">Fraud Source</label>
                    <select
                      id="fraud_source"
                      name="fraud_source"
                      value={formData.fraud_source}
                      onChange={handleInputChange}
                    >
                      <option value="">Select Fraud Source</option>
                      {fraudSources.map(source => (
                        <option key={source} value={source}>{source}</option>
                      ))}
                    </select>
                  </div>
                </>
              )}
            </div>

            {/* Comments */}
            <div className="form-section full-width">
              <h3>Comments</h3>
              
              <div className="form-group">
                <label htmlFor="comment">Comments/Notes</label>
                <textarea
                  id="comment"
                  name="comment"
                  value={formData.comment}
                  onChange={handleInputChange}
                  rows="4"
                  placeholder="Add any additional comments or notes..."
                />
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button 
              type="button" 
              onClick={handleCancel}
              className="btn btn-secondary"
              disabled={loading}
            >
              <FaTimes /> Cancel
            </button>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? <FaSpinner className="fa-spin" /> : <FaSave />}
              {loading ? 'Updating...' : 'Update Case'}
            </button>
          </div>
        </form>
      </div>

      <div className="info-note">
        <p><strong>Note:</strong> Turnaround time and case status are automatically calculated based on the dates and expected processing days.</p>
      </div>
    </div>
  );
};

export default EditInsuranceCase;
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
