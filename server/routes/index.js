const express = require('express');
const router = express.Router();
const { getConnectionStatus } = require('../db/db');

const authRoutes = require('./authRoutes');
const productRoutes = require('./productRoutes');
const cartRoutes = require('./cartRoutes');
const orderRoutes = require('./orderRoutes');

router.get('/health', (req, res) => {
  const dbStatus = getConnectionStatus();
  res.json({
    success: true,
    message: 'API is running',
    database: {
      type: dbStatus.isAtlas ? 'MongoDB Atlas' : 'In-Memory',
      host: dbStatus.host,
      name: dbStatus.name
    },
    timestamp: new Date().toISOString()
  });
});

router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/cart', cartRoutes);
router.use('/orders', orderRoutes);

module.exports = router;