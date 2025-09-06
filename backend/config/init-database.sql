-- Create database if it doesn't exist
CREATE DATABASE IF NOT EXISTS ecofinds CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE ecofinds;

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  full_name VARCHAR(100),
  phone VARCHAR(20),
  address TEXT,
  city VARCHAR(50),
  state VARCHAR(50),
  zip_code VARCHAR(10),
  profile_image VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE,
  email_verified BOOLEAN DEFAULT FALSE
);

-- Product categories table
CREATE TABLE IF NOT EXISTS categories (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  value VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  icon VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  category_id INT,
  seller_id INT NOT NULL,
  condition_rating ENUM('poor', 'fair', 'good', 'excellent') DEFAULT 'good',
  images JSON,
  location VARCHAR(100),
  is_available BOOLEAN DEFAULT TRUE,
  is_featured BOOLEAN DEFAULT FALSE,
  views INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id),
  FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_category (category_id),
  INDEX idx_seller (seller_id),
  INDEX idx_available (is_available),
  INDEX idx_created (created_at)
);

-- Cart items table
CREATE TABLE IF NOT EXISTS cart_items (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity INT DEFAULT 1,
  added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_product (user_id, product_id),
  INDEX idx_user (user_id)
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id INT PRIMARY KEY AUTO_INCREMENT,
  buyer_id INT NOT NULL,
  seller_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity INT DEFAULT 1,
  total_amount DECIMAL(10, 2) NOT NULL,
  status ENUM('pending', 'confirmed', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
  shipping_address TEXT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (buyer_id) REFERENCES users(id),
  FOREIGN KEY (seller_id) REFERENCES users(id),
  FOREIGN KEY (product_id) REFERENCES products(id),
  INDEX idx_buyer (buyer_id),
  INDEX idx_seller (seller_id),
  INDEX idx_status (status)
);

-- Favorites/Wishlist table
CREATE TABLE IF NOT EXISTS favorites (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  product_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_favorite (user_id, product_id)
);

-- Reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id INT PRIMARY KEY AUTO_INCREMENT,
  product_id INT NOT NULL,
  reviewer_id INT NOT NULL,
  rating INT CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  FOREIGN KEY (reviewer_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_review (product_id, reviewer_id)
);

-- Messages table for user communication
CREATE TABLE IF NOT EXISTS messages (
  id INT PRIMARY KEY AUTO_INCREMENT,
  sender_id INT NOT NULL,
  receiver_id INT NOT NULL,
  product_id INT,
  subject VARCHAR(200),
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL,
  INDEX idx_receiver (receiver_id),
  INDEX idx_sender (sender_id)
);

-- Insert default categories
INSERT IGNORE INTO categories (name, value, description, icon) VALUES
('Electronics', 'electronics', 'Phones, computers, gadgets and electronic devices', '📱'),
('Clothing', 'clothing', 'Fashion, shoes, accessories and apparel', '👔'),
('Home & Garden', 'home-garden', 'Furniture, decor, gardening and household items', '🏠'),
('Books', 'books', 'Books, magazines, textbooks and literature', '📚'),
('Sports & Outdoors', 'sports-outdoors', 'Sports equipment, outdoor gear and fitness items', '⚽'),
('Toys & Games', 'toys-games', 'Children toys, board games and entertainment', '🎮'),
('Health & Beauty', 'health-beauty', 'Cosmetics, skincare, health and wellness products', '💄'),
('Automotive', 'automotive', 'Car parts, accessories and automotive equipment', '🚗'),
('Music & Instruments', 'music-instruments', 'Musical instruments, audio equipment and music gear', '🎵'),
('Other', 'other', 'Miscellaneous items and everything else', '📦');

-- Insert a test user (password: testuser123)
INSERT IGNORE INTO users (username, email, password, full_name) VALUES
('testuser', 'test@example.com', '$2b$10$rQZ8J8ZJZ8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8', 'Test User');

-- Insert some sample products
INSERT IGNORE INTO products (title, description, price, category_id, seller_id, condition_rating, location) VALUES
('iPhone 12 - Good Condition', 'Used iPhone 12 in excellent working condition. Minor scratches on back, screen is perfect.', 450.00, 1, 1, 'good', 'New York, NY'),
('Vintage Leather Jacket', 'Classic brown leather jacket from the 80s. Real leather, great vintage piece.', 85.00, 2, 1, 'excellent', 'Los Angeles, CA'),
('Coffee Table - Oak Wood', 'Beautiful solid oak coffee table. Perfect for living room. Shows minor wear.', 120.00, 3, 1, 'good', 'Chicago, IL'),
('Programming Books Bundle', 'Collection of 5 programming books including JavaScript, Python, and React.', 45.00, 4, 1, 'fair', 'Austin, TX'),
('Mountain Bike - Trek', 'Trek mountain bike, 21 speeds. Great for trails and city riding.', 280.00, 5, 1, 'good', 'Denver, CO');

COMMIT;
