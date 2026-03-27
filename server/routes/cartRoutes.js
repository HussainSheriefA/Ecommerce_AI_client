const express = require('express');
const router = express.Router();
const {
  getCart,
  addItem,
  updateItemQuantity,
  removeItem
} = require('../controllers/cartController');
const { protect } = require('../middleware/auth');
const { cartValidators } = require('../middleware/validator');

router.get('/', protect, getCart);
router.post('/items', protect, cartValidators.addItem, addItem);
router.put('/items/:itemId', protect, cartValidators.updateItem, updateItemQuantity);
router.delete('/items/:itemId', protect, cartValidators.removeItem, removeItem);

module.exports = router;
