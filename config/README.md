# Environment Configuration Guide

This directory contains environment-specific configuration files for different AWS deployment environments.

## File Structure

- `dev.env` - Development environment (local testing on AWS)
- `staging.env` - Staging environment (pre-production testing)
- `prod.env` - Production environment (live application)

## Usage

### Local Development

```bash
# Copy dev.env to backend/.env
cp config/dev.env backend/.env
```

### AWS Deployment

For AWS deployments, **do not commit sensitive values to this directory**. Instead:

1. **Use AWS Secrets Manager** for sensitive data:
   - Database passwords
   - JWT secrets
   - SMTP credentials
   - API keys

2. **Use AWS Parameter Store** for non-sensitive configuration:
   - URLs and endpoints
   - Feature flags
   - Logging levels

3. **Load values in ECS Task Definition**:
   ```json
   {
     "secrets": [
       {
         "name": "DATABASE_URL",
         "valueFrom": "arn:aws:secretsmanager:region:account:secret:db-url"
       }
     ],
     "environment": [
       {
         "name": "API_BASE_URL",
         "value": "https://api.example.com"
       }
     ]
   }
   ```

## Environment Variables by Category

### Database
- `DATABASE_URL` - PostgreSQL connection string

### Authentication & Security
- `JWT_SECRET` - JWT signing key (SENSITIVE)
- `CORS_ORIGIN` - Allowed CORS origins
- `SESSION_SECURE` - Use secure cookies only
- `SESSION_HTTP_ONLY` - Only send cookies over HTTP
- `SESSION_SAME_SITE` - CSRF protection

### AWS Services
- `AWS_REGION` - AWS region
- `AWS_ACCOUNT_ID` - AWS account ID

### API Configuration
- `API_BASE_URL` - Public API endpoint
- `API_TIMEOUT` - Request timeout in ms

### Logging
- `LOG_LEVEL` - Logging level (debug, info, warn, error)
- `LOG_FORMAT` - Log format (json, text)

### Email/SMTP
- `SMTP_HOST` - Mail server host
- `SMTP_PORT` - Mail server port
- `SMTP_USER` - Mail server username (SENSITIVE)
- `SMTP_FROM` - From email address

### Feature Flags
- `ENABLE_DETAILED_MONITORING` - Enable CloudWatch detailed monitoring
- `ENABLE_DETAILED_LOGGING` - Enable verbose logging

### Rate Limiting
- `RATE_LIMIT_WINDOW_MS` - Request window in milliseconds
- `RATE_LIMIT_MAX_REQUESTS` - Max requests per window

## Managing Sensitive Data

### AWS Secrets Manager

Store sensitive data in Secrets Manager:

```bash
# Create secret
aws secretsmanager create-secret \
  --name ecommerce-db-password \
  --secret-string 'password123'

# Reference in ECS task definition
{
  "secrets": [
    {
      "name": "DATABASE_PASSWORD",
      "valueFrom": "arn:aws:secretsmanager:region:account:secret:ecommerce-db-password"
    }
  ]
}
```

### AWS Parameter Store

Store non-sensitive configuration:

```bash
# Create parameter
aws ssm put-parameter \
  --name /ecommerce/prod/api-base-url \
  --value 'https://api.example.com' \
  --type String

# Reference in application
const apiUrl = await aws.ssm.getParameter({
  Name: '/ecommerce/prod/api-base-url'
});
```

## Environment-Specific Guidelines

### Development
- Verbose logging (debug level)
- Detailed monitoring enabled
- Permissive CORS
- Local or test SMTP

### Staging
- Info level logging
- Detailed monitoring enabled
- Detailed logging enabled
- Staging SMTP server

### Production
- Warn/error level logging only
- Detailed if major features enabled
- Minimal logging (performance)
- AWS SES for email
- All data from Secrets Manager/Parameter Store
- No hardcoded secrets

## Security Best Practices

1. **Never commit .env files** to git (use `.gitignore`)
2. **Always use Secrets Manager** for passwords, keys, tokens
3. **Use encryption in transit** (HTTPS/TLS)
4. **Encrypt sensitive data at rest** in S3/RDS
5. **Rotate secrets regularly** in Secrets Manager
6. **Audit access** to sensitive values via CloudTrail
7. **Use IAM policies** to restrict access per environment
8. **Enable versioning** in Secrets Manager for rollback

## Loading Configuration in Application

### Backend (Express.js)

```javascript
// Load environment variables
require('dotenv').config();

// Or use AWS SDK for Secrets Manager
const AWS = require('aws-sdk');
const secretsManager = new AWS.SecretsManager();

const getSecret = async (secretName) => {
  try {
    const data = await secretsManager.getSecretValue({
      SecretId: secretName
    }).promise();
    return JSON.parse(data.SecretString);
  } catch (error) {
    console.error('Error retrieving secret:', error);
    throw error;
  }
};

// Usage
const dbPassword = await getSecret('ecommerce-db-password');
```

### Frontend (React/Vite)

```javascript
// Vite environment variables must start with VITE_
// config/prod.env or .env.production
VITE_API_BASE_URL=https://api.example.com
VITE_LOG_LEVEL=warn

// Access in application
console.log(import.meta.env.VITE_API_BASE_URL);
```

## Troubleshooting

### Missing Environment Variable Error
1. Check file is in correct location
2. Verify variable name spelling
3. Ensure .env file is loaded before application start
4. Check AWS Secrets Manager has the secret

### Invalid Database Connection
1. Verify DATABASE_URL format: `postgres://user:password@host:port/dbname`
2. Check RDS security groups allow ECS security group traffic
3. Verify credentials stored in Secrets Manager are correct
4. Test connection from ECS task container

### JWT Secret Not Loading
1. Verify JWT_SECRET exists in Secrets Manager
2. Check ECS task execution role has `secretsmanager:GetSecretValue` permission
3. Review CloudWatch logs for error details

## Deployment Workflow

```bash
# 1. Set up AWS Secrets Manager with all secrets
aws secretsmanager create-secret --name ecommerce-db-password --secret-string 'xxx'
aws secretsmanager create-secret --name ecommerce-jwt-secret --secret-string 'xxx'

# 2. Deploy infrastructure with Terraform
cd infrastructure/terraform
terraform apply -var-file="environments/prod.tfvars"

# 3. ECS services automatically load environment from:
#    - Secrets Manager (sensitive data)
#    - Parameter Store (non-sensitive)
#    - Task definition (common values)

# 4. Verify environment loaded correctly
docker exec <container-id> env | grep DATABASE_URL
```
