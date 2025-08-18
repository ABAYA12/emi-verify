const bcrypt = require('bcryptjs');
const db = require('../config/database');

class User {
  /**
   * Create a new user with email verification
   */
  static async createWithEmail({ fullName, email, password }) {
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('Invalid email format');
    }

    // Check if user already exists
    const existingUser = await this.findByEmail(email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Insert user into database
    const query = `
      INSERT INTO users (full_name, email, password, verified, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, full_name, email, verified, created_at
    `;
    
    const now = new Date();
    const values = [fullName, email.toLowerCase(), hashedPassword, false, now, now];
    
    try {
      const client = await db.pool.connect();
      try {
        const result = await client.query(query, values);
        return result.rows[0];
      } finally {
        client.release();
      }
    } catch (error) {
      if (error.code === '23505') { // Unique violation
        throw new Error('User with this email already exists');
      }
      throw new Error('Failed to create user: ' + error.message);
    }
  }

  /**
   * Find user by email
   */
  static async findByEmail(email) {
    const query = 'SELECT * FROM users WHERE LOWER(email) = LOWER($1)';
    
    try {
      const client = await db.pool.connect();
      try {
        const result = await client.query(query, [email.trim()]);
        return result.rows[0] || null;
      } finally {
        client.release();
      }
    } catch (error) {
      throw new Error('Failed to find user: ' + error.message);
    }
  }

  /**
   * Find user by ID
   */
  static async findById(id) {
    const query = 'SELECT * FROM users WHERE id = $1';
    
    try {
      const client = await db.pool.connect();
      try {
        const result = await client.query(query, [id]);
        return result.rows[0] || null;
      } finally {
        client.release();
      }
    } catch (error) {
      throw new Error('Failed to find user: ' + error.message);
    }
  }

  /**
   * Verify password
   */
  static async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  /**
   * Create verification code
   */
  static async createVerificationCode(email) {
    const code = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit code
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes from now
    
    const query = `
      INSERT INTO verification_codes (email, code, expires_at, created_at)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (email) 
      DO UPDATE SET 
        code = EXCLUDED.code,
        expires_at = EXCLUDED.expires_at,
        created_at = EXCLUDED.created_at,
        used = false
      RETURNING *
    `;
    
    try {
      const client = await db.pool.connect();
      try {
        const result = await client.query(query, [email.toLowerCase(), code, expiresAt, new Date()]);
        return result.rows[0];
      } finally {
        client.release();
      }
    } catch (error) {
      throw new Error('Failed to create verification code: ' + error.message);
    }
  }

  /**
   * Verify email with code
   */
  static async verifyCode(email, code) {
    const client = await db.pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Check verification code
      const codeQuery = `
        SELECT * FROM verification_codes 
        WHERE email = $1 AND code = $2 AND expires_at > NOW() AND used = false
      `;
      const codeResult = await client.query(codeQuery, [email.toLowerCase(), code]);
      
      if (codeResult.rows.length === 0) {
        throw new Error('Invalid or expired verification code');
      }
      
      // Mark code as used
      const markUsedQuery = `
        UPDATE verification_codes 
        SET used = true 
        WHERE email = $1 AND code = $2
      `;
      await client.query(markUsedQuery, [email.toLowerCase(), code]);
      
      // Update user verification status
      const updateUserQuery = `
        UPDATE users 
        SET verified = true, updated_at = NOW() 
        WHERE email = $1
        RETURNING id, full_name, email, verified, created_at
      `;
      const userResult = await client.query(updateUserQuery, [email.toLowerCase()]);
      
      if (userResult.rows.length === 0) {
        throw new Error('User not found');
      }
      
      await client.query('COMMIT');
      return userResult.rows[0];
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Create password reset token
   */
  static async createPasswordResetToken(email) {
    const user = await this.findByEmail(email);
    if (!user) {
      throw new Error('User not found');
    }

    // Generate reset token
    const token = require('crypto').randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes from now
    
    const query = `
      INSERT INTO password_resets (email, token, expires_at, created_at)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (email) 
      DO UPDATE SET 
        token = EXCLUDED.token,
        expires_at = EXCLUDED.expires_at,
        created_at = EXCLUDED.created_at,
        used = false
      RETURNING *
    `;
    
    try {
      const client = await db.pool.connect();
      try {
        const result = await client.query(query, [email.toLowerCase(), token, expiresAt, new Date()]);
        return result.rows[0];
      } finally {
        client.release();
      }
    } catch (error) {
      throw new Error('Failed to create password reset token: ' + error.message);
    }
  }

  /**
   * Reset password with token
   */
  static async resetPasswordWithToken(token, newPassword) {
    const client = await db.pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Check reset token
      const tokenQuery = `
        SELECT * FROM password_resets 
        WHERE token = $1 AND expires_at > NOW() AND used = false
      `;
      const tokenResult = await client.query(tokenQuery, [token]);
      
      if (tokenResult.rows.length === 0) {
        throw new Error('Invalid or expired reset token');
      }
      
      const resetRecord = tokenResult.rows[0];
      
      // Hash new password
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
      
      // Update user password
      const updateUserQuery = `
        UPDATE users 
        SET password = $1, updated_at = NOW() 
        WHERE email = $2
        RETURNING id, full_name, email, verified, created_at
      `;
      const userResult = await client.query(updateUserQuery, [hashedPassword, resetRecord.email]);
      
      if (userResult.rows.length === 0) {
        throw new Error('User not found');
      }
      
      // Mark token as used
      const markUsedQuery = `
        UPDATE password_resets 
        SET used = true 
        WHERE token = $1
      `;
      await client.query(markUsedQuery, [token]);
      
      await client.query('COMMIT');
      return userResult.rows[0];
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Update user profile
   */
  static async updateProfile(userId, { fullName }) {
    const query = `
      UPDATE users 
      SET full_name = $1, updated_at = NOW() 
      WHERE id = $2
      RETURNING id, full_name, email, verified, created_at
    `;
    
    try {
      const client = await db.pool.connect();
      try {
        const result = await client.query(query, [fullName, userId]);
        if (result.rows.length === 0) {
          throw new Error('User not found');
        }
        return result.rows[0];
      } finally {
        client.release();
      }
    } catch (error) {
      throw new Error('Failed to update profile: ' + error.message);
    }
  }
}

module.exports = User;
