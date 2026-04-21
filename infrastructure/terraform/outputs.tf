output "vpc_id" {
  description = "VPC ID"
  value       = aws_vpc.main.id
}

output "public_subnet_ids" {
  description = "Public subnet IDs"
  value       = aws_subnet.public[*].id
}

output "private_subnet_ids" {
  description = "Private subnet IDs"
  value       = aws_subnet.private[*].id
}

output "alb_dns_name" {
  description = "ALB DNS name"
  value       = aws_lb.main.dns_name
}

output "alb_arn" {
  description = "ALB ARN"
  value       = aws_lb.main.arn
}

output "rds_endpoint" {
  description = "RDS database endpoint"
  value       = aws_db_instance.main.endpoint
  sensitive   = true
}

output "rds_port" {
  description = "RDS database port"
  value       = aws_db_instance.main.port
}

output "rds_database_name" {
  description = "RDS database name"
  value       = aws_db_instance.main.db_name
}

output "ecs_cluster_name" {
  description = "ECS cluster name"
  value       = aws_ecs_cluster.main.name
}

output "ecs_cluster_arn" {
  description = "ECS cluster ARN"
  value       = aws_ecs_cluster.main.arn
}

output "api_service_name" {
  description = "API ECS service name"
  value       = aws_ecs_service.api.name
}

output "web_service_name" {
  description = "Web ECS service name"
  value       = aws_ecs_service.web.name
}

output "invoice_service_name" {
  description = "Invoice ECS service name"
  value       = aws_ecs_service.invoice.name
}

output "cloudwatch_log_group_api" {
  description = "CloudWatch log group for API"
  value       = aws_cloudwatch_log_group.api.name
}

output "cloudwatch_log_group_web" {
  description = "CloudWatch log group for web"
  value       = aws_cloudwatch_log_group.web.name
}

output "cloudwatch_log_group_invoice" {
  description = "CloudWatch log group for invoice"
  value       = aws_cloudwatch_log_group.invoice.name
}

output "ecr_repository_urls" {
  description = "ECR repository URLs keyed by service name"
  value       = { for k, r in aws_ecr_repository.this : k => r.repository_url }
}

output "deployment_info" {
  description = "Deployment information"
  value = {
    environment           = var.environment
    region                = var.aws_region
    alb_url               = "http://${aws_lb.main.dns_name}"
    database_name         = aws_db_instance.main.db_name
    ecs_cluster           = aws_ecs_cluster.main.name
    task_cpu              = var.ecs_task_cpu
    task_memory           = var.ecs_task_memory
    desired_task_count    = var.ecs_desired_count
    api_port              = var.app_port
    web_port              = var.web_port
  }
}
