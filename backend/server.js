const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  }
});

app.use('/api/', limiter);

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? 
    ['https://emiverify.insightgridanalytic.com', 'https://emiverify.insightgridanalytic.com/verify-email'] : 
    ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:5173'],
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Cookie parsing middleware
app.use(cookieParser());

// Static file serving commented out for now - frontend is separate
// app.use(express.static('frontend/public'));
// app.use('/app', express.static('frontend/build'));

// API Root endpoint
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to EMI Verify API',
    description: 'Insurance Cases and Document Verification Management System',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
    quick_links: {
      health_check: '/health',
      api_documentation: '/api',
      authentication: '/api/auth',
      dashboard_analytics: '/api/analytics/dashboard',
      insurance_cases: '/api/insurance-cases',
      document_verifications: '/api/document-verifications'
    },
    getting_started: {
      '1_register_user': 'POST /api/auth/register',
      '2_login_user': 'POST /api/auth/login',
      '3_view_sample_data': 'GET /api/analytics/dashboard',
      '4_list_insurance_cases': 'GET /api/insurance-cases',
      '5_list_document_verifications': 'GET /api/document-verifications',
      '6_export_to_csv': 'GET /api/export/insurance-cases',
      '7_full_documentation': 'GET /api'
    }
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'EMI Verify API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

// API Routes
console.log('Loading API routes...');
app.use('/api/auth', require('./routes/auth'));
console.log('Auth routes loaded');
app.use('/api/insurance-cases', require('./routes/insuranceCases'));
app.use('/api/document-verifications', require('./routes/documentVerifications'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/export', require('./routes/export'));
console.log('All API routes loaded');

// Frontend Routes - Auth pages (commented out - using React app)
/*
app.get('/login.html', (req, res) => {
  res.sendFile(__dirname + '/frontend/public/login.html');
});

app.get('/login', (req, res) => {
  res.sendFile(__dirname + '/frontend/public/login.html');
});

app.get('/register.html', (req, res) => {
  res.sendFile(__dirname + '/frontend/public/register.html');
});

app.get('/register', (req, res) => {
  res.sendFile(__dirname + '/frontend/public/register.html');
});

app.get('/about.html', (req, res) => {
  res.sendFile(__dirname + '/frontend/public/about.html');
});

app.get('/about', (req, res) => {
  res.sendFile(__dirname + '/frontend/public/about.html');
});

app.get('/services.html', (req, res) => {
  res.sendFile(__dirname + '/frontend/public/services.html');
});

app.get('/services', (req, res) => {
  res.sendFile(__dirname + '/frontend/public/services.html');
});
*/

// Authentication middleware for protected routes
const requireAuth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1] || req.cookies.token;
  
  if (!token) {
    return res.redirect('/login');
  }
  
  try {
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    req.user = decoded;
    next();
  } catch (error) {
    return res.redirect('/login');
  }
};

// Main app routes - serve React application (PROTECTED)
app.get('/dashboard*', requireAuth, (req, res) => {
  res.sendFile(__dirname + '/frontend/build/index.html');
});

app.get('/insurance-cases*', requireAuth, (req, res) => {
  res.sendFile(__dirname + '/frontend/build/index.html');
});

app.get('/document-verifications*', requireAuth, (req, res) => {
  res.sendFile(__dirname + '/frontend/build/index.html');
});

app.get('/analytics*', requireAuth, (req, res) => {
  res.sendFile(__dirname + '/frontend/build/index.html');
});

// Frontend routes commented out - using separate React app
/*
app.get('/app', requireAuth, (req, res) => {
  res.sendFile(__dirname + '/frontend/build/index.html');
});

app.get('/app*', requireAuth, (req, res) => {
  res.sendFile(__dirname + '/frontend/build/index.html');
});

// Home page (landing page)
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/frontend/public/landing.html');
});

// Alternative home route - redirect to root
app.get('/home', (req, res) => {
  res.redirect('/');
});

app.get('/login', (req, res) => {
  res.sendFile(__dirname + '/frontend/public/login.html');
});

app.get('/register', (req, res) => {
  res.sendFile(__dirname + '/frontend/public/register.html');
});

app.get('/about', (req, res) => {
  res.sendFile(__dirname + '/frontend/public/about.html');
});

app.get('/services', (req, res) => {
  res.sendFile(__dirname + '/frontend/public/services.html');
});
*/

// Simple root endpoint for API-only mode
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'EMI Verify API Server',
    version: '1.0.0',
    frontend: 'http://localhost:3001'
  });
});

// Home page (landing page)
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/frontend/public/landing.html');
});

// Alternative home route - redirect to root
app.get('/home', (req, res) => {
  res.redirect('/');
});

app.get('/login', (req, res) => {
  res.sendFile(__dirname + '/frontend/public/login.html');
});

app.get('/register', (req, res) => {
  res.sendFile(__dirname + '/frontend/public/register.html');
});

app.get('/about', (req, res) => {
  res.sendFile(__dirname + '/frontend/public/about.html');
});

app.get('/services', (req, res) => {
  res.sendFile(__dirname + '/frontend/public/services.html');
});

// API Documentation endpoint
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'EMI Verify API',
    version: '1.0.0',
    description: 'Insurance Cases and Document Verification Management System',
    endpoints: {
      health: 'GET /health',
      authentication: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        change_password: 'POST /api/auth/change-password',
        refresh_token: 'POST /api/auth/refresh-token',
        logout: 'POST /api/auth/logout',
        profile: 'GET /api/auth/profile',
        verify: 'GET /api/auth/verify'
      },
      insurance_cases: {
        list: 'GET /api/insurance-cases',
        create: 'POST /api/insurance-cases',
        get_by_id: 'GET /api/insurance-cases/:id',
        update: 'PUT /api/insurance-cases/:id',
        delete: 'DELETE /api/insurance-cases/:id',
        bulk_create: 'POST /api/insurance-cases/bulk'
      },
      document_verifications: {
        list: 'GET /api/document-verifications',
        create: 'POST /api/document-verifications',
        get_by_id: 'GET /api/document-verifications/:id',
        update: 'PUT /api/document-verifications/:id',
        delete: 'DELETE /api/document-verifications/:id',
        bulk_create: 'POST /api/document-verifications/bulk'
      },
      analytics: {
        insurance_kpis: 'GET /api/analytics/insurance-cases',
        document_kpis: 'GET /api/analytics/document-verifications',
        dashboard: 'GET /api/analytics/dashboard'
      },
      exports: {
        insurance_csv: 'GET /api/export/insurance-cases',
        document_csv: 'GET /api/export/document-verifications',
        export_summary: 'GET /api/export/summary'
      }
    },
    query_parameters: {
      filtering: [
        'start_date (YYYY-MM-DD)',
        'end_date (YYYY-MM-DD)',
        'agent_name',
        'country',
        'case_status (insurance cases)',
        'document_type (document verifications)',
        'payment_status (document verifications)'
      ]
    }
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found',
    requested_url: req.originalUrl,
    available_endpoints: '/api'
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  
  // Handle specific error types
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({
      success: false,
      message: 'Invalid JSON in request body'
    });
  }

  if (err.type === 'entity.too.large') {
    return res.status(413).json({
      success: false,
      message: 'Request body too large'
    });
  }

  // Default error response
  res.status(err.status || 500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' ? 
      'Internal server error' : err.message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`
🚀 EMI Verify API Server is running!
📍 Port: ${PORT}
🌍 Environment: ${process.env.NODE_ENV || 'development'}
📊 Health check: http://localhost:${PORT}/health
📚 API documentation: http://localhost:${PORT}/api

📈 Available Services:
   • Insurance Cases Management
   • Document Verification Management  
   • Analytics & KPIs
   • CSV Export functionality

🔧 Next steps:
   1. Set up your PostgreSQL database
   2. Copy .env.example to .env and configure
   3. Run: npm run setup-db
   4. Start adding data via the API endpoints
  `);
});

module.exports = app;
