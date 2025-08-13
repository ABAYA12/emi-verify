# Docker Setup Guide for EMI Verify

This guide explains how to run EMI Verify with the provided Docker Compose setup.

## 🐳 Docker Services

The `docker-compose.yml` file provides:

- **PostgreSQL 15**: Database server
- **PgAdmin 4**: Web-based database administration tool

## 📋 Database Configuration

From your Docker Compose file:

```yaml
Database Details:
- Host: localhost
- Port: 5432
- Database: emi_verify
- Username: emi_admin
- Password: emi_password123
```

```yaml
PgAdmin Access:
- URL: http://localhost:8080
- Email: admin@emi.com
- Password: pgadmin123
```

## 🚀 Quick Start with Docker

### 1. Start Docker Services
```bash
# Start PostgreSQL and PgAdmin
docker-compose up -d

# Check services are running
docker-compose ps
```

### 2. Set up EMI Verify
```bash
# Use the automated setup script
./quick-start.sh

# Or manual setup:
npm install
npm run setup-db
npm run sample-data
npm run dev
```

### 3. Verify Setup
```bash
# Check database connection
curl http://localhost:3000/health

# View sample data
curl http://localhost:3000/api/analytics/dashboard
```

## 🔧 Manual Docker Commands

### Start Services
```bash
docker-compose up -d postgres    # Start only PostgreSQL
docker-compose up -d             # Start all services
```

### Check Status
```bash
docker-compose ps                # List running containers
docker-compose logs postgres     # View PostgreSQL logs
docker-compose logs pgadmin      # View PgAdmin logs
```

### Database Operations
```bash
# Connect to PostgreSQL directly
docker-compose exec postgres psql -U emi_admin -d emi_verify

# Run SQL commands
docker-compose exec postgres psql -U emi_admin -d emi_verify -c "SELECT COUNT(*) FROM insurance_cases;"
```

### Stop Services
```bash
docker-compose stop              # Stop services
docker-compose down              # Stop and remove containers
docker-compose down -v           # Stop, remove containers and volumes (⚠️ deletes data)
```

## 📊 PgAdmin Setup

1. Open http://localhost:8080
2. Login with:
   - Email: `admin@emi.com`
   - Password: `pgadmin123`
3. Add server connection:
   - Host: `postgres` (container name)
   - Port: `5432`
   - Database: `emi_verify`
   - Username: `emi_admin`
   - Password: `emi_password123`

## 🔍 Troubleshooting

### Database Connection Issues
```bash
# Check if PostgreSQL is running
docker-compose ps

# Check PostgreSQL logs
docker-compose logs postgres

# Test connection from host
telnet localhost 5432
```

### Reset Database
```bash
# Stop and remove all containers and volumes
docker-compose down -v

# Start fresh
docker-compose up -d
./quick-start.sh
```

### Port Conflicts
If ports 5432 or 8080 are already in use:

1. Edit `docker-compose.yml`
2. Change port mappings:
   ```yaml
   postgres:
     ports:
       - "5433:5432"  # Use different host port
   
   pgadmin:
     ports:
       - "8081:80"    # Use different host port
   ```
3. Update `.env` file with new port

## 📈 Production Considerations

### Security
- Change default passwords in production
- Use environment variables for sensitive data
- Enable SSL/TLS for database connections

### Backup
```bash
# Backup database
docker-compose exec postgres pg_dump -U emi_admin emi_verify > backup.sql

# Restore database
docker-compose exec -T postgres psql -U emi_admin emi_verify < backup.sql
```

### Monitoring
```bash
# Monitor container resources
docker stats

# View container health
docker-compose ps
docker inspect emi_postgres
```
