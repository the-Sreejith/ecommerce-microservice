const { validateProductData, formatProduct, parsePaginationParams } = require('../../utils/helpers');

describe('Helper Functions', () => {
  describe('validateProductData', () => {
    test('should validate valid product data', () => {
      // Arrange
      const productData = {
        name: 'Test Product',
        price: 29.99,
        description: 'Test Description'
      };
      
      // Act
      const result = validateProductData(productData);
      
      // Assert
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
    
    test('should validate product data with optional fields', () => {
      // Arrange
      const productData = {
        name: 'Test Product',
        price: 29.99,
        description: 'Test Description',
        category: 'Electronics',
        imageUrl: 'https://example.com/image.jpg'
      };
      
      // Act
      const result = validateProductData(productData);
      
      // Assert
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
    
    test('should return errors for missing required fields', () => {
      // Arrange
      const productData = {
        name: 'Test Product'
        // Missing price and description
      };
      
      // Act
      const result = validateProductData(productData);
      
      // Assert
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Price is required');
      expect(result.errors).toContain('Description is required');
    });
    
    test('should return error for invalid price', () => {
      // Arrange
      const productData = {
        name: 'Test Product',
        price: -10,
        description: 'Test Description'
      };
      
      // Act
      const result = validateProductData(productData);
      
      // Assert
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Price must be a positive number');
    });
    
    test('should return error for non-numeric price', () => {
      // Arrange
      const productData = {
        name: 'Test Product',
        price: 'not-a-number',
        description: 'Test Description'
      };
      
      // Act
      const result = validateProductData(productData);
      
      // Assert
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Price must be a number');
    });
  });
  
  describe('formatProduct', () => {
    test('should format product with all fields', () => {
      // Arrange
      const product = {
        productId: 'test-id',
        name: 'Test Product',
        price: 29.99,
        description: 'Test Description',
        category: 'Electronics',
        imageUrl: 'https://example.com/image.jpg',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      };
      
      // Act
      const formattedProduct = formatProduct(product);
      
      // Assert
      expect(formattedProduct).toEqual({
        id: product.productId,
        name: product.name,
        price: product.price,
        description: product.description,
        category: product.category,
        imageUrl: product.imageUrl,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt
      });
    });
    
    test('should format product with minimal fields', () => {
      // Arrange
      const product = {
        productId: 'test-id',
        name: 'Test Product',
        price: 29.99,
        description: 'Test Description'
      };
      
      // Act
      const formattedProduct = formatProduct(product);
      
      // Assert
      expect(formattedProduct).toEqual({
        id: product.productId,
        name: product.name,
        price: product.price,
        description: product.description,
        category: undefined,
        imageUrl: undefined,
        createdAt: undefined,
        updatedAt: undefined
      });
    });
  });
  
  describe('parsePaginationParams', () => {
    test('should parse valid pagination parameters', () => {
      // Arrange
      const query = {
        page: '1',
        limit: '10'
      };
      
      // Act
      const params = parsePaginationParams(query);
      
      // Assert
      expect(params).toEqual({
        page: 1,
        limit: 10,
        offset: 0
      });
    });
    
    test('should use default values for missing parameters', () => {
      // Arrange
      const query = {};
      
      // Act
      const params = parsePaginationParams(query);
      
      // Assert
      expect(params).toEqual({
        page: 1,
        limit: 10,
        offset: 0
      });
    });
    
    test('should handle invalid page number', () => {
      // Arrange
      const query = {
        page: 'invalid',
        limit: '10'
      };
      
      // Act
      const params = parsePaginationParams(query);
      
      // Assert
      expect(params).toEqual({
        page: 1,
        limit: 10,
        offset: 0
      });
    });
    
    test('should handle invalid limit value', () => {
      // Arrange
      const query = {
        page: '1',
        limit: 'invalid'
      };
      
      // Act
      const params = parsePaginationParams(query);
      
      // Assert
      expect(params).toEqual({
        page: 1,
        limit: 10,
        offset: 0
      });
    });
    
    test('should calculate correct offset', () => {
      // Arrange
      const query = {
        page: '3',
        limit: '20'
      };
      
      // Act
      const params = parsePaginationParams(query);
      
      // Assert
      expect(params).toEqual({
        page: 3,
        limit: 20,
        offset: 40 // (page - 1) * limit
      });
    });
  });
}); 