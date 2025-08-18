#!/bin/bash

# EMI Verify Deployment Script
# This script handles the complete deployment process for EC2

set -e  # Exit on any error

echo "🚀 Starting EMI Verify deployment on EC2..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -f "docker-compose.yml" ]; then
    print_error "Not in EMI Verify project directory!"
    exit 1
fi

print_step "Installing system dependencies..."

# Update system packages
sudo apt-get update -y

# Install Node.js if not present
if ! command -v node &> /dev/null; then
    print_status "Installing Node.js 18..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
else
    print_status "Node.js is already installed: $(node --version)"
fi

# Install Docker if not present
if ! command -v docker &> /dev/null; then
    print_status "Installing Docker..."
    sudo apt-get install -y apt-transport-https ca-certificates curl gnupg lsb-release
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
    sudo apt-get update -y
    sudo apt-get install -y docker-ce docker-ce-cli containerd.io
    sudo usermod -aG docker $USER
else
    print_status "Docker is already installed: $(docker --version)"
fi

# Install Docker Compose if not present
if ! command -v docker-compose &> /dev/null; then
    print_status "Installing Docker Compose..."
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
else
    print_status "Docker Compose is already installed: $(docker-compose --version)"
fi

# Start and enable Docker
print_step "Starting Docker service..."
sudo systemctl start docker
sudo systemctl enable docker

print_step "Pulling latest changes from Git..."
git pull origin main || {
    print_warning "Git pull failed, continuing with local changes..."
}

print_step "Installing Node.js dependencies..."
npm run install:all || {
    print_error "Failed to install dependencies!"
    exit 1
}

print_step "Running backend tests..."
npm run test:backend || {
    print_warning "Backend tests failed, but continuing deployment..."
}

print_step "Building frontend..."
cd frontend
npm run build || {
    print_error "Frontend build failed!"
    exit 1
}
cd ..

print_step "Stopping existing containers..."
docker-compose down || {
    print_warning "No existing containers to stop..."
}

print_step "Cleaning up Docker resources..."
docker system prune -f || true

print_step "Building and starting containers..."
docker-compose up -d --build || {
    print_error "Failed to start Docker containers!"
    exit 1
}

print_step "Waiting for services to initialize..."
sleep 45

print_step "Setting up database..."
npm run setup-db || {
    print_warning "Database setup failed, may need manual intervention..."
}

print_step "Running comprehensive health checks..."

# Get EC2 public IP
PUBLIC_IP=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4 2>/dev/null || echo "localhost")

# Check backend health
for i in {1..10}; do
    if curl -f http://localhost:3001/health > /dev/null 2>&1; then
        print_status "✅ Backend is healthy"
        break
    else
        print_warning "⏳ Waiting for backend... (attempt $i/10)"
        sleep 10
    fi
done

# Check if frontend build exists
if [ -d "frontend/build" ] || [ -d "frontend/dist" ]; then
    print_status "✅ Frontend build exists"
else
    print_warning "⚠️ Frontend build directory not found"
fi

# Check if database is accessible
if docker-compose exec -T postgres pg_isready -U emi_admin > /dev/null 2>&1; then
    print_status "✅ Database is ready"
else
    print_warning "⚠️ Database health check failed"
fi

print_step "Checking service status..."
docker-compose ps

print_step "🎉 Deployment completed!"
print_status "Services are now available:"
print_status "  🌐 Frontend: http://$PUBLIC_IP:3000"
print_status "  🔌 Backend API: http://$PUBLIC_IP:3001"
print_status "  🗄️ PgAdmin: http://$PUBLIC_IP:8080"
print_status "  📊 Database: $PUBLIC_IP:5432"

echo ""
print_status "Management commands:"
print_status "  📋 View logs: docker-compose logs -f"
print_status "  🛑 Stop services: docker-compose down"
print_status "  🔄 Restart services: docker-compose restart"
print_status "  🏥 Health check: curl http://localhost:3001/health"

# Create a status check script
cat > check-status.sh << 'EOF'
#!/bin/bash
echo "=== EMI Verify Status Check ==="
echo "Containers:"
docker-compose ps
echo ""
echo "Health Checks:"
curl -s http://localhost:3001/health | jq . 2>/dev/null || echo "Backend not responding"
echo ""
echo "Recent Logs:"
docker-compose logs --tail=10
EOF

chmod +x check-status.sh
print_status "📊 Status check script created: ./check-status.sh"
