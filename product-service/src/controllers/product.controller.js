const productService = require('../services/product.service');
const logger = require('../utils/logger');

/**
 * Get all products
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function getAllProducts(req, res) {
  try {
    const { limit, nextToken, ...filters } = req.query;
    
    const options = {
      limit: limit ? parseInt(limit, 10) : undefined,
      lastEvaluatedKey: nextToken,
      filters,
    };
    
    const result = await productService.getAllProducts(options);
    
    return res.status(200).json(result);
  } catch (error) {
    logger.error(`Error getting all products: ${error.message}`);
    return res.status(500).json({ 
      error: 'Failed to retrieve products',
      message: error.message 
    });
  }
}

/**
 * Get product by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function getProductById(req, res) {
  try {
    const { productId } = req.params;
    
    const product = await productService.getProductById(productId);
    
    if (!product) {
      return res.status(404).json({ 
        error: 'Product not found',
        message: `Product with ID ${productId} not found` 
      });
    }
    
    return res.status(200).json(product);
  } catch (error) {
    logger.error(`Error getting product by ID: ${error.message}`);
    return res.status(500).json({ 
      error: 'Failed to retrieve product',
      message: error.message 
    });
  }
}

/**
 * Create a new product
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function createProduct(req, res) {
  try {
    const productData = req.body;
    
    // Extract user ID from authentication token
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ 
        error: 'Unauthorized',
        message: 'User not authenticated' 
      });
    }
    
    // Validate required fields
    const requiredFields = ['name', 'price', 'description'];
    for (const field of requiredFields) {
      if (!productData[field]) {
        return res.status(400).json({ 
          error: 'Bad request',
          message: `Missing required field: ${field}` 
        });
      }
    }
    
    const newProduct = await productService.createProduct(productData, userId);
    
    return res.status(201).json(newProduct);
  } catch (error) {
    logger.error(`Error creating product: ${error.message}`);
    
    if (error.message.includes('Only admins')) {
      return res.status(403).json({ 
        error: 'Forbidden',
        message: error.message 
      });
    }
    
    return res.status(500).json({ 
      error: 'Failed to create product',
      message: error.message 
    });
  }
}

/**
 * Update product by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function updateProduct(req, res) {
  try {
    const { productId } = req.params;
    const updates = req.body;
    
    // Extract user ID from authentication token
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ 
        error: 'Unauthorized',
        message: 'User not authenticated' 
      });
    }
    
    const updatedProduct = await productService.updateProduct(productId, updates, userId);
    
    return res.status(200).json(updatedProduct);
  } catch (error) {
    logger.error(`Error updating product: ${error.message}`);
    
    if (error.message.includes('not found')) {
      return res.status(404).json({ 
        error: 'Not found',
        message: error.message 
      });
    }
    
    if (error.message.includes('Only admins')) {
      return res.status(403).json({ 
        error: 'Forbidden',
        message: error.message 
      });
    }
    
    return res.status(500).json({ 
      error: 'Failed to update product',
      message: error.message 
    });
  }
}

/**
 * Delete product by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function deleteProduct(req, res) {
  try {
    const { productId } = req.params;
    
    // Extract user ID from authentication token
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ 
        error: 'Unauthorized',
        message: 'User not authenticated' 
      });
    }
    
    await productService.deleteProduct(productId, userId);
    
    return res.status(204).send();
  } catch (error) {
    logger.error(`Error deleting product: ${error.message}`);
    
    if (error.message.includes('not found')) {
      return res.status(404).json({ 
        error: 'Not found',
        message: error.message 
      });
    }
    
    if (error.message.includes('Only admins')) {
      return res.status(403).json({ 
        error: 'Forbidden',
        message: error.message 
      });
    }
    
    return res.status(500).json({ 
      error: 'Failed to delete product',
      message: error.message 
    });
  }
}

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
}; 