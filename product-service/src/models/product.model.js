const { v4: uuidv4 } = require('uuid');
const { docClient, PRODUCTS_TABLE } = require('../config/db');
const { PutCommand, GetCommand, QueryCommand, ScanCommand, DeleteCommand, UpdateCommand } = require('@aws-sdk/lib-dynamodb');
const logger = require('../utils/logger');

/**
 * Create a new product
 * @param {Object} productData - Product data
 * @returns {Promise<Object>} - Created product
 */
async function createProduct(productData) {
  const productId = uuidv4();
  const createdAt = new Date().toISOString();
  const updatedAt = createdAt;
  
  const newProduct = {
    productId,
    ...productData,
    createdAt,
    updatedAt,
  };
  
  const params = {
    TableName: PRODUCTS_TABLE,
    Item: newProduct,
  };
  
  try {
    await docClient.send(new PutCommand(params));
    logger.info(`Product created with ID: ${productId}`);
    return newProduct;
  } catch (error) {
    logger.error(`Error creating product: ${error.message}`);
    throw error;
  }
}

/**
 * Get product by ID
 * @param {string} productId - ID of product to retrieve
 * @returns {Promise<Object|null>} - Product or null if not found
 */
async function getProductById(productId) {
  const params = {
    TableName: PRODUCTS_TABLE,
    Key: { productId },
  };
  
  try {
    const { Item } = await docClient.send(new GetCommand(params));
    return Item || null;
  } catch (error) {
    logger.error(`Error getting product by ID ${productId}: ${error.message}`);
    throw error;
  }
}

/**
 * Get all products with optional filtering and pagination
 * @param {Object} options - Query options
 * @param {number} options.limit - Maximum number of items to return
 * @param {string} options.lastEvaluatedKey - Key to start from for pagination
 * @param {Object} options.filters - Filter conditions
 * @returns {Promise<Object>} - List of products and pagination token
 */
async function getAllProducts(options = {}) {
  const { limit = 50, lastEvaluatedKey, filters = {} } = options;
  
  const params = {
    TableName: PRODUCTS_TABLE,
    Limit: limit,
  };
  
  if (lastEvaluatedKey) {
    params.ExclusiveStartKey = JSON.parse(Buffer.from(lastEvaluatedKey, 'base64').toString());
  }
  
  // Add filters if provided
  if (Object.keys(filters).length > 0) {
    // Implementation of filters would depend on your specific requirements
    // This is a placeholder for filter implementation
  }
  
  try {
    const { Items, LastEvaluatedKey } = await docClient.send(new ScanCommand(params));
    
    return {
      products: Items,
      nextToken: LastEvaluatedKey 
        ? Buffer.from(JSON.stringify(LastEvaluatedKey)).toString('base64') 
        : null,
    };
  } catch (error) {
    logger.error(`Error getting all products: ${error.message}`);
    throw error;
  }
}

/**
 * Update product by ID
 * @param {string} productId - ID of product to update
 * @param {Object} updates - Product data to update
 * @returns {Promise<Object>} - Updated product
 */
async function updateProduct(productId, updates) {
  // First check if product exists
  const existingProduct = await getProductById(productId);
  if (!existingProduct) {
    throw new Error(`Product with ID ${productId} not found`);
  }
  
  const updatedAt = new Date().toISOString();
  
  // Build update expression and attribute values
  let updateExpression = 'SET updatedAt = :updatedAt';
  const expressionAttributeValues = {
    ':updatedAt': updatedAt,
  };
  
  Object.entries(updates).forEach(([key, value]) => {
    if (key !== 'productId' && key !== 'createdAt') {
      updateExpression += `, ${key} = :${key}`;
      expressionAttributeValues[`:${key}`] = value;
    }
  });
  
  const params = {
    TableName: PRODUCTS_TABLE,
    Key: { productId },
    UpdateExpression: updateExpression,
    ExpressionAttributeValues: expressionAttributeValues,
    ReturnValues: 'ALL_NEW',
  };
  
  try {
    const { Attributes } = await docClient.send(new UpdateCommand(params));
    logger.info(`Product updated with ID: ${productId}`);
    return Attributes;
  } catch (error) {
    logger.error(`Error updating product with ID ${productId}: ${error.message}`);
    throw error;
  }
}

/**
 * Delete product by ID
 * @param {string} productId - ID of product to delete
 * @returns {Promise<boolean>} - Success status
 */
async function deleteProduct(productId) {
  const params = {
    TableName: PRODUCTS_TABLE,
    Key: { productId },
  };
  
  try {
    await docClient.send(new DeleteCommand(params));
    logger.info(`Product deleted with ID: ${productId}`);
    return true;
  } catch (error) {
    logger.error(`Error deleting product with ID ${productId}: ${error.message}`);
    throw error;
  }
}

module.exports = {
  createProduct,
  getProductById,
  getAllProducts,
  updateProduct,
  deleteProduct,
}; 