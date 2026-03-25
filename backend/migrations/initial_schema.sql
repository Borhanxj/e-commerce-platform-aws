CREATE TYPE user_role AS ENUM ('customer', 'sales_manager', 'product_manager');

CREATE TABLE users (
    id            SERIAL PRIMARY KEY,
    email         VARCHAR(255)  UNIQUE NOT NULL,
    password_hash VARCHAR(255)  NOT NULL,
    role          user_role     NOT NULL DEFAULT 'customer',
    created_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);