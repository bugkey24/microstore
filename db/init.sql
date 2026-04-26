-- Initial database setup for MicroStore

CREATE DATABASE auth_db;
CREATE DATABASE product_db;
CREATE DATABASE order_db;

-- Connect to product_db to create products table and seed data
\c product_db;

CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    stock INTEGER NOT NULL CHECK (stock >= 0)
);

INSERT INTO products (name, price, stock) VALUES
('Wireless Mouse', 25.99, 150),
('Mechanical Keyboard', 89.50, 75),
('USB-C Hub', 34.00, 200),
('27" Monitor', 299.99, 30),
('LED Desk Lamp', 19.99, 100);

-- Tables for auth_db and order_db will be handled by the services (or migrations)
-- But for completeness, let's define them here if needed for direct SQL setup

\c auth_db;

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT now()
);

\c order_db;

CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    total DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id),
    product_id UUID NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    price_snapshot DECIMAL(10,2) NOT NULL,
    quantity INTEGER NOT NULL
);
