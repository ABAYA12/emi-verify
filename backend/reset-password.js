const bcrypt = require('bcryptjs');
const { Pool } = require('pg');
require('dotenv').config();

// Database connection
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'emi_verify',
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

async function resetPassword(email, newPassword) {
  try {
    console.log('🔧 Resetting password for:', email);
    
    const client = await pool.connect();
    
    // Hash the new password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    
    // Update the password
    const result = await client.query(
      'UPDATE users SET password = $1, updated_at = NOW() WHERE LOWER(email) = LOWER($2) RETURNING id, email',
      [hashedPassword, email]
    );
    
    if (result.rows.length > 0) {
      console.log('✅ Password updated successfully for user:', result.rows[0]);
      console.log(`✅ New password: "${newPassword}"`);
    } else {
      console.log('❌ User not found');
    }
    
    client.release();
    
  } catch (error) {
    console.error('💥 Error:', error.message);
  }
  
  process.exit(0);
}

// Reset password to a known value
resetPassword('emiverify@insightgridanalytic.com', 'emi12345');
