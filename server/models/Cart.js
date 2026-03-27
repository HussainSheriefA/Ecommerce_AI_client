const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'Quantity must be at least 1'],
    default: 1
  },
  price: {
    type: Number,
    required: true
  }
}, { _id: true });

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  items: [cartItemSchema]
}, {
  timestamps: true
});

cartSchema.virtual('itemCount').get(function() {
  return this.items.reduce((total, item) => total + item.quantity, 0);
});

cartSchema.virtual('subtotal').get(function() {
  return this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
});

cartSchema.methods.addItem = async function(productId, quantity = 1) {
  const Product = mongoose.model('Product');
  const product = await Product.findById(productId);
  
  if (!product) {
    throw new Error('Product not found');
  }
  
  if (product.stock < quantity) {
    throw new Error('Insufficient stock');
  }

  const existingItemIndex = this.items.findIndex(
    item => item.product.toString() === productId.toString()
  );

  if (existingItemIndex > -1) {
    const newQuantity = this.items[existingItemIndex].quantity + quantity;
    if (product.stock < newQuantity) {
      throw new Error('Insufficient stock');
    }
    this.items[existingItemIndex].quantity = newQuantity;
  } else {
    this.items.push({
      product: productId,
      quantity,
      price: product.price
    });
  }

  return await this.save();
};

cartSchema.methods.updateItemQuantity = async function(itemId, quantity) {
  const itemIndex = this.items.findIndex(
    item => item._id.toString() === itemId.toString()
  );

  if (itemIndex === -1) {
    throw new Error('Item not found in cart');
  }

  if (quantity <= 0) {
    this.items.splice(itemIndex, 1);
  } else {
    const Product = mongoose.model('Product');
    const item = this.items[itemIndex];
    const product = await Product.findById(item.product);
    
    if (product.stock < quantity) {
      throw new Error('Insufficient stock');
    }
    
    item.quantity = quantity;
  }

  return await this.save();
};

cartSchema.methods.removeItem = async function(itemId) {
  const itemIndex = this.items.findIndex(
    item => item._id.toString() === itemId.toString()
  );

  if (itemIndex === -1) {
    throw new Error('Item not found in cart');
  }

  this.items.splice(itemIndex, 1);
  return await this.save();
};

cartSchema.methods.clearCart = async function() {
  this.items = [];
  return await this.save();
};

cartSchema.statics.getOrCreate = async function(userId) {
  let cart = await this.findOne({ user: userId }).populate('items.product');
  
  if (!cart) {
    cart = await this.create({ user: userId, items: [] });
  }
  
  return cart;
};

module.exports = mongoose.model('Cart', cartSchema);
