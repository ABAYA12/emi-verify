const express = require('express');
const router = express.Router();
const InsuranceCase = require('../models/InsuranceCase');

// Get all insurance cases
router.get('/', async (req, res) => {
  try {
    const filters = {
      start_date: req.query.start_date,
      end_date: req.query.end_date,
      agent_name: req.query.agent_name,
      country: req.query.country,
      case_status: req.query.case_status
    };

    const cases = await InsuranceCase.getAll(filters);
    res.json({
      success: true,
      data: cases,
      count: cases.length
    });
  } catch (error) {
    console.error('Error fetching insurance cases:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching insurance cases',
      error: error.message
    });
  }
});

// Get insurance case by ID
router.get('/:id', async (req, res) => {
  try {
    const caseRecord = await InsuranceCase.getById(req.params.id);
    if (!caseRecord) {
      return res.status(404).json({
        success: false,
        message: 'Insurance case not found'
      });
    }
    res.json({
      success: true,
      data: caseRecord
    });
  } catch (error) {
    console.error('Error fetching insurance case:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching insurance case',
      error: error.message
    });
  }
});

// Create new insurance case
router.post('/', async (req, res) => {
  try {
    const newCase = await InsuranceCase.create(req.body);
    res.status(201).json({
      success: true,
      data: newCase,
      message: 'Insurance case created successfully'
    });
  } catch (error) {
    console.error('Error creating insurance case:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating insurance case',
      error: error.message
    });
  }
});

// Update insurance case
router.put('/:id', async (req, res) => {
  try {
    const updatedCase = await InsuranceCase.update(req.params.id, req.body);
    if (!updatedCase) {
      return res.status(404).json({
        success: false,
        message: 'Insurance case not found'
      });
    }
    res.json({
      success: true,
      data: updatedCase,
      message: 'Insurance case updated successfully'
    });
  } catch (error) {
    console.error('Error updating insurance case:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating insurance case',
      error: error.message
    });
  }
});

// Delete insurance case
router.delete('/:id', async (req, res) => {
  try {
    const deletedCase = await InsuranceCase.delete(req.params.id);
    if (!deletedCase) {
      return res.status(404).json({
        success: false,
        message: 'Insurance case not found'
      });
    }
    res.json({
      success: true,
      data: deletedCase,
      message: 'Insurance case deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting insurance case:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting insurance case',
      error: error.message
    });
  }
});

// Bulk create insurance cases
router.post('/bulk', async (req, res) => {
  try {
    const { cases } = req.body;
    if (!Array.isArray(cases) || cases.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cases array is required and must not be empty'
      });
    }

    const createdCases = [];
    const errors = [];

    for (let i = 0; i < cases.length; i++) {
      try {
        const newCase = await InsuranceCase.create(cases[i]);
        createdCases.push(newCase);
      } catch (error) {
        errors.push({
          index: i,
          case: cases[i],
          error: error.message
        });
      }
    }

    res.status(201).json({
      success: true,
      data: {
        created: createdCases,
        errors: errors,
        total_processed: cases.length,
        successful: createdCases.length,
        failed: errors.length
      },
      message: `Bulk creation completed: ${createdCases.length} successful, ${errors.length} failed`
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
