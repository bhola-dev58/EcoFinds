const express = require('express');
const multer = require('multer');
const path = require('path');
const { body, validationResult, query } = require('express-validator');
const { promisePool } = require('../config/database');
const { authenticateToken, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'product-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10485760 // 10MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = (process.env.ALLOWED_FILE_TYPES || 'image/jpeg,image/png,image/gif,image/webp').split(',');
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images are allowed.'));
    }
  }
});

// Get all products with filtering and pagination
router.get('/', [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('category').optional().isString(),
  query('search').optional().isString(),
  query('min_price').optional().isFloat({ min: 0 }),
  query('max_price').optional().isFloat({ min: 0 }),
  query('condition').optional().isIn(['poor', 'fair', 'good', 'excellent']),
  query('seller_id').optional().isInt({ min: 1 })
], optionalAuth, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    // Build dynamic query
    let whereConditions = ['p.is_available = 1'];
    let queryParams = [];

    if (req.query.category) {
      whereConditions.push('c.value = ?');
      queryParams.push(req.query.category);
    }

    if (req.query.search) {
      whereConditions.push('(p.title LIKE ? OR p.description LIKE ?)');
      const searchTerm = `%${req.query.search}%`;
      queryParams.push(searchTerm, searchTerm);
    }

    if (req.query.min_price) {
      whereConditions.push('p.price >= ?');
      queryParams.push(req.query.min_price);
    }

    if (req.query.max_price) {
      whereConditions.push('p.price <= ?');
      queryParams.push(req.query.max_price);
    }

    if (req.query.condition) {
      whereConditions.push('p.condition_rating = ?');
      queryParams.push(req.query.condition);
    }

    if (req.query.seller_id) {
      whereConditions.push('p.seller_id = ?');
      queryParams.push(req.query.seller_id);
    }

    const whereClause = whereConditions.join(' AND ');

    // Get products with pagination
    const productsQuery = `
      SELECT 
        p.id, p.title, p.description, p.price, p.condition_rating, 
        p.images, p.location, p.is_available, p.is_featured, p.views, 
        p.created_at, p.updated_at,
        c.name as category_name, c.value as category_value,
        u.username as seller_username, u.full_name as seller_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN users u ON p.seller_id = u.id
      WHERE ${whereClause}
      ORDER BY p.created_at DESC
      LIMIT ? OFFSET ?
    `;

    const [products] = await promisePool.execute(productsQuery, [...queryParams, limit, offset]);

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE ${whereClause}
    `;
    
    const [countResult] = await promisePool.execute(countQuery, queryParams);
    const total = countResult[0].total;

    // Parse images JSON
    const formattedProducts = products.map(product => ({
      ...product,
      images: product.images ? JSON.parse(product.images) : [],
      category: product.category_value,
      seller: {
        username: product.seller_username,
        name: product.seller_name
      }
    }));

    res.json({
      success: true,
      data: {
        products: formattedProducts,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch products'
    });
  }
});

// Get single product by ID
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const productId = req.params.id;

    // Increment view count
    await promisePool.execute(
      'UPDATE products SET views = views + 1 WHERE id = ?',
      [productId]
    );

    const [products] = await promisePool.execute(`
      SELECT 
        p.id, p.title, p.description, p.price, p.condition_rating, 
        p.images, p.location, p.is_available, p.is_featured, p.views, 
        p.created_at, p.updated_at,
        c.name as category_name, c.value as category_value,
        u.username as seller_username, u.full_name as seller_name,
        u.email as seller_email, u.phone as seller_phone
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN users u ON p.seller_id = u.id
      WHERE p.id = ? AND p.is_available = 1
    `, [productId]);

    if (products.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const product = products[0];
    const formattedProduct = {
      ...product,
      images: product.images ? JSON.parse(product.images) : [],
      category: product.category_value,
      seller: {
        username: product.seller_username,
        name: product.seller_name,
        email: product.seller_email,
        phone: product.seller_phone
      }
    };

    res.json({
      success: true,
      data: {
        product: formattedProduct
      }
    });

  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch product'
    });
  }
});

// Create new product
router.post('/', authenticateToken, upload.array('images', 5), [
  body('title').isLength({ min: 1, max: 200 }).withMessage('Title is required and must be under 200 characters'),
  body('description').isLength({ max: 2000 }).withMessage('Description must be under 2000 characters'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('category_id').isInt({ min: 1 }).withMessage('Valid category is required'),
  body('condition_rating').isIn(['poor', 'fair', 'good', 'excellent']).withMessage('Valid condition rating is required'),
  body('location').optional().isLength({ max: 100 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { title, description, price, category_id, condition_rating, location } = req.body;
    
    // Process uploaded images
    const images = req.files ? req.files.map(file => `/uploads/${file.filename}`) : [];

    // Verify category exists
    const [categories] = await promisePool.execute(
      'SELECT id FROM categories WHERE id = ? AND is_active = 1',
      [category_id]
    );

    if (categories.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid category selected'
      });
    }

    // Insert product
    const [result] = await promisePool.execute(`
      INSERT INTO products (title, description, price, category_id, seller_id, condition_rating, images, location)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [title, description, price, category_id, req.user.id, condition_rating, JSON.stringify(images), location || null]);

    const productId = result.insertId;

    // Fetch the created product
    const [newProduct] = await promisePool.execute(`
      SELECT 
        p.id, p.title, p.description, p.price, p.condition_rating, 
        p.images, p.location, p.is_available, p.created_at,
        c.name as category_name, c.value as category_value
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.id = ?
    `, [productId]);

    const product = newProduct[0];
    const formattedProduct = {
      ...product,
      images: JSON.parse(product.images),
      category: product.category_value
    };

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: {
        product: formattedProduct
      }
    });

  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create product'
    });
  }
});

// Update product
router.put('/:id', authenticateToken, upload.array('images', 5), [
  body('title').optional().isLength({ min: 1, max: 200 }),
  body('description').optional().isLength({ max: 2000 }),
  body('price').optional().isFloat({ min: 0 }),
  body('category_id').optional().isInt({ min: 1 }),
  body('condition_rating').optional().isIn(['poor', 'fair', 'good', 'excellent']),
  body('location').optional().isLength({ max: 100 }),
  body('is_available').optional().isBoolean()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const productId = req.params.id;
    
    // Check if product exists and belongs to user
    const [existingProducts] = await promisePool.execute(
      'SELECT id, seller_id, images FROM products WHERE id = ?',
      [productId]
    );

    if (existingProducts.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    if (existingProducts[0].seller_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this product'
      });
    }

    // Build update query dynamically
    const updateFields = [];
    const updateValues = [];

    Object.keys(req.body).forEach(key => {
      if (req.body[key] !== undefined && key !== 'images') {
        updateFields.push(`${key} = ?`);
        updateValues.push(req.body[key]);
      }
    });

    // Handle new images
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(file => `/uploads/${file.filename}`);
      updateFields.push('images = ?');
      updateValues.push(JSON.stringify(newImages));
    }

    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid fields to update'
      });
    }

    updateFields.push('updated_at = CURRENT_TIMESTAMP');
    updateValues.push(productId);

    // Update product
    await promisePool.execute(
      `UPDATE products SET ${updateFields.join(', ')} WHERE id = ?`,
      updateValues
    );

    // Fetch updated product
    const [updatedProduct] = await promisePool.execute(`
      SELECT 
        p.id, p.title, p.description, p.price, p.condition_rating, 
        p.images, p.location, p.is_available, p.updated_at,
        c.name as category_name, c.value as category_value
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.id = ?
    `, [productId]);

    const product = updatedProduct[0];
    const formattedProduct = {
      ...product,
      images: JSON.parse(product.images || '[]'),
      category: product.category_value
    };

    res.json({
      success: true,
      message: 'Product updated successfully',
      data: {
        product: formattedProduct
      }
    });

  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update product'
    });
  }
});

// Delete product
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const productId = req.params.id;
    
    // Check if product exists and belongs to user
    const [products] = await promisePool.execute(
      'SELECT seller_id FROM products WHERE id = ?',
      [productId]
    );

    if (products.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    if (products[0].seller_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this product'
      });
    }

    // Delete product (will cascade to related records)
    await promisePool.execute('DELETE FROM products WHERE id = ?', [productId]);

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });

  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete product'
    });
  }
});

module.exports = router;
