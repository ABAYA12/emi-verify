const express = require('express');
const router = express.Router();
const DocumentVerification = require('../models/DocumentVerification');

// Get all document verifications
router.get('/', async (req, res) => {
  try {
    const filters = {
      start_date: req.query.start_date,
      end_date: req.query.end_date,
      agent_name: req.query.agent_name,
      country: req.query.country,
      document_type: req.query.document_type,
      payment_status: req.query.payment_status
    };

    const verifications = await DocumentVerification.getAll(filters);
    res.json({
      success: true,
      data: verifications,
      count: verifications.length
    });
  } catch (error) {
    console.error('Error fetching document verifications:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching document verifications',
      error: error.message
    });
  }
});

// Get document verification by ID
router.get('/:id', async (req, res) => {
  try {
    const verification = await DocumentVerification.getById(req.params.id);
    if (!verification) {
      return res.status(404).json({
        success: false,
        message: 'Document verification not found'
      });
    }
    res.json({
      success: true,
      data: verification
    });
  } catch (error) {
    console.error('Error fetching document verification:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching document verification',
      error: error.message
    });
  }
});

// Create new document verification
router.post('/', async (req, res) => {
  try {
    const newVerification = await DocumentVerification.create(req.body);
    res.status(201).json({
      success: true,
      data: newVerification,
      message: 'Document verification created successfully'
    });
  } catch (error) {
    console.error('Error creating document verification:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating document verification',
      error: error.message
    });
  }
});

// Update document verification
router.put('/:id', async (req, res) => {
  try {
    const updatedVerification = await DocumentVerification.update(req.params.id, req.body);
    if (!updatedVerification) {
      return res.status(404).json({
        success: false,
        message: 'Document verification not found'
      });
    }
    res.json({
      success: true,
      data: updatedVerification,
      message: 'Document verification updated successfully'
    });
  } catch (error) {
    console.error('Error updating document verification:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating document verification',
      error: error.message
    });
  }
});

// Delete document verification
router.delete('/:id', async (req, res) => {
  try {
    const deletedVerification = await DocumentVerification.delete(req.params.id);
    if (!deletedVerification) {
      return res.status(404).json({
        success: false,
        message: 'Document verification not found'
      });
    }
    res.json({
      success: true,
      data: deletedVerification,
      message: 'Document verification deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting document verification:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting document verification',
      error: error.message
    });
  }
});

// Bulk create document verifications
router.post('/bulk', async (req, res) => {
  try {
    const { verifications } = req.body;
    if (!Array.isArray(verifications) || verifications.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Verifications array is required and must not be empty'
      });
    }

    const createdVerifications = [];
    const errors = [];

    for (let i = 0; i < verifications.length; i++) {
      try {
        const newVerification = await DocumentVerification.create(verifications[i]);
        createdVerifications.push(newVerification);
      } catch (error) {
        errors.push({
          index: i,
          verification: verifications[i],
          error: error.message
        });
      }
    }

    res.status(201).json({
      success: true,
      data: {
        created: createdVerifications,
        errors: errors,
        total_processed: verifications.length,
        successful: createdVerifications.length,
        failed: errors.length
      },
      message: `Bulk creation completed: ${createdVerifications.length} successful, ${errors.length} failed`
    });
  } catch (error) {
    console.error('Error in bulk create:', error);
    res.status(500).json({
      success: false,
      message: 'Error in bulk creation',
      error: error.message
    });
  }
});

module.exports = router;
