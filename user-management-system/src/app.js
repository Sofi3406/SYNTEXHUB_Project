const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const productRoutes = require('./routes/productRoutes');

dotenv.config();

const app = express();

connectDB();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api', userRoutes);
app.use('/api', productRoutes); 

app.get('/', (req, res) => {
    res.json({
        message: 'User & Product Management System API',
        version: '2.0.0',
        endpoints: {
            // User endpoints
            users: {
                createUser: 'POST /api/users',
                getAllUsers: 'GET /api/users',
                getUser: 'GET /api/users/:id',
                updateUser: 'PUT /api/users/:id',
                deleteUser: 'DELETE /api/users/:id'
            },
            // Product endpoints
            products: {
                createProduct: 'POST /api/products (Auth Required)',
                getAllProducts: 'GET /api/products',
                searchProducts: 'GET /api/products/search',
                getProduct: 'GET /api/products/:id',
                updateProduct: 'PUT /api/products/:id (Auth Required)',
                deleteProduct: 'DELETE /api/products/:id (Auth Required)',
                getStats: 'GET /api/products/stats',
                getByCategory: 'GET /api/products/category/:category'
            }
        },
        authentication: {
            type: 'Basic Authentication',
            credentials: 'admin/password123 (Required for protected routes)'
        }
    });
});

app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err.message : {}
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`API Base URL: http://localhost:${PORT}/api`);
});

module.exports = app;