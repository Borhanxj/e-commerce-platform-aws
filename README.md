# E-Commerce Platform - AWS Deployment Ready

A fully containerized, production-ready e-commerce platform designed for AWS cloud deployment with modern DevOps practices.

![Status](https://img.shields.io/badge/Status-AWS%20Ready-blue)
![License](https://img.shields.io/badge/License-ISC-green)

## 📋 Quick Navigation

- **[Architecture Overview](ARCHITECTURE.md)** - System design and AWS services
- **[AWS GUI Deployment Guide](docs/GUI_DEPLOYMENT_GUIDE.md)** - Full step-by-step AWS Console instructions (No CLI required)
- **[AWS CLI Deployment Guide](docs/AWS_DEPLOYMENT.md)** - Traditional CLI-based deployment
- **[Local Development](docs/LOCAL_DEVELOPMENT.md)** - Set up for development
- **[Troubleshooting](docs/TROUBLESHOOTING.md)** - Common issues and solutions
- **[Development Guidelines](CLAUDE.md)** - Code standards and Git conventions

## 🚀 Quick Start

### Local Development

```bash
# Clone repository
git clone <repository-url>
cd e-commerce-platform-aws

# Run setup
chmod +x scripts/setup.sh
./scripts/setup.sh

# Start services with Docker Compose
docker-compose -f docker-compose.dev.yml up --build
```

**Services:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000
- PostgreSQL: localhost:5432
- MailHog UI: http://localhost:8025

### AWS Deployment

```bash
# Prerequisites: AWS CLI, Terraform, Docker

# 1. Configure AWS
aws configure

# 2. Deploy to development
./scripts/deploy.sh dev eu-west-1

# 3. Verify deployment
./scripts/health-check.sh dev eu-west-1
```

See [AWS Deployment Guide](docs/AWS_DEPLOYMENT.md) for detailed steps.

## 🏗️ Project Structure

```
.
├── services/                    # Microservices
│   ├── api/                     # Express.js backend
│   ├── web/                     # React frontend
│   └── invoice/                 # Python invoice service
├── infrastructure/              # Infrastructure as Code
│   └── terraform/               # Terraform configuration
├── config/                      # Environment configurations
├── scripts/                     # Deployment scripts
├── .github/workflows/           # CI/CD pipelines
└── docs/                        # Documentation
```

## 🏭 Architecture

### High-Level Components

- **Frontend** - React + Vite SPA served via CloudFront CDN
- **Backend API** - Express.js microservice on ECS Fargate
- **Invoice Service** - Python FastAPI microservice
- **Database** - AWS RDS PostgreSQL with Multi-AZ
- **Load Balancing** - Application Load Balancer (ALB)
- **Container Registry** - Amazon ECR
- **Monitoring** - CloudWatch + SNS alerts
- **Secrets Management** - AWS Secrets Manager

### Deployment Environments

| Environment | Compute | Database | Auto-Scaling | Monitoring |
|---|---|---|---|---|
| **Development** | Single task | t3.micro | 1-2 | Basic |
| **Staging** | 2 tasks | t3.small | 2-4 | Detailed |
| **Production** | 3 tasks | t3.medium (Multi-AZ) | 3-10 | Full |

## 🔧 Key Features

✅ **Infrastructure as Code** - Terraform for reproducible deployments
✅ **CI/CD Pipeline** - GitHub Actions for automated testing & deployment
✅ **Containerized** - Docker multi-stage builds optimized for production
✅ **Scalable** - ECS auto-scaling based on CPU/memory metrics
✅ **Secure** - VPC networking, IAM policies, encrypted secrets
✅ **Monitored** - CloudWatch logs, metrics, and alarms
✅ **Database** - Managed RDS with automated backups
✅ **CDN** - CloudFront distribution for static assets
✅ **Environment Management** - Separate configs per environment

## 📦 Services

### Backend API (Express.js)

```bash
cd services/api
npm install
npm run dev           # Dev server with hot-reload
npm test              # Run tests
npm run lint          # Lint code
npm run format        # Format code
```

**Features:**
- JWT authentication
- CRUD operations
- Database migrations
- Comprehensive tests
- Docker-ready

### Frontend (React + Vite)

```bash
cd services/web
npm install
npm run dev           # Dev server
npm run build         # Production build
npm test              # Run tests
npm run preview       # Preview build
```

**Features:**
- Modern React 19 with Vite
- Tailwind CSS styling
- Responsive design
- Component tests
- Production optimized

### Invoice Service (Python)

```bash
cd services/invoice
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python -m uvicorn main:app --reload
```

**Features:**
- FastAPI framework
- PDF generation
- Email sending
- Async workers
- API documentation

## 🗄️ Database

PostgreSQL 16 with Schema:

- `auth.users` - User accounts
- `auth.customers` - Customer profiles
- `auth.sales_managers` - Sales team
- `products` - Product catalog
- `orders` - Order records
- `order_items` - Order line items
- `cart_items` - Shopping cart
- `wishlist_items` - Wishlist
- `notifications` - User notifications
- `product_discounts` - Active discounts

**Migrations:** Managed with `node-pg-migrate`, located in `services/api/migrations/`

## 📝 Environment Configuration

Configuration is environment-specific:

```bash
# Development
cp config/dev.env services/api/.env

# Staging
cp config/staging.env services/api/.env

# Production (use AWS Secrets Manager)
# See config/README.md for details
```

See [Configuration Guide](config/README.md) for all options.

## 🚢 Deployment

### Local Testing

```bash
# 1. Start services
docker-compose -f docker-compose.dev.yml up --build

# 2. Run tests
cd services/api && npm test
cd services/web && npm test

# 3. Connect to database
docker-compose exec db psql -U postgres -d ecommerce
```

### AWS Deployment

```bash
# 1. Initialize infrastructure
cd infrastructure/terraform
terraform init
terraform plan -var-file="environments/dev.tfvars"

# 2. Deploy
terraform apply

# 3. Push images
./scripts/deploy.sh dev eu-west-1

# 4. Health check
./scripts/health-check.sh dev eu-west-1
```

Full guide in [AWS_DEPLOYMENT.md](docs/AWS_DEPLOYMENT.md)

## 📊 Monitoring

### CloudWatch Dashboards

```bash
# View logs
aws logs tail /ecs/ecommerce-api --follow

# Metrics
aws cloudwatch get-metric-statistics \
  --namespace AWS/ECS \
  --metric-name CPUUtilization \
  --dimensions Name=ServiceName,Value=ecommerce-api
```

### Alarms

Automatic alarms for:
- CPU > 80%
- Memory > 85%
- RDS connections high
- Task failures
- Unhealth targets

## 🔐 Security

- **Network**: Private VPC subnets for services
- **Auth**: JWT tokens with expiry
- **Encryption**: TLS in transit, encryption at rest
- **Secrets**: AWS Secrets Manager for credentials
- **Access**: IAM roles with least privileges
- **Audit**: CloudTrail logging for all API calls

## 🧪 Testing

### Backend Tests

```bash
cd services/api
npm test                  # Run all tests
npm test -- --coverage   # With coverage report
npm run test:watch       # Watch mode
```

### Frontend Tests

```bash
cd services/web
npm test                  # Run component tests
npm test -- --coverage   # With coverage
npm run test:watch       # Watch mode
```

### Invoice Service Tests

```bash
cd services/invoice
pytest tests/             # Run all tests
pytest tests/ --cov      # With coverage
pytest tests/test_api.py # Specific file
```

## 📋 Git Workflow

Follow [Conventional Commits](CLAUDE.md#git-conventions):

```bash
# Feature
git commit -m "feat: add product search endpoint"

# Bug fix
git commit -m "fix: resolve cart total calculation"

# Documentation
git commit -m "docs: update deployment guide"
```

## 🔄 CI/CD Pipeline

### Automated Workflows

1. **Build & Test** (.github/workflows/build-and-push.yml)
   - Runs on all branches
   - Lints code
   - Runs tests
   - Pushes to ECR

2. **Develop Deploy** (.github/workflows/deploy-dev.yml)
   - Triggers on develop branch push
   - Deploys to development environment

3. **Staging Deploy** (.github/workflows/deploy-staging.yml)
   - Triggers on staging branch push
   - Promotes to staging

4. **Production Deploy** (.github/workflows/deploy-prod.yml)
   - Triggers on main branch push
   - Requires approval
   - Blue-green deployment strategy

## 📈 Scaling

Auto-scaling, configured per environment:

- **Development** - 1-2 tasks
- **Staging** - 2-4 tasks
- **Production** - 3-10 tasks

Scales based on:
- CPU utilization (target: 70%)
- Memory utilization (target: 80%)
- Custom metrics

## 💰 Cost Estimation

**Monthly costs (estimated):**

| Environment | ECS | RDS | ALB | Networking | Total |
|---|---|---|---|---|---|
| Dev | $10 | $10 | $16 | $5 | ~$40 |
| Staging | $30 | $25 | $16 | $10 | ~$80 |
| Production | $100 | $70 | $16 | $30 | ~$220 |

*Costs vary by region and traffic patterns*

## 🤝 Contributing

1. Create feature branch: `git checkout -b feature/my-feature`
2. Make changes and commit with conventional commits
3. Push branch and create Pull Request
4. CI/CD pipeline runs automatically
5. Merge after approval

See [CLAUDE.md](CLAUDE.md) for detailed development guidelines.

## 📚 Documentation

- [ARCHITECTURE.md](ARCHITECTURE.md) - System design
- [AWS_DEPLOYMENT.md](docs/AWS_DEPLOYMENT.md) - Production deployment
- [LOCAL_DEVELOPMENT.md](docs/LOCAL_DEVELOPMENT.md) - Local setup
- [TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md) - Common issues
- [config/README.md](config/README.md) - Configuration
- [CLAUDE.md](CLAUDE.md) - Development guidelines

## 🛠️ Technologies

### Frontend
- React 19
- Vite
- Tailwind CSS
- Vitest + React Testing Library

### Backend
- Node.js 20+
- Express.js
- PostgreSQL 16
- Jest + Supertest

### Infrastructure
- AWS (ECS, RDS, ALB, S3, CloudFront, etc.)
- Terraform
- Docker

### DevOps
- GitHub Actions
- Docker & Docker Compose
- AWS ECR

## 📞 Support

For issues or questions:

1. **Check Documentation** - See docs/ folder
2. **Search Issues** - Check GitHub issues
3. **Troubleshooting** - See [TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md)
4. **Development** - Review [CLAUDE.md](CLAUDE.md)

## 📝 License

ISC License - See LICENSE file

## 🎯 Next Steps

1. **Review Architecture** - Understand AWS setup
2. **Local Development** - Run locally first
3. **Deploy to AWS** - Follow deployment guide
4. **Configure Monitoring** - Set up CloudWatch
5. **Scale** - Adjust auto-scaling policies

---

**Ready to deploy?** Start with [AWS_DEPLOYMENT.md](docs/AWS_DEPLOYMENT.md)

**Want to develop locally?** See [LOCAL_DEVELOPMENT.md](docs/LOCAL_DEVELOPMENT.md)

**Need help?** Check [TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md)
