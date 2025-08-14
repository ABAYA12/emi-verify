# EMI Verify Authentication System

This document describes the authentication system implemented for the EMI Verify application.

## Features

- **User Registration**: Register with username and password only
- **User Login**: Authenticate with JWT tokens
- **Password Change**: Change password for authenticated users
- **Token Refresh**: Refresh expired access tokens
- **Secure Storage**: Passwords hashed with bcrypt, refresh tokens stored securely

## Database Schema

### Users Table

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(30) UNIQUE NOT NULL CHECK (
        username ~ '^[a-zA-Z0-9_-]+$' AND 
        LENGTH(username) >= 3 AND 
        LENGTH(username) <= 30
    ),
    password VARCHAR(255) NOT NULL CHECK (LENGTH(password) >= 6),
    refresh_token TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

## API Endpoints

### Authentication Routes

All authentication routes are prefixed with `/api/auth/`.

#### 1. Register User
- **POST** `/api/auth/register`
- **Body**: `{ "username": "string", "password": "string" }`
- **Response**: User object + tokens

```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "uuid",
      "username": "testuser",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    },
    "tokens": {
      "accessToken": "jwt_access_token",
      "refreshToken": "jwt_refresh_token"
    }
  }
}
```

#### 2. Login User
- **POST** `/api/auth/login`
- **Body**: `{ "username": "string", "password": "string" }`
- **Response**: User object + tokens

#### 3. Change Password
- **POST** `/api/auth/change-password`
- **Headers**: `Authorization: Bearer <access_token>`
- **Body**: `{ "oldPassword": "string", "newPassword": "string" }`
- **Response**: Success message

#### 4. Refresh Token
- **POST** `/api/auth/refresh-token`
- **Body**: `{ "refreshToken": "string" }`
- **Response**: New tokens

#### 5. Logout
- **POST** `/api/auth/logout`
- **Headers**: `Authorization: Bearer <access_token>`
- **Response**: Success message

#### 6. Get Profile
- **GET** `/api/auth/profile`
- **Headers**: `Authorization: Bearer <access_token>`
- **Response**: User profile

#### 7. Verify Token
- **GET** `/api/auth/verify`
- **Headers**: `Authorization: Bearer <access_token>`
- **Response**: Token validation result

## Security Features

### Password Security
- Passwords are hashed using bcrypt with salt rounds of 12
- Minimum password length: 6 characters
- No maximum length limit (handled at application level)

### Username Validation
- Only alphanumeric characters, underscores, and hyphens allowed
- Length: 3-30 characters
- Must be unique across the system

### JWT Tokens
- **Access Token**: Expires in 15 minutes
- **Refresh Token**: Expires in 7 days
- Tokens are signed with JWT_SECRET from environment variables

### Database Security
- Refresh tokens are stored in the database for validation
- Automatic logout on password change (invalidates refresh tokens)
- UUID primary keys for users

## Environment Variables

```bash
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=emi_verify
DB_USER=emi_admin
DB_PASSWORD=emi_password123

# JWT Security
JWT_SECRET=your_jwt_secret_here
JWT_ACCESS_TOKEN_EXPIRY=15m
JWT_REFRESH_TOKEN_EXPIRY=7d

# Server Configuration
PORT=3000
NODE_ENV=development
```

## Installation and Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Setup Environment**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Create Users Table**
   ```bash
   npm run migrate-users
   ```

4. **Start Server**
   ```bash
   npm run dev
   ```

## Usage Examples

### Register a New User

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "johndoe",
    "password": "secure123"
  }'
```

### Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "johndoe",
    "password": "secure123"
  }'
```

### Access Protected Route

```bash
curl -X GET http://localhost:3000/api/auth/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Change Password

```bash
curl -X POST http://localhost:3000/api/auth/change-password \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "oldPassword": "secure123",
    "newPassword": "newsecure456"
  }'
```

### Refresh Token

```bash
curl -X POST http://localhost:3000/api/auth/refresh-token \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "YOUR_REFRESH_TOKEN"
  }'
```

## Error Handling

The API returns consistent error responses:

```json
{
  "success": false,
  "message": "Error description"
}
```

### Common Error Codes

- **400**: Bad Request (validation errors)
- **401**: Unauthorized (authentication failures)
- **500**: Internal Server Error

## Testing

Run authentication tests:

```bash
npm run test:auth
```

## Security Considerations

1. **Environment Variables**: Always use strong, unique values for JWT_SECRET in production
2. **HTTPS**: Use HTTPS in production to protect tokens in transit
3. **Token Storage**: Store tokens securely on the client side
4. **Rate Limiting**: The API includes rate limiting to prevent abuse
5. **No Email Recovery**: Forgotten passwords must be reset manually in the database

## Frontend Integration

For frontend applications, follow this flow:

1. **Registration/Login**: Store both access and refresh tokens
2. **API Requests**: Use access token in Authorization header
3. **Token Refresh**: When access token expires (401 response), use refresh token to get new tokens
4. **Logout**: Call logout endpoint and clear stored tokens

## Database Management

### Manual Password Reset (if forgotten)

```sql
-- Generate new hashed password
UPDATE users 
SET password = '$2a$12$hashedPasswordHere', 
    refresh_token = NULL,
    updated_at = CURRENT_TIMESTAMP
WHERE username = 'username_here';
```

### View User Information

```sql
SELECT id, username, created_at, updated_at 
FROM users 
WHERE username = 'username_here';
```

## Development

The authentication system is built with:

- **Express.js**: Web framework
- **bcryptjs**: Password hashing
- **jsonwebtoken**: JWT token generation and verification
- **uuid**: Unique user ID generation
- **PostgreSQL**: Database storage

## Future Enhancements

- Email verification system
- Password recovery via email
- Two-factor authentication
- Admin user roles
- Session management
- Account lockout after failed attempts
