const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoutes');


dotenv.config();


const app = express();


connectDB();


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api', userRoutes);

// Root route
app.get('/', (req, res) => {
    res.json({
        message: 'User Management System API',
        version: '1.0.0',
        endpoints: {
            createUser: 'POST /api/users',
            getAllUsers: 'GET /api/users',
            getUser: 'GET /api/users/:id',
            updateUser: 'PUT /api/users/:id',
            deleteUser: 'DELETE /api/users/:id'
        },
        authentication: 'Basic Auth required for all endpoints'
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err.message : {}
    });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
   
});

module.exports = app;