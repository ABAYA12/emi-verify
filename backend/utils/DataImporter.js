const fs = require('fs');
const path = require('path');
const csv = require('csv-parse');
const InsuranceCase = require('../models/InsuranceCase');
const DocumentVerification = require('../models/DocumentVerification');

class DataImporter {
  static async importInsuranceCasesFromCSV(csvFilePath) {
    return new Promise((resolve, reject) => {
      const results = [];
      const errors = [];

      fs.createReadStream(csvFilePath)
        .pipe(csv({ columns: true, skip_empty_lines: true }))
        .on('data', (data) => results.push(data))
        .on('end', async () => {
          console.log(`Processing ${results.length} insurance case records...`);
          
          let successCount = 0;
          for (let i = 0; i < results.length; i++) {
            try {
              const record = this.mapInsuranceCaseFields(results[i]);
              await InsuranceCase.create(record);
              successCount++;
            } catch (error) {
              errors.push({
                row: i + 1,
                data: results[i],
                error: error.message
              });
            }
          }

          resolve({
            total: results.length,
            successful: successCount,
            failed: errors.length,
            errors: errors
          });
        })
        .on('error', reject);
    });
  }

  static async importDocumentVerificationsFromCSV(csvFilePath) {
    return new Promise((resolve, reject) => {
      const results = [];
      const errors = [];

      fs.createReadStream(csvFilePath)
        .pipe(csv({ columns: true, skip_empty_lines: true }))
        .on('data', (data) => results.push(data))
        .on('end', async () => {
          console.log(`Processing ${results.length} document verification records...`);
          
          let successCount = 0;
          for (let i = 0; i < results.length; i++) {
            try {
              const record = this.mapDocumentVerificationFields(results[i]);
              await DocumentVerification.create(record);
              successCount++;
            } catch (error) {
              errors.push({
                row: i + 1,
                data: results[i],
                error: error.message
              });
            }
          }

          resolve({
            total: results.length,
            successful: successCount,
            failed: errors.length,
            errors: errors
          });
        })
        .on('error', reject);
    });
  }

  static mapInsuranceCaseFields(csvRow) {
    // Map CSV column names to database fields
    // Adjust these mappings based on your actual CSV headers
    return {
      agent_name: csvRow['AGENT NAME'] || csvRow['agent_name'] || null,
      insured_name: csvRow['INSURED NAME'] || csvRow['insured_name'] || null,
      country: csvRow['COUNTRY'] || csvRow['country'] || null,
      date_received: this.parseDate(csvRow['DATE RECEIVED'] || csvRow['date_received']),
      date_closed: this.parseDate(csvRow['DATE CLOSED'] || csvRow['date_closed']),
      turn_around_time: this.parseInteger(csvRow['TURN AROUND TIME'] || csvRow['turn_around_time']),
      case_status: csvRow['CASE STATUS'] || csvRow['case_status'] || null,
      policy_number: csvRow['POLICY NUMBER'] || csvRow['policy_number'] || null,
      case_type: csvRow['CASE TYPE'] || csvRow['case_type'] || null,
      insurance_company: csvRow['INSURANCE COMPANY'] || csvRow['insurance_company'] || null,
      is_fraud: this.parseBoolean(csvRow['IS FRAUD'] || csvRow['is_fraud']),
      fraud_type: csvRow['FRAUD TYPE'] || csvRow['fraud_type'] || null,
      comment: csvRow['COMMENT'] || csvRow['comment'] || null,
      fraud_source: csvRow['FRAUD SOURCE'] || csvRow['fraud_source'] || null
    };
  }

  static mapDocumentVerificationFields(csvRow) {
    // Map CSV column names to database fields
    return {
      agent_name: csvRow['AGENT NAME'] || csvRow['agent_name'] || null,
      ars_number: csvRow['ARS NUMBER'] || csvRow['ars_number'] || null,
      check_id: csvRow['CHECK ID'] || csvRow['check_id'] || null,
      applicant_name: csvRow['APPLICANT NAME'] || csvRow['applicant_name'] || null,
      document_type: csvRow['DOCUMENT TYPE'] || csvRow['document_type'] || null,
      country: csvRow['COUNTRY'] || csvRow['country'] || null,
      region_town: csvRow['REGION_TOWN'] || csvRow['region_town'] || null,
      date_received: this.parseDate(csvRow['DATE RECEIVED'] || csvRow['date_received']),
      date_closed: this.parseDate(csvRow['DATE CLOSED'] || csvRow['date_closed']),
      turn_around_time: this.parseInteger(csvRow['TURN AROUND TIME'] || csvRow['turn_around_time']),
      turn_around_status: csvRow['TURN AROUND STATUS'] || csvRow['turn_around_status'] || null,
      processing_fee: this.parseDecimal(csvRow['PROCESSING FEE'] || csvRow['processing_fee']),
      agent_amount_paid: this.parseDecimal(csvRow['AGENT AMOUNT PAID'] || csvRow['agent_amount_paid']),
      total: this.parseDecimal(csvRow['TOTAL'] || csvRow['total']),
      payment_status: csvRow['PAYMENT STATUS'] || csvRow['payment_status'] || null
    };
  }

  static parseDate(dateString) {
    if (!dateString || dateString.trim() === '') return null;
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? null : date.toISOString().split('T')[0];
  }

  static parseInteger(value) {
    if (!value || value.toString().trim() === '') return null;
    const parsed = parseInt(value);
    return isNaN(parsed) ? null : parsed;
  }

  static parseDecimal(value) {
    if (!value || value.toString().trim() === '') return null;
    const parsed = parseFloat(value);
    return isNaN(parsed) ? null : parsed;
  }

  static parseBoolean(value) {
    if (!value) return false;
    const str = value.toString().toLowerCase().trim();
    return str === 'true' || str === 'yes' || str === '1' || str === 'fraud';
  }

  // Generate sample data for testing
  static async generateSampleData() {
    console.log('Generating sample data...');

    // Sample Insurance Cases
    const sampleInsuranceCases = [
      {
        agent_name: 'John Smith',
        insured_name: 'Alice Johnson',
        country: 'USA',
        date_received: '2024-01-15',
        date_closed: '2024-01-25',
        turn_around_time: 10,
        case_status: 'Closed',
        policy_number: 'POL001234',
        case_type: 'Property Damage',
        insurance_company: 'ABC Insurance',
        is_fraud: false,
        comment: 'Standard property damage claim'
      },
      {
        agent_name: 'Sarah Wilson',
        insured_name: 'Bob Martinez',
        country: 'Mexico',
        date_received: '2024-01-20',
        date_closed: '2024-02-05',
        turn_around_time: 16,
        case_status: 'Closed',
        policy_number: 'POL001235',
        case_type: 'Auto Accident',
        insurance_company: 'XYZ Insurance',
        is_fraud: true,
        fraud_type: 'Documented Fraud',
        fraud_source: 'Internal Investigation',
        comment: 'Fraudulent claim detected during investigation'
      },
      {
        agent_name: 'Mike Chen',
        insured_name: 'Carol Davis',
        country: 'Canada',
        date_received: '2024-02-01',
        case_status: 'Open',
        policy_number: 'POL001236',
        case_type: 'Health Insurance',
        insurance_company: 'DEF Insurance',
        is_fraud: false,
        comment: 'Currently under review'
      }
    ];

    // Sample Document Verifications
    const sampleDocVerifications = [
      {
        agent_name: 'Emma Rodriguez',
        ars_number: 'ARS2024001',
        check_id: 'CHK001',
        applicant_name: 'David Thompson',
        document_type: 'Passport',
        country: 'USA',
        region_town: 'New York, NY',
        date_received: '2024-01-10',
        date_closed: '2024-01-15',
        turn_around_time: 5,
        turn_around_status: 'On Time',
        processing_fee: 150.00,
        agent_amount_paid: 120.00,
        total: 150.00,
        payment_status: 'PAID'
      },
      {
        agent_name: 'James Liu',
        ars_number: 'ARS2024002',
        check_id: 'CHK002',
        applicant_name: 'Maria Garcia',
        document_type: 'Driver License',
        country: 'Mexico',
        region_town: 'Guadalajara',
        date_received: '2024-01-12',
        date_closed: '2024-01-20',
        turn_around_time: 8,
        turn_around_status: 'On Time',
        processing_fee: 75.00,
        agent_amount_paid: 60.00,
        total: 75.00,
        payment_status: 'PENDING'
      },
      {
        agent_name: 'Lisa Park',
        ars_number: 'ARS2024003',
        check_id: 'CHK003',
        applicant_name: 'Ahmed Hassan',
        document_type: 'Birth Certificate',
        country: 'UAE',
        region_town: 'Dubai',
        date_received: '2024-01-25',
        turn_around_status: 'In Progress',
        processing_fee: 100.00,
        agent_amount_paid: 80.00,
        total: 100.00,
        payment_status: 'UNPAID'
      }
    ];

    try {
      // Insert sample insurance cases
      for (const caseData of sampleInsuranceCases) {
        await InsuranceCase.create(caseData);
      }

      // Insert sample document verifications
      for (const verificationData of sampleDocVerifications) {
        await DocumentVerification.create(verificationData);
      }

      console.log('Sample data generated successfully!');
      console.log(`- ${sampleInsuranceCases.length} insurance cases created`);
      console.log(`- ${sampleDocVerifications.length} document verifications created`);

      return {
        insurance_cases: sampleInsuranceCases.length,
        document_verifications: sampleDocVerifications.length
      };
    } catch (error) {
      console.error('Error generating sample data:', error);
      throw error;
    }
  }
}

module.exports = DataImporter;
