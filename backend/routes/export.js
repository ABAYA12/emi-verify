const express = require('express');
const router = express.Router();
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const path = require('path');
const fs = require('fs');
const InsuranceCase = require('../models/InsuranceCase');
const DocumentVerification = require('../models/DocumentVerification');

// Ensure exports directory exists
const ensureExportsDir = () => {
  const exportsDir = path.join(__dirname, '../exports');
  if (!fs.existsSync(exportsDir)) {
    fs.mkdirSync(exportsDir, { recursive: true });
  }
  return exportsDir;
};

// Export Insurance Cases to CSV
router.get('/insurance-cases', async (req, res) => {
  try {
    const filters = {
      start_date: req.query.start_date,
      end_date: req.query.end_date,
      agent_name: req.query.agent_name,
      country: req.query.country,
      case_status: req.query.case_status
    };

    const cases = await InsuranceCase.getAll(filters);
    
    if (cases.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No insurance cases found for the specified filters'
      });
    }

    const exportsDir = ensureExportsDir();
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `insurance-cases-${timestamp}.csv`;
    const filepath = path.join(exportsDir, filename);

    const csvWriter = createCsvWriter({
      path: filepath,
      header: [
        { id: 'id', title: 'ID' },
        { id: 'agent_name', title: 'AGENT NAME' },
        { id: 'insured_name', title: 'INSURED NAME' },
        { id: 'country', title: 'COUNTRY' },
        { id: 'date_received', title: 'DATE RECEIVED' },
        { id: 'date_closed', title: 'DATE CLOSED' },
        { id: 'turn_around_time', title: 'TURN AROUND TIME' },
        { id: 'case_status', title: 'CASE STATUS' },
        { id: 'policy_number', title: 'POLICY NUMBER' },
        { id: 'case_type', title: 'CASE TYPE' },
        { id: 'insurance_company', title: 'INSURANCE COMPANY' },
        { id: 'is_fraud', title: 'IS FRAUD' },
        { id: 'fraud_type', title: 'FRAUD TYPE' },
        { id: 'comment', title: 'COMMENT' },
        { id: 'fraud_source', title: 'FRAUD SOURCE' },
        { id: 'created_at', title: 'CREATED AT' },
        { id: 'updated_at', title: 'UPDATED AT' }
      ]
    });

    // Format data for CSV
    const csvData = cases.map(caseRecord => ({
      ...caseRecord,
      date_received: caseRecord.date_received ? 
        new Date(caseRecord.date_received).toISOString().split('T')[0] : '',
      date_closed: caseRecord.date_closed ? 
        new Date(caseRecord.date_closed).toISOString().split('T')[0] : '',
      is_fraud: caseRecord.is_fraud ? 'YES' : 'NO',
      created_at: new Date(caseRecord.created_at).toISOString(),
      updated_at: new Date(caseRecord.updated_at).toISOString()
    }));

    await csvWriter.writeRecords(csvData);

    // Set headers for file download
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    
    // Stream the file
    const fileStream = fs.createReadStream(filepath);
    fileStream.pipe(res);

    // Clean up file after sending
    fileStream.on('end', () => {
      fs.unlink(filepath, (err) => {
        if (err) console.error('Error cleaning up CSV file:', err);
      });
    });

  } catch (error) {
    console.error('Error exporting insurance cases:', error);
    res.status(500).json({
      success: false,
      message: 'Error exporting insurance cases to CSV',
      error: error.message
    });
  }
});

// Export Document Verifications to CSV
router.get('/document-verifications', async (req, res) => {
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
    
    if (verifications.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No document verifications found for the specified filters'
      });
    }

    const exportsDir = ensureExportsDir();
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `document-verifications-${timestamp}.csv`;
    const filepath = path.join(exportsDir, filename);

    const csvWriter = createCsvWriter({
      path: filepath,
      header: [
        { id: 'id', title: 'ID' },
        { id: 'agent_name', title: 'AGENT NAME' },
        { id: 'ars_number', title: 'ARS NUMBER' },
        { id: 'check_id', title: 'CHECK ID' },
        { id: 'applicant_name', title: 'APPLICANT NAME' },
        { id: 'document_type', title: 'DOCUMENT TYPE' },
        { id: 'country', title: 'COUNTRY' },
        { id: 'region_town', title: 'REGION_TOWN' },
        { id: 'date_received', title: 'DATE RECEIVED' },
        { id: 'date_closed', title: 'DATE CLOSED' },
        { id: 'turn_around_time', title: 'TURN AROUND TIME' },
        { id: 'turn_around_status', title: 'TURN AROUND STATUS' },
        { id: 'processing_fee', title: 'PROCESSING FEE' },
        { id: 'agent_amount_paid', title: 'AGENT AMOUNT PAID' },
        { id: 'total', title: 'TOTAL' },
        { id: 'payment_status', title: 'PAYMENT STATUS' },
        { id: 'created_at', title: 'CREATED AT' },
        { id: 'updated_at', title: 'UPDATED AT' }
      ]
    });

    // Format data for CSV
    const csvData = verifications.map(verification => ({
      ...verification,
      date_received: verification.date_received ? 
        new Date(verification.date_received).toISOString().split('T')[0] : '',
      date_closed: verification.date_closed ? 
        new Date(verification.date_closed).toISOString().split('T')[0] : '',
      processing_fee: verification.processing_fee || '',
      agent_amount_paid: verification.agent_amount_paid || '',
      total: verification.total || '',
      created_at: new Date(verification.created_at).toISOString(),
      updated_at: new Date(verification.updated_at).toISOString()
    }));

    await csvWriter.writeRecords(csvData);

    // Set headers for file download
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    
    // Stream the file
    const fileStream = fs.createReadStream(filepath);
    fileStream.pipe(res);

    // Clean up file after sending
    fileStream.on('end', () => {
      fs.unlink(filepath, (err) => {
        if (err) console.error('Error cleaning up CSV file:', err);
      });
    });

  } catch (error) {
    console.error('Error exporting document verifications:', error);
    res.status(500).json({
      success: false,
      message: 'Error exporting document verifications to CSV',
      error: error.message
    });
  }
});

// Get export summary
router.get('/summary', async (req, res) => {
  try {
    const dateFilter = {
      start_date: req.query.start_date,
      end_date: req.query.end_date
    };

    const [totalInsuranceCases, totalDocVerifications] = await Promise.all([
      InsuranceCase.getTotalCases(dateFilter),
      DocumentVerification.getTotalVerifications(dateFilter)
    ]);

    res.json({
      success: true,
      data: {
        available_exports: {
          insurance_cases: {
            total_records: totalInsuranceCases,
            endpoint: '/api/export/insurance-cases'
          },
          document_verifications: {
            total_records: totalDocVerifications,
            endpoint: '/api/export/document-verifications'
          }
        },
        supported_filters: [
          'start_date (YYYY-MM-DD)',
          'end_date (YYYY-MM-DD)',
          'agent_name',
          'country',
          'case_status (for insurance cases)',
          'document_type (for document verifications)',
          'payment_status (for document verifications)'
        ],
        date_filter: dateFilter
      }
    });
  } catch (error) {
    console.error('Error getting export summary:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting export summary',
      error: error.message
    });
  }
});

module.exports = router;
