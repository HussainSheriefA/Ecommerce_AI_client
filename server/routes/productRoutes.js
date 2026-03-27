const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
} = require('../controllers/productController');
const { protect, adminOnly } = require('../middleware/auth');
const { productValidators, queryValidators } = require('../middleware/validator');

router.get('/', queryValidators.pagination, getProducts);
router.get('/:id', productValidators.getById, getProductById);
router.post('/', protect, adminOnly, productValidators.create, createProduct);
router.put('/:id', protect, adminOnly, productValidators.update, updateProduct);
router.delete('/:id', protect, adminOnly, productValidators.getById, deleteProduct);

module.exports = router;
