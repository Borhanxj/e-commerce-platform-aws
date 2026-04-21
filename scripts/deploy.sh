#!/bin/bash

# Deploy Script - Deploy services to AWS ECS

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
ENVIRONMENT="${1:-dev}"
AWS_REGION="${2:-us-east-1}"

# Color output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}=== E-Commerce Platform AWS Deployment ===${NC}"
echo "Environment: $ENVIRONMENT"
echo "Region: $AWS_REGION"

# Validate environment
if [[ ! "$ENVIRONMENT" =~ ^(dev|staging|prod)$ ]]; then
    echo -e "${RED}ERROR: Invalid environment. Must be dev, staging, or prod${NC}"
    exit 1
fi

# Check prerequisites
check_prerequisites() {
    echo -e "${YELLOW}Checking prerequisites...${NC}"
    
    if ! command -v aws &> /dev/null; then
        echo -e "${RED}ERROR: AWS CLI not found. Please install AWS CLI v2${NC}"
        exit 1
    fi
    
    if ! command -v terraform &> /dev/null; then
        echo -e "${RED}ERROR: Terraform not found. Please install Terraform${NC}"
        exit 1
    fi
    
    if ! command -v docker &> /dev/null; then
        echo -e "${RED}ERROR: Docker not found. Please install Docker${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✓ All prerequisites met${NC}"
}

# Build Docker images
build_images() {
    echo -e "${YELLOW}Building Docker images...${NC}"
    
    # Build API
    echo "Building API image..."
    cd "$PROJECT_ROOT/services/api"
    docker build -t "ecommerce-api:latest" -f Dockerfile .
    
    # Build Web
    echo "Building Web image..."
    cd "$PROJECT_ROOT/services/web"
    docker build -t "ecommerce-web:latest" -f Dockerfile .
    
    # Build Invoice
    echo "Building Invoice image..."
    cd "$PROJECT_ROOT/services/invoice"
    docker build -t "ecommerce-invoice:latest" -f Dockerfile .
    
    echo -e "${GREEN}✓ Docker images built successfully${NC}"
}

# Push images to ECR
push_to_ecr() {
    echo -e "${YELLOW}Pushing images to ECR...${NC}"
    
    ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
    ECR_REGISTRY="$ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com"
    
    # Login to ECR
    echo "Logging in to ECR..."
    aws ecr get-login-password --region $AWS_REGION | \
        docker login --username AWS --password-stdin $ECR_REGISTRY
    
    # Create repositories if they don't exist
    for repo in ecommerce-api ecommerce-web ecommerce-invoice; do
        if ! aws ecr describe-repositories --repository-names $repo --region $AWS_REGION 2>/dev/null; then
            echo "Creating ECR repository: $repo"
            aws ecr create-repository --repository-name $repo --region $AWS_REGION
        fi
    done
    
    # Tag and push images
    for image in api web invoice; do
        echo "Pushing ecommerce-$image to ECR..."
        docker tag "ecommerce-$image:latest" "$ECR_REGISTRY/ecommerce-$image:latest"
        docker tag "ecommerce-$image:latest" "$ECR_REGISTRY/ecommerce-$image:$ENVIRONMENT"
        docker push "$ECR_REGISTRY/ecommerce-$image:latest"
        docker push "$ECR_REGISTRY/ecommerce-$image:$ENVIRONMENT"
    done
    
    echo -e "${GREEN}✓ Images pushed to ECR${NC}"
    echo "ECR Registry: $ECR_REGISTRY"
}

# Deploy infrastructure with Terraform
deploy_infrastructure() {
    echo -e "${YELLOW}Deploying infrastructure with Terraform...${NC}"
    
    cd "$PROJECT_ROOT/infrastructure/terraform"
    
    # Get image URIs from ECR
    ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
    ECR_REGISTRY="$ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com"
    
    # Initialize Terraform
    echo "Initializing Terraform..."
    terraform init
    
    # Plan
    echo "Planning Terraform changes..."
    terraform plan \
        -var-file="environments/${ENVIRONMENT}.tfvars" \
        -var="api_image_url=$ECR_REGISTRY/ecommerce-api:latest" \
        -var="web_image_url=$ECR_REGISTRY/ecommerce-web:latest" \
        -var="invoice_image_url=$ECR_REGISTRY/ecommerce-invoice:latest" \
        -var="aws_region=$AWS_REGION" \
        -out=tfplan
    
    # Apply
    echo "Applying Terraform changes..."
    terraform apply tfplan
    
    # Get outputs
    echo -e "${GREEN}✓ Infrastructure deployed${NC}"
    terraform output -json > "$PROJECT_ROOT/deployment-${ENVIRONMENT}-info.json"
    echo "Deployment info saved to deployment-${ENVIRONMENT}-info.json"
}

# Run database migrations
run_migrations() {
    echo -e "${YELLOW}Running database migrations...${NC}"
    
    # Get ECS cluster and service names
    CLUSTER_NAME="ecommerce-cluster-${ENVIRONMENT}"
    SERVICE_NAME="ecommerce-api-service-${ENVIRONMENT}"
    
    # Run migration task
    TASK_DEF=$(aws ecs describe-services \
        --cluster $CLUSTER_NAME \
        --services $SERVICE_NAME \
        --region $AWS_REGION \
        --query 'services[0].taskDefinition' \
        --output text)
    
    echo "Running migrations on task definition: $TASK_DEF"
    aws ecs run-task \
        --cluster $CLUSTER_NAME \
        --task-definition $TASK_DEF \
        --launch-type FARGATE \
        --network-configuration "awsvpcConfiguration={subnets=[$(get_subnet_ids)],assignPublicIp=DISABLED}" \
        --overrides '{
            "containerOverrides": [{
                "name": "api",
                "command": ["npm", "run", "migrate:up"]
            }]
        }' \
        --region $AWS_REGION
    
    echo -e "${GREEN}✓ Migration task submitted${NC}"
    echo "Check CloudWatch logs for migration progress"
}

# Seed initial data
seed_database() {
    echo -e "${YELLOW}Seeding database with initial data...${NC}"
    
    CLUSTER_NAME="ecommerce-cluster-${ENVIRONMENT}"
    
    echo "Seeding admin account..."
    aws ecs run-task \
        --cluster $CLUSTER_NAME \
        --task-definition "ecommerce-api-${ENVIRONMENT}" \
        --launch-type FARGATE \
        --network-configuration "awsvpcConfiguration={subnets=[$(get_subnet_ids)],assignPublicIp=DISABLED}" \
        --overrides '{
            "containerOverrides": [{
                "name": "api",
                "command": ["node", "scripts/seed-admin.js"]
            }]
        }' \
        --region $AWS_REGION
    
    echo -e "${GREEN}✓ Seed tasks submitted${NC}"
}

# Get subnet IDs
get_subnet_ids() {
    aws ec2 describe-subnets \
        --filters "Name=vpc-id,Values=$(get_vpc_id)" "Name=map-public-ip-on-launch,Values=false" \
        --region $AWS_REGION \
        --query 'Subnets[0:2].SubnetId' \
        --output text | tr '\t' ','
}

# Get VPC ID
get_vpc_id() {
    aws ec2 describe-vpcs \
        --filters "Name=tag:Name,Values=ecommerce-vpc-${ENVIRONMENT}" \
        --region $AWS_REGION \
        --query 'Vpcs[0].VpcId' \
        --output text
}

# Verify deployment
verify_deployment() {
    echo -e "${YELLOW}Verifying deployment...${NC}"
    
    CLUSTER_NAME="ecommerce-cluster-${ENVIRONMENT}"
    
    # Check ECS services
    echo "Checking ECS services..."
    aws ecs list-services \
        --cluster $CLUSTER_NAME \
        --region $AWS_REGION \
        --query 'serviceArns' \
        --output text
    
    # Check task status
    echo "Checking task status..."
    aws ecs describe-services \
        --cluster $CLUSTER_NAME \
        --services "ecommerce-api-service-${ENVIRONMENT}" "ecommerce-web-service-${ENVIRONMENT}" \
        --region $AWS_REGION \
        --query 'services[*].[serviceName,desiredCount,runningCount]' \
        --output table
    
    echo -e "${GREEN}✓ Deployment verification complete${NC}"
}

# Main deployment flow
main() {
    check_prerequisites
    build_images
    push_to_ecr
    deploy_infrastructure
    echo ""
    echo -e "${GREEN}=== Deployment Complete ===${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Run migrations: ./scripts/deploy.sh migrate $ENVIRONMENT $AWS_REGION"
    echo "2. Seed database: ./scripts/deploy.sh seed $ENVIRONMENT $AWS_REGION"
    echo "3. Verify deployment: ./scripts/deploy.sh verify $ENVIRONMENT $AWS_REGION"
}

# Handle arguments
if [ "$1" == "migrate" ]; then
    run_migrations
elif [ "$1" == "seed" ]; then
    seed_database
elif [ "$1" == "verify" ]; then
    verify_deployment
else
    main
fi
