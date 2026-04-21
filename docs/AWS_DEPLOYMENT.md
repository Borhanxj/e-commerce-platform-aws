# AWS Deployment Guide

This guide provides step-by-step instructions for deploying the e-commerce platform to AWS.

## Prerequisites

- AWS Account with appropriate permissions
- AWS CLI v2 installed locally
- Terraform v1.0+ installed
- Docker installed (for testing)
- GitHub account (for CI/CD)
- Domain name (for production)

## Directory Structure for Deployment

```
infrastructure/
├── terraform/
│   ├── environments/
│   │   ├── dev.tfvars
│   │   ├── staging.tfvars
│   │   └── prod.tfvars
│   ├── *.tf files
│   └── terraform.tfstate (generated)
├── scripts/
│   ├── init.sh
│   ├── plan.sh
│   └── apply.sh
└── README.md
```

## Phase 1: Local Setup

### 1.1 Configure AWS CLI

```bash
aws configure
```

Provide your AWS Access Key ID, Secret Access Key, default region (e.g., `us-east-1`), and output format (e.g., `json`).

### 1.2 Create S3 Backend for Terraform State

Create an S3 bucket to store Terraform state:

```bash
aws s3 mb s3://ecommerce-tf-state-$(date +%s) --region us-east-1
aws s3api put-bucket-versioning \
  --bucket ecommerce-tf-state-xxx \
  --versioning-configuration Status=Enabled
```

Update `infrastructure/terraform/provider.tf`:

```hcl
terraform {
  backend "s3" {
    bucket         = "ecommerce-tf-state-xxx"
    key            = "prod/terraform.tfstate"
    region         = "us-east-1"
    encrypt        = true
    dynamodb_table = "terraform-locks"
  }
}
```

### 1.3 Create DynamoDB Lock Table

```bash
aws dynamodb create-table \
  --table-name terraform-locks \
  --attribute-definitions AttributeName=LockID,AttributeType=S \
  --key-schema AttributeName=LockID,KeyType=HASH \
  --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5 \
  --region us-east-1
```

## Phase 2: Infrastructure Provisioning

### 2.1 Initialize Terraform

```bash
cd infrastructure/terraform
terraform init -backend-config="bucket=ecommerce-tf-state-xxx"
```

### 2.2 Plan Infrastructure Changes

```bash
# For development
terraform plan -var-file="environments/dev.tfvars" -out=tfplan

# Review the plan output
terraform show tfplan
```

### 2.3 Apply Infrastructure

```bash
terraform apply tfplan
```

This will create:
- VPC with public and private subnets
- Security groups
- RDS PostgreSQL database
- ECS cluster with launch template
- ALB with target groups
- IAM roles and policies
- Elasticache (optional)
- CloudWatch log groups

### 2.4 Verify Infrastructure

```bash
# Get ALB DNS name
aws elbv2 describe-load-balancers --query 'LoadBalancers[0].DNSName'

# Get RDS endpoint
aws rds describe-db-instances --query 'DBInstances[0].Endpoint.Address'

# Get ECS cluster name
aws ecs list-clusters
```

## Phase 3: Docker Image Preparation

### 3.1 Create ECR Repositories

```bash
# Create repositories for each service
aws ecr create-repository --repository-name ecommerce-api
aws ecr create-repository --repository-name ecommerce-invoice
aws ecr create-repository --repository-name ecommerce-web
```

### 3.2 Build Docker Images Locally

```bash
# From project root

# Build API image
cd services/api
docker build -t ecommerce-api:latest .

# Build Invoice image
cd ../invoice
docker build -t ecommerce-invoice:latest .

# Build Web image
cd ../web
docker build -t ecommerce-web:latest .
```

### 3.3 Push Images to ECR

```bash
# Login to ECR
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin <ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com

# Tag images
docker tag ecommerce-api:latest \
  <ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com/ecommerce-api:latest

# Push to ECR
docker push <ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com/ecommerce-api:latest
```

## Phase 4: Database Setup

### 4.1 Get RDS Details

```bash
# Get RDS endpoint
RDS_ENDPOINT=$(aws rds describe-db-instances \
  --db-instance-identifier ecommerce-db-dev \
  --query 'DBInstances[0].Endpoint.Address' \
  --output text)

echo "RDS Endpoint: $RDS_ENDPOINT"
```

### 4.2 Run Database Migrations

Create a migration task:

```bash
aws ecs run-task \
  --cluster ecommerce-dev \
  --task-definition ecommerce-api-migrate:1 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-xxx],securityGroups=[sg-xxx]}" \
  --overrides '{
    "containerOverrides": [
      {
        "name": "api",
        "command": ["npm", "run", "migrate:up"]
      }
    ]
  }'
```

### 4.3 Seed Initial Data

```bash
aws ecs run-task \
  --cluster ecommerce-dev \
  --task-definition ecommerce-api-seed:1 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-xxx],securityGroups=[sg-xxx]}" \
  --overrides '{
    "containerOverrides": [
      {
        "name": "api",
        "command": ["node", "scripts/seed-products.js"]
      }
    ]
  }'
```

## Phase 5: Service Deployment

### 5.1 Update ECS Task Definitions

Update task definitions with ECR image URIs:

```bash
# Create task definition for API
aws ecs register-task-definition \
  --family ecommerce-api \
  --container-definitions '[
    {
      "name": "api",
      "image": "<ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com/ecommerce-api:latest",
      "essential": true,
      "portMappings": [{"containerPort": 3000}],
      "environment": [
        {"name": "PORT", "value": "3000"},
        {"name": "NODE_ENV", "value": "production"}
      ],
      "secrets": [
        {
          "name": "DATABASE_URL",
          "valueFrom": "arn:aws:secretsmanager:us-east-1:xxx:secret:db-url"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/ecommerce-api",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]' \
  --task-role-arn arn:aws:iam::ACCOUNT_ID:role/ecommere-task-role \
  --execution-role-arn arn:aws:iam::ACCOUNT_ID:role/ecsTaskExecutionRole
```

### 5.2 Update ECS Services

```bash
# Update API service
aws ecs update-service \
  --cluster ecommerce-dev \
  --service ecommerce-api \
  --task-definition ecommerce-api \
  --force-new-deployment
```

## Phase 6: DNS and CDN Setup

### 6.1 Create Route 53 Records

```bash
# Create alias record pointing to ALB
aws route53 change-resource-record-sets \
  --hosted-zone-id Z123456789 \
  --change-batch '{
    "Changes": [
      {
        "Action": "CREATE",
        "ResourceRecordSet": {
          "Name": "api.example.com",
          "Type": "A",
          "AliasTarget": {
            "HostedZoneId": "Z35SXDOTRQ7X7K",
            "DNSName": "ecom-alb-123.us-east-1.elb.amazonaws.com",
            "EvaluateTargetHealth": true
          }
        }
      }
    ]
  }'
```

### 6.2 Configure CloudFront

Update Terraform or create distribution:

```bash
aws cloudfront create-distribution \
  --origin-domain-name ecom-bucket.s3.us-east-1.amazonaws.com \
  --default-root-object index.html
```

## Phase 7: Monitoring and Alerts

### 7.1 Create CloudWatch Alarms

```bash
# CPU utilization alarm
aws cloudwatch put-metric-alarm \
  --alarm-name ecommerce-api-cpu-high \
  --alarm-description "Alert when API CPU is high" \
  --metric-name CPUUtilization \
  --namespace AWS/ECS \
  --statistic Average \
  --period 300 \
  --threshold 80 \
  --comparison-operator GreaterThanThreshold \
  --dimensions Name=ServiceName,Value=ecommerce-api Name=ClusterName,Value=ecommerce-dev
```

### 7.2 Setup SNS Notifications

```bash
# Create SNS topic
aws sns create-topic --name ecommerce-alerts

# Subscribe to alerts
aws sns subscribe \
  --topic-arn arn:aws:sns:us-east-1:xxx:ecommerce-alerts \
  --protocol email \
  --notification-endpoint admin@example.com
```

## Phase 8: CI/CD Pipeline Setup

### 8.1 Configure GitHub Repository Secrets

```bash
# In GitHub: Settings → Secrets and variables → Actions

AWS_ACCESS_KEY_ID=xxx
AWS_SECRET_ACCESS_KEY=xxx
AWS_REGION=us-east-1
ECR_REGISTRY=<ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com
ECS_CLUSTER_DEV=ecommerce-dev
ECS_CLUSTER_PROD=ecommerce-prod
```

### 8.2 Enable Workflows

GitHub Actions workflows are in `.github/workflows/`:
- `build-and-push.yml` - Build and push images
- `deploy-dev.yml` - Deploy to development
- `deploy-staging.yml` - Deploy to staging
- `deploy-prod.yml` - Deploy to production

Workflows trigger automatically on:
- Push to `main` → Deploy to prod
- Push to `staging` → Deploy to staging
- Push to `develop` → Deploy to dev

## Verification Checklist

- [ ] Infrastructure created in AWS
- [ ] ECR repositories created and images pushed
- [ ] RDS database provisioned and migrations run
- [ ] ECS services running and healthy
- [ ] ALB routing traffic to services
- [ ] CloudFront distribution created
- [ ] Route 53 DNS records pointing to services
- [ ] CloudWatch logs aggregating
- [ ] SNS alerts configured
- [ ] GitHub Actions workflows running
- [ ] Application accessible via domain name
- [ ] Health checks passing on all services

## Common Issues and Solutions

### RDS Connection Issues

```bash
# Check security group
aws ec2 describe-security-groups --query 'SecurityGroups[0].IpPermissions'

# Add inbound rule for ECS security group
aws ec2 authorize-security-group-ingress \
  --group-id sg-xxx \
  --source-group sg-ecs-xxx \
  --protocol tcp \
  --port 5432
```

### ECS Task Failures

```bash
# View task logs
aws logs tail /ecs/ecommerce-api --follow

# Describe task
aws ecs describe-tasks \
  --cluster ecommerce-dev \
  --tasks arn:aws:ecs:us-east-1:xxx:task/ecommerce-api/xxx
```

### Image Push Failures

```bash
# Verify ECR login
aws ecr describe-repositories

# Re-authenticate if needed
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin xxx.dkr.ecr.us-east-1.amazonaws.com
```

## Rollback Procedure

```bash
# Rollback to previous task definition
aws ecs update-service \
  --cluster ecommerce-prod \
  --service ecommerce-api \
  --task-definition ecommerce-api:5

# Verify service
aws ecs describe-services \
  --cluster ecommerce-prod \
  --services ecommerce-api
```

## Cost Estimation

Monthly costs (approximate, dev environment):

| Service | Instance | Cost |
|---------|----------|------|
| ECS Fargate | 2 vCPU, 4GB RAM | $40/month |
| RDS | t3.small, 20GB | $25/month |
| ALB | 1 ALB | $16/month |
| CloudFront | 1GB transfer | $5/month |
| S3 | 10GB storage | $0.23/month |
| **Total** | | **~$90/month** |

Production costs will be 3-5x higher due to Auto-scaling and Multi-AZ deployment.

## Next Steps

1. Deploy to development environment
2. Run integration tests
3. Promote to staging
4. User acceptance testing (UAT)
5. Deploy to production
6. Monitor and optimize
7. Scale based on demand

For detailed troubleshooting, see [TROUBLESHOOTING.md](TROUBLESHOOTING.md).
