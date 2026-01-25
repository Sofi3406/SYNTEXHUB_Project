const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const authMiddleware = require('../middleware/auth');
const { productValidationRules, queryValidationRules, validate } = require('../middleware/validate');

// Public routes (no authentication required)
router.get('/products', queryValidationRules(), validate, productController.getAllProducts);
router.get('/products/search', queryValidationRules(), validate, productController.searchProducts);
router.get('/products/stats', productController.getProductStats);
router.get('/products/category/:category', queryValidationRules(), validate, productController.getProductsByCategory);
router.get('/products/:id', productController.getProductById);

// Protected routes (require authentication)
router.use(authMiddleware);

router.post('/products', 
    productValidationRules(), 
    validate, 
    productController.createProduct
);

router.put('/products/:id',
    productValidationRules(),
    validate,
    productController.updateProduct
);

router.delete('/products/:id', productController.deleteProduct);

module.exports = router;