const db = require('../config/database');

const setupDatabase = async () => {
  try {
    console.log('Setting up EMI Verify database...');

    // Create Insurance Cases table
    await db.query(`
      CREATE TABLE IF NOT EXISTS insurance_cases (
        id SERIAL PRIMARY KEY,
        agent_name VARCHAR(255),
        insured_name VARCHAR(255),
        country VARCHAR(100),
        date_received DATE,
        date_closed DATE,
        turn_around_time INTEGER, -- in days
        case_status VARCHAR(50),
        policy_number VARCHAR(100),
        case_type VARCHAR(100),
        insurance_company VARCHAR(255),
        is_fraud BOOLEAN DEFAULT FALSE,
        fraud_type VARCHAR(100),
        comment TEXT,
        fraud_source VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create Document Verification table
    await db.query(`
      CREATE TABLE IF NOT EXISTS document_verifications (
        id SERIAL PRIMARY KEY,
        agent_name VARCHAR(255),
        ars_number VARCHAR(100),
        check_id VARCHAR(100),
        applicant_name VARCHAR(255),
        document_type VARCHAR(100),
        country VARCHAR(100),
        region_town VARCHAR(255),
        date_received DATE,
        date_closed DATE,
        turn_around_time INTEGER, -- in days
        turn_around_status VARCHAR(50),
        processing_fee DECIMAL(10,2),
        agent_amount_paid DECIMAL(10,2),
        total DECIMAL(10,2),
        payment_status VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create indexes for better performance
    await db.query(`
      CREATE INDEX IF NOT EXISTS idx_insurance_cases_agent ON insurance_cases(agent_name);
      CREATE INDEX IF NOT EXISTS idx_insurance_cases_country ON insurance_cases(country);
      CREATE INDEX IF NOT EXISTS idx_insurance_cases_date_received ON insurance_cases(date_received);
      CREATE INDEX IF NOT EXISTS idx_insurance_cases_status ON insurance_cases(case_status);
      CREATE INDEX IF NOT EXISTS idx_insurance_cases_fraud ON insurance_cases(is_fraud);
    `);

    await db.query(`
      CREATE INDEX IF NOT EXISTS idx_doc_verifications_agent ON document_verifications(agent_name);
      CREATE INDEX IF NOT EXISTS idx_doc_verifications_country ON document_verifications(country);
      CREATE INDEX IF NOT EXISTS idx_doc_verifications_date_received ON document_verifications(date_received);
      CREATE INDEX IF NOT EXISTS idx_doc_verifications_status ON document_verifications(turn_around_status);
      CREATE INDEX IF NOT EXISTS idx_doc_verifications_payment ON document_verifications(payment_status);
    `);

    // Create trigger to update updated_at timestamp
    await db.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$ language 'plpgsql';
    `);

    await db.query(`
      DROP TRIGGER IF EXISTS update_insurance_cases_updated_at ON insurance_cases;
      CREATE TRIGGER update_insurance_cases_updated_at
        BEFORE UPDATE ON insurance_cases
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    `);

    await db.query(`
      DROP TRIGGER IF EXISTS update_document_verifications_updated_at ON document_verifications;
      CREATE TRIGGER update_document_verifications_updated_at
        BEFORE UPDATE ON document_verifications
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    `);

    console.log('Database setup completed successfully!');
    console.log('Tables created:');
    console.log('- insurance_cases');
    console.log('- document_verifications');
    console.log('Indexes and triggers created for optimal performance.');

    process.exit(0);
  } catch (error) {
    console.error('Error setting up database:', error);
    process.exit(1);
  }
};

setupDatabase();
