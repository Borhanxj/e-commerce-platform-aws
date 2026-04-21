environment = "dev"
aws_region  = "eu-west-1"

# VPC
vpc_cidr             = "10.0.0.0/16"
public_subnet_cidrs  = ["10.0.1.0/24", "10.0.2.0/24"]
private_subnet_cidrs = ["10.0.11.0/24", "10.0.12.0/24"]

# RDS — cheapest single-AZ setup for a school demo.
db_instance_class        = "db.t4g.micro"
db_allocated_storage     = 20
db_multi_az              = false
db_backup_retention_days = 1
db_engine_version        = "16.3"

# ECS — one task per service.
ecs_task_cpu      = 256
ecs_task_memory   = 512
ecs_desired_count = 1
ecs_min_capacity  = 1
ecs_max_capacity  = 2

# Ports
app_port = 3000
web_port = 80

# Security
enable_deletion_protection = false
enable_detailed_monitoring = false

# REQUIRED — must be a real address you control; SES will email a verification link.
# Update before running `terraform apply`.
ses_sender_email = "ozan.kacmaz@sabanciuniv.edu"

# REQUIRED — GitHub repo allowed to assume the OIDC deploy role.
github_repo   = "kacmazozan/e-commerce-platform-aws"
github_branch = "refs/heads/main"

tags = {
  CostCenter   = "dev"
  AutoShutdown = "true"
}
