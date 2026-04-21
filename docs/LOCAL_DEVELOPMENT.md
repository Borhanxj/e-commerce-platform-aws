# Local Development Guide

This guide explains how to set up and run the e-commerce platform locally for development.

## Prerequisites

- Docker v20.10+
- Docker Compose v2.0+
- Node.js v18+
- npm v9+
- Git

## Quick Start

### 1. Clone and Setup

```bash
git clone <repository-url>
cd e-commerce-platform-aws

# Run setup script
chmod +x scripts/setup.sh
./scripts/setup.sh
```

### 2. Start Services

```bash
# Start all services with Docker Compose
docker-compose -f docker-compose.dev.yml up --build

# Or for background mode
docker-compose -f docker-compose.dev.yml up -d --build
```

This will start:
- **Backend API** - http://localhost:3000
- **Frontend** - http://localhost:5173
- **PostgreSQL** - localhost:5432
- **MailHog** - http://localhost:8025
- **Invoice API** - http://localhost:8080

### 3. Access the Application

- **Admin Dashboard** - http://localhost:5173/admin
  - Email: `admin@example.com`
  - Password: `admin123456`

- **Sales Manager Dashboard** - http://localhost:5173/sales-manager
  - Email: `salesmanager@example.com`
  - Password: `salesmanager123456`

- **Customer App** - http://localhost:5173
  - Register a new account or use any credentials

- **MailHog UI** - http://localhost:8025
  - View emails sent during development

## Individual Service Setup

### Backend Service

```bash
cd services/api

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Run migrations
npm run migrate:up

# Seed initial data
npm run seed:admin

# Start development server with hot-reload
npm run dev

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Lint code
npm run lint

# Format code
npm run format
```

### Frontend Service

```bash
cd services/web

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Lint code
npm run lint

# Format code
npm run format
```

### Invoice Service

```bash
cd services/invoice

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run service
python -m uvicorn main:app --reload --port 8080

# Run tests
pytest tests/
```

## Database Management

### Access PostgreSQL

```bash
# From host machine
docker-compose exec db psql -U postgres -d ecommerce

# Common psql commands
\dt                           # List tables
\d products                   # Describe table
SELECT * FROM products LIMIT 5;  # Query data
\q                           # Exit
```

### Run Migrations

```bash
# Apply all pending migrations
cd services/api
npm run migrate:up

# Roll back last migration
npm run migrate:down

# Create new migration
# 1. Create file: services/api/migrations/<N>_description.js
# 2. Add exports.up and exports.down functions
# 3. Run npm run migrate:up
```

### Seed Data

```bash
cd services/api

# Seed admin account
npm run seed:admin

# Or directly with node
node scripts/seed-admin.js
node scripts/seed-sales-manager.js
node scripts/seed-product-manager.js
node scripts/seed-products.js
```

### Reset Database

```bash
# Stop containers
docker-compose -f docker-compose.dev.yml down

# Remove database volume
docker volume rm ecommerce_postgres_data

# Restart containers (database will be recreated and seeded)
docker-compose -f docker-compose.dev.yml up --build
```

## Testing

### Backend Tests

```bash
cd services/api

# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run specific test file
npm test -- auth.test.js

# Run tests matching pattern
npm test -- --testNamePattern="POST /api/auth/login"

# Generate coverage report
npm test -- --coverage
```

### Frontend Tests

```bash
cd services/web

# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run specific test file
npm test LoginPage

# Generate coverage report
npm test -- --coverage
```

### Invoice Service Tests

```bash
cd services/invoice

# Run all tests
pytest tests/

# Run with verbose output
pytest tests/ -v

# Run specific test file
pytest tests/test_api.py

# Run with coverage
pytest tests/ --cov=.
```

## Code Quality

### Linting

```bash
# Check API
cd services/api && npm run lint

# Check Web
cd services/web && npm run lint
```

### Code Formatting

```bash
# Check format compliance
cd services/api && npm run format:check
cd services/web && npm run format:check

# Auto-fix formatting
cd services/api && npm run format
cd services/web && npm run format
```

## Environment Variables

### Backend (.env or services/api/.env)

```env
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/ecommerce
JWT_SECRET=dev-secret-key
SMTP_HOST=localhost
SMTP_PORT=1025
```

### Frontend (.env or services/web/.env)

```env
VITE_API_BASE_URL=http://localhost:3000
```

### Invoice Service

```env
ENVIRONMENT=development
JWT_SECRET=dev-secret-key
SMTP_HOST=localhost
```

## Common Tasks

### Add a New Route

```bash
cd services/api

# 1. Create route file: routes/my-feature.js
# 2. Add route handler function
# 3. Register in app.js:
#    app.use('/api/my-feature', require('./routes/my-feature'));
# 4. Test the endpoint
# 5. Write tests in test/my-feature.test.js
```

### Add Database Table

```bash
cd services/api

# 1. Create migration file: migrations/<N>_add_my_table.js
# 2. Define exports.up and exports.down
# 3. Run migration:
#    npm run migrate:up
# 4. Create seed script if needed
# 5. Write repository/query functions
```

### Add Frontend Component

```bash
cd services/web

# 1. Create component: src/components/MyComponent.jsx
# 2. Create test: test/MyComponent.test.jsx
# 3. Use in a page: src/pages/*/index.jsx
# 4. Write tests
# 5. Run tests: npm test
```

## Debugging

### Backend Debugging

```javascript
// Add debug logs
console.log('Debug info:', variable);

// View logs
docker-compose logs -f api
docker-compose logs -f api | grep ERROR

// Debug with node inspector
node --inspect server.js

// Connect VS Code debugger or Chrome DevTools
```

### Frontend Debugging

```javascript
// Add debug statements
console.log('Debug:', value);
debugger; // Browser will pause here in dev tools

// View logs
docker-compose logs -f web

// Open browser DevTools (F12 or Cmd+Opt+I)
```

### Database Debugging

```bash
# Check database connection
docker-compose exec api npm run test:db

# View query logs
PGVERBOSE=on npm run dev

# Check migrations status
cd services/api
npx node-pg-migrate status

# View table structure
docker-compose exec db psql -U postgres -d ecommerce -c "\d products"
```

## Performance Testing

### Backend Load Testing

```bash
# Install artillery
npm install -g artillery

# Create test file: load-test.yml
# Run test
artillery run load-test.yml

# Example load-test.yml:
config:
  target: 'http://localhost:3000'
  phases:
    - duration: 60
      arrivalRate: 10
scenarios:
  - name: 'Get Products'
    flow:
      - get:
          url: '/api/products'
```

### Frontend Performance

```bash
# Build and analyze
cd services/web
npm run build

# Check bundle size
npm run build -- --analyze
```

## API Documentation

### Get OpenAPI/Swagger Docs

```bash
# Install Swagger/OpenAPI tools
npm install -D @redocly/openapi-cli

# Generate from code or:
curl http://localhost:3000/api-docs
```

### Manual Testing Tools

```bash
# Using curl
curl http://localhost:3000/api/products

# Using REST Client VS Code extension
# Create file: requests.rest
GET http://localhost:3000/api/products

# Using Postman
# Import requests from services/api docs/postman-collection.json
```

## Troubleshooting

### Container Issues

```bash
# View logs from all services
docker-compose -f docker-compose.dev.yml logs

# View logs from specific service
docker-compose logs api

# Follow logs in real-time
docker-compose logs -f api

# Rebuild services
docker-compose -f docker-compose.dev.yml up --build --force-recreate

# Remove and recreate everything
docker-compose -f docker-compose.dev.yml down -v
docker-compose -f docker-compose.dev.yml up --build
```

### Network Issues

```bash
# Check if ports are in use
lsof -i :3000    # API
lsof -i :5173    # Frontend
lsof -i :5432    # Database
lsof -i :1025    # MailHog SMTP
lsof -i :8025    # MailHog Web UI

# Kill process using port
kill -9 <PID>
```

### Database Issues

```bash
# Check PostgreSQL is running
docker-compose ps db

# Check database exists
docker-compose exec db psql -U postgres -l

# Reset database
docker-compose exec db dropdb -U postgres ecommerce
docker-compose exec db createdb -U postgres ecommerce
docker-compose exec api npm run migrate:up
```

### Dependencies Issues

```bash
# Clear npm cache
npm cache clean --force

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# For virtual environments
rm -rf venv/
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

## Health Checks

```bash
# Check API health
curl http://localhost:3000/api/health

# Check database
curl http://localhost:3000/api/health/db

# Check all services status
docker-compose ps
```

## VS Code Setup (Optional)

### Recommended Extensions

- ES7+ React/Redux/React-Native snippets
- Prettier - Code formatter
- ESLint
- REST Client
- SQL Tools
- Docker

### Debug Configuration (.vscode/launch.json)

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Backend API",
      "program": "${workspaceFolder}/services/api/server.js",
      "cwd": "${workspaceFolder}/services/api",
      "env": {"NODE_ENV": "development"}
    }
  ]
}
```

## Next Steps

1. **Understand Architecture** - Read [ARCHITECTURE.md](../ARCHITECTURE.md)
2. **Deploy to AWS** - See [AWS_DEPLOYMENT.md](AWS_DEPLOYMENT.md)
3. **Contribute** - Review [CLAUDE.md](../CLAUDE.md) for development guidelines
4. **Scale** - Check deployment strategies for production

## Support

For issues or questions:
1. Check [TROUBLESHOOTING.md](TROUBLESHOOTING.md)
2. Review logs: `docker-compose logs <service>`
3. Read project documentation in `/docs`
4. Check Git history for similar problems
