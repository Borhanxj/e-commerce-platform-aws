# SES email identity + SMTP credentials for the invoice service.
#
# NOTE: In SES sandbox mode you can only send to *verified* recipients.
# The sender identity below must be verified manually (check the inbox for
# the AWS verification email after the first apply).

variable "ses_sender_email" {
  description = "Email address used as the From: for invoice emails. Must be verifiable in SES."
  type        = string
}

resource "aws_ses_email_identity" "sender" {
  email = var.ses_sender_email
}

# IAM user whose access key is used as the SES SMTP username/password.
resource "aws_iam_user" "ses_smtp" {
  name = "${var.project_name}-ses-smtp-${var.environment}"
  path = "/system/"
}

resource "aws_iam_user_policy" "ses_smtp" {
  name = "ses-send"
  user = aws_iam_user.ses_smtp.name

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect   = "Allow"
        Action   = ["ses:SendRawEmail", "ses:SendEmail"]
        Resource = "*"
      }
    ]
  })
}

resource "aws_iam_access_key" "ses_smtp" {
  user = aws_iam_user.ses_smtp.name
}

# The SES SMTP password is a region-specific v4 HMAC of the secret key.
# Terraform exposes it directly as `ses_smtp_password_v4`.
resource "aws_secretsmanager_secret" "ses_smtp" {
  name                    = "${var.project_name}-ses-smtp-${var.environment}"
  recovery_window_in_days = 0
}

resource "aws_secretsmanager_secret_version" "ses_smtp" {
  secret_id = aws_secretsmanager_secret.ses_smtp.id
  secret_string = jsonencode({
    username = aws_iam_access_key.ses_smtp.id
    password = aws_iam_access_key.ses_smtp.ses_smtp_password_v4
  })
}

# Expose split secret ARNs so the task definition can pull each value individually.
output "ses_smtp_endpoint" {
  value = "email-smtp.${var.aws_region}.amazonaws.com"
}

output "ses_smtp_secret_arn" {
  value     = aws_secretsmanager_secret.ses_smtp.arn
  sensitive = true
}
