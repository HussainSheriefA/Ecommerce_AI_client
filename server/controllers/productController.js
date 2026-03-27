const Product = require('../models/Product');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

const getProducts = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 12,
    sort = '-createdAt',
    category,
    brand,
    minPrice,
    maxPrice,
    search
  } = req.query;

  const query = { isActive: true };

  if (category) {
    query.category = category;
  }

  if (brand) {
    query.brand = { $regex: brand, $options: 'i' };
  }

  if (minPrice !== undefined || maxPrice !== undefined) {
    query.price = {};
    if (minPrice !== undefined) query.price.$gte = Number(minPrice);
    if (maxPrice !== undefined) query.price.$lte = Number(maxPrice);
  }

  if (search) {
    query.$text = { $search: search };
  }

  const skip = (Number(page) - 1) * Number(limit);

  const [products, total] = await Promise.all([
    Product.find(query)
      .sort(search ? { score: { $meta: 'textScore' } } : sort)
      .skip(skip)
      .limit(Number(limit)),
    Product.countDocuments(query)
  ]);

  ApiResponse.paginated(
    res,
    'Products retrieved successfully',
    products,
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

const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product || !product.isActive) {
    throw ApiError.notFound('Product not found');
  }

  ApiResponse.success(res, 'Product retrieved successfully', { product });
});

const createProduct = asyncHandler(async (req, res) => {
  const product = await Product.create(req.body);
  ApiResponse.success(res, 'Product created successfully', { product }, 201);
});

const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  if (!product) {
    throw ApiError.notFound('Product not found');
  }

  ApiResponse.success(res, 'Product updated successfully', { product });
});

const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    throw ApiError.notFound('Product not found');
  }

  product.isActive = false;
  await product.save();

  ApiResponse.success(res, 'Product deleted successfully');
});

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
};
