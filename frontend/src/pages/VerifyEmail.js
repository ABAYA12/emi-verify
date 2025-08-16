import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Auth.css';

const VerifyEmail = () => {
  const [code, setCode] = useState('');
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendMessage, setResendMessage] = useState('');
  const [countdown, setCountdown] = useState(0);
  
  const { verifyEmail, resendVerification, verificationEmail, requiresVerification } = useAuth();
  const navigate = useNavigate();

  // Redirect if not requiring verification
  useEffect(() => {
    if (!requiresVerification || !verificationEmail) {
      navigate('/login');
    }
  }, [requiresVerification, verificationEmail, navigate]);

  // Countdown timer for resend button
  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleCodeChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setCode(value);
    
    if (errors.code) {
      setErrors({});
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!code || code.length !== 6) {
      setErrors({ code: 'Please enter the 6-digit verification code' });
      return;
    }

    setIsLoading(true);
    try {
      await verifyEmail(verificationEmail, code);
      
      // Show success and redirect to login
      navigate('/login', { 
        state: { 
          message: 'Email verified successfully! You can now log in.',
          type: 'success'
        }
      });
    } catch (error) {
      setErrors({ code: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setIsResending(true);
    setResendMessage('');
    
    try {
      await resendVerification(verificationEmail);
      setResendMessage('Verification code sent! Please check your email.');
      setCountdown(60); // 60 second countdown
    } catch (error) {
      setResendMessage('Failed to send verification code. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  if (!requiresVerification || !verificationEmail) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Verify Your Email</h1>
          <p>
            We've sent a 6-digit verification code to<br />
            <strong>{verificationEmail}</strong>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="code">Verification Code</label>
            <input
              type="text"
              id="code"
              name="code"
              value={code}
              onChange={handleCodeChange}
              className={`verification-input ${errors.code ? 'error' : ''}`}
              placeholder="Enter 6-digit code"
              maxLength="6"
              disabled={isLoading}
              autoComplete="one-time-code"
            />
            {errors.code && <span className="error-message">{errors.code}</span>}
          </div>

          <button
            type="submit"
            className="auth-button"
            disabled={isLoading || code.length !== 6}
          >
            {isLoading ? 'Verifying...' : 'Verify Email'}
          </button>
        </form>

        <div className="auth-footer">
          <div className="resend-section">
            {resendMessage && (
              <p className={`resend-message ${resendMessage.includes('Failed') ? 'error' : 'success'}`}>
                {resendMessage}
              </p>
            )}
            
            <p>
              Didn't receive the code?{' '}
              <button
                type="button"
                className="link-button"
                onClick={handleResend}
                disabled={isResending || countdown > 0}
              >
                {isResending ? 'Sending...' : 
                 countdown > 0 ? `Resend in ${countdown}s` : 'Resend code'}
              </button>
            </p>
          </div>

          <p>
            Want to use a different email?{' '}
            <Link to="/signup" className="auth-link">
              Sign up again
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
