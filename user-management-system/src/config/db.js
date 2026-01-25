const mongoose = require('mongoose');
require('dotenv').config();
const { initGridFS } = require('../utils/gridfs'); 

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('MongoDB connected successfully');
        
        // Initialize GridFS after connection
        initGridFS(); 
        console.log('GridFS initialized');
        
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
};

module.exports = connectDB;