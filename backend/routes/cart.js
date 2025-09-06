const express = require('express');
const { promisePool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get user's cart
router.get('/', authenticateToken, async (req, res) => {
  try {
    const [cartItems] = await promisePool.execute(`
      SELECT 
        ci.id, ci.quantity, ci.added_at,
        p.id as product_id, p.title, p.price, p.images, p.is_available,
        u.username as seller_username
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      JOIN users u ON p.seller_id = u.id
      WHERE ci.user_id = ? AND p.is_available = 1
      ORDER BY ci.added_at DESC
    `, [req.user.id]);

    const formattedItems = cartItems.map(item => ({
      ...item,
      images: item.images ? JSON.parse(item.images) : []
    }));

    res.json({
      success: true,
      data: { cart: formattedItems }
    });

  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch cart'
    });
  }
});

// Add item to cart
router.post('/add', authenticateToken, async (req, res) => {
  try {
    const { product_id, quantity = 1 } = req.body;

    if (!product_id) {
      return res.status(400).json({
        success: false,
        message: 'Product ID is required'
      });
    }

    // Check if product exists and is available
    const [products] = await promisePool.execute(
      'SELECT id, seller_id, is_available FROM products WHERE id = ?',
      [product_id]
    );

    if (products.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const product = products[0];

    if (!product.is_available) {
      return res.status(400).json({
        success: false,
        message: 'Product is not available'
      });
    }

    if (product.seller_id === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Cannot add your own product to cart'
      });
    }

    // Check if item already in cart
    const [existing] = await promisePool.execute(
      'SELECT id, quantity FROM cart_items WHERE user_id = ? AND product_id = ?',
      [req.user.id, product_id]
    );

    if (existing.length > 0) {
      // Update quantity
      await promisePool.execute(
        'UPDATE cart_items SET quantity = quantity + ? WHERE id = ?',
        [quantity, existing[0].id]
      );
    } else {
      // Add new item
      await promisePool.execute(
        'INSERT INTO cart_items (user_id, product_id, quantity) VALUES (?, ?, ?)',
        [req.user.id, product_id, quantity]
      );
    }

    res.json({
      success: true,
      message: 'Item added to cart successfully'
    });

  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add item to cart'
    });
  }
});

// Remove item from cart
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const cartItemId = req.params.id;

    // Check if cart item belongs to user
    const [items] = await promisePool.execute(
      'SELECT user_id FROM cart_items WHERE id = ?',
      [cartItemId]
    );

    if (items.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Cart item not found'
      });
    }

    if (items[0].user_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to remove this item'
      });
    }

    await promisePool.execute('DELETE FROM cart_items WHERE id = ?', [cartItemId]);

    res.json({
      success: true,
      message: 'Item removed from cart successfully'
    });

  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove item from cart'
    });
  }
});

// Clear entire cart
router.delete('/', authenticateToken, async (req, res) => {
  try {
    await promisePool.execute('DELETE FROM cart_items WHERE user_id = ?', [req.user.id]);

    res.json({
      success: true,
      message: 'Cart cleared successfully'
    });

  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clear cart'
    });
  }
});

module.exports = router;
