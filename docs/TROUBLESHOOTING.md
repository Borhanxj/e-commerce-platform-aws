# Troubleshooting Guide

## Common Issues and Solutions

### AWS Deployment Issues

#### 1. Terraform State Lock

**Problem:** `Error acquiring the lock`

```bash
# Solution: Remove stale lock
terraform force-unlock <LOCK_ID>

# Or reset state (dev only)
terraform destroy  # Remove all resources
rm -rf .terraform/
rm terraform.tfstate*
terraform init
```

#### 2. EC2/ECS Permission Denied

**Problem:** `AccessDenied: User is not authorized to perform: ecs:*`

```bash
# Solution: Check IAM permissions
# 1. Verify credentials with:
aws sts get-caller-identity

# 2. Attach required policy to IAM user/role
aws iam attach-user-policy \
  --user-name <username> \
  --policy-arn arn:aws:iam::aws:policy/AmazonECS_FullAccess
```

#### 3. RDS Connection Timeout

**Problem:** `ECONNREFUSED` or timeout connecting to RDS

```bash
# Solution: Check security groups
aws ec2 describe-security-groups \
  --group-ids sg-xxxxx \
  --query 'SecurityGroups[0].IpPermissions'

# Add ECS security group to RDS inbound rules
aws ec2 authorize-security-group-ingress \
  --group-id sg-rds-xxx \
  --source-group sg-ecs-xxx \
  --protocol tcp \
  --port 5432
```

#### 4. ECR Image Push Failed

**Problem:** `ImagePushFailure` or authentication error

```bash
# Solution: Re-authenticate with ECR
aws ecr get-login-password --region eu-west-1 | \
  docker login --username AWS --password-stdin <ACCOUNT_ID>.dkr.ecr.eu-west-1.amazonaws.com

# Verify repository exists
aws ecr describe-repositories --repository-names ecommerce-api

# If not, create it
aws ecr create-repository --repository-name ecommerce-api
```

### Database Issues

#### 1. Migration Failures

**Problem:** `Migration failed: already exists`

```bash
# Solution: Check migration status
npm run migrate:status

# Roll back and retry
npm run migrate:down

# Or create new migration with unique number
```

#### 2. Database Connection in Docker

**Problem:** `Cannot connect to database: ENOTFOUND db`

```bash
# Solution: Ensure services are on same network
docker-compose ps

# If db not running:
docker-compose up -d db

# Check connection string
echo $DATABASE_URL
# Should be: postgres://postgres:postgres@db:5432/ecommerce
```

#### 3. Database Locked

**Problem:** `database is locked`

```bash
# Solution: Kill blocking queries
docker-compose exec db psql -U postgres -d ecommerce -c "
  SELECT pg_terminate_backend(pid)
  FROM pg_stat_activity
  WHERE pid <> pg_backend_pid()
  AND query NOT ILIKE '%pg_stat_activity%';"

# Destroy and recreate
docker-compose down -v
docker-compose up db
```

### Docker Issues

#### 1. Out of Disk Space

**Problem:** `no space left on device`

```bash
# Solution: Clean up Docker
docker system prune -a --volumes
docker image prune -a
docker volume prune
docker container prune
```

#### 2. Port Already in Use

**Problem:** `Bind for 0.0.0.0:3000 failed: port is already allocated`

```bash
# Solution: Find and kill process
lsof -i :3000
kill -9 <PID>

# Or change port in docker-compose.yml
ports:
  - "3001:3000"  # Change to 3001
```

#### 3. Permission Denied Creating Volume

**Problem:** `permission denied` when mounting volumes

```bash
# Solution: Fix file permissions
sudo chown $(id -u):$(id -g) /path/to/project

# Or run Docker with user context
docker-compose up --user $(id -u):$(id -g)
```

### Application Issues

#### 1. API Returns 500 Error

**Problem:** Endpoint returns 500 Internal Server Error

```bash
# Solution: Check logs
docker-compose logs api

# Check specific error
docker-compose logs api | grep -i error

# Look for stack trace in logs
```

#### 2. Frontend Cannot Connect to API

**Problem:** Network error, CORS issues

```bash
# Solution: Check API is responding
curl http://localhost:3000/api/health

# Check CORS headers
curl -i http://localhost:3000/api/products

# Verify VITE_API_BASE_URL in .env
cat services/web/.env
```

#### 3. Authentication Token Invalid

**Problem:** JWT verification fails, 401 Unauthorized

```bash
# Solution: Check JWT_SECRET matches
echo $JWT_SECRET

# Clear browser storage and re-login
# In browser console:
localStorage.clear();
sessionStorage.clear();
```

#### 4. Password Reset Not Working

**Problem:** Reset email not sent or link invalid

```bash
# Solution: Check MailHog
# Open http://localhost:8025

# Check email configuration
cat services/api/.env | grep SMTP

# Verify email service is running
docker-compose ps mailserver invoice-api
```

### Performance Issues

#### 1. Slow Database Queries

**Problem:** Database queries taking too long

```bash
# Solution: Enable query logging
PGLOG_STATEMENT=all npm run dev

# Check slow queries
docker-compose exec db psql -U postgres -d ecommerce -c "
  SELECT query, calls, mean_time 
  FROM pg_stat_statements 
  ORDER BY mean_time DESC 
  LIMIT 5;"

# Add indexes if needed
CREATE INDEX idx_products_category ON products(category_id);
```

#### 2. High Memory Usage

**Problem:** Node process consuming excessive memory

```bash
# Solution: Check for memory leaks
docker stats

# Enable heap snapshots
node --expose-gc server.js

# Monitor memory over time
watch -n 1 'docker stats --no-stream'
```

#### 3. Slow Frontend Build

**Problem:** `npm run build` takes too long

```bash
# Solution: Analyze bundle
npm run build -- --analyze

# Remove unused dependencies
npm audit
npm uninstall <package>

# Use tree-shaking
npm run build -- --rollupOptions.treeshake
```

### Testing Issues

#### 1. Tests Pass Locally but Fail in CI

**Problem:** Tests running inconsistently

```bash
# Solution: Run tests exactly as CI does
# .github/workflows shows test command

# Run with same environment
npm test -- --passWithNoTests

# Check for timing issues
npm test -- --testTimeout=10000
```

#### 2. Database Tests Fail

**Problem:** Test database connection issues

```bash
# Solution: Ensure test database setup
npm run migrate:up --env test

# Check test configuration
cat jest.config.js

# Check DATABASE_URL for tests
echo $DATABASE_URL_TEST
```

#### 3. Intermittent Failures

**Problem:** Tests pass sometimes, fail others

```bash
# Solution: Check for race conditions
npm test -- --bail  # Stop on first failure

# Run single test multiple times
npm test -- LoginPage --runs=10

# Check for timeouts
npm test -- --testTimeout=5000
```

### Git and Version Control

#### 1. Merge Conflicts

**Problem:** Merge conflicts in migrations or config

```bash
# Solution: Resolve manually
git status  # See conflicted files
# Edit files to resolve conflicts
git add .
git commit -m "Resolve merge conflicts"

# After resolving, run migrations
npm run migrate:up
```

#### 2. Large Files in Git

**Problem:** Large files slow down git operations

```bash
# Solution: Use git lfs
git lfs install
git lfs track "*.sql"
git add .gitattributes

# Or remove large files
git rm --cached <large-file>
echo "<large-file>" >> .gitignore
```

### Logging and Monitoring

#### 1. Cannot Find Logs

**Problem:** Application logs not appearing

```bash
# Solution: Check log configuration
LOG_LEVEL=debug npm run dev

# Check stdout/stderr
docker-compose logs -f api 2>&1 | tee debug.log

# Enable verbose logging
DEBUG=* npm run dev
```

#### 2. CloudWatch Logs Empty

**Problem:** ECS logs not appearing in CloudWatch

```bash
# Solution: Check IAM permissions
aws iam get-role-policy --role-name ecsTaskExecutionRole --policy-name name

# Check log group exists
aws logs describe-log-groups --log-group-name-prefix /ecs/ecommerce

# Push logs manually to test
aws logs put-log-events \
  --log-group-name /ecs/ecommerce-api \
  --log-stream-name test \
  --log-events timestamp=$(date +%s000),message="test"
```

### SSL/TLS Issues

#### 1. Certificate Validation Failed

**Problem:** `unable to verify the first certificate`

```bash
# Solution: Update CA certificates
npm config set cafile /path/to/ca.pem

# Or disable certificate verification (development only)
NODE_TLS_REJECT_UNAUTHORIZED=0 npm start
```

#### 2. HTTPS Redirect Loop

**Problem:** Stuck in redirect loop with HTTPS

```bash
# Solution: Check redirect configuration
# In nginx.conf or app config:
# Remove redirect if already HTTPS

# Verify AWS Certificate Manager
aws acm describe-certificate --certificate-arn <arn>
```

### Scaling and Load Issues

#### 1. ECS Tasks Not Scaling

**Problem:** Auto-scaling not kicking in

```bash
# Solution: Check scaling policies
aws applications describe-scaling-policy

# Verify CloudWatch metrics exist
aws cloudwatch get-metric-statistics --namespace AWS/ECS --metric-name CPUUtilization

# Manually scale for testing
aws ecs update-service --service ecommerce-api --desired-count 3
```

#### 2. Load Balancer Unhealthy Targets

**Problem:** ALB showing unhealthy targets

```bash
# Solution: Check health check configuration
aws elbv2 describe-target-groups

# Check target health
aws elbv2 describe-target-health --target-group-arn <arn>

# Verify API health endpoint
curl http://localhost:3000/api/health

#  Review ECS task logs
aws logs tail /ecs/ecommerce-api --follow
```

## Getting Help

### Information to Collect

When reporting issues, gather:

```bash
# Environment info
node --version
npm --version
docker --version
docker-compose --version

# Service status
docker-compose ps
docker-compose logs --tail=100

# Database state
npm run migrate:status
docker-compose exec db psql -U postgres -l

# Recent errors
docker-compose logs api | grep -i error
```

### Resources

1. **Documentation**
   - [AWS Deployment Guide](AWS_DEPLOYMENT.md)
   - [Local Development](LOCAL_DEVELOPMENT.md)
   - [Architecture](../ARCHITECTURE.md)

2. **External Resources**
   - [Terraform Docs](https://www.terraform.io/docs)
   - [AWS ECS Documentation](https://aws.amazon.com/documentation/ecs/)
   - [Node.js Troubleshooting](https://nodejs.org/en/docs/guides/nodejs-performance/)
   - [PostgreSQL Documentation](https://www.postgresql.org/docs/)

3. **Community**
   - GitHub Issues in repository
   - Stack Overflow tags: aws, terraform, ecs, nodejs, postgresql
   - AWS Support (for production issues)

### Reporting Bugs

Include:
1. Error message (full stack trace)
2. Steps to reproduce
3. Expected behavior
4. Actual behavior
5. Environment (OS, versions, configurations)
6. Relevant logs and screenshots

## Prevention

### Best Practices

1. **Keep dependencies updated**: `npm outdated`, `npm update`
2. **Use environment variables**: Never hardcode secrets
3. **Monitor health**: Set up CloudWatch alarms
4. **Backup data**: Regular RDS snapshots
5. **Test before deploying**: Run full test suite
6. **Document changes**: Update ADR (Architecture Decision Record)
7. **Review logs regularly**: CloudWatch Insights queries
8. **Automate deployments**: Use CI/CD pipelines

### Performance Optimization

1. Enable caching at multiple levels
2. Use read replicas for database
3. Implement pagination for list endpoints
4. Use ECS auto-scaling intelligently
5. CDN for static assets (CloudFront)
6. Database connection pooling
7. Request rate limiting

### Security Best Practices

1. Enable VPC security groups minimum permissions
2. Use IAM roles with least privileges
3. Enable encryption at rest and in transit
4. Regular security audits and penetration testing
5. Keep dependencies updated for security patches
6. Monitor access logs and set up alerts
7. Enable MFA for AWS account
