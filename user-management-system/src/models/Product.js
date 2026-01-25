const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Product name is required'],
        trim: true,
        minlength: [3, 'Product name must be at least 3 characters'],
        maxlength: [200, 'Product name cannot exceed 200 characters']
    },
    description: {
        type: String,
        required: [true, 'Product description is required'],
        minlength: [10, 'Description must be at least 10 characters'],
        maxlength: [2000, 'Description cannot exceed 2000 characters']
    },
    price: {
        type: Number,
        required: [true, 'Product price is required'],
        min: [0, 'Price cannot be negative'],
        max: [1000000, 'Price cannot exceed 1,000,000']
    },
    category: {
        type: String,
        required: [true, 'Product category is required'],
        enum: {
            values: ['Electronics', 'Clothing', 'Books', 'Home & Kitchen', 'Sports', 'Toys', 'Beauty', 'Other'],
            message: '{VALUE} is not a valid category'
        }
    },
    subcategory: {
        type: String,
        trim: true
    },
    brand: {
        type: String,
        trim: true
    },
    sku: {
        type: String,
        required: [true, 'SKU is required'],
        unique: true,
        uppercase: true,
        trim: true
    },
    stock: {
        type: Number,
        required: [true, 'Stock quantity is required'],
        min: [0, 'Stock cannot be negative'],
        default: 0
    },
    images: [{
    type: String,
    validate: {
        validator: function(v) {
        
            return /^(https?:\/\/.*\.(?:png|jpg|jpeg|gif|webp|svg))|(https?:\/\/.*\/.*\.(?:png|jpg|jpeg|gif|webp|svg)\?.*)$/i.test(v);
        },
        message: 'Please provide a valid image URL'
    }
}],
    ratings: {
        average: {
            type: Number,
            min: [0, 'Rating must be at least 0'],
            max: [5, 'Rating cannot exceed 5'],
            default: 0
        },
        count: {
            type: Number,
            default: 0
        }
    },
    isActive: {
        type: Boolean,
        default: true
    },
    discount: {
        type: Number,
        min: [0, 'Discount cannot be negative'],
        max: [100, 'Discount cannot exceed 100%'],
        default: 0
    },
    tags: [{
        type: String,
        trim: true
    }],
    specifications: {
        type: Map,
        of: String
    },
    createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false  
},
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual for discounted price
productSchema.virtual('discountedPrice').get(function() {
    return this.price * (1 - this.discount / 100);
});

// Indexes for better query performance
productSchema.index({ name: 'text', description: 'text', category: 1 });
productSchema.index({ price: 1 });
productSchema.index({ category: 1, subcategory: 1 });
productSchema.index({ sku: 1 }, { unique: true });
productSchema.index({ 'ratings.average': -1 });
productSchema.index({ createdAt: -1 });

// Update timestamp before saving
productSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

// Text index for search
productSchema.index({ name: 'text', description: 'text', brand: 'text' });

const Product = mongoose.model('Product', productSchema);

module.exports = Product;