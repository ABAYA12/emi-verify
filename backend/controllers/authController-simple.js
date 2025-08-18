const User = require('../models/User');
const emailService = require('../utils/emailService');
const { 
  generateAccessToken, 
  generateRefreshToken 
} = require('../middleware/auth');

/**
 * Register a new user with email verification
 */
const signup = async (req, res) => {
  console.log('Signup request received:', { ...req.body, password: '[REDACTED]' });
  try {
    const { fullName, email, password } = req.body;

    // Validate input
    if (!fullName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Full name, email and password are required'
      });
    }

    // Create user
    const user = await User.createWithEmail({ fullName, email, password });

    // Generate verification code
    const verificationCode = await User.createVerificationCode(email);

    // Send verification email
    try {
      await emailService.sendVerificationCode(email, fullName, verificationCode.code);
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
      console.log(`DEVELOPMENT: Verification code for ${email}: ${verificationCode.code}`);
      // Continue with signup even if email fails - user can request resend
    }

    res.status(201).json({
      success: true,
      message: 'Account created successfully. Please check your email for the verification code.',
      data: {
        email: user.email,
        verified: user.verified
      }
    });
  } catch (error) {
    console.error('Signup error:', error);
    
    if (error.message === 'User with this email already exists') {
      return res.status(409).json({
        success: false,
        message: 'An account with this email already exists'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to create account. Please try again.'
    });
  }
};

/**
 * Verify email with verification code
 */
const verifyEmail = async (req, res) => {
  try {
    const { email, code } = req.body;

    // Validate input
    if (!email || !code) {
      return res.status(400).json({
        success: false,
        message: 'Email and verification code are required'
      });
    }

    // Verify the code
    const user = await User.verifyCode(email, code);

    // Generate tokens
    const accessToken = generateAccessToken(user.id);

    res.json({
      success: true,
      message: 'Email verified successfully',
      data: {
        user: {
          id: user.id,
          full_name: user.full_name,
          email: user.email,
          verified: user.verified
        },
        accessToken
      }
    });
  } catch (error) {
    console.error('Email verification error:', error);
    
    if (error.message === 'Invalid or expired verification code') {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired verification code'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to verify email. Please try again.'
    });
  }
};

/**
 * Login user
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('🔑 Login attempt for:', email);

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Find user (case-insensitive email search)
    const user = await User.findByEmail(email.toLowerCase().trim());
    console.log('👤 User found:', user ? 'Yes' : 'No');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check if email is verified
    console.log('✅ User verified:', user.verified);
    if (!user.verified) {
      return res.status(401).json({
        success: false,
        message: 'Please verify your email before logging in'
      });
    }

    // Verify password
    console.log('🔐 Verifying password...');
    const isValidPassword = await User.verifyPassword(password, user.password);
    console.log('🔐 Password valid:', isValidPassword);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Generate tokens
    const accessToken = generateAccessToken(user.id);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          full_name: user.full_name,
          email: user.email,
          verified: user.verified
        },
        accessToken
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed. Please try again.'
    });
  }
};

/**
 * Forgot password - send reset email
 */
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    // Create password reset token
    const resetRecord = await User.createPasswordResetToken(email);
    
    // Send password reset email
    try {
      await emailService.sendPasswordReset(email, resetRecord.token);
    } catch (emailError) {
      console.error('Failed to send password reset email:', emailError);
      // Still return success to prevent email enumeration
    }

    res.json({
      success: true,
      message: 'If an account with that email exists, we sent you a password reset link.'
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    
    // Return success even on error to prevent email enumeration
    res.json({
      success: true,
      message: 'If an account with that email exists, we sent you a password reset link.'
    });
  }
};

/**
 * Reset password with token
 */
const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({
        success: false,
        message: 'Token and new password are required'
      });
    }

    // Validate password strength
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters long'
      });
    }

    // Reset password
    const user = await User.resetPasswordWithToken(token, password);

    res.json({
      success: true,
      message: 'Password reset successfully. You can now log in with your new password.',
      data: {
        email: user.email
      }
    });
  } catch (error) {
    console.error('Reset password error:', error);
    
    if (error.message === 'Invalid or expired reset token') {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to reset password. Please try again.'
    });
  }
};

/**
 * Get user profile
 */
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        verified: user.verified,
        created_at: user.created_at
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile'
    });
  }
};

/**
 * Update user profile
 */
const updateProfile = async (req, res) => {
  try {
    const { fullName } = req.body;
    const userId = req.user.id;

    if (!fullName) {
      return res.status(400).json({
        success: false,
        message: 'Full name is required'
      });
    }

    const user = await User.updateProfile(userId, { fullName });
    
    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        verified: user.verified
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile'
    });
  }
};

/**
 * Development only - manually verify a user (bypass email verification)
 */
const devVerifyUser = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    // Find user by email
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Manually verify user
    await User.markAsVerified(email);

    res.json({
      success: true,
      message: 'User manually verified for development',
      data: {
        email: user.email,
        verified: true
      }
    });
  } catch (error) {
    console.error('Dev verify error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify user'
    });
  }
};

/**
 * Development only - get verification code for a user
 */
const getVerificationCode = async (req, res) => {
  try {
    const { email } = req.params;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    // Get verification code from database
    const query = `
      SELECT code, expires_at 
      FROM verification_codes 
      WHERE email = $1 AND used = false 
      ORDER BY created_at DESC 
      LIMIT 1
    `;
    
    const db = require('../config/database');
    const result = await db.query(query, [email.toLowerCase()]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No verification code found for this email'
      });
    }

    const codeData = result.rows[0];
    
    res.json({
      success: true,
      message: 'Verification code retrieved (development only)',
      data: {
        email: email,
        code: codeData.code,
        expires_at: codeData.expires_at
      }
    });
  } catch (error) {
    console.error('Get verification code error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get verification code'
    });
  }
};

module.exports = {
  signup,
  verifyEmail,
  login,
  forgotPassword,
  resetPassword,
  getProfile,
  updateProfile,
  devVerifyUser,
  getVerificationCode
};
