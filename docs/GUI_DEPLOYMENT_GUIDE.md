# AWS Console Deployment Guide (GUI)

This guide provides step-by-step instructions for deploying the E-commerce Platform using the **AWS Management Console** (Web UI) instead of the CLI.

---

## Architecture Overview
We will deploy the following components:
1.  **VPC & Networking**: The foundation for our private network.
2.  **RDS (PostgreSQL)**: Our managed database.
3.  **ECR (Registry)**: To store our Docker images.
4.  **ECS (Fargate)**: To run our application containers (API, Web, Invoice).
5.  **ALB (Load Balancer)**: To route traffic to our services.

---

## Phase 1: Networking Setup (VPC)
1.  Log in to the [AWS Console](https://console.aws.amazon.com/).
2.  Search for **VPC** in the top search bar.
3.  Click **Create VPC**.
4.  Select **"VPC and more"** (this is the easiest way).
5.  **Name tag**: `ecommerce-project`
6.  **IPv4 CIDR block**: `10.0.0.0/16`
7.  **Number of Availability Zones (AZs)**: 2
8.  **Number of Public Subnets**: 2
9.  **Number of Private Subnets**: 2
10. **NAT Gateways**: 1 per AZ (Recommended for production) or 1 single (Cheaper).
11. **VPC Endpoints**: S3 Gateway (Keep checked).
12. Click **Create VPC**.

---

## Phase 2: Database Setup (RDS)
1.  Search for **RDS**.
2.  Click **Create database**.
3.  **Engine type**: PostgreSQL.
4.  **Templates**: "Free tier" (for testing) or "Dev/Test".
5.  **DB instance identifier**: `ecommerce-db`
6.  **Master username**: `postgres`
7.  **Master password**: *Choose a strong password and save it.*
8.  **Connectivity**: 
    - Select your `ecommerce-project-vpc`.
    - Public access: **No**.
9.  Click **Create database**.

---

## Phase 3: Image Registry (ECR)
1.  Search for **ECR**.
2.  Click **Create repository** for each service:
    - Name: `ecommerce-api`
    - Name: `ecommerce-web`
    - Name: `ecommerce-invoice`
3.  *Note: You will still need to push your local docker images to these repositories once. Use the "View push commands" button in the ECR console for instructions.*

---

## Phase 4: Container Orchestration (ECS)
1.  Search for **ECS**.
2.  **Step 1: Create Cluster**
    - Click **Create Cluster**.
    - Name: `ecommerce-cluster`.
    - Infrastructure: **AWS Fargate** (Serverless).
3.  **Step 2: Create Task Definitions**
    - You need to create one for `api`, `web`, and `invoice`.
    - Set Memory/CPU (e.g., 0.5 vCPU, 1 GB RAM).
    - Add Container: Use the ECR Image URI from Phase 3.
    - Set Environment Variables (DB URL, Port, Secret Key).
4.  **Step 3: Create Services**
    - Inside your cluster, create a "Service".
    - select the Task Definition you created.
    - Set Desired tasks to 1 (or 2 for redundancy).
    - **Networking**: Select your Private Subnets.

---

## Phase 5: Routing Traffic (Load Balancer)
1.  Search for **EC2**, then find **Load Balancers** in the left menu.
2.  Click **Create Load Balancer** -> **Application Load Balancer**.
3.  **Scheme**: Internet-facing.
4.  **Listeners**: HTTP on port 80.
5.  **Target Groups**: Create a target group for each service (pointing to your ECS tasks).

---

## Phase 6: Static Assets (S3 + CloudFront)
1.  Search for **S3**.
2.  Create a bucket for static assets (e.g., `ecommerce-assets-YOURNAME`).
3.  Search for **CloudFront**.
4.  Create a Distribution pointing to your S3 bucket for fast global delivery.

---

## Summary of URLs to Manage
- **Frontend URL**: Provided by the Load Balancer or CloudFront.
- **Backend API URL**: Provided by the Load Balancer (typically used by the frontend).
- **Database Host**: Found in the RDS "Connectivity & security" tab.
