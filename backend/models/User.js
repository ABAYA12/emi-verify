const db = require('../config/database');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

class User {
  constructor(userData) {
    this.id = userData.id;
    this.username = userData.username;
    this.password = userData.password;
    this.refresh_token = userData.refresh_token;
    this.created_at = userData.created_at;
    this.updated_at = userData.updated_at;
  }

  // Create a new user
  static async create({ username, password }) {
    try {
      // Validate input
      if (!username || !password) {
        throw new Error('Username and password are required');
      }

      // Validate username format
      if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
        throw new Error('Username can only contain letters, numbers, underscores, and hyphens');
      }

      if (username.length < 3 || username.length > 30) {
        throw new Error('Username must be between 3 and 30 characters');
      }

      // Validate password length
      if (password.length < 6) {
        throw new Error('Password must be at least 6 characters long');
      }

      // Check if username already exists
      const existingUser = await this.findByUsername(username);
      if (existingUser) {
        throw new Error('Username already exists');
      }

      // Hash password
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Insert user into database
      const userId = uuidv4();
      const query = `
        INSERT INTO users (id, username, password)
        VALUES ($1, $2, $3)
        RETURNING id, username, created_at, updated_at
      `;
      
      const result = await db.query(query, [userId, username, hashedPassword]);
      return new User(result.rows[0]);
    } catch (error) {
      throw error;
    }
  }

  // Find user by username
  static async findByUsername(username) {
    try {
      const query = 'SELECT * FROM users WHERE username = $1';
      const result = await db.query(query, [username]);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      return new User(result.rows[0]);
    } catch (error) {
      throw error;
    }
  }

  // Find user by ID
  static async findById(id) {
    try {
      const query = 'SELECT * FROM users WHERE id = $1';
      const result = await db.query(query, [id]);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      return new User(result.rows[0]);
    } catch (error) {
      throw error;
    }
  }

  // Find user by refresh token
  static async findByRefreshToken(refreshToken) {
    try {
      const query = 'SELECT * FROM users WHERE refresh_token = $1';
      const result = await db.query(query, [refreshToken]);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      return new User(result.rows[0]);
    } catch (error) {
      throw error;
    }
  }

  // Verify password
  async verifyPassword(password) {
    try {
      return await bcrypt.compare(password, this.password);
    } catch (error) {
      throw error;
    }
  }

  // Update password
  async updatePassword(newPassword) {
    try {
      // Validate password length
      if (newPassword.length < 6) {
        throw new Error('Password must be at least 6 characters long');
      }

      // Hash new password
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

      // Update in database
      const query = `
        UPDATE users 
        SET password = $1, updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
        RETURNING id, username, updated_at
      `;
      
      const result = await db.query(query, [hashedPassword, this.id]);
      
      if (result.rows.length === 0) {
        throw new Error('User not found');
      }

      // Update instance
      this.password = hashedPassword;
      this.updated_at = result.rows[0].updated_at;

      return true;
    } catch (error) {
      throw error;
    }
  }

  // Update refresh token
  async updateRefreshToken(refreshToken) {
    try {
      const query = `
        UPDATE users 
        SET refresh_token = $1, updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
        RETURNING updated_at
      `;
      
      const result = await db.query(query, [refreshToken, this.id]);
      
      if (result.rows.length === 0) {
        throw new Error('User not found');
      }

      // Update instance
      this.refresh_token = refreshToken;
      this.updated_at = result.rows[0].updated_at;

      return true;
    } catch (error) {
      throw error;
    }
  }

  // Remove refresh token (logout)
  async removeRefreshToken() {
    try {
      const query = `
        UPDATE users 
        SET refresh_token = NULL, updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
        RETURNING updated_at
      `;
      
      const result = await db.query(query, [this.id]);
      
      if (result.rows.length === 0) {
        throw new Error('User not found');
      }

      // Update instance
      this.refresh_token = null;
      this.updated_at = result.rows[0].updated_at;

      return true;
    } catch (error) {
      throw error;
    }
  }

  // Convert to safe object (without password and refresh token)
  toSafeObject() {
    return {
      id: this.id,
      username: this.username,
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  }
}

module.exports = User;
