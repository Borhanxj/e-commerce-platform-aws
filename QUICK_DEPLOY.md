# AWS Deployment - Step by Step

## Phase 1: Local Setup & Prerequisites

### 1.1 Install Required Tools
```bash
# AWS CLI v2 (check: aws --version)
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install

# Terraform (check: terraform --version)
wget https://releases.hashicorp.com/terraform/1.5.0/terraform_1.5.0_linux_amd64.zip
unzip terraform_1.5.0_linux_amd64.zip
sudo mv terraform /usr/local/bin/

# Docker (check: docker --version)
sudo apt-get install docker.io docker-compose

# Git (check: git --version)
```

### 1.2 Configure AWS CLI
```bash
aws configure
# Enter:
# AWS Access Key ID: [your-access-key]
# AWS Secret Access Key: [your-secret-key]
# Default region name: us-east-1
# Default output format: json

# Verify
aws sts get-caller-identity
```

---

## Phase 2: Setup Terraform Backend

### 2.1 Create S3 Bucket for Terraform State
```bash
BUCKET_NAME="ecommerce-tf-state-$(date +%s)"
aws s3 mb s3://$BUCKET_NAME --region us-east-1
aws s3api put-bucket-versioning --bucket $BUCKET_NAME --versioning-configuration Status=Enabled
echo "Bucket Name: $BUCKET_NAME"
```

### 2.2 Create DynamoDB Lock Table
```bash
aws dynamodb create-table \
  --table-name terraform-locks \
  --attribute-definitions AttributeName=LockID,AttributeType=S \
  --key-schema AttributeName=LockID,KeyType=HASH \
  --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5 \
  --region us-east-1
```

### 2.3 Update Terraform Backend Config
```bash
cd /home/borhan/university/cs436/project/e-commerce-platform-aws/infrastructure/terraform

# Edit provider.tf - uncomment backend block:
# Replace "ecommerce-tf-state-xxx" with your actual bucket name
```

---

## Phase 3: Build & Push Docker Images

### 3.1 Create ECR Repositories
```bash
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
REGION=us-east-1

for service in ecommerce-api ecommerce-web ecommerce-invoice; do
  aws ecr create-repository --repository-name $service --region $REGION
done

echo "ECR Registry: $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com"
```

### 3.2 Build Docker Images
```bash
cd /home/borhan/university/cs436/project/e-commerce-platform-aws

# Build API
cd services/api
docker build -t ecommerce-api:latest .

# Build Web
cd ../web
docker build -t ecommerce-web:latest .

# Build Invoice
cd ../invoice
docker build -t ecommerce-invoice:latest .
```

### 3.3 Push to ECR
```bash
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
REGION=us-east-1
REGISTRY="$ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com"

# Login to ECR
aws ecr get-login-password --region $REGION | \
  docker login --username AWS --password-stdin $REGISTRY

# Tag and push API
docker tag ecommerce-api:latest $REGISTRY/ecommerce-api:latest
docker push $REGISTRY/ecommerce-api:latest

# Tag and push Web
docker tag ecommerce-web:latest $REGISTRY/ecommerce-web:latest
docker push $REGISTRY/ecommerce-web:latest

# Tag and push Invoice
docker tag ecommerce-invoice:latest $REGISTRY/ecommerce-invoice:latest
docker push $REGISTRY/ecommerce-invoice:latest
```

---

## Phase 4: Deploy Infrastructure with Terraform

### 4.1 Initialize Terraform
```bash
cd /home/borhan/university/cs436/project/e-commerce-platform-aws/infrastructure/terraform

terraform init
```

### 4.2 Plan Development Environment
```bash
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
REGISTRY="$ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com"

terraform plan \
  -var-file="environments/dev.tfvars" \
  -var="api_image_url=$REGISTRY/ecommerce-api:latest" \
  -var="web_image_url=$REGISTRY/ecommerce-web:latest" \
  -var="invoice_image_url=$REGISTRY/ecommerce-invoice:latest" \
  -out=tfplan-dev

# Review output
terraform show tfplan-dev
```

### 4.3 Apply to Development
```bash
terraform apply tfplan-dev

# Wait 5-10 minutes for infrastructure to be created
```

### 4.4 Get Infrastructure Details
```bash
terraform output -json > deployment-dev-info.json
cat deployment-dev-info.json

# Extract key values for later use
ALB_DNS=$(terraform output -raw alb_dns_name)
RDS_ENDPOINT=$(terraform output -raw rds_endpoint)
ECS_CLUSTER=$(terraform output -raw ecs_cluster_name)

echo "ALB DNS: $ALB_DNS"
echo "RDS Endpoint: $RDS_ENDPOINT"
echo "ECS Cluster: $ECS_CLUSTER"
```

---

## Phase 5: Database Setup

### 5.1 Get RDS Endpoint
```bash
RDS_ENDPOINT=$(terraform output -raw rds_endpoint | cut -d: -f1)
CLUSTER="ecommerce-cluster-dev"

echo "RDS Endpoint: $RDS_ENDPOINT"
```

### 5.2 Run Database Migrations
```bash
CLUSTER="ecommerce-cluster-dev"
SUBNETS=$(aws ec2 describe-subnets \
  --filters "Name=vpc-id,Values=$(aws ec2 describe-vpcs \
    --filters "Name=tag:Name,Values=ecommerce-vpc-dev" \
    --query 'Vpcs[0].VpcId' --output text)" \
  --query 'Subnets[0:2].SubnetId' --output text)

SECURITY_GROUP=$(aws ec2 describe-security-groups \
  --filters "Name=group-name,Values=ecommerce-ecs-tasks-sg-dev" \
  --query 'SecurityGroups[0].GroupId' --output text)

aws ecs run-task \
  --cluster $CLUSTER \
  --task-definition ecommerce-api-dev:1 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[${SUBNETS// /,}],securityGroups=[$SECURITY_GROUP],assignPublicIp=DISABLED}" \
  --overrides '{
    "containerOverrides": [{
      "name": "api",
      "command": ["npm", "run", "migrate:up"]
    }]
  }' \
  --region us-east-1

# Wait 5 minutes, then check logs
aws logs tail /ecs/ecommerce-api-dev --follow
```

### 5.3 Seed Initial Data
```bash
CLUSTER="ecommerce-cluster-dev"
SUBNETS=$(aws ec2 describe-subnets \
  --filters "Name=vpc-id,Values=$(aws ec2 describe-vpcs \
    --filters "Name=tag:Name,Values=ecommerce-vpc-dev" \
    --query 'Vpcs[0].VpcId' --output text)" \
  --query 'Subnets[0:2].SubnetId' --output text)

SECURITY_GROUP=$(aws ec2 describe-security-groups \
  --filters "Name=group-name,Values=ecommerce-ecs-tasks-sg-dev" \
  --query 'SecurityGroups[0].GroupId' --output text)

for script in seed-admin seed-sales-manager seed-product-manager seed-products; do
  aws ecs run-task \
    --cluster $CLUSTER \
    --task-definition ecommerce-api-dev:1 \
    --launch-type FARGATE \
    --network-configuration "awsvpcConfiguration={subnets=[${SUBNETS// /,}],securityGroups=[$SECURITY_GROUP],assignPublicIp=DISABLED}" \
    --overrides "{
      \"containerOverrides\": [{
        \"name\": \"api\",
        \"command\": [\"node\", \"scripts/$script.js\"]
      }]
    }" \
    --region us-east-1
done

echo "Seed tasks submitted. Check CloudWatch logs in 5 minutes."
```

---

## Phase 6: Verify Deployment

### 6.1 Check ECS Services
```bash
CLUSTER="ecommerce-cluster-dev"

aws ecs describe-services \
  --cluster $CLUSTER \
  --services ecommerce-api-service-dev ecommerce-web-service-dev \
  --query 'services[*].[serviceName,desiredCount,runningCount,status]' \
  --output table
```

### 6.2 Check ALB Health
```bash
ALB_DNS=$(terraform output -raw alb_dns_name)

ALB_ARN=$(aws elbv2 describe-load-balancers \
  --query "LoadBalancers[?LoadBalancerName=='ecommerce-alb-dev'].LoadBalancerArn" \
  --output text)

aws elbv2 describe-target-groups \
  --load-balancer-arn $ALB_ARN \
  --query 'TargetGroups[*].TargetGroupArn' \
  --output text | xargs -I {} aws elbv2 describe-target-health \
  --target-group-arn {} \
  --query 'TargetHealthDescriptions[*].[Target.Id,TargetHealth.State]' \
  --output table
```

### 6.3 Check CloudWatch Logs
```bash
# Check API logs
aws logs tail /ecs/ecommerce-api-dev --follow --since 5m

# Check Web logs
aws logs tail /ecs/ecommerce-web-dev --follow --since 5m

# Check for errors
aws logs filter-log-events \
  --log-group-name /ecs/ecommerce-api-dev \
  --filter-pattern "ERROR" \
  --query 'events[*].[timestamp,message]' \
  --output text
```

---

## Phase 7: Configure CloudWatch Alarms

### 7.1 CPU Alarm
```bash
CLUSTER="ecommerce-cluster-dev"

aws cloudwatch put-metric-alarm \
  --alarm-name ecommerce-api-cpu-high-dev \
  --alarm-description "Alert when API CPU > 80%" \
  --metric-name CPUUtilization \
  --namespace AWS/ECS \
  --statistic Average \
  --period 300 \
  --threshold 80 \
  --comparison-operator GreaterThanThreshold \
  --evaluation-periods 1 \
  --dimensions Name=ServiceName,Value=ecommerce-api-service-dev Name=ClusterName,Value=$CLUSTER
```

### 7.2 RDS Alarm
```bash
aws cloudwatch put-metric-alarm \
  --alarm-name ecommerce-rds-cpu-high-dev \
  --alarm-description "Alert when RDS CPU > 80%" \
  --metric-name CPUUtilization \
  --namespace AWS/RDS \
  --statistic Average \
  --period 300 \
  --threshold 80 \
  --comparison-operator GreaterThanThreshold \
  --evaluation-periods 1 \
  --dimensions Name=DBInstanceIdentifier,Value=ecommerce-db-dev
```

---

## Phase 8: Setup DNS (Optional)

### 8.1 Create Route 53 Record (if you have a domain)
```bash
HOSTED_ZONE_ID="your-zone-id"  # Get from Route 53
ALB_DNS=$(terraform output -raw alb_dns_name)

aws route53 change-resource-record-sets \
  --hosted-zone-id $HOSTED_ZONE_ID \
  --change-batch '{
    "Changes": [{
      "Action": "CREATE",
      "ResourceRecordSet": {
        "Name": "api.yourdomain.com",
        "Type": "CNAME",
        "TTL": 300,
        "ResourceRecords": [{"Value": "'$ALB_DNS'"}]
      }
    }]
  }'
```

---

## Phase 9: Enable CI/CD (GitHub Actions)

### 9.1 Create GitHub Secrets
```bash
# In GitHub repo: Settings → Secrets and variables → Actions

# Add these secrets:
AWS_ACCESS_KEY_ID=<your-access-key>
AWS_SECRET_ACCESS_KEY=<your-secret-key>
AWS_REGION=us-east-1
AWS_ACCOUNT_ID=<your-account-id>
ECR_REGISTRY=<your-account-id>.dkr.ecr.us-east-1.amazonaws.com
```

### 9.2 Push to GitHub
```bash
cd /home/borhan/university/cs436/project/e-commerce-platform-aws

git add .
git commit -m "feat: add AWS infrastructure and CI/CD pipeline"
git push origin main

# Workflows will trigger automatically
```

---

## Phase 10: Test Application

### 10.1 Get Service URLs
```bash
ALB_DNS=$(terraform output -raw alb_dns_name)

echo "Frontend: http://$ALB_DNS"
echo "API: http://$ALB_DNS/api"
echo "Health: http://$ALB_DNS/api/health"
```

### 10.2 Test Health Endpoints
```bash
ALB_DNS=$(terraform output -raw alb_dns_name)

curl http://$ALB_DNS/api/health
curl http://$ALB_DNS/
```

### 10.3 Test Login
```bash
# Open browser: http://<ALB_DNS>
# Admin Dashboard: /admin
# Email: admin@example.com
# Password: admin123456
```

---

## Phase 11: Deploy Staging & Production (Optional)

### 11.1 Plan Staging
```bash
cd /home/borhan/university/cs436/project/e-commerce-platform-aws/infrastructure/terraform

terraform plan \
  -var-file="environments/staging.tfvars" \
  -var="api_image_url=$REGISTRY/ecommerce-api:latest" \
  -var="web_image_url=$REGISTRY/ecommerce-web:latest" \
  -var="invoice_image_url=$REGISTRY/ecommerce-invoice:latest" \
  -out=tfplan-staging

terraform apply tfplan-staging
```

### 11.2 Plan Production
```bash
terraform plan \
  -var-file="environments/prod.tfvars" \
  -var="api_image_url=$REGISTRY/ecommerce-api:latest" \
  -var="web_image_url=$REGISTRY/ecommerce-web:latest" \
  -var="invoice_image_url=$REGISTRY/ecommerce-invoice:latest" \
  -out=tfplan-prod

terraform apply tfplan-prod
```

---

## Cleanup (Optional)

### Destroy Development Environment
```bash
cd /home/borhan/university/cs436/project/e-commerce-platform-aws/infrastructure/terraform

terraform destroy -var-file="environments/dev.tfvars"
```

### Remove ECR Images
```bash
for service in ecommerce-api ecommerce-web ecommerce-invoice; do
  aws ecr delete-repository --repository-name $service --force
done
```

---

## Troubleshooting

### Check Terraform State
```bash
terraform state list
terraform state show aws_ecs_cluster.main
```

### Check ECS Logs
```bash
aws logs tail /ecs/ecommerce-api-dev --follow
```

### Check RDS Connection
```bash
# From an ECS task container
psql -h $RDS_ENDPOINT -U postgres -d ecommerce
```

### Update Service (after code changes)
```bash
CLUSTER="ecommerce-cluster-dev"
SERVICE="ecommerce-api-service-dev"

aws ecs update-service \
  --cluster $CLUSTER \
  --service $SERVICE \
  --force-new-deployment
```

---

## Summary

**Time needed**: ~30-45 minutes
**Cost per month**: ~$40 (dev) | ~$80 (staging) | ~$220 (prod)

**What you get**:
- ✅ Running backend API
- ✅ Running frontend
- ✅ PostgreSQL database
- ✅ Load balancer
- ✅ Auto-scaling
- ✅ CloudWatch monitoring
- ✅ Automated CI/CD
