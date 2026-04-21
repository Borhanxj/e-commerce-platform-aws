# RDS PostgreSQL + connection-string secret for the API task.

resource "aws_db_subnet_group" "main" {
  name       = "${var.project_name}-db-subnet-group-${var.environment}"
  subnet_ids = aws_subnet.private[*].id

  tags = {
    Name = "${var.project_name}-db-subnet-group-${var.environment}"
  }
}

# URL-safe (no @:/? chars) so the password can be embedded in a connection string.
resource "random_password" "db_password" {
  length           = 32
  special          = true
  override_special = "-_"
}

resource "aws_db_instance" "main" {
  identifier                = "${var.project_name}-db-${var.environment}"
  engine                    = "postgres"
  engine_version            = var.db_engine_version
  instance_class            = var.db_instance_class
  allocated_storage         = var.db_allocated_storage
  db_name                   = "ecommerce"
  username                  = "postgres"
  password                  = random_password.db_password.result
  db_subnet_group_name      = aws_db_subnet_group.main.name
  vpc_security_group_ids    = [aws_security_group.rds.id]
  skip_final_snapshot       = var.environment == "prod" ? false : true
  final_snapshot_identifier = var.environment == "prod" ? "${var.project_name}-db-final-snap-${formatdate("YYYY-MM-DD-hhmm", timestamp())}" : null
  multi_az                  = var.db_multi_az
  backup_retention_period   = var.db_backup_retention_days
  backup_window             = "03:00-04:00"
  maintenance_window        = "sun:04:00-sun:05:00"
  storage_encrypted         = true
  deletion_protection       = var.environment == "prod" ? true : false
  publicly_accessible       = false

  tags = {
    Name = "${var.project_name}-db-${var.environment}"
  }
}

# Full Postgres connection string for the API — matches DATABASE_URL shape
# expected by backend/db.js.
resource "aws_secretsmanager_secret" "database_url" {
  name                    = "${var.project_name}-database-url-${var.environment}"
  recovery_window_in_days = 0

  tags = {
    Name = "${var.project_name}-database-url-${var.environment}"
  }
}

resource "aws_secretsmanager_secret_version" "database_url" {
  secret_id     = aws_secretsmanager_secret.database_url.id
  secret_string = "postgresql://${aws_db_instance.main.username}:${random_password.db_password.result}@${aws_db_instance.main.address}:${aws_db_instance.main.port}/${aws_db_instance.main.db_name}"
}

# CloudWatch alarms
resource "aws_cloudwatch_metric_alarm" "rds_cpu" {
  alarm_name          = "${var.project_name}-rds-cpu-high-${var.environment}"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "CPUUtilization"
  namespace           = "AWS/RDS"
  period              = "300"
  statistic           = "Average"
  threshold           = "80"
  alarm_description   = "RDS CPU utilization is high"

  dimensions = {
    DBInstanceIdentifier = aws_db_instance.main.id
  }
}

resource "aws_cloudwatch_metric_alarm" "rds_connections" {
  alarm_name          = "${var.project_name}-rds-connections-high-${var.environment}"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "DatabaseConnections"
  namespace           = "AWS/RDS"
  period              = "300"
  statistic           = "Average"
  threshold           = "80"
  alarm_description   = "RDS connections count is high"

  dimensions = {
    DBInstanceIdentifier = aws_db_instance.main.id
  }
}
