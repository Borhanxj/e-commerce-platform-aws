# Private DNS so the API can reach the invoice service at
# invoice.internal.local:8080 without hard-coding an ALB.

resource "aws_service_discovery_private_dns_namespace" "internal" {
  name        = "internal.local"
  description = "Internal service discovery for ${var.project_name}-${var.environment}"
  vpc         = aws_vpc.main.id
}

resource "aws_service_discovery_service" "invoice" {
  name = "invoice"

  dns_config {
    namespace_id = aws_service_discovery_private_dns_namespace.internal.id

    dns_records {
      ttl  = 10
      type = "A"
    }

    routing_policy = "MULTIVALUE"
  }

  health_check_custom_config {
    failure_threshold = 1
  }
}
