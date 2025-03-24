const request = require('supertest');
const app = require('../src/app');
const productModel = require('../src/models/productModel');
const jwt = require('jsonwebtoken');

// Mock productModel
jest.mock('../src/models/productModel');

// Mock axios for inventory service calls
jest.mock('axios');

// Helper function to generate a JWT token for testing
const generateAdminToken = () => {
  return jwt.sign(
    { userId: 'admin123', role: 'admin' },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '1h' }
  );
};

describe('Product API Endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/products', () => {
    it('should get all products', async () => {
      const mockProducts = [
        { productId: 'prod_1', name: 'Test Product 1', price: 19.99 },
        { productId: 'prod_2', name: 'Test Product 2', price: 29.99 }
      ];
      
      productModel.getProducts.mockResolvedValue({
        products: mockProducts,
        nextPageToken: null
      });

      const res = await request(app).get('/api/products');
      
      expect(res.statusCode).toBe(200);
      expect(res.body.products).toHaveLength(2);
      expect(res.body.products[0].name).toBe('Test Product 1');
      expect(productModel.getProducts).toHaveBeenCalledTimes(1);
    });

    it('should handle pagination and filters', async () => {
      const mockProducts = [
        { productId: 'prod_3', name: 'Test Product 3', price: 39.99 }
      ];
      
      productModel.getProducts.mockResolvedValue({
        products: mockProducts,
        nextPageToken: 'abc123'
      });

      const res = await request(app)
        .get('/api/products?limit=1&nextPageToken=xyz789&category=electronics');
      
      expect(res.statusCode).toBe(200);
      expect(res.body.products).toHaveLength(1);
      expect(res.body.nextPageToken).toBe('abc123');
      expect(productModel.getProducts).toHaveBeenCalledWith('1', 'xyz789', { category: 'electronics' });
    });
  });

  describe('GET /api/products/:productId', () => {
    it('should get a product by id', async () => {
      const mockProduct = { productId: 'prod_1', name: 'Test Product', price: 19.99 };
      productModel.getProductById.mockResolvedValue(mockProduct);

      const res = await request(app).get('/api/products/prod_1');
      
      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual(mockProduct);
      expect(productModel.getProductById).toHaveBeenCalledWith('prod_1');
    });

    it('should return 404 if product not found', async () => {
      productModel.getProductById.mockResolvedValue(null);

      const res = await request(app).get('/api/products/nonexistent');
      
      expect(res.statusCode).toBe(404);
      expect(res.body.message).toContain('not found');
    });
  });

  describe('POST /api/products', () => {
    it('should create a new product with admin token', async () => {
      const newProduct = { name: 'New Product', price: 49.99, description: 'New product description' };
      const createdProduct = { productId: 'prod_new', ...newProduct };
      
      productModel.createProduct.mockResolvedValue(createdProduct);

      const res = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${generateAdminToken()}`)
        .send(newProduct);
      
      expect(res.statusCode).toBe(201);
      expect(res.body).toEqual(createdProduct);
      expect(productModel.createProduct).toHaveBeenCalledWith(newProduct);
    });

    it('should return 401 if no token provided', async () => {
      const res = await request(app)
        .post('/api/products')
        .send({ name: 'New Product', price: 49.99 });
      
      expect(res.statusCode).toBe(401);
      expect(productModel.createProduct).not.toHaveBeenCalled();
    });

    it('should return 400 if required fields are missing', async () => {
      const res = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${generateAdminToken()}`)
        .send({ description: 'Missing required fields' });
      
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toContain('name and price are required');
      expect(productModel.createProduct).not.toHaveBeenCalled();
    });
  });

  describe('PUT /api/products/:productId', () => {
    it('should update a product with admin token', async () => {
      const updates = { price: 59.99, description: 'Updated description' };
      const updatedProduct = { productId: 'prod_1', name: 'Test Product', ...updates };
      
      productModel.updateProduct.mockResolvedValue(updatedProduct);

      const res = await request(app)
        .put('/api/products/prod_1')
        .set('Authorization', `Bearer ${generateAdminToken()}`)
        .send(updates);
      
      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual(updatedProduct);
      expect(productModel.updateProduct).toHaveBeenCalledWith('prod_1', updates);
    });

    it('should return 400 if no update data provided', async () => {
      const res = await request(app)
        .put('/api/products/prod_1')
        .set('Authorization', `Bearer ${generateAdminToken()}`)
        .send({});
      
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toContain('No update data provided');
      expect(productModel.updateProduct).not.toHaveBeenCalled();
    });
  });

  describe('DELETE /api/products/:productId', () => {
    it('should delete a product with admin token', async () => {
      const deletedProduct = { productId: 'prod_1', name: 'Deleted Product', price: 19.99 };
      
      productModel.deleteProduct.mockResolvedValue(deletedProduct);

      const res = await request(app)
        .delete('/api/products/prod_1')
        .set('Authorization', `Bearer ${generateAdminToken()}`);
      
      expect(res.statusCode).toBe(200);
      expect(res.body.message).toContain('deleted successfully');
      expect(res.body.product).toEqual(deletedProduct);
      expect(productModel.deleteProduct).toHaveBeenCalledWith('prod_1');
    });
  });
});