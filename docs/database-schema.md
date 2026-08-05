# Database Schema Documentation

Visual ERD representation diagram: `database-schema.png` (placed alongside this file in `docs/`).

## Table Definitions

### 1. `users`
| Column | Type | Attributes | Description |
|---|---|---|---|
| `id` | INT | PRIMARY KEY, AUTO_INCREMENT | Unique User Identifier |
| `username` | VARCHAR(100) | UNIQUE, NOT NULL | User Login Name |
| `email` | VARCHAR(255) | UNIQUE, NOT NULL | User Email Address |
| `password_hash` | VARCHAR(255) | NOT NULL | Password Hash |
| `role` | ENUM('admin', 'cashier', 'manager') | DEFAULT 'cashier' | Access Role |
| `created_at` | DATETIME | DEFAULT CURRENT_TIMESTAMP | Record Timestamp |

---

### 2. `products`
| Column | Type | Attributes | Description |
|---|---|---|---|
| `id` | INT | PRIMARY KEY, AUTO_INCREMENT | Unique Product ID |
| `sku` | VARCHAR(50) | UNIQUE, NOT NULL | Stock Keeping Unit |
| `name` | VARCHAR(255) | NOT NULL | Item Name |
| `category` | VARCHAR(100) | NOT NULL | Item Category |
| `price` | DECIMAL(10,2) | NOT NULL | Retail Selling Price |
| `cost_price` | DECIMAL(10,2) | NOT NULL | Wholesale Cost Price |
| `stock_quantity` | INT | DEFAULT 0 | Current Inventory Count |
| `reorder_level` | INT | DEFAULT 10 | Stock Alert Threshold |
| `created_at` | DATETIME | DEFAULT CURRENT_TIMESTAMP | Record Timestamp |

---

### 3. `sales`
| Column | Type | Attributes | Description |
|---|---|---|---|
| `id` | INT | PRIMARY KEY, AUTO_INCREMENT | Transaction ID |
| `invoice_number` | VARCHAR(50) | UNIQUE, NOT NULL | Invoice Identifier |
| `user_id` | INT | FOREIGN KEY (`users.id`) | Cashier/User ID |
| `total_amount` | DECIMAL(10,2) | NOT NULL | Final Transaction Total |
| `payment_method` | ENUM('cash', 'card', 'online') | DEFAULT 'cash' | Payment Method |
| `created_at` | DATETIME | DEFAULT CURRENT_TIMESTAMP | Transaction Timestamp |

---

### 4. `sale_items`
| Column | Type | Attributes | Description |
|---|---|---|---|
| `id` | INT | PRIMARY KEY, AUTO_INCREMENT | Line Item ID |
| `sale_id` | INT | FOREIGN KEY (`sales.id`) | Associated Sale ID |
| `product_id` | INT | FOREIGN KEY (`products.id`) | Purchased Product ID |
| `quantity` | INT | NOT NULL | Quantity Sold |
| `unit_price` | DECIMAL(10,2) | NOT NULL | Price at time of sale |
| `subtotal` | DECIMAL(10,2) | NOT NULL | Line item subtotal |
