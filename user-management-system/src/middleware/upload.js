const multer = require('multer');
const { generateUniqueFilename, getFileExtension, isValidFileType } = require('../utils/gridfs');

// Configure multer storage
const storage = multer.memoryStorage();

// File filter function
const fileFilter = (req, file, cb) => {
    const extension = getFileExtension(file.originalname);
    
    if (!isValidFileType(extension)) {
        const error = new Error('Invalid file type. Allowed types: images, documents, videos, audio, zip');
        error.code = 'INVALID_FILE_TYPE';
        return cb(error, false);
    }

    // Check file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
        const error = new Error('File size too large. Maximum size is 10MB');
        error.code = 'FILE_TOO_LARGE';
        return cb(error, false);
    }

    cb(null, true);
};

// Create multer instance
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
        files: 5 
    }
});

// Single file upload middleware
const uploadSingle = (fieldName = 'file') => {
    return (req, res, next) => {
        const uploadMiddleware = upload.single(fieldName);
        
        uploadMiddleware(req, res, (err) => {
            if (err) {
                console.error('Single upload error:', err.message, err.code);
                
                if (err.code === 'LIMIT_FILE_SIZE') {
                    return res.status(400).json({
                        success: false,
                        message: 'File size too large. Maximum size is 10MB'
                    });
                }
                if (err.code === 'INVALID_FILE_TYPE') {
                    return res.status(400).json({
                        success: false,
                        message: err.message
                    });
                }
                return res.status(400).json({
                    success: false,
                    message: 'File upload error',
                    error: err.message
                });
            }
            
            // Log file info for debugging
            if (req.file) {
                console.log('File uploaded:', req.file.originalname, req.file.size, 'bytes');
            }
            
            next();
        });
    };
};

// Multiple files upload middleware
const uploadMultiple = (fieldName = 'files', maxCount = 5) => {
    return (req, res, next) => {
        console.log('Upload multiple called with field:', fieldName);
        console.log('Request headers:', req.headers['content-type']);
        
        const uploadMiddleware = upload.array(fieldName, maxCount);
        
        uploadMiddleware(req, res, (err) => {
            if (err) {
                console.error('Multiple upload error:', err.message, err.code, err.field);
                
                if (err.code === 'LIMIT_FILE_SIZE') {
                    return res.status(400).json({
                        success: false,
                        message: 'File size too large. Maximum size is 10MB'
                    });
                }
                if (err.code === 'LIMIT_UNEXPECTED_FILE') {
                    return res.status(400).json({
                        success: false,
                        message: `Please use "${fieldName}" as the field name. Maximum ${maxCount} files allowed`
                    });
                }
                if (err.code === 'INVALID_FILE_TYPE') {
                    return res.status(400).json({
                        success: false,
                        message: err.message
                    });
                }
                // Handle "Field name missing" error
                if (err.message && err.message.includes('Field name missing')) {
                    return res.status(400).json({
                        success: false,
                        message: `Please use form-data with "${fieldName}" as the field name for file uploads`
                    });
                }
                return res.status(400).json({
                    success: false,
                    message: 'File upload error',
                    error: err.message
                });
            }
            
            // Log files info for debugging
            if (req.files && req.files.length > 0) {
                console.log(`Uploaded ${req.files.length} files:`);
                req.files.forEach(file => {
                    console.log(`  - ${file.originalname} (${file.size} bytes)`);
                });
            }
            
            next();
        });
    };
};

module.exports = {
    upload,
    uploadSingle,
    uploadMultiple
};