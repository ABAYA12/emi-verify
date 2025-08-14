import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSave, FaTimes, FaSpinner } from 'react-icons/fa';
import { apiService } from '../services/api';
import toast from 'react-hot-toast';
import './InsuranceCases.css';

const AddInsuranceCase = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
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

      await apiService.insuranceCases.create(submitData);
      toast.success('Insurance case created successfully');
      navigate('/insurance-cases');
    } catch (error) {
      console.error('Error creating insurance case:', error);
      toast.error(error.response?.data?.message || 'Failed to create insurance case');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/insurance-cases');
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>Add New Insurance Case</h2>
        <p>Create a new insurance case record</p>
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
              {loading ? 'Creating...' : 'Create Case'}
            </button>
          </div>
        </form>
      </div>

      <div className="info-note">
        <p><strong>Note:</strong> Turnaround time and case status will be automatically calculated based on the dates and expected processing days.</p>
      </div>
    </div>
  );
};

export default AddInsuranceCase;
