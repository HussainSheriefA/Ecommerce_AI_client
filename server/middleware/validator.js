const { body, param, query, validationResult } = require('express-validator');
const ApiError = require('../utils/ApiError');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => ({
      field: error.path,
      message: error.msg
    }));
    throw ApiError.badRequest('Validation failed', errorMessages);
  }
  next();
};

const authValidators = {
  register: [
    body('name')
      .trim()
      .notEmpty().withMessage('Name is required')
      .isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
    body('email')
      .trim()
      .notEmpty().withMessage('Email is required')
      .isEmail().withMessage('Please provide a valid email'),
    body('password')
      .notEmpty().withMessage('Password is required')
      .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    handleValidationErrors
  ],
  login: [
    body('email')
      .trim()
      .notEmpty().withMessage('Email is required')
      .isEmail().withMessage('Please provide a valid email'),
    body('password')
      .notEmpty().withMessage('Password is required'),
    handleValidationErrors
  ]
};

const productValidators = {
  create: [
    body('name')
      .trim()
      .notEmpty().withMessage('Product name is required'),
    body('description')
      .trim()
      .notEmpty().withMessage('Description is required'),
    body('price')
      .notEmpty().withMessage('Price is required')
      .isFloat({ min: 0 }).withMessage('Price must be a positive number'),
    body('category')
      .trim()
      .notEmpty().withMessage('Category is required'),
    body('brand')
      .trim()
      .notEmpty().withMessage('Brand is required'),
    body('image')
      .trim()
      .notEmpty().withMessage('Product image is required'),
    handleValidationErrors
  ],
  update: [
    param('id')
      .isMongoId().withMessage('Invalid product ID'),
    handleValidationErrors
  ],
  getById: [
    param('id')
      .isMongoId().withMessage('Invalid product ID'),
    handleValidationErrors
  ]
};

const cartValidators = {
  addItem: [
    body('productId')
      .notEmpty().withMessage('Product ID is required')
      .isMongoId().withMessage('Invalid product ID'),
    body('quantity')
      .optional()
      .isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
    handleValidationErrors
  ],
  updateItem: [
    param('itemId')
      .isMongoId().withMessage('Invalid item ID'),
    body('quantity')
      .notEmpty().withMessage('Quantity is required')
      .isInt({ min: 0 }).withMessage('Quantity must be a non-negative integer'),
    handleValidationErrors
  ],
  removeItem: [
    param('itemId')
      .isMongoId().withMessage('Invalid item ID'),
    handleValidationErrors
  ]
};

const orderValidators = {
  create: [
    body('shippingAddress')
      .notEmpty().withMessage('Shipping address is required'),
    body('shippingAddress.street')
      .notEmpty().withMessage('Street is required'),
    body('shippingAddress.city')
      .notEmpty().withMessage('City is required'),
    body('shippingAddress.state')
      .notEmpty().withMessage('State is required'),
    body('shippingAddress.zipCode')
      .notEmpty().withMessage('Zip code is required'),
    body('paymentMethod')
      .notEmpty().withMessage('Payment method is required')
      .isIn(['card', 'paypal', 'cod']).withMessage('Invalid payment method'),
    handleValidationErrors
  ]
};

const queryValidators = {
  pagination: [
    query('page')
      .optional()
      .isInt({ min: 1 }).withMessage('Page must be a positive integer')
      .toInt(),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
      .toInt(),
    handleValidationErrors
  ]
};

module.exports = {
  authValidators,
  productValidators,
  cartValidators,
  orderValidators,
  queryValidators
};
