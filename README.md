# EMI Verify
**Insurance Cases and Document Verification Management System**

A comprehensive full-stack application for managing Insurance Cases and Document Verification records with advanced analytics and CSV export capabilities.

## 🏗️ Project Structure

```
emi-verify/
├── backend/                    # Node.js + Express API server
│   ├── config/                # Database configuration
│   ├── controllers/           # API controllers
│   ├── middleware/            # Authentication & validation
│   ├── models/               # Database models
│   ├── routes/               # API routes
│   ├── scripts/              # Database setup & migration scripts
│   ├── tests/                # Backend tests
│   ├── utils/                # Utility functions
│   ├── server.js             # Main server file
│   └── package.json          # Backend dependencies
├── frontend/                  # React.js frontend application
│   ├── public/               # Static assets
│   ├── src/                  # React components & pages
│   └── package.json          # Frontend dependencies
├── docker-compose.yml        # PostgreSQL & PgAdmin containers
├── package.json             # Workspace management
└── quick-start.sh           # Automated setup script
```

## 🚀 Features

### Core Functionality
- **Dual Dataset Management**: Handle both Insurance Cases and Document Verification records
- **Flexible Data Entry**: Missing fields are allowed (stored as NULL)
- **PostgreSQL Storage**: Robust database with optimized indexes and triggers
- **CSV Export**: Download data with optional date range filtering
- **Advanced Analytics**: Comprehensive KPI calculations for both datasets

### Insurance Cases KPIs
- Total Cases Received/Closed
- Average Turnaround Time
- Case Closure Rate
- Pending Cases
- Case Volume by Country/Type
- Fraud Analysis (Total cases, rate, types, sources)
- Agent Performance Metrics
- Country Risk Assessment

### Document Verification KPIs
- Total Verifications Received/Completed
- Average Turnaround Time
- Completion Rate
- Pending Verifications
- Volume by Document Type/Country
- Financial Metrics (Processing fees, agent payments, net revenue)
- Outstanding Payments Analysis
- Agent Performance Metrics

## 📋 Data Schemas

### Insurance Cases Fields
- Agent Name, Insured Name, Country
- Date Received, Date Closed, Turnaround Time
- Case Status, Policy Number, Case Type
- Insurance Company, Fraud Information
- Comments and Fraud Source

### Document Verification Fields
- Agent Name, ARS Number, Check ID
- Applicant Name, Document Type, Country/Region
- Date Received, Date Closed, Turnaround Time
- Processing Fees, Agent Payments, Payment Status

## 🛠 Quick Start

### Option 1: Automated Setup (Recommended)
```bash
# Clone and navigate to the project
cd /home/ubuntu/emi-verify

# Run the automated setup script
./quick-start.sh
```

This script will:
- Start PostgreSQL with Docker
- Install backend and frontend dependencies
- Set up the database and sample data
- Provide instructions for starting the applications

### Option 2: Manual Setup

#### Prerequisites
- Node.js (v14 or higher)
- Docker & Docker Compose (for database)
- npm or yarn

#### Installation Steps

1. **Start Database Services**
   ```bash
   docker-compose up -d postgres
   ```

2. **Install Dependencies**
   ```bash
   # Install workspace dependencies
   npm install
   
   # Or install individually
   npm run install:backend
   npm run install:frontend
   ```

3. **Configure Backend Environment**
   ```bash
   cp .env.example backend/.env
   # Edit backend/.env file if needed (default values work with Docker)
   ```

4. **Set up Database**
   ```bash
   npm run setup-db
   npm run sample-data
   ```

5. **Start Applications**
   ```bash
   # Terminal 1: Start backend
   npm run dev:backend
   
   # Terminal 2: Start frontend
   npm run dev:frontend
   ```

## 🚀 Available Scripts

### Workspace Level
- `npm run install:all` - Install all dependencies
- `npm run start:backend` - Start backend in production mode
- `npm run start:frontend` - Start frontend development server
- `npm run dev:backend` - Start backend in development mode
- `npm run setup-db` - Initialize database
- `npm run sample-data` - Generate sample data
- `npm run test:backend` - Run backend tests

### Individual Services
```bash
# Backend (from ./backend/)
npm start          # Production mode
npm run dev        # Development mode with nodemon
npm test           # Run all tests
npm run setup-db   # Database setup

# Frontend (from ./frontend/)
npm start          # Development server
npm run build      # Production build
```

## 🌐 Access Information

Once both applications are running:

### Applications
- **Frontend**: http://localhost:3001 (React development server)
- **Backend API**: http://localhost:3000 (Express server)

### Database Management
- **PostgreSQL**: localhost:5432
  - Database: `emi_verify`
  - User: `emi_admin`
  - Password: `emi_password123`
- **PgAdmin**: http://localhost:8080
  - Email: `admin@emi.com`
  - Password: `pgadmin123`

### Health Check
```bash
curl http://localhost:3000/health
```

## 📡 API Endpoints

### Health & Documentation
- `GET /health` - Server health check
- `GET /api` - API documentation

### Insurance Cases
- `GET /api/insurance-cases` - List all cases (with filters)
- `POST /api/insurance-cases` - Create new case
- `GET /api/insurance-cases/:id` - Get specific case
- `PUT /api/insurance-cases/:id` - Update case
- `DELETE /api/insurance-cases/:id` - Delete case
- `POST /api/insurance-cases/bulk` - Bulk create cases

### Document Verifications
- `GET /api/document-verifications` - List all verifications (with filters)
- `POST /api/document-verifications` - Create new verification
- `GET /api/document-verifications/:id` - Get specific verification
- `PUT /api/document-verifications/:id` - Update verification
- `DELETE /api/document-verifications/:id` - Delete verification
- `POST /api/document-verifications/bulk` - Bulk create verifications

### Analytics & KPIs
- `GET /api/analytics/insurance-cases` - Insurance cases KPIs
- `GET /api/analytics/document-verifications` - Document verification KPIs
- `GET /api/analytics/dashboard` - Combined dashboard metrics

### CSV Export
- `GET /api/export/insurance-cases` - Export insurance cases to CSV
- `GET /api/export/document-verifications` - Export document verifications to CSV
- `GET /api/export/summary` - Export summary information

## 🔍 Query Parameters

All endpoints support filtering with these parameters:
- `start_date` (YYYY-MM-DD) - Filter by date received
- `end_date` (YYYY-MM-DD) - Filter by date received
- `agent_name` - Filter by agent name (partial match)
- `country` - Filter by country (partial match)

### Additional Filters
- **Insurance Cases**: `case_status`
- **Document Verifications**: `document_type`, `payment_status`

## 📊 Example API Usage

### Create Insurance Case
```bash
curl -X POST http://localhost:3000/api/insurance-cases \
  -H "Content-Type: application/json" \
  -d '{
    "agent_name": "John Doe",
    "insured_name": "Jane Smith",
    "country": "USA",
    "date_received": "2024-01-15",
    "case_type": "Property Damage",
    "insurance_company": "ABC Insurance",
    "is_fraud": false
  }'
```

### Get Analytics Dashboard
```bash
curl "http://localhost:3000/api/analytics/dashboard?start_date=2024-01-01&end_date=2024-12-31"
```

### Export to CSV
```bash
curl "http://localhost:3000/api/export/insurance-cases?start_date=2024-01-01" \
  --output insurance-cases.csv
```

## 🔧 Configuration

### Environment Variables (.env)
```env
NODE_ENV=development
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=emi_verify
DB_USER=your_db_user
DB_PASSWORD=your_db_password
JWT_SECRET=your_jwt_secret
```

### Database Configuration
The system automatically creates:
- Optimized indexes for performance
- Timestamp triggers for audit trails
- Foreign key constraints for data integrity

## 🚦 Development

### Available Scripts
- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm run setup-db` - Initialize database schema
- `npm test` - Run test suite

### Project Structure
```
emi-verify/
├── config/database.js      # Database connection
├── models/                 # Data models
├── routes/                 # API routes
├── scripts/               # Database setup scripts
├── server.js              # Main application file
└── package.json           # Dependencies
```

## 📈 Performance Features

- **Database Indexes**: Optimized for common queries
- **Connection Pooling**: Efficient database connections
- **Rate Limiting**: API protection against abuse
- **Error Handling**: Comprehensive error management
- **Security**: Helmet.js and CORS protection

## 🔒 Security Features

- Rate limiting on API endpoints
- Input validation and sanitization
- Secure headers with Helmet.js
- Environment-based configuration
- SQL injection prevention

## 📝 License

MIT License - see LICENSE file for details

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

---

**EMI Verify** - Built for InsightGrid Analytics
*Comprehensive data management with powerful analytics*