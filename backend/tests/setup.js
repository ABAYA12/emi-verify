// Jest setup file
console.log('Setting up test environment for EMI Verify...');

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.DB_NAME = 'emi_verify_test';

// Global test timeout
jest.setTimeout(30000);
