-- SQLite

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample data
INSERT INTO users (username, email) VALUES
    ('john_doe', 'john@example.com'),
    ('jane_smith', 'jane@example.com'),
    ('bob_wilson', 'bob@example.com');

-- Create products table
CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample products
INSERT INTO products (name, price, description) VALUES
    ('Laptop', 999.99, 'High performance laptop'),
    ('Smartphone', 599.99, 'Latest model smartphone'),
    ('Headphones', 99.99, 'Wireless noise-canceling headphones');

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    product_id INTEGER,
    quantity INTEGER NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    order_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Insert sample orders
INSERT INTO orders (user_id, product_id, quantity, total_price) VALUES
    (1, 1, 1, 999.99),
    (2, 2, 2, 1199.98),
    (3, 3, 1, 99.99);

-- Query to verify data
SELECT * FROM users;
SELECT * FROM products;
SELECT * FROM orders;
