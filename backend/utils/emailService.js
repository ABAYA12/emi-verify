const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST || 'email-smtp.us-east-1.amazonaws.com',
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USERNAME || 'AKIATWMWU2JKMCAZBKZE',
        pass: process.env.SMTP_PASSWORD || 'BNTZIO1gGvWGeU9l0FkvL7Ln9sNnlSQXgWfeiEnaJ7/w'
      }
    });

    this.fromEmail = process.env.FROM_EMAIL || 'emiverify@insightgridanalytic.com';
  }

  /**
   * Send verification code email
   */
  async sendVerificationCode(email, fullName, code) {
    try {
      const mailOptions = {
        from: this.fromEmail,
        to: email,
        subject: 'Your EMI Verify Account Verification Code',
        text: `Hello ${fullName},

Thank you for signing up for EMI Verify.
Your verification code is: ${code}

This code will expire in 30 minutes. If you did not request this, please ignore this email.

Regards,
EMI Verify Team`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Hello ${fullName},</h2>
            <p>Thank you for signing up for EMI Verify.</p>
            <div style="background: #f8f9fa; padding: 20px; border-radius: 5px; text-align: center; margin: 20px 0;">
              <h3 style="color: #007bff; margin: 0;">Your verification code is:</h3>
              <h1 style="color: #007bff; font-size: 32px; letter-spacing: 5px; margin: 10px 0;">${code}</h1>
            </div>
            <p style="color: #666;">This code will expire in 30 minutes. If you did not request this, please ignore this email.</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            <p style="color: #999; font-size: 14px;">Regards,<br>EMI Verify Team</p>
          </div>
        `
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('Verification email sent:', result.messageId);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('Failed to send verification email:', error);
      throw new Error('Failed to send verification email');
    }
  }

  /**
   * Send password reset email
   */
  async sendPasswordReset(email, fullName, resetLink) {
    try {
      const mailOptions = {
        from: this.fromEmail,
        to: email,
        subject: 'Reset Your EMI Verify Password',
        text: `Hello ${fullName},

We received a request to reset your EMI Verify account password.
Click the link below to reset your password:
${resetLink}

This link will expire in 30 minutes. If you did not request this, please ignore this email.

Regards,
EMI Verify Team`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Hello ${fullName},</h2>
            <p>We received a request to reset your EMI Verify account password.</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetLink}" style="background: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a>
            </div>
            <p style="color: #666; font-size: 14px;">Or copy and paste this link in your browser:<br>
            <a href="${resetLink}" style="color: #007bff; word-break: break-all;">${resetLink}</a></p>
            <p style="color: #666;">This link will expire in 30 minutes. If you did not request this, please ignore this email.</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            <p style="color: #999; font-size: 14px;">Regards,<br>EMI Verify Team</p>
          </div>
        `
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('Password reset email sent:', result.messageId);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('Failed to send password reset email:', error);
      throw new Error('Failed to send password reset email');
    }
  }

  /**
   * Test email configuration
   */
  async testConnection() {
    try {
      await this.transporter.verify();
      console.log('SMTP connection verified successfully');
      return true;
    } catch (error) {
      console.error('SMTP connection failed:', error);
      return false;
    }
  }
}

module.exports = new EmailService();
