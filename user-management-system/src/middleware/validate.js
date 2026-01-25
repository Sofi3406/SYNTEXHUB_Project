const { body, param, query, validationResult } = require('express-validator');

// Validation rules for products
const productValidationRules = () => {
    return [
        body('name')
            .notEmpty().withMessage('Product name is required')
            .isLength({ min: 3, max: 200 }).withMessage('Name must be 3-200 characters'),
        
        body('description')
            .notEmpty().withMessage('Description is required')
            .isLength({ min: 10, max: 2000 }).withMessage('Description must be 10-2000 characters'),
        
        body('price')
            .notEmpty().withMessage('Price is required')
            .isFloat({ min: 0, max: 1000000 }).withMessage('Price must be between 0 and 1,000,000'),
        
        body('category')
            .notEmpty().withMessage('Category is required')
            .isIn(['Electronics', 'Clothing', 'Books', 'Home & Kitchen', 'Sports', 'Toys', 'Beauty', 'Other'])
            .withMessage('Invalid category'),
        
        body('sku')
            .notEmpty().withMessage('SKU is required')
            .isUppercase().withMessage('SKU must be uppercase')
            .trim(),
        
        body('stock')
            .optional()
            .isInt({ min: 0 }).withMessage('Stock must be a positive integer'),
        
        body('discount')
            .optional()
            .isFloat({ min: 0, max: 100 }).withMessage('Discount must be between 0 and 100'),
        
        body('images')
            .optional()
            .isArray().withMessage('Images must be an array')
            .custom((images) => {
                if (images && images.length > 5) {
                    throw new Error('Maximum 5 images allowed');
                }
                return true;
            }),
        
        body('tags')
            .optional()
            .isArray().withMessage('Tags must be an array'),
        
        body('specifications')
            .optional()
            .isObject().withMessage('Specifications must be an object')
    ];
};

// Validation for query parameters
const queryValidationRules = () => {
    return [
        query('page')
            .optional()
            .isInt({ min: 1 }).withMessage('Page must be a positive integer')
            .toInt(),
        
        query('limit')
            .optional()
            .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
            .toInt(),
        
        query('minPrice')
            .optional()
            .isFloat({ min: 0 }).withMessage('Minimum price must be positive')
            .toFloat(),
        
        query('maxPrice')
            .optional()
            .isFloat({ min: 0 }).withMessage('Maximum price must be positive')
            .toFloat(),
        
        query('category')
            .optional()
            .trim(),
        
        query('sortBy')
            .optional()
            .isIn(['name', 'price', 'createdAt', 'ratings.average', 'discountedPrice'])
            .withMessage('Invalid sort field'),
        
        query('sortOrder')
            .optional()
            .isIn(['asc', 'desc'])
            .withMessage('Sort order must be asc or desc')
    ];
};

// Validate function
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (errors.isEmpty()) {
        return next();
    }
    
    const extractedErrors = [];
    errors.array().map(err => extractedErrors.push({ [err.path]: err.msg }));
    
    return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: extractedErrors
    });
};

module.exports = {
    productValidationRules,
    queryValidationRules,
    validate
};