# Staging environment configuration
environment = "staging"
aws_region  = "eu-west-1"

# VPC
vpc_cidr               = "10.1.0.0/16"
public_subnet_cidrs    = ["10.1.1.0/24", "10.1.2.0/24"]
private_subnet_cidrs   = ["10.1.11.0/24", "10.1.12.0/24"]

# RDS - staging uses small instance
db_instance_class       = "db.t3.small"
db_allocated_storage    = 30
db_multi_az             = false
db_backup_retention_days = 14

# ECS - staging uses 2 tasks for testing
ecs_task_cpu         = 512
ecs_task_memory      = 1024
ecs_desired_count    = 2
ecs_min_capacity     = 2
ecs_max_capacity     = 4

# Application
app_port = 3000
web_port = 80

# SES / GitHub OIDC — override before apply
ses_sender_email = "CHANGE_ME@example.com"
github_repo      = "kacmazozan/e-commerce-platform-aws"
github_branch    = "refs/heads/main"

# Security
enable_deletion_protection = true
enable_detailed_monitoring = true

tags = {
  CostCenter = "staging"
  AutoShutdown = "false"
}
