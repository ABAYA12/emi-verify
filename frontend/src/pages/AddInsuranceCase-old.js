import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSave, FaTimes } from 'react-icons/fa';
import { apiService } from '../services/api';
import toast from 'react-hot-toast';

const AddInsuranceCase = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    agent_name: '',
    insured_name: '',
    country: '',
    date_received: '',
    date_closed: '',
    turn_around_time: '',
    case_status: '',
    policy_number: '',
    case_type: '',
    insurance_company: '',
    is_fraud: false,
    fraud_type: '',
    comment: '',
    fraud_source: ''
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Prepare data for submission
      const submitData = { ...formData };
      
      // Convert empty strings to null
      Object.keys(submitData).forEach(key => {
        if (submitData[key] === '') {
          submitData[key] = null;
        }
      });

      // Convert turn_around_time to number if provided
      if (submitData.turn_around_time) {
        submitData.turn_around_time = parseInt(submitData.turn_around_time);
      }

      await apiService.insuranceCases.create(submitData);
      toast.success('Insurance case created successfully');
      navigate('/insurance-cases');
    } catch (err) {
      console.error('Error creating insurance case:', err);
      toast.error('Failed to create insurance case');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/insurance-cases');
  };

  return (
    <div className="add-insurance-case">
      <div className="page-header">
        <div>
          <h1 className="page-title">Add Insurance Case</h1>
          <p className="page-subtitle">Create a new insurance case record</p>
        </div>
      </div>

      <div className="form-container">
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Agent Name</label>
              <input
                type="text"
                name="agent_name"
                className="form-control"
                value={formData.agent_name}
                onChange={handleChange}
                placeholder="Enter agent name"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Insured Name</label>
              <input
                type="text"
                name="insured_name"
                className="form-control"
                value={formData.insured_name}
                onChange={handleChange}
                placeholder="Enter insured person's name"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Country</label>
              <input
                type="text"
                name="country"
                className="form-control"
                value={formData.country}
                onChange={handleChange}
                placeholder="Enter country"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Policy Number</label>
              <input
                type="text"
                name="policy_number"
                className="form-control"
                value={formData.policy_number}
                onChange={handleChange}
                placeholder="Enter policy number"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Date Received</label>
              <input
                type="date"
                name="date_received"
                className="form-control"
                value={formData.date_received}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Date Closed</label>
              <input
                type="date"
                name="date_closed"
                className="form-control"
                value={formData.date_closed}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Case Status</label>
              <select
                name="case_status"
                className="form-control"
                value={formData.case_status}
                onChange={handleChange}
              >
                <option value="">Select status</option>
                <option value="Open">Open</option>
                <option value="Closed">Closed</option>
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Under Review">Under Review</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Turnaround Time (days)</label>
              <input
                type="number"
                name="turn_around_time"
                className="form-control"
                value={formData.turn_around_time}
                onChange={handleChange}
                placeholder="Enter number of days"
                min="0"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Case Type</label>
              <select
                name="case_type"
                className="form-control"
                value={formData.case_type}
                onChange={handleChange}
              >
                <option value="">Select case type</option>
                <option value="Property Damage">Property Damage</option>
                <option value="Auto Accident">Auto Accident</option>
                <option value="Health Insurance">Health Insurance</option>
                <option value="Life Insurance">Life Insurance</option>
                <option value="Liability">Liability</option>
                <option value="Workers Compensation">Workers Compensation</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Insurance Company</label>
              <input
                type="text"
                name="insurance_company"
                className="form-control"
                value={formData.insurance_company}
                onChange={handleChange}
                placeholder="Enter insurance company name"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <div className="d-flex align-items-center">
                <input
                  type="checkbox"
                  name="is_fraud"
                  id="is_fraud"
                  checked={formData.is_fraud}
                  onChange={handleChange}
                  style={{ marginRight: '8px' }}
                />
                <label htmlFor="is_fraud" className="form-label mb-0">
                  Is this a fraud case?
                </label>
              </div>
            </div>
          </div>

          {formData.is_fraud && (
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Fraud Type</label>
                <select
                  name="fraud_type"
                  className="form-control"
                  value={formData.fraud_type}
                  onChange={handleChange}
                >
                  <option value="">Select fraud type</option>
                  <option value="Documented Fraud">Documented Fraud</option>
                  <option value="Suspected Fraud">Suspected Fraud</option>
                  <option value="Premium Fraud">Premium Fraud</option>
                  <option value="Claims Fraud">Claims Fraud</option>
                  <option value="Application Fraud">Application Fraud</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Fraud Source</label>
                <select
                  name="fraud_source"
                  className="form-control"
                  value={formData.fraud_source}
                  onChange={handleChange}
                >
                  <option value="">Select fraud source</option>
                  <option value="Internal Investigation">Internal Investigation</option>
                  <option value="External Report">External Report</option>
                  <option value="Customer Report">Customer Report</option>
                  <option value="Agent Report">Agent Report</option>
                  <option value="Automated Detection">Automated Detection</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
          )}

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Comments</label>
              <textarea
                name="comment"
                className="form-control"
                rows="4"
                value={formData.comment}
                onChange={handleChange}
                placeholder="Enter any additional comments or notes..."
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
                  <div className="spinner"></div> Creating...
                </>
              ) : (
                <>
                  <FaSave /> Create Insurance Case
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddInsuranceCase;
