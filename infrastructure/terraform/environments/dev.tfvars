# Development environment configuration
environment = "dev"
aws_region  = "us-east-1"

# VPC
vpc_cidr               = "10.0.0.0/16"
public_subnet_cidrs    = ["10.0.1.0/24", "10.0.2.0/24"]
private_subnet_cidrs   = ["10.0.11.0/24", "10.0.12.0/24"]

# RDS - dev uses small instance
db_instance_class       = "db.t3.micro"
db_allocated_storage    = 20
db_multi_az             = false
db_backup_retention_days = 7

# ECS - dev uses single task per service
ecs_task_cpu         = 256
ecs_task_memory      = 512
ecs_desired_count    = 1
ecs_min_capacity     = 1
ecs_max_capacity     = 2

# Application
app_port = 3000
web_port = 3000

# Security
enable_deletion_protection = false
enable_detailed_monitoring = false

tags = {
  CostCenter = "dev"
  AutoShutdown = "true"
}
