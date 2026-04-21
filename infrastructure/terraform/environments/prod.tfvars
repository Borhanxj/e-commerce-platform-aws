# Production environment configuration
environment = "prod"
aws_region  = "us-east-1"

# VPC
vpc_cidr               = "10.2.0.0/16"
public_subnet_cidrs    = ["10.2.1.0/24", "10.2.2.0/24"]
private_subnet_cidrs   = ["10.2.11.0/24", "10.2.12.0/24"]

# RDS - production uses larger instance with Multi-AZ
db_instance_class       = "db.t3.medium"
db_allocated_storage    = 100
db_multi_az             = true
db_backup_retention_days = 30

# ECS - production uses auto-scaling
ecs_task_cpu         = 512
ecs_task_memory      = 1024
ecs_desired_count    = 3
ecs_min_capacity     = 3
ecs_max_capacity     = 10

# Application
app_port = 3000
web_port = 3000

# Security
enable_deletion_protection = true
enable_detailed_monitoring = true

tags = {
  CostCenter = "ops"
  AutoShutdown = "false"
  CriticalService = "true"
}
