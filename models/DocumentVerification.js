const db = require('../config/database');

class DocumentVerificationModel {
  static async create(verificationData) {
    const {
      agent_name, ars_number, check_id, applicant_name, document_type,
      country, region_town, date_received, date_closed, turn_around_time,
      turn_around_status, processing_fee, agent_amount_paid, total, payment_status
    } = verificationData;

    const query = `
      INSERT INTO document_verifications (
        agent_name, ars_number, check_id, applicant_name, document_type,
        country, region_town, date_received, date_closed, turn_around_time,
        turn_around_status, processing_fee, agent_amount_paid, total, payment_status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING *;
    `;

    const values = [
      agent_name || null, ars_number || null, check_id || null,
      applicant_name || null, document_type || null, country || null,
      region_town || null, date_received || null, date_closed || null,
      turn_around_time || null, turn_around_status || null,
      processing_fee || null, agent_amount_paid || null, total || null,
      payment_status || null
    ];

    const result = await db.query(query, values);
    return result.rows[0];
  }

  static async getAll(filters = {}) {
    let query = 'SELECT * FROM document_verifications WHERE 1=1';
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

    if (filters.document_type) {
      query += ` AND document_type ILIKE $${paramCounter}`;
      values.push(`%${filters.document_type}%`);
      paramCounter++;
    }

    if (filters.payment_status) {
      query += ` AND payment_status = $${paramCounter}`;
      values.push(filters.payment_status);
      paramCounter++;
    }

    query += ' ORDER BY created_at DESC';

    const result = await db.query(query, values);
    return result.rows;
  }

  static async getById(id) {
    const query = 'SELECT * FROM document_verifications WHERE id = $1';
    const result = await db.query(query, [id]);
    return result.rows[0];
  }

  static async update(id, updateData) {
    const fields = Object.keys(updateData).filter(key => updateData[key] !== undefined);
    const setClause = fields.map((field, index) => `${field} = $${index + 2}`).join(', ');
    const values = [id, ...fields.map(field => updateData[field])];

    const query = `
      UPDATE document_verifications 
      SET ${setClause}
      WHERE id = $1 
      RETURNING *;
    `;

    const result = await db.query(query, values);
    return result.rows[0];
  }

  static async delete(id) {
    const query = 'DELETE FROM document_verifications WHERE id = $1 RETURNING *';
    const result = await db.query(query, [id]);
    return result.rows[0];
  }

  // KPI Methods
  static async getTotalVerifications(dateFilter = {}) {
    let query = 'SELECT COUNT(*) as total FROM document_verifications WHERE 1=1';
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

  static async getCompletedVerifications(dateFilter = {}) {
    let query = 'SELECT COUNT(*) as total FROM document_verifications WHERE date_closed IS NOT NULL';
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
    let query = 'SELECT AVG(turn_around_time) as avg_time FROM document_verifications WHERE turn_around_time IS NOT NULL';
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

  static async getPendingVerifications(dateFilter = {}) {
    let query = 'SELECT COUNT(*) as total FROM document_verifications WHERE date_closed IS NULL';
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

  static async getVerificationsByDocumentType(dateFilter = {}) {
    let query = `
      SELECT document_type, COUNT(*) as verification_count 
      FROM document_verifications 
      WHERE document_type IS NOT NULL
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

    query += ' GROUP BY document_type ORDER BY verification_count DESC';

    const result = await db.query(query, values);
    return result.rows;
  }

  static async getVerificationsByCountry(dateFilter = {}) {
    let query = `
      SELECT country, COUNT(*) as verification_count 
      FROM document_verifications 
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

    query += ' GROUP BY country ORDER BY verification_count DESC';

    const result = await db.query(query, values);
    return result.rows;
  }

  static async getTotalProcessingFees(dateFilter = {}) {
    let query = 'SELECT COALESCE(SUM(processing_fee), 0) as total FROM document_verifications WHERE processing_fee IS NOT NULL';
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

  static async getTotalAgentPayments(dateFilter = {}) {
    let query = 'SELECT COALESCE(SUM(agent_amount_paid), 0) as total FROM document_verifications WHERE agent_amount_paid IS NOT NULL';
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

  static async getOutstandingPayments(dateFilter = {}) {
    let query = `
      SELECT COUNT(*) as count, COALESCE(SUM(total), 0) as amount 
      FROM document_verifications 
      WHERE payment_status != 'PAID' AND payment_status IS NOT NULL AND total IS NOT NULL
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
    return {
      count: parseInt(result.rows[0].count),
      amount: parseFloat(result.rows[0].amount) || 0
    };
  }

  static async getAgentPerformance(dateFilter = {}) {
    let query = `
      SELECT 
        agent_name,
        COUNT(*) as total_verifications,
        COUNT(CASE WHEN date_closed IS NOT NULL THEN 1 END) as completed_verifications,
        AVG(turn_around_time) as avg_turnaround,
        ROUND(
          COUNT(CASE WHEN date_closed IS NOT NULL THEN 1 END) * 100.0 / COUNT(*), 2
        ) as completion_rate
      FROM document_verifications 
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

    query += ' GROUP BY agent_name ORDER BY total_verifications DESC';

    const result = await db.query(query, values);
    return result.rows;
  }
}

module.exports = DocumentVerificationModel;
