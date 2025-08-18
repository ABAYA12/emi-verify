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

async function debugLogin(email, password) {
  try {
    console.log('🔍 Debugging login for:', email);
    
    // Connect to database
    const client = await pool.connect();
    console.log('✅ Database connected');
    
    // Find user (try both original and lowercase)
    const queries = [
      'SELECT * FROM users WHERE email = $1',
      'SELECT * FROM users WHERE LOWER(email) = LOWER($1)'
    ];
    
    let user = null;
    for (const query of queries) {
      const result = await client.query(query, [email]);
      if (result.rows.length > 0) {
        user = result.rows[0];
        console.log('✅ User found with query:', query);
        break;
      }
    }
    
    if (!user) {
      console.log('❌ User not found');
      client.release();
      return;
    }
    
    console.log('📊 User details:', {
      id: user.id,
      email: user.email,
      verified: user.verified,
      created_at: user.created_at,
      password_hash_length: user.password?.length,
      password_starts_with: user.password?.substring(0, 7)
    });
    
    // Check verification status
    if (!user.verified) {
      console.log('❌ User email not verified');
      client.release();
      return;
    }
    
    // Test password verification
    console.log('🔐 Testing password...');
    const isValid = await bcrypt.compare(password, user.password);
    console.log('🔐 Password valid:', isValid);
    
    if (isValid) {
      console.log('✅ LOGIN SUCCESSFUL!');
    } else {
      console.log('❌ LOGIN FAILED - Invalid password');
      
      // Test common passwords
      const commonPasswords = ['password', 'admin', 'emi12345', 'password123', 'emiverify123'];
      console.log('🔍 Testing common passwords...');
      
      for (const testPwd of commonPasswords) {
        const testValid = await bcrypt.compare(testPwd, user.password);
        if (testValid) {
          console.log(`✅ Found working password: "${testPwd}"`);
          break;
        }
      }
    }
    
    client.release();
    
  } catch (error) {
    console.error('💥 Error:', error.message);
  }
  
  process.exit(0);
}

// Test with the user's email
debugLogin('emiverify@insightgridanalytic.com', 'emi12345');
