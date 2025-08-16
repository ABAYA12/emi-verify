const emailService = require('../utils/emailService');

async function testEmail() {
  try {
    console.log('Testing SMTP connection...');
    const isConnected = await emailService.testConnection();
    
    if (isConnected) {
      console.log('✅ SMTP connection successful');
      console.log('✅ Email service is ready for use');
      console.log('Note: In production, emails can only be sent to verified addresses in AWS SES');
    } else {
      console.log('❌ SMTP connection failed');
    }
  } catch (error) {
    console.error('❌ Email test failed:', error.message);
  }
}

testEmail();
