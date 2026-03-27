const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

const createOrder = asyncHandler(async (req, res) => {
  const { shippingAddress, paymentMethod } = req.body;

  const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
  
  if (!cart || cart.items.length === 0) {
    throw ApiError.badRequest('Your cart is empty');
  }

  for (const item of cart.items) {
    const product = await Product.findById(item.product._id);
    if (!product || product.stock < item.quantity) {
      throw ApiError.badRequest(`Insufficient stock for ${product?.name || 'a product'}`);
    }
  }

  const TAX_RATE = 0.10;
  const FREE_SHIPPING_THRESHOLD = 500;
  const SHIPPING_COST = 25;

  const subtotal = cart.subtotal;
  const tax = subtotal * TAX_RATE;
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
  const total = subtotal + tax + shipping;

  const orderItems = cart.items.map(item => ({
    product: item.product._id,
    name: item.product.name,
    image: item.product.image,
    price: item.price,
    quantity: item.quantity
  }));

  const order = await Order.create({
    user: req.user._id,
    items: orderItems,
    shippingAddress,
    paymentMethod,
    prices: {
      subtotal,
      tax,
      shipping,
      total
    }
  });

  for (const item of cart.items) {
    await Product.findByIdAndUpdate(
      item.product._id,
      { $inc: { stock: -item.quantity } }
    );
  }

  await cart.clearCart();

  ApiResponse.success(res, 'Order placed successfully', { order }, 201);
});

const getOrders = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const skip = (Number(page) - 1) * Number(limit);

  const [orders, total] = await Promise.all([
    Order.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .populate('items.product', 'name image'),
    Order.countDocuments({ user: req.user._id })
  ]);

  ApiResponse.paginated(
    res,
    'Orders retrieved successfully',
    orders,
    {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / Number(limit)),
      hasNextPage: page * limit < total,
      hasPrevPage: page > 1
    }
  );
});

const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findOne({
    _id: req.params.id,
    user: req.user._id
  }).populate('items.product', 'name image');

  if (!order) {
    throw ApiError.notFound('Order not found');
  }

  ApiResponse.success(res, 'Order retrieved successfully', { order });
});

const getAllOrders = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status } = req.query;
  
  const query = {};
  if (status) query.orderStatus = status;

  const skip = (Number(page) - 1) * Number(limit);

  const [orders, total] = await Promise.all([
    Order.find(query)
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    Order.countDocuments(query)
  ]);

  ApiResponse.paginated(
    res,
    'All orders retrieved',
    orders,
    {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / Number(limit)),
      hasNextPage: page * limit < total,
      hasPrevPage: page > 1
    }
  );
});

module.exports = {
  createOrder,
  getOrders,
  getOrderById,
  getAllOrders
};
