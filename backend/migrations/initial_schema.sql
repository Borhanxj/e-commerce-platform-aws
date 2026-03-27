CREATE SCHEMA IF NOT EXISTS auth;

CREATE TYPE auth.user_role AS ENUM ('customer', 'sales_manager', 'product_manager');

CREATE TABLE auth.users (
    id            SERIAL PRIMARY KEY,
    email         VARCHAR(255)  UNIQUE NOT NULL,
    password_hash VARCHAR(255)  NOT NULL,
    role          auth.user_role NOT NULL DEFAULT 'customer',
    created_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE TABLE auth.customers (
    customer_id  INT PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name         VARCHAR(100) NOT NULL,
    tax_id       VARCHAR(50) NOT NULL UNIQUE,
    home_address TEXT NOT NULL
);

CREATE TABLE auth.sales_managers (
    sales_manager_id INT PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name             VARCHAR(100) NOT NULL
);

CREATE TABLE auth.product_managers (
    product_manager_id INT PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name               VARCHAR(100) NOT NULL
);
