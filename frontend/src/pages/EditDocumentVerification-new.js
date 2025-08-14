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
    ars_number: '',
    check_id: '',
    applicant_name: '',
    document_type: '',
    country: '',
    region_town: '',
    date_received: '',
    date_closed: '',
    processing_fee: 0,
    amount_paid: 0,
    payment_status: '',
    expected_days: 5
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
    'Police Clearance',
    'Business Registration',
    'Other'
  ];

  const paymentStatuses = [
    'PAID',
    'PENDING',
    'UNPAID',
    'PARTIAL',
    'CANCELLED'
  ];

  const countries = [
    'Nigeria', 'Ghana', 'Kenya', 'South Africa', 'Uganda', 'Tanzania',
    'Rwanda', 'Botswana', 'Zambia', 'Malawi', 'Zimbabwe', 'Other'
  ];

  useEffect(() => {
    fetchDocumentVerification();
  }, [id]);

  const fetchDocumentVerification = async () => {
    try {
      setFetchLoading(true);
      const response = await apiService.documentVerifications.getForEdit(id);
      const verification = response.data.data;
      
      // Pre-fill the form with exact database values
      setFormData({
        agent_name: verification.agent_name || '',
        ars_number: verification.ars_number || '',
        check_id: verification.check_id || '',
        applicant_name: verification.applicant_name || '',
        document_type: verification.document_type || '',
        country: verification.country || '',
        region_town: verification.region_town || '',
        date_received: verification.date_received || '',
        date_closed: verification.date_closed || '',
        processing_fee: verification.processing_fee || 0,
        amount_paid: verification.amount_paid || 0,
        payment_status: verification.payment_status || '',
        expected_days: verification.expected_days || 5
      });
    } catch (error) {
      console.error('Error fetching document verification:', error);
      toast.error('Failed to load document verification for editing');
      navigate('/document-verifications');
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
    
    if (!formData.agent_name || !formData.applicant_name) {
      toast.error('Agent name and applicant name are required');
      return;
    }

    try {
      setLoading(true);
      
      // Prepare data for submission (remove empty strings and convert numbers)
      const submitData = {
        ...formData,
        expected_days: parseInt(formData.expected_days) || 5,
        processing_fee: parseFloat(formData.processing_fee) || 0,
        amount_paid: parseFloat(formData.amount_paid) || 0,
        // Convert empty strings to null for optional fields
        date_received: formData.date_received || null,
        date_closed: formData.date_closed || null,
        ars_number: formData.ars_number || null,
        check_id: formData.check_id || null,
        document_type: formData.document_type || null,
        country: formData.country || null,
        region_town: formData.region_town || null,
        payment_status: formData.payment_status || null
      };

      await apiService.documentVerifications.update(id, submitData);
      toast.success('Document verification updated successfully');
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
      <div className="page-container">
        <div className="loading-spinner">
          <FaSpinner className="fa-spin" />
          <p>Loading document verification...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>Edit Document Verification</h2>
        <p>Update the document verification information below</p>
      </div>

      <div className="form-container">
        <form onSubmit={handleSubmit} className="verification-form">
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
                <label htmlFor="applicant_name">Applicant Name *</label>
                <input
                  type="text"
                  id="applicant_name"
                  name="applicant_name"
                  value={formData.applicant_name}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter applicant name"
                />
              </div>

              <div className="form-group">
                <label htmlFor="ars_number">ARS Number</label>
                <input
                  type="text"
                  id="ars_number"
                  name="ars_number"
                  value={formData.ars_number}
                  onChange={handleInputChange}
                  placeholder="Enter ARS number"
                />
              </div>

              <div className="form-group">
                <label htmlFor="check_id">Check ID</label>
                <input
                  type="text"
                  id="check_id"
                  name="check_id"
                  value={formData.check_id}
                  onChange={handleInputChange}
                  placeholder="Enter check ID"
                />
              </div>
            </div>

            {/* Document Details */}
            <div className="form-section">
              <h3>Document Details</h3>
              
              <div className="form-group">
                <label htmlFor="document_type">Document Type</label>
                <select
                  id="document_type"
                  name="document_type"
                  value={formData.document_type}
                  onChange={handleInputChange}
                >
                  <option value="">Select Document Type</option>
                  {documentTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
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

              <div className="form-group">
                <label htmlFor="region_town">Region/Town</label>
                <input
                  type="text"
                  id="region_town"
                  name="region_town"
                  value={formData.region_town}
                  onChange={handleInputChange}
                  placeholder="Enter region or town"
                />
              </div>
            </div>

            {/* Timeline */}
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

              <div className="form-group">
                <label htmlFor="payment_status">Payment Status</label>
                <select
                  id="payment_status"
                  name="payment_status"
                  value={formData.payment_status}
                  onChange={handleInputChange}
                >
                  <option value="">Select Payment Status</option>
                  {paymentStatuses.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
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
              {loading ? 'Updating...' : 'Update Verification'}
            </button>
          </div>
        </form>
      </div>

      <div className="info-note">
        <p><strong>Note:</strong> Turnaround time and status are automatically calculated based on the dates and expected processing days.</p>
      </div>
    </div>
  );
};

export default EditDocumentVerification;
