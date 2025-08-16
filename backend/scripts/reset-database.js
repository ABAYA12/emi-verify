const db = require('../config/database');

const resetDatabase = async () => {
  const client = await db.pool.connect();
  
  try {
    console.log('🗑️  Dropping all existing tables...');
    
    // Drop tables in correct order (considering foreign key constraints)
    const dropQueries = [
      'DROP TABLE IF EXISTS verification_codes CASCADE',
      'DROP TABLE IF EXISTS password_resets CASCADE', 
      'DROP TABLE IF EXISTS document_verifications CASCADE',
      'DROP TABLE IF EXISTS insurance_cases CASCADE',
      'DROP TABLE IF EXISTS users CASCADE'
    ];
    
    for (const query of dropQueries) {
      await client.query(query);
      console.log(`✅ Executed: ${query}`);
    }
    
    console.log('\n🔧 Creating fresh tables...');
    
    // Create users table
    const createUsersTable = `
      CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        full_name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        verified BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    await client.query(createUsersTable);
    console.log('✅ Created users table');
    
    // Create verification_codes table
    const createVerificationCodesTable = `
      CREATE TABLE verification_codes (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) NOT NULL,
        code VARCHAR(6) NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        used BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(email)
      )
    `;
    await client.query(createVerificationCodesTable);
    console.log('✅ Created verification_codes table');
    
    // Create password_resets table
    const createPasswordResetsTable = `
      CREATE TABLE password_resets (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) NOT NULL,
        token VARCHAR(255) NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        used BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(email)
      )
    `;
    await client.query(createPasswordResetsTable);
    console.log('✅ Created password_resets table');
    
    // Create insurance_cases table
    const createInsuranceCasesTable = `
      CREATE TABLE insurance_cases (
        id SERIAL PRIMARY KEY,
        case_number VARCHAR(50) UNIQUE NOT NULL,
        policy_holder_name VARCHAR(255) NOT NULL,
        policy_number VARCHAR(100),
        claim_amount DECIMAL(12,2),
        date_of_incident DATE,
        incident_description TEXT,
        status VARCHAR(50) DEFAULT 'Under Review',
        assigned_adjuster VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        user_id INTEGER REFERENCES users(id) ON DELETE SET NULL
      )
    `;
    await client.query(createInsuranceCasesTable);
    console.log('✅ Created insurance_cases table');
    
    // Create document_verifications table
    const createDocumentVerificationsTable = `
      CREATE TABLE document_verifications (
        id SERIAL PRIMARY KEY,
        document_type VARCHAR(100) NOT NULL,
        document_number VARCHAR(100),
        applicant_name VARCHAR(255) NOT NULL,
        date_of_birth DATE,
        verification_status VARCHAR(50) DEFAULT 'Pending',
        verified_date TIMESTAMP,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        insurance_case_id INTEGER REFERENCES insurance_cases(id) ON DELETE SET NULL
      )
    `;
    await client.query(createDocumentVerificationsTable);
    console.log('✅ Created document_verifications table');
    
    // Create indexes for better performance
    const createIndexes = [
      'CREATE INDEX idx_users_email ON users(email)',
      'CREATE INDEX idx_verification_codes_email ON verification_codes(email)',
      'CREATE INDEX idx_verification_codes_expires ON verification_codes(expires_at)',
      'CREATE INDEX idx_password_resets_email ON password_resets(email)',
      'CREATE INDEX idx_password_resets_token ON password_resets(token)',
      'CREATE INDEX idx_password_resets_expires ON password_resets(expires_at)',
      'CREATE INDEX idx_insurance_cases_status ON insurance_cases(status)',
      'CREATE INDEX idx_insurance_cases_case_number ON insurance_cases(case_number)',
      'CREATE INDEX idx_document_verifications_status ON document_verifications(verification_status)'
    ];
    
    for (const indexQuery of createIndexes) {
      await client.query(indexQuery);
      console.log(`✅ Created index: ${indexQuery.split(' ')[2]}`);
    }
    
    console.log('\n🎉 Database reset completed successfully!');
    console.log('\n📊 Created tables:');
    console.log('   • users (authentication & profile data)');
    console.log('   • verification_codes (email verification)');
    console.log('   • password_resets (password reset tokens)');
    console.log('   • insurance_cases (insurance case management)');
    console.log('   • document_verifications (document verification records)');
    console.log('\n🔑 Ready for email verification workflow!');
    
  } catch (error) {
    console.error('❌ Error resetting database:', error);
    throw error;
  } finally {
    client.release();
  }
};

// Run the reset
if (require.main === module) {
  resetDatabase()
    .then(() => {
      console.log('\n✅ Database reset script completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Database reset script failed:', error);
      process.exit(1);
    });
}

module.exports = resetDatabase;
