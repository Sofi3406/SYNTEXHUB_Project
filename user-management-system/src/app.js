const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const productRoutes = require('./routes/productRoutes');
const fileRoutes = require('./routes/fileRoutes'); 

dotenv.config();

const app = express();

connectDB();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api', userRoutes);
app.use('/api', productRoutes);
app.use('/api', fileRoutes);

app.get('/', (req, res) => {
    res.json({
        message: 'User, Product & File Management System API',
        version: '3.0.0',
        endpoints: {
            // User endpoints
            users: {
                createUser: 'POST /api/users (Auth Required)',
                getAllUsers: 'GET /api/users (Auth Required)',
                getUser: 'GET /api/users/:id (Auth Required)',
                updateUser: 'PUT /api/users/:id (Auth Required)',
                deleteUser: 'DELETE /api/users/:id (Auth Required)'
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
            },
            // File endpoints (NEW)
            files: {
                uploadSingle: 'POST /api/files/upload (Auth Required)',
                uploadMultiple: 'POST /api/files/upload-multiple (Auth Required)',
                getAllFiles: 'GET /api/files',
                getFileMetadata: 'GET /api/files/metadata/:filename',
                downloadFile: 'GET /api/files/download/:filename',
                viewFile: 'GET /api/files/view/:filename',
                deleteFile: 'DELETE /api/files/:filename (Auth Required)',
                getStats: 'GET /api/files/stats'
            }
        },
        authentication: {
            type: 'Basic Authentication',
            credentials: 'admin/password123 (Required for protected routes)'
        },
        fileUpload: {
            maxSize: '10MB per file',
            maxFiles: '5 files per upload',
            allowedTypes: 'Images (jpg, png, gif), Documents (pdf, doc, xls, ppt), Audio/Video (mp3, mp4), Zip, Text'
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