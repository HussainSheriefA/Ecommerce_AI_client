require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');
const User = require('./models/User');

const seedData = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: process.env.DB_NAME || 'ecommerceai'
    });
    console.log('Connected to MongoDB');

    // Clear existing data
    await Product.deleteMany({});
    await User.deleteMany({});
    console.log('Cleared existing data');

    // Add dummy products
    const products = [
      {
        name: "Rolex Submariner Date",
        shortName: "Submariner",
        description: "The Submariner Date is the reference among divers' watches. Waterproof to a depth of 300 metres.",
        price: 9500,
        originalPrice: 11200,
        category: "Watches",
        brand: "Rolex",
        image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=90",
        images: [
          "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=90",
          "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=800&q=90"
        ],
        stock: 5,
        rating: 4.9,
        reviews: 284,
        badge: "Best Seller",
        isActive: true,
        features: ["Swiss Automatic Movement", "300m Water Resistance", "Oystersteel Case"],
        specs: { "Case Size": "41mm", "Movement": "Calibre 3235", "Water Resistance": "300m" }
      },
      {
        name: "Hermès Birkin 30",
        shortName: "Birkin 30",
        description: "The world's most coveted handbag. Each Birkin requires 18-25 hours to handcraft.",
        price: 18900,
        originalPrice: 20500,
        category: "Bags",
        brand: "Hermès",
        image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&q=90",
        images: [
          "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&q=90",
          "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&q=90"
        ],
        stock: 3,
        rating: 5.0,
        reviews: 98,
        badge: "Exclusive",
        isActive: true,
        features: ["Togo Leather", "Palladium Hardware", "Hand-stitched"],
        specs: { "Size": "30cm", "Leather": "Togo", "Hardware": "Palladium" }
      },
      {
        name: "Gucci Ophidia Tote",
        shortName: "Ophidia Tote",
        description: "The Ophidia Structured Tote in supreme canvas with leather trim and Double G hardware.",
        price: 3200,
        originalPrice: 3800,
        category: "Bags",
        brand: "Gucci",
        image: "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=800&q=90",
        images: [
          "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=800&q=90"
        ],
        stock: 8,
        rating: 4.7,
        reviews: 562,
        badge: "New Arrival",
        isActive: true,
        features: ["GG Supreme Canvas", "Leather Trim", "Double G Hardware"],
        specs: { "Size": "40x32x16cm", "Material": "GG Supreme", "Origin": "Italy" }
      },
      {
        name: "Balenciaga Phantom Sneaker",
        shortName: "Phantom Low",
        description: "The Phantom Sneaker features an extreme XL outsole and sock-like stretch knit upper.",
        price: 1050,
        originalPrice: 1200,
        category: "Shoes",
        brand: "Balenciaga",
        image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=90",
        images: [
          "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=90",
          "https://images.unsplash.com/photo-1528701800489-20be2dfbe2e3?w=800&q=90"
        ],
        stock: 12,
        rating: 4.5,
        reviews: 341,
        badge: "Best Seller",
        isActive: true,
        features: ["Stretch Knit Upper", "XL Rubber Outsole", "Recycled Materials"],
        specs: { "Upper": "Stretch Knit", "Sole": "XL Rubber", "Fit": "True to Size" }
      },
      {
        name: "Cartier Love Ring",
        shortName: "Love Ring",
        description: "The Love ring from Cartier's iconic collection. Crafted in 18K yellow gold.",
        price: 1850,
        originalPrice: 2100,
        category: "Jewelry",
        brand: "Cartier",
        image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&q=90",
        images: [
          "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&q=90"
        ],
        stock: 6,
        rating: 4.9,
        reviews: 430,
        badge: "Exclusive",
        isActive: true,
        features: ["18K Yellow Gold", "Screw Motif Design", "Certificate of Authenticity"],
        specs: { "Metal": "18K Yellow Gold", "Width": "3.65mm", "Origin": "France" }
      },
      {
        name: "Chanel No. 5 EDP",
        shortName: "Chanel No.5",
        description: "The world's most iconic fragrance since 1921. A floral aldehyde masterpiece.",
        price: 185,
        originalPrice: 210,
        category: "Fragrance",
        brand: "Chanel",
        image: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=800&q=90",
        images: [
          "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=800&q=90"
        ],
        stock: 30,
        rating: 4.9,
        reviews: 892,
        badge: "Limited Edition",
        isActive: true,
        features: ["100ml EDP Spray", "Top: Aldehyde, Neroli", "Heart: Rose, Jasmine"],
        specs: { "Volume": "100ml", "Type": "EDP", "Longevity": "8-10hrs" }
      }
    ];

    const createdProducts = await Product.insertMany(products);
    console.log(`✅ Created ${createdProducts.length} products`);

    // Add dummy user
    const user = new User({
      name: "John Doe",
      email: "john@example.com",
      password: "password123",
      role: "user"
    });
    await user.save();
    console.log('✅ Created dummy user: john@example.com / password123');

    // Add admin user
    const admin = new User({
      name: "Admin User",
      email: "admin@example.com",
      password: "admin123",
      role: "admin"
    });
    await admin.save();
    console.log('✅ Created admin user: admin@example.com / admin123');

    console.log('\n🎉 Database seeded successfully!');
    console.log('\nTest Credentials:');
    console.log('  User: john@example.com / password123');
    console.log('  Admin: admin@example.com / admin123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error.message);
    process.exit(1);
  }
};

seedData();
