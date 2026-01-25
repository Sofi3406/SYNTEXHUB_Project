const Product = require('../models/Product');

// Create a new product
exports.createProduct = async (req, res) => {
    try {
        // Add createdBy from authenticated user
        const productData = {
            ...req.body,
            createdBy: req.user ? req.user._id : null
        };

        const product = new Product(productData);
        await product.save();

        res.status(201).json({
            success: true,
            message: 'Product created successfully',
            data: product
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'SKU already exists'
            });
        }
        res.status(500).json({
            success: false,
            message: 'Error creating product',
            error: error.message
        });
    }
};

// Get all products with search, filter, and pagination
exports.getAllProducts = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            search,
            category,
            minPrice,
            maxPrice,
            sortBy = 'createdAt',
            sortOrder = 'desc',
            inStock,
            hasDiscount
        } = req.query;

        // Build query
        let query = {};

        // Search by name or description (text search)
        if (search) {
            query.$text = { $search: search };
        }

        // Filter by category
        if (category) {
            query.category = category;
        }

        // Filter by price range
        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = parseFloat(minPrice);
            if (maxPrice) query.price.$lte = parseFloat(maxPrice);
        }

        // Filter by stock availability
        if (inStock === 'true') {
            query.stock = { $gt: 0 };
        } else if (inStock === 'false') {
            query.stock = 0;
        }

        // Filter by discount
        if (hasDiscount === 'true') {
            query.discount = { $gt: 0 };
        }

        // Calculate pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Build sort object
        const sort = {};
        sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

        // Execute query with pagination
        const products = await Product.find(query)
            .sort(sort)
            .skip(skip)
            .limit(parseInt(limit))
            .populate('createdBy', 'name email');

        // Get total count for pagination info
        const total = await Product.countDocuments(query);
        const totalPages = Math.ceil(total / parseInt(limit));

        res.status(200).json({
            success: true,
            count: products.length,
            total,
            totalPages,
            currentPage: parseInt(page),
            data: products
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching products',
            error: error.message
        });
    }
};

// Get single product by ID
exports.getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id)
            .populate('createdBy', 'name email');

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        res.status(200).json({
            success: true,
            data: product
        });
    } catch (error) {
        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                message: 'Invalid product ID format'
            });
        }
        res.status(500).json({
            success: false,
            message: 'Error fetching product',
            error: error.message
        });
    }
};

// Update product
exports.updateProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(
            req.params.id,
            { ...req.body, updatedAt: Date.now() },
            { new: true, runValidators: true }
        );

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Product updated successfully',
            data: product
        });
    } catch (error) {
        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                message: 'Invalid product ID format'
            });
        }
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'SKU already exists'
            });
        }
        res.status(500).json({
            success: false,
            message: 'Error updating product',
            error: error.message
        });
    }
};

// Delete product
exports.deleteProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Product deleted successfully'
        });
    } catch (error) {
        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                message: 'Invalid product ID format'
            });
        }
        res.status(500).json({
            success: false,
            message: 'Error deleting product',
            error: error.message
        });
    }
};

// Advanced search with MongoDB aggregation
exports.searchProducts = async (req, res) => {
    try {
        const {
            search,
            category,
            minPrice = 0,
            maxPrice = 1000000,
            minRating = 0,
            page = 1,
            limit = 10
        } = req.query;

        // Build aggregation pipeline
        const pipeline = [];

        // Match stage for filters
        const matchStage = {};
        
        if (search) {
            matchStage.$text = { $search: search };
        }
        
        if (category) {
            matchStage.category = category;
        }
        
        matchStage.price = { $gte: parseFloat(minPrice), $lte: parseFloat(maxPrice) };
        matchStage['ratings.average'] = { $gte: parseFloat(minRating) };
        matchStage.isActive = true;

        pipeline.push({ $match: matchStage });

        // Add discounted price calculation
        pipeline.push({
            $addFields: {
                discountedPrice: {
                    $multiply: ['$price', { $subtract: [1, { $divide: ['$discount', 100] }] }]
                }
            }
        });

        // Facet for pagination and total count
        pipeline.push({
            $facet: {
                metadata: [
                    { $count: 'total' },
                    { $addFields: { page: parseInt(page) } }
                ],
                data: [
                    { $skip: (parseInt(page) - 1) * parseInt(limit) },
                    { $limit: parseInt(limit) },
                    {
                        $lookup: {
                            from: 'users',
                            localField: 'createdBy',
                            foreignField: '_id',
                            as: 'createdBy'
                        }
                    },
                    { $unwind: { path: '$createdBy', preserveNullAndEmptyArrays: true } },
                    {
                        $project: {
                            'createdBy.password': 0,
                            'createdBy.__v': 0
                        }
                    }
                ]
            }
        });

        // Execute aggregation
        const result = await Product.aggregate(pipeline);

        // Format response
        const products = result[0].data;
        const metadata = result[0].metadata[0] || { total: 0, page: parseInt(page) };
        const totalPages = Math.ceil(metadata.total / parseInt(limit));

        res.status(200).json({
            success: true,
            count: products.length,
            total: metadata.total,
            totalPages,
            currentPage: parseInt(page),
            data: products
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error searching products',
            error: error.message
        });
    }
};

// Get product statistics
exports.getProductStats = async (req, res) => {
    try {
        const stats = await Product.aggregate([
            {
                $match: { isActive: true }
            },
            {
                $group: {
                    _id: null,
                    totalProducts: { $sum: 1 },
                    totalValue: { $sum: '$price' },
                    averagePrice: { $avg: '$price' },
                    maxPrice: { $max: '$price' },
                    minPrice: { $min: '$price' },
                    totalStock: { $sum: '$stock' }
                }
            },
            {
                $project: {
                    _id: 0,
                    totalProducts: 1,
                    totalValue: { $round: ['$totalValue', 2] },
                    averagePrice: { $round: ['$averagePrice', 2] },
                    maxPrice: 1,
                    minPrice: 1,
                    totalStock: 1
                }
            }
        ]);

        // Get category-wise distribution
        const categoryStats = await Product.aggregate([
            {
                $match: { isActive: true }
            },
            {
                $group: {
                    _id: '$category',
                    count: { $sum: 1 },
                    averagePrice: { $avg: '$price' }
                }
            },
            {
                $project: {
                    category: '$_id',
                    count: 1,
                    averagePrice: { $round: ['$averagePrice', 2] },
                    _id: 0
                }
            },
            {
                $sort: { count: -1 }
            }
        ]);

        res.status(200).json({
            success: true,
            data: {
                overall: stats[0] || {},
                byCategory: categoryStats
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching product statistics',
            error: error.message
        });
    }
};

// Get products by category with aggregation
exports.getProductsByCategory = async (req, res) => {
    try {
        const { category } = req.params;
        const { page = 1, limit = 10 } = req.query;

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const [products, categoryStats] = await Promise.all([
            Product.find({ category, isActive: true })
                .sort({ 'ratings.average': -1, createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit)),
            
            Product.aggregate([
                { $match: { category, isActive: true } },
                {
                    $group: {
                        _id: null,
                        totalProducts: { $sum: 1 },
                        averageRating: { $avg: '$ratings.average' },
                        averagePrice: { $avg: '$price' },
                        totalStock: { $sum: '$stock' }
                    }
                }
            ])
        ]);

        const total = await Product.countDocuments({ category, isActive: true });
        const totalPages = Math.ceil(total / parseInt(limit));

        res.status(200).json({
            success: true,
            category,
            stats: categoryStats[0] || {},
            pagination: {
                count: products.length,
                total,
                totalPages,
                currentPage: parseInt(page)
            },
            data: products
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching category products',
            error: error.message
        });
    }
};