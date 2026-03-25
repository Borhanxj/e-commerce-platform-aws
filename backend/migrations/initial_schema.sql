CREATE TYPE user_role AS ENUM ('customer', 'sales_manager', 'product_manager');

CREATE TABLE users (
    id            SERIAL PRIMARY KEY,
    email         VARCHAR(255)  UNIQUE NOT NULL,
    password_hash VARCHAR(255)  NOT NULL,
    role          user_role     NOT NULL DEFAULT 'customer',
    created_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE TABLE customers (
    customer_id  INT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    name         VARCHAR(100) NOT NULL,
    tax_id       VARCHAR(50) NOT NULL UNIQUE,
    home_address TEXT NOT NULL
);

CREATE TABLE sales_managers (
    sales_manager_id INT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    name             VARCHAR(100) NOT NULL
);

CREATE TABLE product_managers (
    product_manager_id INT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    name               VARCHAR(100) NOT NULL
);