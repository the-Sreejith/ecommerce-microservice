const productModel = require('../models/productModel');
const logger = require('../utils/logger');

// Get all products with pagination and filtering
const getProducts = async (req, res, next) => {
  try {
    const limit = req.query.limit || 50;
    const nextPageToken = req.query.nextPageToken || null;
    
    // Parse filters from query parameters
    const filters = {};
    Object.entries(req.query).forEach(([key, value]) => {
      if (!['limit', 'nextPageToken'].includes(key)) {
        filters[key] = value;
      }
    });

    const result = await productModel.getProducts(limit, nextPageToken, filters);
    
    res.json({
      products: result.products,
      nextPageToken: result.nextPageToken,
      count: result.products.length
    });
  } catch (error) {
    next(error);
  }
};

// Get a specific product by ID
const getProductById = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const product = await productModel.getProductById(productId);
    
    if (!product) {
      const error = new Error('Product not found');
      error.statusCode = 404;
      throw error;
    }
    
    res.json(product);
  } catch (error) {
    next(error);
  }
};

// Create a new product (admin only)
const createProduct = async (req, res, next) => {
  try {
    // Validate required fields
    const { name, price, description } = req.body;
    
    if (!name || !price) {
      const error = new Error('Product name and price are required');
      error.statusCode = 400;
      throw error;
    }

    const productData = {
      name,
      price: parseFloat(price),
      description,
      ...req.body
    };

    const product = await productModel.createProduct(productData);
    
    res.status(201).json(product);
  } catch (error) {
    next(error);
  }
};

// Update a product (admin only)
const updateProduct = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const updates = req.body;
    
    if (Object.keys(updates).length === 0) {
      const error = new Error('No update data provided');
      error.statusCode = 400;
      throw error;
    }

    const updatedProduct = await productModel.updateProduct(productId, updates);
    
    res.json(updatedProduct);
  } catch (error) {
    next(error);
  }
};

// Delete a product (admin only)
const deleteProduct = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const deletedProduct = await productModel.deleteProduct(productId);
    
    res.json({
      message: 'Product deleted successfully',
      product: deletedProduct
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
};

// src/routes/productRoutes.js
const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

// Public routes
router.get('/', productController.getProducts);
router.get('/:productId', productController.getProductById);

// Admin routes
router.post('/', verifyToken, isAdmin, productController.createProduct);
router.put('/:productId', verifyToken, isAdmin, productController.updateProduct);
router.delete('/:productId', verifyToken, isAdmin, productController.deleteProduct);

module.exports = router;
