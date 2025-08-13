#!/bin/bash

# EMI Verify Quick Start Script with Docker
echo "🚀 EMI Verify Quick Start with Docker"
echo "===================================="

# Check if Docker is running
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    echo "   Visit: https://docs.docker.com/get-docker/"
    exit 1
fi

if ! docker info &> /dev/null; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    echo "   Visit: https://nodejs.org/"
    exit 1
fi

echo "✅ Prerequisites check passed"

# Check if Docker Compose file exists
if [ ! -f docker-compose.yml ]; then
    echo "❌ docker-compose.yml not found. Please ensure the Docker Compose file is in the current directory."
    exit 1
fi

echo "🐳 Starting PostgreSQL with Docker Compose..."
docker-compose up -d postgres

echo "⏳ Waiting for PostgreSQL to be ready..."
sleep 10

# Test database connection
echo "🔍 Testing database connection..."
while ! docker-compose exec -T postgres pg_isready -U emi_admin -d emi_verify &> /dev/null; do
    echo "   Waiting for database..."
    sleep 2
done

echo "✅ Database is ready!"

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cp .env.example .env
fi

echo "📦 Installing dependencies..."
npm install

echo "🗃️  Setting up database..."
npm run setup-db

echo "🎯 Generating sample data..."
node scripts/generate-sample-data.js

echo ""
echo "🎉 EMI Verify is ready!"
echo "======================="
echo ""
echo "� Docker Services:"
echo "   PostgreSQL: localhost:5432"
echo "   PgAdmin: http://localhost:8080"
echo "   - Email: admin@emi.com"
echo "   - Password: pgadmin123"
echo ""
echo "�🚀 To start the EMI Verify server:"
echo "   npm start              # Production mode"
echo "   npm run dev            # Development mode"
echo ""
echo "📡 API Endpoints:"
echo "   http://localhost:3000/health            # Health check"
echo "   http://localhost:3000/api              # API documentation"
echo "   http://localhost:3000/api/analytics/dashboard  # Dashboard KPIs"
echo ""
echo "📊 Sample Data Created:"
echo "   • 3 Insurance Cases"
echo "   • 3 Document Verifications"
echo "   • Ready for testing and development"
echo ""
echo "🛑 To stop Docker services:"
echo "   docker-compose down"
echo ""
echo "✨ Happy coding!"
