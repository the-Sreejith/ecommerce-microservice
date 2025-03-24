const productModel = require('../models/product.model');
const rabbitmqConfig = require('../config/rabbitmq');
const logger = require('../utils/logger');

/**
 * Check if user is admin via RabbitMQ
 * @param {string} userId - User ID to check
 * @returns {Promise<boolean>} - Whether user is admin
 */
async function checkIsAdmin(userId) {
  try {
    const channel = rabbitmqConfig.getChannel();
    
    // Create a unique correlation ID for this request
    const correlationId = Date.now().toString();
    
    // Create a queue for the response
    const { queue: replyQueueName } = await channel.assertQueue('', { exclusive: true });
    
    // Send a message to the admin check queue
    channel.sendToQueue(
      rabbitmqConfig.ADMIN_CHECK_QUEUE,
      Buffer.from(JSON.stringify({ userId })),
      {
        correlationId,
        replyTo: replyQueueName,
      }
    );
    
    // Wait for the response with a timeout
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        channel.cancel(correlationId);
        reject(new Error('Admin check request timed out'));
      }, 5000);
      
      channel.consume(
        replyQueueName,
        (msg) => {
          if (msg.properties.correlationId === correlationId) {
            clearTimeout(timeout);
            const response = JSON.parse(msg.content.toString());
            resolve(response.isAdmin);
          }
        },
        { consumerTag: correlationId }
      );
    });
  } catch (error) {
    logger.error(`Error checking admin status: ${error.message}`);
    // Default to false if there's an error
    return false;
  }
}

/**
 * Notify inventory service about product changes
 * @param {string} action - The action performed (create, update, delete)
 * @param {Object} product - The product data
 */
async function notifyInventoryService(action, product) {
  try {
    const channel = rabbitmqConfig.getChannel();
    
    // Send a message to the inventory notification queue
    channel.sendToQueue(
      rabbitmqConfig.INVENTORY_NOTIFICATION_QUEUE,
      Buffer.from(JSON.stringify({ 
        action, 
        product,
        timestamp: new Date().toISOString() 
      })),
      { persistent: true }
    );
    
    logger.info(`Inventory service notified about ${action} action for product ${product.productId}`);
  } catch (error) {
    logger.error(`Error notifying inventory service: ${error.message}`);
    // Just log the error, don't stop the flow
  }
}

/**
 * Get all products with pagination and filtering
 * @param {Object} options - Query options
 * @returns {Promise<Object>} - List of products and pagination token
 */
async function getAllProducts(options = {}) {
  return productModel.getAllProducts(options);
}

/**
 * Get product by ID
 * @param {string} productId - ID of product to retrieve
 * @returns {Promise<Object|null>} - Product or null if not found
 */
async function getProductById(productId) {
  return productModel.getProductById(productId);
}

/**
 * Create a new product
 * @param {Object} productData - Product data to create
 * @param {string} userId - ID of user creating the product
 * @returns {Promise<Object>} - Created product
 */
async function createProduct(productData, userId) {
  // Check if user is admin
  const isAdmin = await checkIsAdmin(userId);
  if (!isAdmin) {
    throw new Error('Only admins can create products');
  }
  
  // Create the product
  const newProduct = await productModel.createProduct(productData);
  
  // Notify inventory service about new product
  await notifyInventoryService('create', newProduct);
  
  return newProduct;
}

/**
 * Update product by ID
 * @param {string} productId - ID of product to update
 * @param {Object} updates - Product data to update
 * @param {string} userId - ID of user updating the product
 * @returns {Promise<Object>} - Updated product
 */
async function updateProduct(productId, updates, userId) {
  // Check if user is admin
  const isAdmin = await checkIsAdmin(userId);
  if (!isAdmin) {
    throw new Error('Only admins can update products');
  }
  
  // Update the product
  const updatedProduct = await productModel.updateProduct(productId, updates);
  
  // Notify inventory service about updated product
  await notifyInventoryService('update', updatedProduct);
  
  return updatedProduct;
}

/**
 * Delete product by ID
 * @param {string} productId - ID of product to delete
 * @param {string} userId - ID of user deleting the product
 * @returns {Promise<boolean>} - Success status
 */
async function deleteProduct(productId, userId) {
  // Check if user is admin
  const isAdmin = await checkIsAdmin(userId);
  if (!isAdmin) {
    throw new Error('Only admins can delete products');
  }
  
  // Get the product before deleting it
  const product = await productModel.getProductById(productId);
  if (!product) {
    throw new Error(`Product with ID ${productId} not found`);
  }
  
  // Delete the product
  const result = await productModel.deleteProduct(productId);
  
  // Notify inventory service about deleted product
  await notifyInventoryService('delete', product);
  
  return result;
}

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
}; 