const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

/**
 * Database Migration Script for Users Table
 * This script creates the users table and related database objects
 */

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'emi_verify',
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

async function runMigration() {
  const client = await pool.connect();
  
  try {
    console.log('🚀 Starting users table migration...');
    
    // Execute the migration step by step
    await client.query('BEGIN');
    
    // Enable UUID extension
    await client.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
    console.log('✅ UUID extension enabled');
    
    // Create users table
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS users (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          username VARCHAR(30) UNIQUE NOT NULL CHECK (
              username ~ '^[a-zA-Z0-9_-]+$' AND 
              LENGTH(username) >= 3 AND 
              LENGTH(username) <= 30
          ),
          password VARCHAR(255) NOT NULL CHECK (LENGTH(password) >= 6),
          refresh_token TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;
    await client.query(createTableSQL);
    console.log('✅ Users table created');
    
    // Create indexes
    await client.query('CREATE INDEX IF NOT EXISTS idx_users_username ON users(username)');
    console.log('✅ Username index created');
    
    await client.query('CREATE INDEX IF NOT EXISTS idx_users_refresh_token ON users(refresh_token) WHERE refresh_token IS NOT NULL');
    console.log('✅ Refresh token index created');
    
    // Create update trigger function
    const triggerFunctionSQL = `
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = CURRENT_TIMESTAMP;
          RETURN NEW;
      END;
      $$ language 'plpgsql'
    `;
    await client.query(triggerFunctionSQL);
    console.log('✅ Update trigger function created');
    
    // Create trigger
    const triggerSQL = `
      DROP TRIGGER IF EXISTS update_users_updated_at ON users;
      CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()
    `;
    await client.query(triggerSQL);
    console.log('✅ Update trigger created');
    
    await client.query('COMMIT');
    
    console.log('✅ Users table migration completed successfully!');
    console.log('📋 Summary:');
    console.log('   - Created users table with UUID primary key');
    console.log('   - Added username uniqueness constraint');
    console.log('   - Added password length validation');
    console.log('   - Created indexes for performance');
    console.log('   - Added automatic timestamp updates');
    
    // Verify the table was created
    const tableCheck = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'users' AND table_schema = 'public'
      ORDER BY ordinal_position
    `);
    
    console.log('\n📊 Users table structure:');
    tableCheck.rows.forEach(row => {
      console.log(`   ${row.column_name}: ${row.data_type} ${row.is_nullable === 'NO' ? '(NOT NULL)' : '(NULLABLE)'}`);
    });
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Migration failed:', error.message);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run migration if this file is executed directly
if (require.main === module) {
  runMigration()
    .then(() => {
      console.log('\n🎉 Migration completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Migration failed:', error);
      process.exit(1);
    });
}

module.exports = { runMigration };
