const db = require('../config/database');

class InsuranceCaseModel {
  static async create(caseData) {
    const {
      agent_name, insured_name, country, date_received, date_closed,
      policy_number, case_type, insurance_company, is_fraud, fraud_type, 
      comment, fraud_source, expected_days, processing_fee, amount_paid
    } = caseData;

    const query = `
      INSERT INTO insurance_cases (
        agent_name, insured_name, country, date_received, date_closed,
        policy_number, case_type, insurance_company, is_fraud, fraud_type, 
        comment, fraud_source, expected_days, processing_fee, amount_paid
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING *;
    `;

    const values = [
      agent_name || null, insured_name || null, country || null,
      date_received || null, date_closed || null, policy_number || null, 
      case_type || null, insurance_company || null, is_fraud || false, 
      fraud_type || null, comment || null, fraud_source || null,
      expected_days || 7, processing_fee || 0, amount_paid || 0
    ];

    const result = await db.query(query, values);
    return result.rows[0];
  }

  static async getAll(filters = {}) {
    let query = 'SELECT * FROM insurance_cases WHERE 1=1';
    const values = [];
    let paramCounter = 1;

    if (filters.start_date) {
      query += ` AND date_received >= $${paramCounter}`;
      values.push(filters.start_date);
      paramCounter++;
    }

    if (filters.end_date) {
      query += ` AND date_received <= $${paramCounter}`;
      values.push(filters.end_date);
      paramCounter++;
    }

    if (filters.agent_name) {
      query += ` AND agent_name ILIKE $${paramCounter}`;
      values.push(`%${filters.agent_name}%`);
      paramCounter++;
    }

    if (filters.country) {
      query += ` AND country ILIKE $${paramCounter}`;
      values.push(`%${filters.country}%`);
      paramCounter++;
    }

    if (filters.case_status) {
      query += ` AND case_status = $${paramCounter}`;
      values.push(filters.case_status);
      paramCounter++;
    }

    query += ' ORDER BY created_at DESC';

    const result = await db.query(query, values);
    return result.rows;
  }

  static async getById(id) {
    const query = 'SELECT * FROM insurance_cases WHERE id = $1';
    const result = await db.query(query, [id]);
    return result.rows[0];
  }

  static async update(id, updateData) {
    // Filter out fields that shouldn't be manually updated (auto-calculated)
    const filteredData = { ...updateData };
    delete filteredData.turn_around_time; // Auto-calculated by trigger
    delete filteredData.case_status; // Auto-calculated by trigger
    delete filteredData.id; // Don't update ID
    delete filteredData.created_at; // Don't update creation timestamp
    
    const fields = Object.keys(filteredData).filter(key => 
      filteredData[key] !== undefined && filteredData[key] !== null && filteredData[key] !== ''
    );
    
    if (fields.length === 0) {
      throw new Error('No valid fields to update');
    }
    
    const setClause = fields.map((field, index) => `${field} = $${index + 2}`).join(', ');
    const values = [id, ...fields.map(field => filteredData[field])];

    const query = `
      UPDATE insurance_cases 
      SET ${setClause}
      WHERE id = $1 
      RETURNING *;
    `;

    const result = await db.query(query, values);
    return result.rows[0];
  }

  static async delete(id) {
    const query = 'DELETE FROM insurance_cases WHERE id = $1 RETURNING *';
    const result = await db.query(query, [id]);
    return result.rows[0];
  }

  // KPI Methods
  static async getTotalCases(dateFilter = {}) {
    let query = 'SELECT COUNT(*) as total FROM insurance_cases WHERE 1=1';
    const values = [];
    let paramCounter = 1;

    if (dateFilter.start_date) {
      query += ` AND date_received >= $${paramCounter}`;
      values.push(dateFilter.start_date);
      paramCounter++;
    }

    if (dateFilter.end_date) {
      query += ` AND date_received <= $${paramCounter}`;
      values.push(dateFilter.end_date);
      paramCounter++;
    }

    const result = await db.query(query, values);
    return parseInt(result.rows[0].total);
  }

  static async getClosedCases(dateFilter = {}) {
    let query = 'SELECT COUNT(*) as total FROM insurance_cases WHERE date_closed IS NOT NULL';
    const values = [];
    let paramCounter = 1;

    if (dateFilter.start_date) {
      query += ` AND date_received >= $${paramCounter}`;
      values.push(dateFilter.start_date);
      paramCounter++;
    }

    if (dateFilter.end_date) {
      query += ` AND date_received <= $${paramCounter}`;
      values.push(dateFilter.end_date);
      paramCounter++;
    }

    const result = await db.query(query, values);
    return parseInt(result.rows[0].total);
  }

  static async getAverageTurnaroundTime(dateFilter = {}) {
    let query = 'SELECT AVG(turn_around_time) as avg_time FROM insurance_cases WHERE turn_around_time IS NOT NULL';
    const values = [];
    let paramCounter = 1;

    if (dateFilter.start_date) {
      query += ` AND date_received >= $${paramCounter}`;
      values.push(dateFilter.start_date);
      paramCounter++;
    }

    if (dateFilter.end_date) {
      query += ` AND date_received <= $${paramCounter}`;
      values.push(dateFilter.end_date);
      paramCounter++;
    }

    const result = await db.query(query, values);
    return parseFloat(result.rows[0].avg_time) || 0;
  }

  static async getPendingCases(dateFilter = {}) {
    let query = 'SELECT COUNT(*) as total FROM insurance_cases WHERE date_closed IS NULL';
    const values = [];
    let paramCounter = 1;

    if (dateFilter.start_date) {
      query += ` AND date_received >= $${paramCounter}`;
      values.push(dateFilter.start_date);
      paramCounter++;
    }

    if (dateFilter.end_date) {
      query += ` AND date_received <= $${paramCounter}`;
      values.push(dateFilter.end_date);
      paramCounter++;
    }

    const result = await db.query(query, values);
    return parseInt(result.rows[0].total);
  }

  static async getCasesByCountry(dateFilter = {}) {
    let query = `
      SELECT country, COUNT(*) as case_count 
      FROM insurance_cases 
      WHERE country IS NOT NULL
    `;
    const values = [];
    let paramCounter = 1;

    if (dateFilter.start_date) {
      query += ` AND date_received >= $${paramCounter}`;
      values.push(dateFilter.start_date);
      paramCounter++;
    }

    if (dateFilter.end_date) {
      query += ` AND date_received <= $${paramCounter}`;
      values.push(dateFilter.end_date);
      paramCounter++;
    }

    query += ' GROUP BY country ORDER BY case_count DESC';

    const result = await db.query(query, values);
    return result.rows;
  }

  static async getFraudCases(dateFilter = {}) {
    let query = 'SELECT COUNT(*) as total FROM insurance_cases WHERE is_fraud = true';
    const values = [];
    let paramCounter = 1;

    if (dateFilter.start_date) {
      query += ` AND date_received >= $${paramCounter}`;
      values.push(dateFilter.start_date);
      paramCounter++;
    }

    if (dateFilter.end_date) {
      query += ` AND date_received <= $${paramCounter}`;
      values.push(dateFilter.end_date);
      paramCounter++;
    }

    const result = await db.query(query, values);
    return parseInt(result.rows[0].total);
  }

  static async getAgentPerformance(dateFilter = {}) {
    let query = `
      SELECT 
        agent_name,
        COUNT(*) as total_cases,
        COUNT(CASE WHEN date_closed IS NOT NULL THEN 1 END) as closed_cases,
        AVG(turn_around_time) as avg_turnaround
      FROM insurance_cases 
      WHERE agent_name IS NOT NULL
    `;
    const values = [];
    let paramCounter = 1;

    if (dateFilter.start_date) {
      query += ` AND date_received >= $${paramCounter}`;
      values.push(dateFilter.start_date);
      paramCounter++;
    }

    if (dateFilter.end_date) {
      query += ` AND date_received <= $${paramCounter}`;
      values.push(dateFilter.end_date);
      paramCounter++;
    }

    query += ' GROUP BY agent_name ORDER BY total_cases DESC';

    const result = await db.query(query, values);
    return result.rows;
  }

  // New methods for improved analytics and revenue tracking
  static async getTotalProcessingFees(dateFilter = {}) {
    let query = 'SELECT COALESCE(SUM(processing_fee), 0) as total FROM insurance_cases WHERE processing_fee IS NOT NULL';
    const values = [];
    let paramCounter = 1;

    if (dateFilter.start_date) {
      query += ` AND date_received >= $${paramCounter}`;
      values.push(dateFilter.start_date);
      paramCounter++;
    }

    if (dateFilter.end_date) {
      query += ` AND date_received <= $${paramCounter}`;
      values.push(dateFilter.end_date);
      paramCounter++;
    }

    const result = await db.query(query, values);
    return parseFloat(result.rows[0].total) || 0;
  }

  static async getTotalAmountPaid(dateFilter = {}) {
    let query = 'SELECT COALESCE(SUM(amount_paid), 0) as total FROM insurance_cases WHERE amount_paid IS NOT NULL';
    const values = [];
    let paramCounter = 1;

    if (dateFilter.start_date) {
      query += ` AND date_received >= $${paramCounter}`;
      values.push(dateFilter.start_date);
      paramCounter++;
    }

    if (dateFilter.end_date) {
      query += ` AND date_received <= $${paramCounter}`;
      values.push(dateFilter.end_date);
      paramCounter++;
    }

    const result = await db.query(query, values);
    return parseFloat(result.rows[0].total) || 0;
  }

  static async getStatusBreakdown(dateFilter = {}) {
    let query = `
      SELECT 
        case_status,
        COUNT(*) as count
      FROM insurance_cases 
      WHERE case_status IS NOT NULL
    `;
    const values = [];
    let paramCounter = 1;

    if (dateFilter.start_date) {
      query += ` AND date_received >= $${paramCounter}`;
      values.push(dateFilter.start_date);
      paramCounter++;
    }

    if (dateFilter.end_date) {
      query += ` AND date_received <= $${paramCounter}`;
      values.push(dateFilter.end_date);
      paramCounter++;
    }

    query += ' GROUP BY case_status ORDER BY count DESC';

    const result = await db.query(query, values);
    return result.rows;
  }

  // New KPI Methods
  static async getCasesByType(dateFilter = {}) {
    let query = `
      SELECT 
        case_type,
        COUNT(*) as case_count
      FROM insurance_cases 
      WHERE case_type IS NOT NULL
    `;
    const values = [];
    let paramCounter = 1;

    if (dateFilter.start_date) {
      query += ` AND date_received >= $${paramCounter}`;
      values.push(dateFilter.start_date);
      paramCounter++;
    }

    if (dateFilter.end_date) {
      query += ` AND date_received <= $${paramCounter}`;
      values.push(dateFilter.end_date);
      paramCounter++;
    }

    query += ' GROUP BY case_type ORDER BY case_count DESC';

    const result = await db.query(query, values);
    return result.rows;
  }

  static async getOnTimeCases(dateFilter = {}) {
    let query = `
      SELECT COUNT(*) as count
      FROM insurance_cases 
      WHERE case_status = 'Closed on time'
    `;
    const values = [];
    let paramCounter = 1;

    if (dateFilter.start_date) {
      query += ` AND date_received >= $${paramCounter}`;
      values.push(dateFilter.start_date);
      paramCounter++;
    }

    if (dateFilter.end_date) {
      query += ` AND date_received <= $${paramCounter}`;
      values.push(dateFilter.end_date);
      paramCounter++;
    }

    const result = await db.query(query, values);
    return parseInt(result.rows[0].count) || 0;
  }

  static async getFraudCasesByType(dateFilter = {}) {
    let query = `
      SELECT 
        fraud_type,
        COUNT(*) as fraud_count
      FROM insurance_cases 
      WHERE is_fraud = true AND fraud_type IS NOT NULL
    `;
    const values = [];
    let paramCounter = 1;

    if (dateFilter.start_date) {
      query += ` AND date_received >= $${paramCounter}`;
      values.push(dateFilter.start_date);
      paramCounter++;
    }

    if (dateFilter.end_date) {
      query += ` AND date_received <= $${paramCounter}`;
      values.push(dateFilter.end_date);
      paramCounter++;
    }

    query += ' GROUP BY fraud_type ORDER BY fraud_count DESC';

    const result = await db.query(query, values);
    return result.rows;
  }

  static async getFraudCasesBySource(dateFilter = {}) {
    let query = `
      SELECT 
        fraud_source,
        COUNT(*) as fraud_count
      FROM insurance_cases 
      WHERE is_fraud = true AND fraud_source IS NOT NULL
    `;
    const values = [];
    let paramCounter = 1;

    if (dateFilter.start_date) {
      query += ` AND date_received >= $${paramCounter}`;
      values.push(dateFilter.start_date);
      paramCounter++;
    }

    if (dateFilter.end_date) {
      query += ` AND date_received <= $${paramCounter}`;
      values.push(dateFilter.end_date);
      paramCounter++;
    }

    query += ' GROUP BY fraud_source ORDER BY fraud_count DESC';

    const result = await db.query(query, values);
    return result.rows;
  }

  static async getFraudRateByInsuranceCompany(dateFilter = {}) {
    let query = `
      SELECT 
        insurance_company,
        COUNT(*) as total_cases,
        COUNT(CASE WHEN is_fraud = true THEN 1 END) as fraud_cases,
        CASE 
          WHEN COUNT(*) > 0 THEN 
            ROUND((COUNT(CASE WHEN is_fraud = true THEN 1 END)::DECIMAL / COUNT(*)) * 100, 2)
          ELSE 0 
        END as fraud_rate
      FROM insurance_cases 
      WHERE insurance_company IS NOT NULL
    `;
    const values = [];
    let paramCounter = 1;

    if (dateFilter.start_date) {
      query += ` AND date_received >= $${paramCounter}`;
      values.push(dateFilter.start_date);
      paramCounter++;
    }

    if (dateFilter.end_date) {
      query += ` AND date_received <= $${paramCounter}`;
      values.push(dateFilter.end_date);
      paramCounter++;
    }

    query += ' GROUP BY insurance_company ORDER BY fraud_rate DESC';

    const result = await db.query(query, values);
    return result.rows;
  }

  static async getCountryRiskAssessment(dateFilter = {}) {
    let query = `
      SELECT 
        country,
        COUNT(*) as total_cases,
        COUNT(CASE WHEN is_fraud = true THEN 1 END) as fraud_cases,
        CASE 
          WHEN COUNT(*) > 0 THEN 
            ROUND((COUNT(CASE WHEN is_fraud = true THEN 1 END)::DECIMAL / COUNT(*)) * 100, 2)
          ELSE 0 
        END as fraud_rate,
        ROUND(AVG(turn_around_time), 2) as avg_turnaround
      FROM insurance_cases 
      WHERE country IS NOT NULL
    `;
    const values = [];
    let paramCounter = 1;

    if (dateFilter.start_date) {
      query += ` AND date_received >= $${paramCounter}`;
      values.push(dateFilter.start_date);
      paramCounter++;
    }

    if (dateFilter.end_date) {
      query += ` AND date_received <= $${paramCounter}`;
      values.push(dateFilter.end_date);
      paramCounter++;
    }

    query += ' GROUP BY country ORDER BY total_cases DESC';

    const result = await db.query(query, values);
    return result.rows;
  }
}

module.exports = InsuranceCaseModel;
