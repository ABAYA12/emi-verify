const db = require('../config/database');

class InsuranceCaseModel {
  static async create(caseData) {
    const {
      agent_name, insured_name, country, date_received, date_closed,
      turn_around_time, case_status, policy_number, case_type,
      insurance_company, is_fraud, fraud_type, comment, fraud_source
    } = caseData;

    const query = `
      INSERT INTO insurance_cases (
        agent_name, insured_name, country, date_received, date_closed,
        turn_around_time, case_status, policy_number, case_type,
        insurance_company, is_fraud, fraud_type, comment, fraud_source
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING *;
    `;

    const values = [
      agent_name || null, insured_name || null, country || null,
      date_received || null, date_closed || null, turn_around_time || null,
      case_status || null, policy_number || null, case_type || null,
      insurance_company || null, is_fraud || false, fraud_type || null,
      comment || null, fraud_source || null
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
    const fields = Object.keys(updateData).filter(key => updateData[key] !== undefined);
    const setClause = fields.map((field, index) => `${field} = $${index + 2}`).join(', ');
    const values = [id, ...fields.map(field => updateData[field])];

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
}

module.exports = InsuranceCaseModel;
