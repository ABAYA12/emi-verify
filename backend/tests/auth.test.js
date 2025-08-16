const request = require('supertest');
const app = require('../server');

describe('Authentication API', () => {
  let accessToken;
  let refreshToken;
  const testUser = {
    username: 'testuser123',
    password: 'testpass123'
  };

  // Test user registration
  describe('POST /api/auth/register', () => {
    test('should register a new user successfully', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send(testUser)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user).toHaveProperty('id');
      expect(response.body.data.user.username).toBe(testUser.username);
      expect(response.body.data.tokens).toHaveProperty('accessToken');
      expect(response.body.data.tokens).toHaveProperty('refreshToken');
      
      // Store tokens for later tests
      accessToken = response.body.data.tokens.accessToken;
      refreshToken = response.body.data.tokens.refreshToken;
    });

    test('should reject registration with invalid username', async () => {
      await request(app)
        .post('/api/auth/register')
        .send({
          username: 'ab', // too short
          password: 'validpass123'
        })
        .expect(400);
    });

    test('should reject registration with short password', async () => {
      await request(app)
        .post('/api/auth/register')
        .send({
          username: 'validuser',
          password: '123' // too short
        })
        .expect(400);
    });

    test('should reject duplicate username', async () => {
      await request(app)
        .post('/api/auth/register')
        .send(testUser)
        .expect(400);
    });
  });

  // Test user login
  describe('POST /api/auth/login', () => {
    test('should login successfully with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send(testUser)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.username).toBe(testUser.username);
      expect(response.body.data.tokens).toHaveProperty('accessToken');
      expect(response.body.data.tokens).toHaveProperty('refreshToken');
    });

    test('should reject login with invalid credentials', async () => {
      await request(app)
        .post('/api/auth/login')
        .send({
          username: testUser.username,
          password: 'wrongpassword'
        })
        .expect(401);
    });

    test('should reject login with non-existent user', async () => {
      await request(app)
        .post('/api/auth/login')
        .send({
          username: 'nonexistent',
          password: 'somepassword'
        })
        .expect(401);
    });
  });

  // Test token verification
  describe('GET /api/auth/verify', () => {
    test('should verify valid token', async () => {
      const response = await request(app)
        .get('/api/auth/verify')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.username).toBe(testUser.username);
    });

    test('should reject request without token', async () => {
      await request(app)
        .get('/api/auth/verify')
        .expect(401);
    });

    test('should reject request with invalid token', async () => {
      await request(app)
        .get('/api/auth/verify')
        .set('Authorization', 'Bearer invalidtoken')
        .expect(401);
    });
  });

  // Test profile retrieval
  describe('GET /api/auth/profile', () => {
    test('should get user profile with valid token', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.username).toBe(testUser.username);
      expect(response.body.data.user).not.toHaveProperty('password');
    });
  });

  // Test password change
  describe('POST /api/auth/change-password', () => {
    test('should change password successfully', async () => {
      const response = await request(app)
        .post('/api/auth/change-password')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          oldPassword: testUser.password,
          newPassword: 'newpassword123'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    test('should reject change with wrong old password', async () => {
      await request(app)
        .post('/api/auth/change-password')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          oldPassword: 'wrongoldpassword',
          newPassword: 'newpassword123'
        })
        .expect(401);
    });
  });

  // Test token refresh
  describe('POST /api/auth/refresh-token', () => {
    test('should refresh token successfully', async () => {
      const response = await request(app)
        .post('/api/auth/refresh-token')
        .send({
          refreshToken: refreshToken
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.tokens).toHaveProperty('accessToken');
      expect(response.body.data.tokens).toHaveProperty('refreshToken');
    });

    test('should reject invalid refresh token', async () => {
      await request(app)
        .post('/api/auth/refresh-token')
        .send({
          refreshToken: 'invalidrefreshtoken'
        })
        .expect(401);
    });
  });

  // Test logout
  describe('POST /api/auth/logout', () => {
    test('should logout successfully', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });
});
