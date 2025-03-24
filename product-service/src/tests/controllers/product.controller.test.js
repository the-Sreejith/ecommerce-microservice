const productController = require('../../controllers/product.controller');
const productService = require('../../services/product.service');
const { validateProductData } = require('../../utils/helpers');

// Mock dependencies
jest.mock('../../services/product.service');
jest.mock('../../utils/helpers');

describe('Product Controller', () => {
  let mockReq;
  let mockRes;
  let mockNext;
  
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Mock request object
    mockReq = {
      params: {},
      query: {},
      body: {},
      user: { id: 'test-user-id' }
    };
    
    // Mock response object
    mockRes = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis()
    };
    
    // Mock next function
    mockNext = jest.fn();
    
    // Mock validation helper
    validateProductData.mockReturnValue({ isValid: true });
  });
  
  describe('getAllProducts', () => {
    test('should return products with pagination', async () => {
      // Arrange
      const mockProducts = {
        products: [{ id: '1', name: 'Test Product' }],
        nextToken: 'token123'
      };
      
      productService.getAllProducts.mockResolvedValueOnce(mockProducts);
      
      // Act
      await productController.getAllProducts(mockReq, mockRes, mockNext);
      
      // Assert
      expect(productService.getAllProducts).toHaveBeenCalledWith({});
      expect(mockRes.json).toHaveBeenCalledWith(mockProducts);
    });
    
    test('should handle errors', async () => {
      // Arrange
      const error = new Error('Database error');
      productService.getAllProducts.mockRejectedValueOnce(error);
      
      // Act
      await productController.getAllProducts(mockReq, mockRes, mockNext);
      
      // Assert
      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });
  
  describe('getProductById', () => {
    test('should return a single product', async () => {
      // Arrange
      const productId = 'test-id';
      const mockProduct = { id: productId, name: 'Test Product' };
      
      mockReq.params.id = productId;
      productService.getProductById.mockResolvedValueOnce(mockProduct);
      
      // Act
      await productController.getProductById(mockReq, mockRes, mockNext);
      
      // Assert
      expect(productService.getProductById).toHaveBeenCalledWith(productId);
      expect(mockRes.json).toHaveBeenCalledWith(mockProduct);
    });
    
    test('should handle product not found', async () => {
      // Arrange
      const productId = 'non-existent-id';
      mockReq.params.id = productId;
      productService.getProductById.mockRejectedValueOnce(new Error('Product not found'));
      
      // Act
      await productController.getProductById(mockReq, mockRes, mockNext);
      
      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Product not found'
      });
    });
  });
  
  describe('createProduct', () => {
    test('should create a new product', async () => {
      // Arrange
      const productData = {
        name: 'New Product',
        price: 29.99,
        description: 'Test Description'
      };
      
      const createdProduct = {
        productId: 'new-id',
        ...productData
      };
      
      mockReq.body = productData;
      productService.createProduct.mockResolvedValueOnce(createdProduct);
      
      // Act
      await productController.createProduct(mockReq, mockRes, mockNext);
      
      // Assert
      expect(validateProductData).toHaveBeenCalledWith(productData);
      expect(productService.createProduct).toHaveBeenCalledWith(productData, mockReq.user.id);
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(createdProduct);
    });
    
    test('should handle validation errors', async () => {
      // Arrange
      const productData = {
        name: 'New Product'
        // Missing required fields
      };
      
      validateProductData.mockReturnValueOnce({
        isValid: false,
        errors: ['Price is required']
      });
      
      mockReq.body = productData;
      
      // Act
      await productController.createProduct(mockReq, mockRes, mockNext);
      
      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Validation failed',
        details: ['Price is required']
      });
      expect(productService.createProduct).not.toHaveBeenCalled();
    });
    
    test('should handle service errors', async () => {
      // Arrange
      const productData = {
        name: 'New Product',
        price: 29.99,
        description: 'Test Description'
      };
      
      const error = new Error('Service error');
      mockReq.body = productData;
      productService.createProduct.mockRejectedValueOnce(error);
      
      // Act
      await productController.createProduct(mockReq, mockRes, mockNext);
      
      // Assert
      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });
  
  describe('updateProduct', () => {
    test('should update an existing product', async () => {
      // Arrange
      const productId = 'test-id';
      const updates = {
        name: 'Updated Product',
        price: 39.99
      };
      
      const updatedProduct = {
        productId,
        ...updates
      };
      
      mockReq.params.id = productId;
      mockReq.body = updates;
      productService.updateProduct.mockResolvedValueOnce(updatedProduct);
      
      // Act
      await productController.updateProduct(mockReq, mockRes, mockNext);
      
      // Assert
      expect(validateProductData).toHaveBeenCalledWith(updates);
      expect(productService.updateProduct).toHaveBeenCalledWith(productId, updates, mockReq.user.id);
      expect(mockRes.json).toHaveBeenCalledWith(updatedProduct);
    });
    
    test('should handle validation errors', async () => {
      // Arrange
      const productId = 'test-id';
      const updates = {
        price: -10 // Invalid price
      };
      
      validateProductData.mockReturnValueOnce({
        isValid: false,
        errors: ['Price must be a positive number']
      });
      
      mockReq.params.id = productId;
      mockReq.body = updates;
      
      // Act
      await productController.updateProduct(mockReq, mockRes, mockNext);
      
      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Validation failed',
        details: ['Price must be a positive number']
      });
      expect(productService.updateProduct).not.toHaveBeenCalled();
    });
    
    test('should handle service errors', async () => {
      // Arrange
      const productId = 'test-id';
      const updates = {
        name: 'Updated Product'
      };
      
      const error = new Error('Service error');
      mockReq.params.id = productId;
      mockReq.body = updates;
      productService.updateProduct.mockRejectedValueOnce(error);
      
      // Act
      await productController.updateProduct(mockReq, mockRes, mockNext);
      
      // Assert
      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });
  
  describe('deleteProduct', () => {
    test('should delete an existing product', async () => {
      // Arrange
      const productId = 'test-id';
      mockReq.params.id = productId;
      productService.deleteProduct.mockResolvedValueOnce(true);
      
      // Act
      await productController.deleteProduct(mockReq, mockRes, mockNext);
      
      // Assert
      expect(productService.deleteProduct).toHaveBeenCalledWith(productId, mockReq.user.id);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Product deleted successfully'
      });
    });
    
    test('should handle service errors', async () => {
      // Arrange
      const productId = 'test-id';
      const error = new Error('Service error');
      
      mockReq.params.id = productId;
      productService.deleteProduct.mockRejectedValueOnce(error);
      
      // Act
      await productController.deleteProduct(mockReq, mockRes, mockNext);
      
      // Assert
      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });
}); 