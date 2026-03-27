const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a product name'],
    trim: true,
    maxlength: [200, 'Product name cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Please provide a product description']
  },
  price: {
    type: Number,
    required: [true, 'Please provide a price'],
    min: [0, 'Price cannot be negative']
  },
  originalPrice: {
    type: Number,
    min: [0, 'Original price cannot be negative'],
    default: function() {
      return this.price;
    }
  },
  category: {
    type: String,
    required: [true, 'Please provide a category'],
    enum: ['Watches', 'Bags', 'Apparel', 'Shoes', 'Accessories', 'Fragrance', 'Jewelry', 'Electronics', 'Home', 'Other'],
    index: true
  },
  brand: {
    type: String,
    required: [true, 'Please provide a brand'],
    trim: true
  },
  images: [{
    type: String,
    required: true
  }],
  image: {
    type: String,
    required: [true, 'Please provide a main product image']
  },
  stock: {
    type: Number,
    required: [true, 'Please provide stock quantity'],
    min: [0, 'Stock cannot be negative'],
    default: 0
  },
  rating: {
    type: Number,
    min: [0, 'Rating cannot be less than 0'],
    max: [5, 'Rating cannot be more than 5'],
    default: 0
  },
  reviews: {
    type: Number,
    default: 0
  },
  badge: {
    type: String,
    enum: ['New Arrival', 'Best Seller', 'Sale', 'Limited Edition', 'Exclusive', 'None'],
    default: 'None'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

productSchema.index({ name: 'text', description: 'text', brand: 'text' });
productSchema.index({ category: 1, price: 1 });

module.exports = mongoose.model('Product', productSchema);
