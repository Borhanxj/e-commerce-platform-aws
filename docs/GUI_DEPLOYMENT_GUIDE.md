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
This phase is where you store your baked "images" (the code and environment together). Although you are using the GUI, you must run a few commands from your computer once to send your code to AWS.

1.  Search for **Elastic Container Registry (ECR)** in the AWS Console.
2.  Click **Create repository** for each service:
    - Repository name: `ecommerce-api`
    - Repository name: `ecommerce-web`
    - Repository name: `ecommerce-invoice`
3.  **Upload your images (Step-by-Step):**
    For each repository you just created (e.g., `ecommerce-api`):
    - Click into the repository name.
    - Look at the top right for the **"View push commands"** button.
    - **Follow those four commands exactly** in your local terminal. They will:
      1. **Authenticate**: Log your computer into AWS.
      2. **Build**: Convert your local code into a Docker image.
      3. **Tag**: Label the image for AWS.
      4. **Push**: Upload the image to the cloud.

    **Exactly what is being uploaded:**
    - For `ecommerce-api`: Your `backend/` folder.
    - For `ecommerce-web`: Your `frontend/` folder.
    - For `ecommerce-invoice`: The Python service in `backend/invoice_api/`.

4.  **Copy the URIs**: Once pushed, copy the **Image URI** for each (it looks like `123456789.dkr.ecr.eu-west-1.amazonaws.com/ecommerce-api:latest`). You will need these for Phase 4.

---

## Phase 4: Container Orchestration (ECS)
This is where your code actually runs. We need to create a **Cluster** (the home for your services), **Task Definitions** (the blueprint for your containers), and **Services** (the actual running instances).

### Step 1: Create Cluster
1. Search for **Elastic Container Service (ECS)** in the AWS Console.
2. Click **Create Cluster**.
3. **Cluster name**: `ecommerce-cluster`.
4. **Infrastructure**: Ensure **AWS Fargate (serverless)** is selected.
5. Click **Create**.

### Step 2: Create Task Definitions (The Blueprint)
*Repeat this for `api`, `web`, and `invoice`.*

1. In the ECS left sidebar, click **Task Definitions** > **Create new task definition** > **Create new task definition with JSON** (or use the UI).
2. **Task definition family**: `ecommerce-api` (example).
3. **Launch type**: Fargate.
4. **Task size**: 0.5 vCPU and 1 GB Memory (sufficient for most services).
5. **Container details**:
   - **Name**: `api`.
   - **Image URI**: Paste the URI from your ECR repository (found in Phase 3).
   - **Port mappings**: 
     - API: Container Port `3000`
     - Web: Container Port `80`
     - Invoice: Container Port `8080`
6. **Environment variables**: Add keys like `DATABASE_URL`, `JWT_SECRET`, etc.
7. Click **Create**.

### Step 3: Create Services (The Running Instances)
*Go back to your Cluster (Phase 4, Step 1) and click on it.*

1. Under the **Services** tab, click **Create**.
2. **Deployment configuration**:
   - **Family**: Select the Task Definition you just created (e.g., `ecommerce-api`).
   - **Service name**: `api-service`.
   - **Desired tasks**: `1` (for dev) or `2` (for high availability).
3. **Networking**:
   - **VPC**: Select `ecommerce-project-vpc`.
   - **Subnets**: Select both **Private Subnets**. (Your code should run in private subnets for security).
   - **Security group**: Create new. Allow port `3000` (for API), `80` (for Web), or `8080` (for Invoice).
4. **Load balancing** (Optional but recommended):
   - Select **Application Load Balancer**.
   - Use the one created in Phase 5.
5. Click **Create**.

---

## Phase 5: Routing Traffic (Load Balancer & Target Groups)
The **Application Load Balancer (ALB)** is your website's "Front Door". It receives requests from the internet and sends them to the correct ECS service (Web, API, or Invoice).

### Step 1: Create Target Groups (The Destinations)
*You need to create 3 Target Groups: `tg-web`, `tg-api`, and `tg-invoice`.*

1. Search for **EC2** and find **Target Groups** in the left sidebar.
2. Click **Create target group**.
3. **Target type**: Select **IP addresses** (Required for ECS Fargate).
4. **Target group name**: `tg-api` (example).
5. **Protocol/Port**: 
   - For `tg-api`: Port `3000`
   - For `tg-web`: Port `80`
   - For `tg-invoice`: Port `8080`
6. **VPC**: Select your `ecommerce-project-vpc`.
7. **Health checks**: 
   - For API: Set path to `/api/health` 
   - For Web: Set path to `/`
8. Click **Next** -> **Create target group** (Do not manually add IPs; ECS will do this automatically!).

### Step 2: Create the Load Balancer (The Front Door)
1. In the **EC2** menu, click **Load Balancers** > **Create load balancer**.
2. Select **Application Load Balancer**.
3. **Name**: `ecommerce-alb`.
4. **Scheme**: **Internet-facing**.
5. **Network mapping**: 
   - Select your `ecommerce-project-vpc`.
   - Select **both Public Subnets**.
6. **Security groups**: Create a new group that allows **HTTP (Port 80)** from anywhere (`0.0.0.0/0`).
7. **Listeners and routing**:
   - Protocol: HTTP | Port: 80.
   - Default action: Forward to your `tg-web` (This makes the user see the frontend by default).
8. Click **Create load balancer**.

### Step 3: Add Routing Rules (The Switchboard)
1. Once created, select your Load Balancer and go to the **Listeners** tab.
2. Click **Manage listener** > **Edit rules**.
3. **Add Rule 1 (API)**: 
   - If Path is `/api/*` -> Forward to `tg-api`.
4. **Add Rule 2 (Invoice)**: 
   - If Path is `/invoice/*` -> Forward to `tg-invoice`.
5. Save changes. Now, one URL handles all three services!

---

## Phase 6: Static Assets (S3 + CloudFront)
For production, you want your images and frontend files to be served globally via a Content Delivery Network (CDN) for maximum speed.

### Step 1: Create the S3 Bucket
1. Search for **S3** > **Create bucket**.
2. **Name**: Use a unique name like `ecommerce-production-assets-XXXXX`.
3. **Object Ownership**: ACLs disabled (Recommended).
4. **Public Access**: Keep **"Block all public access"** checked (We will use CloudFront to bypass this securely).
5. Click **Create bucket**.

### Step 2: Create the CloudFront Distribution
1. Search for **CloudFront** > **Create distribution**.
2. **Origin domain**: Select your S3 bucket from the list.
3. **Origin access**: Select **Origin access control settings (recommended)**.
   - Click **Create control setting** and save.
4. **Web Application Firewall (WAF)**: Select "Do not enable" for now to save costs (unless you need extra security).
5. **Default root object**: `index.html`.
6. Click **Create distribution**.
7. **CRITICAL**: Once created, CloudFront will show a yellow banner: *"The S3 bucket policy needs to be updated..."*. Click **Copy policy** and then go to your S3 bucket's **Permissions** tab to paste it. This allows the CDN to talk to your private bucket.

### Step 3: Upload your Files
1. Use the S3 Console to upload your `frontend/dist` folder content (if building locally) or your product images.
2. Users will now access your site via the **CloudFront Distribution Domain Name** (e.g., `d1234.cloudfront.net`).

---

## Summary of URLs to Manage
- **Frontend URL**: Provided by the Load Balancer or CloudFront.
- **Backend API URL**: Provided by the Load Balancer (typically used by the frontend).
- **Database Host**: Found in the RDS "Connectivity & security" tab.
