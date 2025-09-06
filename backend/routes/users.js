const express = require('express');
const { body, validationResult } = require('express-validator');
const { promisePool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Update user profile
router.put('/profile', authenticateToken, [
  body('full_name').optional().isLength({ max: 100 }),
  body('phone').optional().isLength({ max: 20 }),
  body('address').optional().isLength({ max: 500 }),
  body('city').optional().isLength({ max: 50 }),
  body('state').optional().isLength({ max: 50 }),
  body('zip_code').optional().isLength({ max: 10 })
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

    const { full_name, phone, address, city, state, zip_code } = req.body;
    
    await promisePool.execute(`
      UPDATE users 
      SET full_name = COALESCE(?, full_name), phone = COALESCE(?, phone), 
          address = COALESCE(?, address), city = COALESCE(?, city), 
          state = COALESCE(?, state), zip_code = COALESCE(?, zip_code),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [full_name, phone, address, city, state, zip_code, req.user.id]);

    // Fetch updated user
    const [users] = await promisePool.execute(
      'SELECT id, username, email, full_name, phone, address, city, state, zip_code, created_at FROM users WHERE id = ?',
      [req.user.id]
    );

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: { user: users[0] }
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile'
    });
  }
});

// Get user's products
router.get('/my-products', authenticateToken, async (req, res) => {
  try {
    const [products] = await promisePool.execute(`
      SELECT p.*, c.name as category_name, c.value as category_value
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.seller_id = ?
      ORDER BY p.created_at DESC
    `, [req.user.id]);

    const formattedProducts = products.map(product => ({
      ...product,
      images: product.images ? JSON.parse(product.images) : [],
      category: product.category_value
    }));

    res.json({
      success: true,
      data: { products: formattedProducts }
    });

  } catch (error) {
    console.error('Get my products error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch products'
    });
  }
});

module.exports = router;
