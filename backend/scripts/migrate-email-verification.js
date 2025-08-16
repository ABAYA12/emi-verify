const db = require('../config/database');

const migrateEmailVerification = async () => {
  const client = await db.getClient();
  
  try {
    await client.query('BEGIN');
    console.log('🔄 Starting email verification migration...');

    // Update users table to include email verification fields
    const alterUsersSQL = `
      -- Add new columns to users table
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS full_name VARCHAR(255),
      ADD COLUMN IF NOT EXISTS email VARCHAR(255) UNIQUE,
      ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255),
      ADD COLUMN IF NOT EXISTS verified BOOLEAN DEFAULT FALSE;
      
      -- Update existing users to have verified = true for backward compatibility
      UPDATE users SET verified = TRUE WHERE verified IS NULL;
      
      -- Create indexes for email
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_users_verified ON users(verified);
    `;
    await client.query(alterUsersSQL);
    console.log('✅ Users table updated with email verification fields');

    // Create verification_codes table
    const createVerificationCodesSQL = `
      CREATE TABLE IF NOT EXISTS verification_codes (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) NOT NULL,
        code VARCHAR(6) NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        used BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE INDEX IF NOT EXISTS idx_verification_codes_email ON verification_codes(email);
      CREATE INDEX IF NOT EXISTS idx_verification_codes_expires_at ON verification_codes(expires_at);
    `;
    await client.query(createVerificationCodesSQL);
    console.log('✅ Verification codes table created');

    // Create password_resets table
    const createPasswordResetsSQL = `
      CREATE TABLE IF NOT EXISTS password_resets (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) NOT NULL,
        token VARCHAR(255) NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        used BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE INDEX IF NOT EXISTS idx_password_resets_email ON password_resets(email);
      CREATE INDEX IF NOT EXISTS idx_password_resets_token ON password_resets(token);
      CREATE INDEX IF NOT EXISTS idx_password_resets_expires_at ON password_resets(expires_at);
    `;
    await client.query(createPasswordResetsSQL);
    console.log('✅ Password resets table created');

    // Create cleanup function for expired codes and tokens
    const createCleanupFunctionSQL = `
      CREATE OR REPLACE FUNCTION cleanup_expired_tokens()
      RETURNS void AS $$
      BEGIN
        DELETE FROM verification_codes WHERE expires_at < NOW();
        DELETE FROM password_resets WHERE expires_at < NOW() OR used = TRUE;
      END;
      $$ LANGUAGE plpgsql;
    `;
    await client.query(createCleanupFunctionSQL);
    console.log('✅ Cleanup function created');

    await client.query('COMMIT');
    console.log('🎉 Email verification migration completed successfully!');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    client.release();
  }
};

// Run migration if this file is executed directly
if (require.main === module) {
  migrateEmailVerification()
    .then(() => {
      console.log('Migration completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}

module.exports = migrateEmailVerification;
