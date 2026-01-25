const mongoose = require('mongoose');
const Product = require('./src/models/Product');
require('dotenv').config();

const sampleProducts = [
    {
        name: "iPhone 15 Pro",
        description: "Latest iPhone with A17 Pro chip, titanium design, and advanced camera system",
        price: 999.99,
        category: "Electronics",
        subcategory: "Smartphones",
        brand: "Apple",
        sku: "IPH15PRO256",
        stock: 50,
        images: ["https://example.com/iphone15-1.jpg", "https://example.com/iphone15-2.jpg"],
        discount: 5,
        tags: ["smartphone", "apple", "premium", "5g"],
        specifications: {
            "Processor": "A17 Pro",
            "RAM": "8GB",
            "Storage": "256GB",
            "Display": "6.1-inch Super Retina XDR",
            "Camera": "48MP + 12MP + 12MP"
        }
    },
    {
        name: "MacBook Air M2",
        description: "Thin and light laptop with M2 chip, perfect for productivity",
        price: 1099.99,
        category: "Electronics",
        subcategory: "Laptops",
        brand: "Apple",
        sku: "MBAIRM213",
        stock: 30,
        images: ["https://example.com/macbook-air.jpg"],
        discount: 0,
        tags: ["laptop", "apple", "ultrabook", "m2"],
        specifications: {
            "Processor": "Apple M2",
            "RAM": "8GB",
            "Storage": "256GB SSD",
            "Display": "13.6-inch Liquid Retina",
            "Battery": "18 hours"
        }
    },
    {
        name: "Nike Air Max 270",
        description: "Comfortable sneakers with Max Air cushioning",
        price: 149.99,
        category: "Clothing",
        subcategory: "Footwear",
        brand: "Nike",
        sku: "NIKEAM270BK",
        stock: 100,
        images: ["https://example.com/nike-airmax.jpg"],
        discount: 15,
        tags: ["shoes", "sneakers", "sports", "comfort"],
        specifications: {
            "Material": "Mesh and synthetic",
            "Color": "Black/White",
            "Size Range": "US 6-13",
            "Gender": "Unisex"
        }
    },
    {
        name: "The Silent Patient",
        description: "Psychological thriller novel by Alex Michaelides",
        price: 14.99,
        category: "Books",
        subcategory: "Fiction",
        brand: "Publisher",
        sku: "BOOKSILPAT",
        stock: 200,
        images: ["https://example.com/silent-patient.jpg"],
        discount: 10,
        tags: ["book", "thriller", "bestseller", "fiction"],
        specifications: {
            "Author": "Alex Michaelides",
            "Pages": "336",
            "Publisher": "Celadon Books",
            "Language": "English"
        }
    },
    {
        name: "Instant Pot Duo",
        description: "7-in-1 electric pressure cooker",
        price: 89.99,
        category: "Home & Kitchen",
        subcategory: "Cookware",
        brand: "Instant Pot",
        sku: "INSTPOTDUO",
        stock: 75,
        images: ["https://example.com/instant-pot.jpg"],
        discount: 20,
        tags: ["kitchen", "cooking", "pressure cooker", "appliance"],
        specifications: {
            "Capacity": "6 quarts",
            "Functions": "7-in-1",
            "Power": "1000W",
            "Material": "Stainless steel"
        }
    },
    {
        name: "Yoga Mat",
        description: "Non-slip premium yoga mat for all exercises",
        price: 29.99,
        category: "Sports",
        subcategory: "Fitness",
        brand: "Gaiam",
        sku: "YOGASTDMAT",
        stock: 150,
        images: ["https://example.com/yoga-mat.jpg"],
        discount: 25,
        tags: ["fitness", "yoga", "exercise", "mat"],
        specifications: {
            "Thickness": "6mm",
            "Material": "PVC",
            "Dimensions": "68 x 24 inches",
            "Color": "Purple"
        }
    },
    {
        name: "LEGO Star Wars Millennium Falcon",
        description: "Detailed LEGO set of the iconic Star Wars spacecraft",
        price: 159.99,
        category: "Toys",
        subcategory: "Building Sets",
        brand: "LEGO",
        sku: "LEGOSWMILF",
        stock: 25,
        images: ["https://example.com/lego-falcon.jpg"],
        discount: 0,
        tags: ["lego", "star wars", "toy", "collectible"],
        specifications: {
            "Pieces": "1351",
            "Age": "9+",
            "Dimensions": "22 x 33 x 8 cm",
            "Theme": "Star Wars"
        }
    },
    {
        name: "Ceramic Coffee Mug Set",
        description: "Set of 4 handmade ceramic mugs",
        price: 34.99,
        category: "Home & Kitchen",
        subcategory: "Tableware",
        brand: "Handmade",
        sku: "CERMUGSET4",
        stock: 80,
        images: ["https://example.com/coffee-mugs.jpg"],
        discount: 30,
        tags: ["mugs", "kitchen", "ceramic", "handmade"],
        specifications: {
            "Material": "Ceramic",
            "Capacity": "12oz each",
            "Dishwasher Safe": "Yes",
            "Microwave Safe": "Yes"
        }
    },
    {
        name: "Wireless Bluetooth Headphones",
        description: "Noise cancelling headphones with 30-hour battery",
        price: 199.99,
        category: "Electronics",
        subcategory: "Audio",
        brand: "Sony",
        sku: "SONYWH1000",
        stock: 40,
        images: ["https://example.com/headphones.jpg"],
        discount: 12,
        tags: ["headphones", "audio", "wireless", "bluetooth"],
        specifications: {
            "Battery": "30 hours",
            "Noise Cancelling": "Yes",
            "Connectivity": "Bluetooth 5.0",
            "Weight": "254g"
        }
    },
    {
        name: "Organic Face Serum",
        description: "Natural vitamin C serum for brightening skin",
        price: 24.99,
        category: "Beauty",
        subcategory: "Skincare",
        brand: "Organic Beauty",
        sku: "ORGSERUMVC",
        stock: 120,
        images: ["https://example.com/face-serum.jpg"],
        discount: 8,
        tags: ["skincare", "beauty", "organic", "vitamin c"],
        specifications: {
            "Volume": "30ml",
            "Ingredients": "100% Natural",
            "Skin Type": "All",
            "Made In": "USA"
        }
    }
];

const seedDatabase = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/user_management_db');
        console.log('Connected to MongoDB');

        // Clear existing products
        await Product.deleteMany({});
        console.log('Cleared existing products');

        // Insert sample products
        // Add createdBy field (using a dummy user ID)
        const productsWithCreator = sampleProducts.map(product => ({
            ...product,
            createdBy: new mongoose.Types.ObjectId() // Dummy user ID
        }));

        await Product.insertMany(productsWithCreator);
        console.log(`Inserted ${sampleProducts.length} sample products`);

        // Create text index if not exists
        await Product.collection.createIndex({ name: 'text', description: 'text', brand: 'text' });
        console.log('Text index created');

        console.log('Database seeded successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
};

seedDatabase();