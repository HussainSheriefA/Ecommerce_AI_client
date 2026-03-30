const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongod = null;
let isConnected = false;

const connectDB = async () => {
  if (isConnected) return;
  
  try {
    // Try MongoDB Atlas first
    const uri = process.env.MONGODB_URI;
    
    if (uri && !uri.includes('localhost')) {
      try {
        await mongoose.connect(uri, {
          dbName: process.env.DB_NAME || 'ecommerceai',
          serverSelectionTimeoutMS: 5000,
        });
        isConnected = true;
        console.log('Connected to MongoDB Atlas');
        return;
      } catch (err) {
        console.log('Atlas failed, using in-memory DB');
      }
    }
    
    // Fallback to in-memory database
    mongod = await MongoMemoryServer.create();
    const memUri = mongod.getUri();
    await mongoose.connect(memUri, { dbName: 'ecommerceai' });
    isConnected = true;
    console.log('Connected to In-Memory DB');
    
    // Seed data if empty
    await seedData();
  } catch (error) {
    console.error('DB Connection Error:', error);
    throw error;
  }
};

// Models
const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, default: 'user' }
}, { timestamps: true });

const ProductSchema = new mongoose.Schema({
  name: String,
  shortName: String,
  description: String,
  price: Number,
  originalPrice: Number,
  category: String,
  brand: String,
  image: String,
  images: [String],
  stock: Number,
  rating: Number,
  reviews: Number,
  badge: String,
  isActive: { type: Boolean, default: true },
  features: [String],
  specs: mongoose.Schema.Types.Mixed
}, { timestamps: true });

const CartSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    quantity: Number,
    price: Number
  }]
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', UserSchema);
const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);
const Cart = mongoose.models.Cart || mongoose.model('Cart', CartSchema);

// Seed data
const seedData = async () => {
  const count = await Product.countDocuments();
  if (count > 0) return;
  
  const products = [
    {
      name: "Rolex Submariner Date",
      shortName: "Submariner",
      description: "The Submariner Date is the reference among divers' watches.",
      price: 9500,
      originalPrice: 11200,
      category: "Watches",
      brand: "Rolex",
      image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=90",
      images: ["https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=90"],
      stock: 5,
      rating: 4.9,
      reviews: 284,
      badge: "Best Seller",
      isActive: true,
      features: ["Swiss Automatic", "300m Water Resistance"],
      specs: { "Case Size": "41mm", "Movement": "Calibre 3235" }
    },
    {
      name: "Hermès Birkin 30",
      shortName: "Birkin 30",
      description: "The world's most coveted handbag.",
      price: 18900,
      originalPrice: 20500,
      category: "Bags",
      brand: "Hermès",
      image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&q=90",
      stock: 3,
      rating: 5.0,
      reviews: 98,
      badge: "Exclusive",
      isActive: true,
      features: ["Togo Leather", "Palladium Hardware"],
      specs: { "Size": "30cm" }
    },
    {
      name: "Gucci Ophidia Tote",
      shortName: "Ophidia Tote",
      description: "The Ophidia Structured Tote in supreme canvas.",
      price: 3200,
      originalPrice: 3800,
      category: "Bags",
      brand: "Gucci",
      image: "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=800&q=90",
      stock: 8,
      rating: 4.7,
      reviews: 562,
      badge: "New Arrival",
      isActive: true,
      features: ["GG Supreme Canvas", "Double G Hardware"],
      specs: { "Size": "40x32x16cm" }
    },
    {
      name: "Balenciaga Phantom Sneaker",
      shortName: "Phantom Low",
      description: "The Phantom Sneaker features an extreme XL outsole.",
      price: 1050,
      originalPrice: 1200,
      category: "Shoes",
      brand: "Balenciaga",
      image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=90",
      stock: 12,
      rating: 4.5,
      reviews: 341,
      badge: "Best Seller",
      isActive: true,
      features: ["Stretch Knit Upper", "XL Rubber Outsole"],
      specs: { "Upper": "Stretch Knit" }
    },
    {
      name: "Cartier Love Ring",
      shortName: "Love Ring",
      description: "The Love ring from Cartier's iconic collection.",
      price: 1850,
      originalPrice: 2100,
      category: "Jewelry",
      brand: "Cartier",
      image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&q=90",
      stock: 6,
      rating: 4.9,
      reviews: 430,
      badge: "Exclusive",
      isActive: true,
      features: ["18K Yellow Gold", "Screw Motif"],
      specs: { "Metal": "18K Yellow Gold" }
    },
    {
      name: "Chanel No. 5 EDP",
      shortName: "Chanel No.5",
      description: "The world's most iconic fragrance since 1921.",
      price: 185,
      originalPrice: 210,
      category: "Fragrance",
      brand: "Chanel",
      image: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=800&q=90",
      stock: 30,
      rating: 4.9,
      reviews: 892,
      badge: "Limited Edition",
      isActive: true,
      features: ["100ml EDP Spray", "Floral Aldehyde"],
      specs: { "Volume": "100ml" }
    }
  ];
  
  await Product.insertMany(products);
  
  // Create test users
  const bcrypt = require('bcryptjs');
  const hashedPassword = await bcrypt.hash('password123', 10);
  
  await User.create({
    name: "John Doe",
    email: "john@example.com",
    password: hashedPassword,
    role: "user"
  });
  
  await User.create({
    name: "Admin User",
    email: "admin@example.com",
    password: await bcrypt.hash('admin123', 10),
    role: "admin"
  });
  
  console.log('Data seeded');
};

module.exports = { connectDB, User, Product, Cart };
