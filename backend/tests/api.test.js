const request = require('supertest');
const app = require('../server');

describe('EMI Verify API Tests', () => {
  describe('Health and Documentation', () => {
    test('GET /health - should return health status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('EMI Verify API is running');
    });

    test('GET /api - should return API documentation', async () => {
      const response = await request(app)
        .get('/api')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.endpoints).toBeDefined();
    });
  });

  describe('Insurance Cases API', () => {
    let createdCaseId;

    test('POST /api/insurance-cases - should create new insurance case', async () => {
      const caseData = {
        agent_name: 'Test Agent',
        insured_name: 'Test Insured',
        country: 'Test Country',
        date_received: '2024-01-15',
        case_type: 'Test Case',
        insurance_company: 'Test Insurance',
        is_fraud: false
      };

      const response = await request(app)
        .post('/api/insurance-cases')
        .send(caseData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.agent_name).toBe(caseData.agent_name);
      createdCaseId = response.body.data.id;
    });

    test('GET /api/insurance-cases - should return all insurance cases', async () => {
      const response = await request(app)
        .get('/api/insurance-cases')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    test('GET /api/insurance-cases/:id - should return specific case', async () => {
      const response = await request(app)
        .get(`/api/insurance-cases/${createdCaseId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(createdCaseId);
    });

    test('PUT /api/insurance-cases/:id - should update case', async () => {
      const updateData = {
        case_status: 'Updated Status'
      };

      const response = await request(app)
        .put(`/api/insurance-cases/${createdCaseId}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.case_status).toBe(updateData.case_status);
    });
  });

  describe('Document Verifications API', () => {
    let createdVerificationId;

    test('POST /api/document-verifications - should create new verification', async () => {
      const verificationData = {
        agent_name: 'Test Verification Agent',
        applicant_name: 'Test Applicant',
        document_type: 'Test Document',
        country: 'Test Country',
        date_received: '2024-01-15',
        processing_fee: 100.00
      };

      const response = await request(app)
        .post('/api/document-verifications')
        .send(verificationData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.agent_name).toBe(verificationData.agent_name);
      createdVerificationId = response.body.data.id;
    });

    test('GET /api/document-verifications - should return all verifications', async () => {
      const response = await request(app)
        .get('/api/document-verifications')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    test('GET /api/document-verifications/:id - should return specific verification', async () => {
      const response = await request(app)
        .get(`/api/document-verifications/${createdVerificationId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(createdVerificationId);
    });
  });

  describe('Analytics API', () => {
    test('GET /api/analytics/dashboard - should return dashboard KPIs', async () => {
      const response = await request(app)
        .get('/api/analytics/dashboard')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.summary).toBeDefined();
      expect(response.body.data.insurance_cases).toBeDefined();
      expect(response.body.data.document_verifications).toBeDefined();
    });

    test('GET /api/analytics/insurance-cases - should return insurance KPIs', async () => {
      const response = await request(app)
        .get('/api/analytics/insurance-cases')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.overview).toBeDefined();
      expect(response.body.data.fraud_analysis).toBeDefined();
    });

    test('GET /api/analytics/document-verifications - should return document KPIs', async () => {
      const response = await request(app)
        .get('/api/analytics/document-verifications')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.overview).toBeDefined();
      expect(response.body.data.financial_metrics).toBeDefined();
    });
  });

  describe('Export API', () => {
    test('GET /api/export/summary - should return export summary', async () => {
      const response = await request(app)
        .get('/api/export/summary')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.available_exports).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    test('GET /api/insurance-cases/999999 - should return 404 for non-existent case', async () => {
      const response = await request(app)
        .get('/api/insurance-cases/999999')
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    test('GET /non-existent-endpoint - should return 404', async () => {
      const response = await request(app)
        .get('/non-existent-endpoint')
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    test('POST /api/insurance-cases with invalid data - should handle gracefully', async () => {
      const response = await request(app)
        .post('/api/insurance-cases')
        .send({ invalid: 'data' });

      // Should not crash the server
      expect(response.status).toBeDefined();
    });
  });
});
