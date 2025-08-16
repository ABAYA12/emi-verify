# EMI Verify Backend

Node.js + Express backend API for the EMI Verify application.

## Structure

```
backend/
├── config/         # Database configuration
├── controllers/    # API controllers (business logic)
├── middleware/     # Authentication & validation middleware
├── models/         # Database models & schemas
├── routes/         # API route definitions
├── scripts/        # Database setup & migration scripts
├── tests/          # Unit and integration tests
├── utils/          # Utility functions and helpers
└── server.js       # Main application entry point
```

## Getting Started

```bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env

# Set up database (make sure PostgreSQL is running)
npm run setup-db

# Start development server
npm run dev

# Or start production server
npm start
```

## Available Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm run setup-db` - Initialize database with tables and triggers
- `npm run sample-data` - Generate sample data for testing
- `npm test` - Run all tests
- `npm run test:auth` - Run authentication tests only
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage report

## Environment Variables

See `.env.example` for all available environment variables. The default values work with the provided Docker Compose setup.

## API Documentation

The API is available at `http://localhost:3000/api` when the server is running.

For detailed API documentation, see the main project README.
