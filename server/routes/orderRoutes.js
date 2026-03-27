const express = require('express');
const router = express.Router();
const {
  createOrder,
  getOrders,
  getOrderById,
  getAllOrders
} = require('../controllers/orderController');
const { protect, adminOnly } = require('../middleware/auth');
const { orderValidators } = require('../middleware/validator');

router.post('/', protect, orderValidators.create, createOrder);
router.get('/', protect, getOrders);
router.get('/admin/all', protect, adminOnly, getAllOrders);
router.get('/:id', protect, getOrderById);

module.exports = router;
