const express = require('express');
const { promisePool } = require('../config/database');

const router = express.Router();

// Get all categories
router.get('/', async (req, res) => {
  try {
    const [categories] = await promisePool.execute(
      'SELECT id, name, value, description, icon FROM categories WHERE is_active = 1 ORDER BY name'
    );

    res.json({
      success: true,
      data: { categories }
    });

  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch categories'
    });
  }
});

module.exports = router;
