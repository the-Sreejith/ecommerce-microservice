const productService = require('../../services/product.service');
const productModel = require('../../models/product.model');
const rabbitmqConfig = require('../../config/rabbitmq');

// Mock the product model
jest.mock('../../models/product.model');

// Mock RabbitMQ config
jest.mock('../../config/rabbitmq', () => ({
  getChannel: jest.fn(),
  ADMIN_CHECK_QUEUE: 'admin_check_test',
  INVENTORY_NOTIFICATION_QUEUE: 'inventory_notification_test'
}));

describe('Product Service', () => {
  let mockChannel;
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock RabbitMQ channel methods
    mockChannel = {
      assertQueue: jest.fn().mockResolvedValue({ queue: 'reply-queue' }),
      sendToQueue: jest.fn(),
      consume: jest.fn((queue, callback) => {
        // Simulate RabbitMQ response for admin check
        const msg = {
          content: Buffer.from(JSON.stringify({ isAdmin: true })),
          properties: { correlationId: expect.any(String) }
        };
        callback(msg);
      })
    };
    
    rabbitmqConfig.getChannel.mockReturnValue(mockChannel);
  });

  describe('getAllProducts', () => {
    test('should call the model and return products', async () => {
      // Arrange
      const options = { limit: 10 };
      const mockProducts = {
        products: [{ id: '1', name: 'Test' }],
        nextToken: 'token123'
      };
      
      productModel.getAllProducts.mockResolvedValueOnce(mockProducts);
      
      // Act
      const result = await productService.getAllProducts(options);
      
      // Assert
      expect(productModel.getAllProducts).toHaveBeenCalledWith(options);
      expect(result).toEqual(mockProducts);
    });
  });
  
  describe('getProductById', () => {
    test('should call the model and return a product', async () => {
      // Arrange
      const productId = 'test-id';
      const mockProduct = { id: productId, name: 'Test Product' };
      
      productModel.getProductById.mockResolvedValueOnce(mockProduct);
      
      // Act
      const result = await productService.getProductById(productId);
      
      // Assert
      expect(productModel.getProductById).toHaveBeenCalledWith(productId);
      expect(result).toEqual(mockProduct);
    });
  });
  
  describe('createProduct', () => {
    test('should check admin status, create product, and notify inventory', async () => {
      // Arrange
      const userId = 'user-123';
      const productData = { name: 'New Product', price: 29.99, description: 'Test' };
      const createdProduct = { productId: 'new-id', ...productData };
      
      productModel.createProduct.mockResolvedValueOnce(createdProduct);
      
      // Act
      const result = await productService.createProduct(productData, userId);
      
      // Assert
      expect(rabbitmqConfig.getChannel).toHaveBeenCalled();
      expect(mockChannel.assertQueue).toHaveBeenCalled();
      expect(mockChannel.sendToQueue).toHaveBeenCalledTimes(2); // Once for admin check, once for inventory notification
      expect(productModel.createProduct).toHaveBeenCalledWith(productData);
      expect(result).toEqual(createdProduct);
    });
    
    test('should throw error if user is not admin', async () => {
      // Arrange
      const userId = 'non-admin-user';
      const productData = { name: 'New Product' };
      
      // Override the consume mock to return non-admin status
      mockChannel.consume = jest.fn((queue, callback) => {
        const msg = {
          content: Buffer.from(JSON.stringify({ isAdmin: false })),
          properties: { correlationId: expect.any(String) }
        };
        callback(msg);
      });
      
      // Act & Assert
      await expect(productService.createProduct(productData, userId))
        .rejects.toThrow('Only admins can create products');
      
      expect(productModel.createProduct).not.toHaveBeenCalled();
    });
  });
  
  describe('updateProduct', () => {
    test('should check admin status, update product, and notify inventory', async () => {
      // Arrange
      const productId = 'product-123';
      const userId = 'admin-user';
      const updates = { name: 'Updated Product', price: 39.99 };
      const updatedProduct = { productId, ...updates };
      
      productModel.updateProduct.mockResolvedValueOnce(updatedProduct);
      
      // Act
      const result = await productService.updateProduct(productId, updates, userId);
      
      // Assert
      expect(rabbitmqConfig.getChannel).toHaveBeenCalled();
      expect(mockChannel.assertQueue).toHaveBeenCalled();
      expect(mockChannel.sendToQueue).toHaveBeenCalledTimes(2); // Once for admin check, once for inventory notification
      expect(productModel.updateProduct).toHaveBeenCalledWith(productId, updates);
      expect(result).toEqual(updatedProduct);
    });
    
    test('should throw error if user is not admin', async () => {
      // Arrange
      const productId = 'product-123';
      const userId = 'non-admin-user';
      const updates = { name: 'Updated Product' };
      
      // Override the consume mock to return non-admin status
      mockChannel.consume = jest.fn((queue, callback) => {
        const msg = {
          content: Buffer.from(JSON.stringify({ isAdmin: false })),
          properties: { correlationId: expect.any(String) }
        };
        callback(msg);
      });
      
      // Act & Assert
      await expect(productService.updateProduct(productId, updates, userId))
        .rejects.toThrow('Only admins can update products');
      
      expect(productModel.updateProduct).not.toHaveBeenCalled();
    });
  });
  
  describe('deleteProduct', () => {
    test('should check admin status, delete product, and notify inventory', async () => {
      // Arrange
      const productId = 'product-123';
      const userId = 'admin-user';
      const existingProduct = { productId, name: 'Product to Delete' };
      
      productModel.getProductById.mockResolvedValueOnce(existingProduct);
      productModel.deleteProduct.mockResolvedValueOnce(true);
      
      // Act
      const result = await productService.deleteProduct(productId, userId);
      
      // Assert
      expect(rabbitmqConfig.getChannel).toHaveBeenCalled();
      expect(mockChannel.assertQueue).toHaveBeenCalled();
      expect(mockChannel.sendToQueue).toHaveBeenCalledTimes(2); // Once for admin check, once for inventory notification
      expect(productModel.getProductById).toHaveBeenCalledWith(productId);
      expect(productModel.deleteProduct).toHaveBeenCalledWith(productId);
      expect(result).toBe(true);
    });
    
    test('should throw error if user is not admin', async () => {
      // Arrange
      const productId = 'product-123';
      const userId = 'non-admin-user';
      
      // Override the consume mock to return non-admin status
      mockChannel.consume = jest.fn((queue, callback) => {
        const msg = {
          content: Buffer.from(JSON.stringify({ isAdmin: false })),
          properties: { correlationId: expect.any(String) }
        };
        callback(msg);
      });
      
      // Act & Assert
      await expect(productService.deleteProduct(productId, userId))
        .rejects.toThrow('Only admins can delete products');
      
      expect(productModel.deleteProduct).not.toHaveBeenCalled();
    });
    
    test('should throw error if product not found', async () => {
      // Arrange
      const productId = 'non-existent-product';
      const userId = 'admin-user';
      
      productModel.getProductById.mockResolvedValueOnce(null);
      
      // Act & Assert
      await expect(productService.deleteProduct(productId, userId))
        .rejects.toThrow(`Product with ID ${productId} not found`);
      
      expect(productModel.deleteProduct).not.toHaveBeenCalled();
    });
  });
}); 