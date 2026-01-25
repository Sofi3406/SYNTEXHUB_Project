require('dotenv').config();

const basicAuth = (req, res, next) => {
    // Check if authorization header exists
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Basic ')) {
        return res.status(401).json({
            success: false,
            message: 'Authentication required. Please provide Basic Auth credentials.'
        });
    }

    // Extract and decode credentials
    const base64Credentials = authHeader.split(' ')[1];
    const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
    const [username, password] = credentials.split(':');

    // Verify credentials
    const validUsername = process.env.BASIC_AUTH_USERNAME || 'admin';
    const validPassword = process.env.BASIC_AUTH_PASSWORD || 'password123';

    if (username === validUsername && password === validPassword) {
        next();
    } else {
        return res.status(401).json({
            success: false,
            message: 'Invalid authentication credentials'
        });
    }
};

module.exports = basicAuth;