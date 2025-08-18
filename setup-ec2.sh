#!/bin/bash

# Pre-deployment setup script for EMI Verify
# Run this once on your EC2 instance before the first deployment

echo "🔧 Setting up EMI Verify deployment environment on EC2..."

# Update system
sudo apt-get update -y

# Install essential packages
sudo apt-get install -y curl wget git jq

# Install Node.js 18
if ! command -v node &> /dev/null; then
    echo "Installing Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

# Install Docker
if ! command -v docker &> /dev/null; then
    echo "Installing Docker..."
    sudo apt-get install -y apt-transport-https ca-certificates curl gnupg lsb-release
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
    sudo apt-get update -y
    sudo apt-get install -y docker-ce docker-ce-cli containerd.io
    sudo usermod -aG docker ubuntu
fi

# Install Docker Compose
if ! command -v docker-compose &> /dev/null; then
    echo "Installing Docker Compose..."
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
fi

# Start Docker
sudo systemctl start docker
sudo systemctl enable docker

# Configure Git (if repository access is needed)
echo "Setting up SSH key for repository access..."

# The SSH key should already be created at ~/.ssh/emi_verify_deploy_key
if [ -f ~/.ssh/emi_verify_deploy_key ]; then
    echo "SSH key found. Adding to SSH agent..."
    eval "$(ssh-agent -s)"
    ssh-add ~/.ssh/emi_verify_deploy_key
    
    # Add GitHub to known hosts
    ssh-keyscan github.com >> ~/.ssh/known_hosts
    
    echo "SSH setup completed."
else
    echo "Warning: SSH key not found at ~/.ssh/emi_verify_deploy_key"
    echo "Please ensure the deployment key is properly set up."
fi

# Set up basic firewall rules (optional, adjust as needed)
echo "Configuring firewall rules..."
sudo ufw allow ssh
sudo ufw allow 3000  # Frontend
sudo ufw allow 3001  # Backend
sudo ufw allow 8080  # PgAdmin
sudo ufw --force enable

echo "✅ Pre-deployment setup completed!"
echo ""
echo "Next steps:"
echo "1. Clone your repository: git clone git@github.com:insightgridanalytics/emi-verify.git"
echo "2. Navigate to the project: cd emi-verify"
echo "3. Run the deployment script: ./deploy.sh"
echo ""
echo "Or wait for automatic deployment via GitHub Actions on your next push!"
