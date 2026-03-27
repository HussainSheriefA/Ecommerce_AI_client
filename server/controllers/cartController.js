const Cart = require('../models/Cart');
const Product = require('../models/Product');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

const getCart = asyncHandler(async (req, res) => {
  const cart = await Cart.getOrCreate(req.user._id);
  await cart.populate('items.product');

  ApiResponse.success(res, 'Cart retrieved successfully', { 
    cart: {
      items: cart.items,
      itemCount: cart.itemCount,
      subtotal: cart.subtotal
    }
  });
});

const addItem = asyncHandler(async (req, res) => {
  const { productId, quantity = 1 } = req.body;

  const product = await Product.findById(productId);
  if (!product || !product.isActive) {
    throw ApiError.notFound('Product not found');
  }

  if (product.stock < quantity) {
    throw ApiError.badRequest('Insufficient stock');
  }

  const cart = await Cart.getOrCreate(req.user._id);
  await cart.addItem(productId, quantity);
  await cart.populate('items.product');

  ApiResponse.success(res, 'Item added to cart', {
    cart: {
      items: cart.items,
      itemCount: cart.itemCount,
      subtotal: cart.subtotal
    }
  });
});

const updateItemQuantity = asyncHandler(async (req, res) => {
  const { itemId } = req.params;
  const { quantity } = req.body;

  const cart = await Cart.getOrCreate(req.user._id);
  await cart.updateItemQuantity(itemId, quantity);
  await cart.populate('items.product');

  ApiResponse.success(res, 'Cart updated', {
    cart: {
      items: cart.items,
      itemCount: cart.itemCount,
      subtotal: cart.subtotal
    }
  });
});

const removeItem = asyncHandler(async (req, res) => {
  const { itemId } = req.params;

  const cart = await Cart.getOrCreate(req.user._id);
  await cart.removeItem(itemId);
  await cart.populate('items.product');

  ApiResponse.success(res, 'Item removed from cart', {
    cart: {
      items: cart.items,
      itemCount: cart.itemCount,
      subtotal: cart.subtotal
    }
  });
});

module.exports = {
  getCart,
  addItem,
  updateItemQuantity,
  removeItem
};
