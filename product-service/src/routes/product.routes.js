const express = require('express');
const productController = require('../controllers/product.controller');
const { authenticate } = require('../middlewares/auth.middleware');

const router = express.Router();

/**
 * @route GET /api/products
 * @desc Get all products
 * @access Public
 */
router.get('/', productController.getAllProducts);

/**
 * @route GET /api/products/:productId
 * @desc Get product by ID
 * @access Public
 */
router.get('/:productId', productController.getProductById);

/**
 * @route POST /api/products
 * @desc Create a new product
 * @access Private (Admin only)
 */
router.post('/', authenticate, productController.createProduct);

/**
 * @route PUT /api/products/:productId
 * @desc Update product by ID
 * @access Private (Admin only)
 */
router.put('/:productId', authenticate, productController.updateProduct);

/**
 * @route DELETE /api/products/:productId
 * @desc Delete product by ID
 * @access Private (Admin only)
 */
router.delete('/:productId', authenticate, productController.deleteProduct);

module.exports = router; 