#!/bin/bash

# Health Check Script - Verify service health

ENVIRONMENT="${1:-dev}"
AWS_REGION="${2:-eu-west-1}"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}=== Health Check for $ENVIRONMENT ===${NC}"

CLUSTER_NAME="ecommerce-cluster-${ENVIRONMENT}"

# Check ECS services
check_ecs_services() {
    echo -e "${YELLOW}Checking ECS services...${NC}"
    
    SERVICES=("api" "web" "invoice")
    
    for SERVICE in "${SERVICES[@]}"; do
        SERVICE_NAME="ecommerce-${SERVICE}-service-${ENVIRONMENT}"
        
        RUNNING=$(aws ecs describe-services \
            --cluster "$CLUSTER_NAME" \
            --services "$SERVICE_NAME" \
            --region "$AWS_REGION" \
            --query 'services[0].runningCount' \
            --output text 2>/dev/null)
        
        DESIRED=$(aws ecs describe-services \
            --cluster "$CLUSTER_NAME" \
            --services "$SERVICE_NAME" \
            --region "$AWS_REGION" \
            --query 'services[0].desiredCount' \
            --output text 2>/dev/null)
        
        if [ -z "$RUNNING" ] || [ -z "$DESIRED" ]; then
            echo -e "${RED}✗ Service $SERVICE not found${NC}"
        elif [ "$RUNNING" == "$DESIRED" ]; then
            echo -e "${GREEN}✓ Service $SERVICE running ($RUNNING/$DESIRED tasks)${NC}"
        else
            echo -e "${YELLOW}◐ Service $SERVICE deploying ($RUNNING/$DESIRED tasks)${NC}"
        fi
    done
}

# Check ALB health
check_alb_health() {
    echo -e "${YELLOW}Checking ALB health...${NC}"
    
    ALB_ARN=$(aws elbv2 describe-load-balancers \
        --query "LoadBalancers[?contains(LoadBalancerName, 'ecommerce-alb-${ENVIRONMENT}')].LoadBalancerArn" \
        --region "$AWS_REGION" \
        --output text 2>/dev/null)
    
    if [ -z "$ALB_ARN" ]; then
        echo -e "${RED}✗ ALB not found${NC}"
        return
    fi
    
    TARGET_GROUPS=$(aws elbv2 describe-target-groups \
        --load-balancer-arn "$ALB_ARN" \
        --region "$AWS_REGION" \
        --query 'TargetGroups[].TargetGroupArn' \
        --output text 2>/dev/null)
    
    for TG_ARN in $TARGET_GROUPS; do
        TG_NAME=$(aws elbv2 describe-target-groups \
            --target-group-arns "$TG_ARN" \
            --region "$AWS_REGION" \
            --query 'TargetGroups[0].TargetGroupName' \
            --output text)
        
        HEALTHY=$(aws elbv2 describe-target-health \
            --target-group-arn "$TG_ARN" \
            --region "$AWS_REGION" \
            --query 'TargetHealthDescriptions[?TargetHealth.State==`healthy`] | length(@)' \
            --output text)
        
        TOTAL=$(aws elbv2 describe-target-health \
            --target-group-arn "$TG_ARN" \
            --region "$AWS_REGION" \
            --query 'length(TargetHealthDescriptions)' \
            --output text)
        
        if [ "$HEALTHY" == "$TOTAL" ] && [ "$TOTAL" -gt 0 ]; then
            echo -e "${GREEN}✓ Target group $TG_NAME healthy ($HEALTHY/$TOTAL)${NC}"
        elif [ "$TOTAL" == "0" ]; then
            echo -e "${YELLOW}◐ Target group $TG_NAME has no targets${NC}"
        else
            echo -e "${YELLOW}◐ Target group $TG_NAME has unhealthy targets ($HEALTHY/$TOTAL)${NC}"
        fi
    done
}

# Check RDS health
check_rds_health() {
    echo -e "${YELLOW}Checking RDS health...${NC}"
    
    DB_INSTANCE="ecommerce-db-${ENVIRONMENT}"
    
    STATUS=$(aws rds describe-db-instances \
        --db-instance-identifier "$DB_INSTANCE" \
        --region "$AWS_REGION" \
        --query 'DBInstances[0].DBInstanceStatus' \
        --output text 2>/dev/null)
    
    if [ -z "$STATUS" ]; then
        echo -e "${RED}✗ RDS instance not found${NC}"
        return
    fi
    
    if [ "$STATUS" == "available" ]; then
        echo -e "${GREEN}✓ RDS instance available${NC}"
    else
        echo -e "${YELLOW}◐ RDS instance status: $STATUS${NC}"
    fi
}

# Check CloudWatch logs
check_logs() {
    echo -e "${YELLOW}Checking recent logs...${NC}"
    
    SERVICES=("api" "web" "invoice")
    
    for SERVICE in "${SERVICES[@]}"; do
        LOG_GROUP="/ecs/ecommerce-${SERVICE}-${ENVIRONMENT}"
        
        ERRORS=$(aws logs filter-log-events \
            --log-group-name "$LOG_GROUP" \
            --start-time $(($(date +%s) - 3600))000 \
            --filter-pattern "ERROR" \
            --region "$AWS_REGION" \
            --query 'events | length(@)' \
            --output text 2>/dev/null)
        
        if [ "$ERRORS" -eq 0 ] 2>/dev/null; then
            echo -e "${GREEN}✓ $SERVICE logs - no errors${NC}"
        elif [ -n "$ERRORS" ] && [ "$ERRORS" -gt 0 ]; then
            echo -e "${YELLOW}◐ $SERVICE logs - $ERRORS errors in last hour${NC}"
        fi
    done
}

# Main checks
echo ""
check_ecs_services
echo ""
check_alb_health
echo ""
check_rds_health
echo ""
check_logs
echo ""
echo -e "${GREEN}=== Health check complete ===${NC}"
