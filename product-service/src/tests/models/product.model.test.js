const { 
  createProduct,
  getProductById,
  getAllProducts,
  updateProduct,
  deleteProduct
} = require('../../models/product.model');
const { docClient } = require('../../config/db');

// Mock the docClient
jest.mock('../../config/db', () => ({
  docClient: {
    send: jest.fn()
  },
  PRODUCTS_TABLE: 'ProductsTest'
}));

// Mock uuid
jest.mock('uuid', () => ({
  v4: jest.fn().mockReturnValue('test-uuid')
}));

describe('Product Model', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
  });

  describe('createProduct', () => {
    test('should create a product successfully', async () => {
      // Arrange
      const productData = {
        name: 'Test Product',
        price: 19.99,
        description: 'Test description'
      };

      docClient.send.mockResolvedValueOnce({});

      // Act
      const result = await createProduct(productData);

      // Assert
      expect(docClient.send).toHaveBeenCalledTimes(1);
      expect(result).toEqual(expect.objectContaining({
        productId: 'test-uuid',
        name: 'Test Product',
        price: 19.99,
        description: 'Test description',
        createdAt: expect.any(String),
        updatedAt: expect.any(String)
      }));
    });

    test('should throw an error if database operation fails', async () => {
      // Arrange
      const productData = {
        name: 'Test Product',
        price: 19.99,
        description: 'Test description'
      };

      docClient.send.mockRejectedValueOnce(new Error('Database error'));

      // Act & Assert
      await expect(createProduct(productData)).rejects.toThrow('Database error');
    });
  });

  describe('getProductById', () => {
    test('should return a product when found', async () => {
      // Arrange
      const productId = 'test-product-id';
      const mockProduct = {
        productId,
        name: 'Test Product',
        price: 19.99
      };

      docClient.send.mockResolvedValueOnce({ Item: mockProduct });

      // Act
      const result = await getProductById(productId);

      // Assert
      expect(docClient.send).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockProduct);
    });

    test('should return null when product not found', async () => {
      // Arrange
      const productId = 'non-existent-id';

      docClient.send.mockResolvedValueOnce({ Item: null });

      // Act
      const result = await getProductById(productId);

      // Assert
      expect(docClient.send).toHaveBeenCalledTimes(1);
      expect(result).toBeNull();
    });

    test('should throw an error if database operation fails', async () => {
      // Arrange
      const productId = 'test-product-id';

      docClient.send.mockRejectedValueOnce(new Error('Database error'));

      // Act & Assert
      await expect(getProductById(productId)).rejects.toThrow('Database error');
    });
  });

  describe('getAllProducts', () => {
    test('should return products and pagination token', async () => {
      // Arrange
      const mockProducts = [
        { productId: 'id1', name: 'Product 1' },
        { productId: 'id2', name: 'Product 2' }
      ];
      const mockLastEvaluatedKey = { productId: 'id2' };

      docClient.send.mockResolvedValueOnce({
        Items: mockProducts,
        LastEvaluatedKey: mockLastEvaluatedKey
      });

      // Act
      const result = await getAllProducts({ limit: 10 });

      // Assert
      expect(docClient.send).toHaveBeenCalledTimes(1);
      expect(result.products).toEqual(mockProducts);
      expect(result.nextToken).toBeTruthy();
    });

    test('should handle no LastEvaluatedKey', async () => {
      // Arrange
      const mockProducts = [
        { productId: 'id1', name: 'Product 1' },
        { productId: 'id2', name: 'Product 2' }
      ];

      docClient.send.mockResolvedValueOnce({
        Items: mockProducts,
        LastEvaluatedKey: undefined
      });

      // Act
      const result = await getAllProducts();

      // Assert
      expect(docClient.send).toHaveBeenCalledTimes(1);
      expect(result.products).toEqual(mockProducts);
      expect(result.nextToken).toBeNull();
    });

    test('should throw an error if database operation fails', async () => {
      // Arrange
      docClient.send.mockRejectedValueOnce(new Error('Database error'));

      // Act & Assert
      await expect(getAllProducts()).rejects.toThrow('Database error');
    });
  });

  describe('updateProduct', () => {
    test('should update a product successfully', async () => {
      // Arrange
      const productId = 'test-product-id';
      const updates = {
        name: 'Updated Product',
        price: 29.99
      };
      const existingProduct = {
        productId,
        name: 'Test Product',
        price: 19.99
      };
      const updatedProduct = {
        productId,
        name: 'Updated Product',
        price: 29.99,
        updatedAt: expect.any(String)
      };

      // Mock getProductById
      jest.spyOn(require('../../models/product.model'), 'getProductById')
        .mockResolvedValueOnce(existingProduct);

      docClient.send.mockResolvedValueOnce({ Attributes: updatedProduct });

      // Act
      const result = await updateProduct(productId, updates);

      // Assert
      expect(docClient.send).toHaveBeenCalledTimes(1);
      expect(result).toEqual(updatedProduct);
    });

    test('should throw an error if product not found', async () => {
      // Arrange
      const productId = 'non-existent-id';
      const updates = { name: 'Updated Product' };

      // Mock getProductById to return null
      jest.spyOn(require('../../models/product.model'), 'getProductById')
        .mockResolvedValueOnce(null);

      // Act & Assert
      await expect(updateProduct(productId, updates)).rejects.toThrow('not found');
    });

    test('should throw an error if database operation fails', async () => {
      // Arrange
      const productId = 'test-product-id';
      const updates = { name: 'Updated Product' };
      const existingProduct = {
        productId,
        name: 'Test Product'
      };

      // Mock getProductById
      jest.spyOn(require('../../models/product.model'), 'getProductById')
        .mockResolvedValueOnce(existingProduct);

      docClient.send.mockRejectedValueOnce(new Error('Database error'));

      // Act & Assert
      await expect(updateProduct(productId, updates)).rejects.toThrow('Database error');
    });
  });

  describe('deleteProduct', () => {
    test('should delete a product successfully', async () => {
      // Arrange
      const productId = 'test-product-id';

      docClient.send.mockResolvedValueOnce({});

      // Act
      const result = await deleteProduct(productId);

      // Assert
      expect(docClient.send).toHaveBeenCalledTimes(1);
      expect(result).toBe(true);
    });

    test('should throw an error if database operation fails', async () => {
      // Arrange
      const productId = 'test-product-id';

      docClient.send.mockRejectedValueOnce(new Error('Database error'));

      // Act & Assert
      await expect(deleteProduct(productId)).rejects.toThrow('Database error');
    });
  });
}); 