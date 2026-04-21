# AWS E-Commerce Platform Architecture

## Project Structure Overview

This guide describes how the project is organized for AWS deployment.

### Directory Structure

```
.
├── .github/workflows/                 # CI/CD pipelines (GitHub Actions)
│   ├── build-and-push.yml            # Build and push Docker images
│   ├── deploy-dev.yml                # Deploy to development
│   ├── deploy-staging.yml            # Deploy to staging
│   └── deploy-prod.yml               # Deploy to production
│
├── infrastructure/                    # Infrastructure as Code
│   ├── terraform/                    # Terraform IaC for AWS
│   │   ├── main.tf                   # Main terraform file
│   │   ├── vpc.tf                    # VPC and networking
│   │   ├── ecs.tf                    # ECS cluster and services
│   │   ├── rds.tf                    # RDS PostgreSQL database
│   │   ├── s3.tf                     # S3 buckets for static assets
│   │   ├── cloudfront.tf             # CloudFront CDN
│   │   ├── alb.tf                    # Application Load Balancer
│   │   ├── iam.tf                    # IAM roles and policies
│   │   ├── variables.tf              # Input variables
│   │   ├── outputs.tf                # Output values
│   │   ├── provider.tf               # AWS provider config
│   │   │
│   │   └── environments/             # Environment-specific configs
│   │       ├── dev.tfvars            # Development variables
│   │       ├── staging.tfvars        # Staging variables
│   │       └── prod.tfvars           # Production variables
│   │
│   └── scripts/                      # Infrastructure scripts
│       ├── init.sh                   # Initialize Terraform
│       ├── plan.sh                   # Plan infrastructure changes
│       └── apply.sh                  # Apply infrastructure changes
│
├── services/                          # Microservices
│   ├── api/                          # Express.js API service
│   │   ├── src/                      # Source code
│   │   │   ├── routes/               # API routes
│   │   │   ├── middleware/           # Express middleware
│   │   │   ├── db.js                 # Database connection
│   │   │   ├── app.js                # Express app setup
│   │   │   └── server.js             # Server entry point
│   │   ├── migrations/               # Database migrations
│   │   ├── scripts/                  # Seed and utility scripts
│   │   ├── test/                     # Jest tests
│   │   ├── Dockerfile                # Production image
│   │   ├── package.json
│   │   ├── .env.example
│   │   └── healthcheck.js            # Health check endpoint
│   │
│   ├── invoice/                      # Python FastAPI microservice
│   │   ├── main.py                   # FastAPI application
│   │   ├── pkg/                      # Shared libraries
│   │   │   ├── mailer/               # Email service
│   │   │   └── invoice/              # Invoice generation
│   │   ├── tests/                    # Pytest tests
│   │   ├── requirements.txt
│   │   ├── Dockerfile                # Production image
│   │   ├── .env.example
│   │   └── health.py                 # Health check endpoint
│   │
│   └── web/                          # React frontend
│       ├── src/                      # React source code
│       │   ├── pages/                # Page components
│       │   ├── components/           # Reusable components
│       │   ├── utils/                # Utility functions
│       │   ├── api.js                # API client
│       │   └── App.jsx               # Root component
│       ├── test/                     # Vitest tests
│       ├── public/                   # Static assets (moved by build)
│       ├── Dockerfile                # Production image (multi-stage)
│       ├── nginx.conf                # Nginx config for serving
│       ├── package.json
│       ├── vite.config.js
│       └── .env.example
│
├── config/                           # Environment configurations
│   ├── dev.env                       # Development environment
│   ├── staging.env                   # Staging environment
│   ├── prod.env                      # Production environment (AWS Secrets Manager)
│   └── README.md                     # Configuration guide
│
├── scripts/                          # Deployment and utility scripts
│   ├── setup.sh                      # Initial project setup
│   ├── deploy.sh                     # Deploy to AWS
│   ├── migrate.sh                    # Run database migrations
│   ├── health-check.sh               # Monitor service health
│   ├── rollback.sh                   # Rollback deployment
│   └── backup.sh                     # Backup database
│
├── docs/                             # Documentation
│   ├── AWS_DEPLOYMENT.md             # AWS deployment guide
│   ├── LOCAL_DEVELOPMENT.md          # Local dev setup
│   ├── API_DOCUMENTATION.md          # API endpoints
│   └── TROUBLESHOOTING.md            # Common issues
│
├── docker-compose.dev.yml            # Local development compose file
├── docker-compose.yml                # Reference file
├── .dockerignore                     # Docker build ignore file
├── CLAUDE.md                         # Claude AI assistant guide
├── ARCHITECTURE.md                   # This file
├── README.md                         # Project overview
└── DEPLOYMENT.md                     # Deployment instructions

```

## AWS Architecture Design

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      AWS Cloud                              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │            CloudFront (CDN)                          │  │
│  │     - Static asset caching and distribution          │  │
│  └───────────┬────────────────────────────────┬────────┘  │
│              │                                │            │
│         ┌────▼────┐                    ┌──────▼────────┐   │
│         │ S3      │                    │ ALB (Public)  │   │
│         │ Bucket  │                    │ Port: 80/443  │   │
│         └─────────┘                    └───────┬───────┘   │
│                                                │            │
│                                        ┌───────▼────────┐   │
│                                        │  VPC (Private) │   │
│                                        │                │   │
│    ┌────────────────────────────────┐  │  ┌───────────┐ │   │
│    │   ECS Cluster                  │  │  │  Frontend  │ │   │
│    │                                │  │  │  (Fargate) │ │   │
│    │  ┌──────────────┐              │  │  │  Port 3000 │ │   │
│    │  │   API Task   │              │  │  └───────────┘ │   │
│    │  │  (Express)   │              │  │                 │   │
│    │  │  Port 3000   │              │  │  ┌───────────┐ │   │
│    │  └──────────────┘              │  │  │ API Task  │ │   │
│    │                                │  │  │(Express)  │ │   │
│    │  ┌──────────────┐              │  │  │ Port 3000 │ │   │
│    │  │ Invoice Task │              │  │  └───────────┘ │   │
│    │  │ (FastAPI)    │              │  │                 │   │
│    │  │  Port 8080   │              │  │  ┌───────────┐ │   │
│    │  └──────────────┘              │  │  │ Invoice   │ │   │
│    │                                │  │  │(FastAPI)  │ │   │
│    │  Auto-scaling: 2-10 tasks     │  │  │ Port 8080 │ │   │
│    └────────────────────────────────┘  │  └───────────┘ │   │
│                                        │                │   │
│    ┌────────────────────────────────┐  │                │   │
│    │   RDS (PostgreSQL)             │  │                │   │
│    │                                │  │                │   │
│    │  - Multi-AZ deployment         │  │                │   │
│    │  - Automated backups           │  │                │   │
│    │  - Read replicas               │  │                │   │
│    └────────────────────────────────┘  │                │   │
│                                        │                │   │
│    ┌────────────────────────────────┐  │                │   │
│    │   Elasticache (Redis)          │  │                │   │
│    │                                │  │                │   │
│    │  - Session storage             │  │                │   │
│    │  - Cache layer                 │  │                │   │
│    └────────────────────────────────┘  │                │   │
│                                        └────────────────┘   │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │           Monitoring & Logging                        │  │
│  │  - CloudWatch (Logs, Metrics, Alarms)                │  │
│  │  - X-Ray (Distributed tracing)                       │  │
│  │  - SNS (Notifications)                               │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │     Secrets Manager & Parameter Store                 │  │
│  │  - Database credentials                              │  │
│  │  - JWT secrets                                       │  │
│  │  - API keys                                          │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Key AWS Services Used

| Service | Purpose | Configuration |
|---------|---------|---|
| **ECS Fargate** | Container orchestration | Auto-scaling, load balancing |
| **RDS** | PostgreSQL database | Multi-AZ, automated backups |
| **ALB** | Load balancing | HTTP/HTTPS, routing rules |
| **S3** | Static asset storage | Versioning, encryption |
| **CloudFront** | CDN for static assets | Global distribution, caching |
| **CloudWatch** | Logging & monitoring | Logs, metrics, alarms |
| **Secrets Manager** | Secret storage | Encrypted credentials |
| **Parameter Store** | Configuration | Environment variables |
| **ECR** | Docker registry | Private repository |
| **IAM** | Access control | Roles and policies |
| **Route 53** | DNS | Domain routing |
| **Certificate Manager** | SSL/TLS | HTTPS certificates |

## Environment Strategy

### Development Environment
- Single ECS task per service (no auto-scaling)
- t3.small RDS instance
- Minimal redundancy
- Cost-optimized

### Staging Environment  
- 2 ECS tasks per service (simulates production)
- t3.medium RDS instance
- Multi-AZ disabled
- Pre-production testing

### Production Environment
- 3-10 auto-scaling ECS tasks per service
- db.t3.large RDS instance (Multi-AZ)
- Read replicas
- Full redundancy and monitoring

## Deployment Pipeline

```
Code Push → GitHub Actions → Build Images → Push to ECR
                                             ↓
                                    Run Integration Tests
                                             ↓
                  Deploy to Dev → Deploy to Staging → Deploy to Prod
```

## Security Best Practices

1. **Network Security**
   - Private VPC for all services
   - Security groups restrict traffic
   - NAT Gateway for outbound access

2. **Data Security**
   - RDS encryption at rest
   - SSL/TLS in transit (HTTPS via ALB)
   - Secrets Manager for sensitive data

3. **Application Security**
   - JWT authentication
   - CORS configuration
   - Rate limiting
   - Input validation

4. **Access Control**
   - IAM roles with least privilege
   - Service-to-service authentication
   - CloudWatch audit logs

## Implementation Flow

The reorganization includes:

1. **Infrastructure as Code** - Terraform templates for reproducible AWS deployment
2. **Microservices Architecture** - Independent services with clear boundaries
3. **CI/CD Pipeline** - Automated testing and deployment
4. **Environment Management** - Separate configurations per environment
5. **Monitoring & Observability** - CloudWatch integration
6. **Secrets Management** - Secure credential storage
7. **Auto-scaling** - Performance-based resource adjustment

## Next Steps

Once the reorganization is complete, the deployment phase will:

1. Initialize Terraform with AWS credentials
2. Create infrastructure in dev environment
3. Deploy services to ECS
4. Configure DNS and CDN
5. Set up monitoring and alerting
6. Create backup and disaster recovery procedures

Refer to [AWS_DEPLOYMENT.md](docs/AWS_DEPLOYMENT.md) for detailed deployment instructions.
