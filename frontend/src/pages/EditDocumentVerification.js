import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaSave, FaTimes, FaSpinner } from 'react-icons/fa';
import { apiService } from '../services/api';
import toast from 'react-hot-toast';
import './DocumentVerifications.css';

const EditDocumentVerification = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [formData, setFormData] = useState({
    agent_name: '',
    applicant_name: '',
    email_address: '',
    phone_number: '',
    date_received: '',
    document_type: '',
    country: '',
    embassy_source: '',
    language_version: '',
    processing_fee: '',
    payment_status: 'PENDING',
    turn_around_time: '',
    turn_around_status: 'IN_PROGRESS',
    rush_order: false,
    additional_notes: ''
  });

  const documentTypes = [
    'Passport',
    'Driver License',
    'Birth Certificate',
    'ID Card',
    'Visa',
    'Marriage Certificate',
    'Death Certificate',
    'Education Certificate',
    'Medical Certificate',
    'Other'
  ];

  const paymentStatuses = [
    { value: 'PAID', label: 'Paid' },
    { value: 'PENDING', label: 'Pending' },
    { value: 'UNPAID', label: 'Unpaid' }
  ];

  const turnAroundStatuses = [
    { value: 'RECEIVED', label: 'Document Received' },
    { value: 'IN_PROGRESS', label: 'In Progress' },
    { value: 'UNDER_REVIEW', label: 'Under Review' },
    { value: 'COMPLETED', label: 'Verification Complete' },
    { value: 'RETURNED', label: 'Returned to Client' }
  ];

  useEffect(() => {
    fetchVerification();
  }, [id]);

  const fetchVerification = async () => {
    try {
      setFetchLoading(true);
      const response = await apiService.documentVerifications.getById(id);
      const verification = response.data.data;
      
      // Format the data for the form
      setFormData({
        agent_name: verification.agent_name || '',
        applicant_name: verification.applicant_name || '',
        email_address: verification.email_address || '',
        phone_number: verification.phone_number || '',
        date_received: verification.date_received ? verification.date_received.split('T')[0] : '',
        document_type: verification.document_type || '',
        country: verification.country || '',
        embassy_source: verification.embassy_source || '',
        language_version: verification.language_version || '',
        processing_fee: verification.processing_fee || '',
        payment_status: verification.payment_status || 'PENDING',
        turn_around_time: verification.turn_around_time || '',
        turn_around_status: verification.turn_around_status || 'IN_PROGRESS',
        rush_order: verification.rush_order || false,
        additional_notes: verification.additional_notes || ''
      });
    } catch (error) {
      console.error('Error fetching verification:', error);
      toast.error('Failed to load document verification');
      navigate('/document-verifications');
    } finally {
      setFetchLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.agent_name || !formData.applicant_name || !formData.document_type || !formData.country) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      // Format data for submission
      const submitData = {
        ...formData,
        processing_fee: formData.processing_fee ? parseFloat(formData.processing_fee) : null,
        turn_around_time: formData.turn_around_time ? parseInt(formData.turn_around_time) : null,
        rush_order: formData.rush_order === true || formData.rush_order === 'true'
      };

      const response = await apiService.documentVerifications.update(id, submitData);
      toast.success('Document verification updated successfully!');
      navigate('/document-verifications');
    } catch (error) {
      console.error('Error updating document verification:', error);
      toast.error(error.response?.data?.message || 'Failed to update document verification');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/document-verifications');
  };

  if (fetchLoading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p className="loading-text">Loading document verification...</p>
      </div>
    );
  }

  return (
    <div className="edit-document-verification">
      <div className="page-header">
        <h1 className="page-title">Edit Document Verification</h1>
        <p className="page-subtitle">Update document verification record</p>
      </div>

      <form onSubmit={handleSubmit} className="verification-form">
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
          <h3 className="section-title">Document Information</h3>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label required">Document Type</label>
              <select
                className="form-control"
                value={formData.document_type}
                onChange={(e) => handleInputChange('document_type', e.target.value)}
                required
              >
                <option value="">Select document type</option>
                {documentTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label required">Country</label>
              <input
                type="text"
                className="form-control"
                placeholder="Enter country of document origin"
                value={formData.country}
                onChange={(e) => handleInputChange('country', e.target.value)}
                required
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Embassy Source</label>
              <input
                type="text"
                className="form-control"
                placeholder="Enter embassy or source authority"
                value={formData.embassy_source}
                onChange={(e) => handleInputChange('embassy_source', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Language Version</label>
              <input
                type="text"
                className="form-control"
                placeholder="Enter document language"
                value={formData.language_version}
                onChange={(e) => handleInputChange('language_version', e.target.value)}
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Date Received</label>
              <input
                type="date"
                className="form-control"
                value={formData.date_received}
                onChange={(e) => handleInputChange('date_received', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Rush Order</label>
              <div className="checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.rush_order}
                    onChange={(e) => handleInputChange('rush_order', e.target.checked)}
                  />
                  <span className="checkbox-text">This is a rush order</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3 className="section-title">Processing Information</h3>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Processing Fee ($)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                className="form-control"
                placeholder="Enter processing fee"
                value={formData.processing_fee}
                onChange={(e) => handleInputChange('processing_fee', e.target.value)}
              />
            </div>
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
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Turnaround Time (days)</label>
              <input
                type="number"
                min="0"
                className="form-control"
                placeholder="Enter expected turnaround time"
                value={formData.turn_around_time}
                onChange={(e) => handleInputChange('turn_around_time', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Processing Status</label>
              <select
                className="form-control"
                value={formData.turn_around_status}
                onChange={(e) => handleInputChange('turn_around_status', e.target.value)}
              >
                {turnAroundStatuses.map(status => (
                  <option key={status.value} value={status.value}>{status.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3 className="section-title">Additional Information</h3>
          <div className="form-group">
            <label className="form-label">Additional Notes</label>
            <textarea
              className="form-control"
              rows="4"
              placeholder="Enter any additional notes or special requirements..."
              value={formData.additional_notes}
              onChange={(e) => handleInputChange('additional_notes', e.target.value)}
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
                <FaSave /> Update Verification
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditDocumentVerification;
