const { docClient } = require('../utils/dynamoClient');
const { PutCommand, GetCommand, ScanCommand, UpdateCommand, DeleteCommand } = require('@aws-sdk/lib-dynamodb');
const logger = require('../utils/logger');
const axios = require('axios');

const TABLE_NAME = process.env.PRODUCT_TABLE_NAME || 'Products';
const INVENTORY_SERVICE_URL = process.env.INVENTORY_SERVICE_URL || 'http://inventory-service:3001/api/inventory';

class ProductModel {
  // Create a new product
  async createProduct(productData) {
    try {
      const product = {
        productId: `prod_${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...productData
      };

      await docClient.send(new PutCommand({
        TableName: TABLE_NAME,
        Item: product
      }));

      // Notify Inventory Service to initialize stock
      try {
        await axios.post(`${INVENTORY_SERVICE_URL}/${product.productId}/initialize`, {
          initialStock: productData.initialStock || 0
        });
      } catch (inventoryError) {
        logger.error('Failed to initialize inventory for new product', {
          error: inventoryError.message,
          productId: product.productId
        });
        // We'll continue with product creation even if inventory initialization fails
        // The inventory can be set up manually later or through a retry mechanism
      }

      return product;
    } catch (error) {
      logger.error('Error creating product', { error: error.message });
      throw error;
    }
  }

  // Get all products with optional filtering and pagination
  async getProducts(limit = 50, lastEvaluatedKey = null, filters = {}) {
    try {
      const params = {
        TableName: TABLE_NAME,
        Limit: parseInt(limit)
      };

      // Add pagination using last evaluated key if provided
      if (lastEvaluatedKey) {
        params.ExclusiveStartKey = JSON.parse(Buffer.from(lastEvaluatedKey, 'base64').toString());
      }

      // Add filtering if provided
      if (Object.keys(filters).length > 0) {
        let filterExpression = [];
        let expressionAttributeValues = {};
        let expressionAttributeNames = {};

        Object.entries(filters).forEach(([key, value]) => {
          const attributeKey = `#${key}`;
          const valueKey = `:${key}`;
          
          filterExpression.push(`${attributeKey} = ${valueKey}`);
          expressionAttributeNames[attributeKey] = key;
          expressionAttributeValues[valueKey] = value;
        });

        params.FilterExpression = filterExpression.join(' AND ');
        params.ExpressionAttributeNames = expressionAttributeNames;
        params.ExpressionAttributeValues = expressionAttributeValues;
      }

      const result = await docClient.send(new ScanCommand(params));
      
      // Format pagination token for the next request
      const nextPageToken = result.LastEvaluatedKey 
        ? Buffer.from(JSON.stringify(result.LastEvaluatedKey)).toString('base64') 
        : null;

      return {
        products: result.Items,
        nextPageToken
      };
    } catch (error) {
      logger.error('Error getting products', { error: error.message });
      throw error;
    }
  }

  // Get a specific product by ID
  async getProductById(productId) {
    try {
      const result = await docClient.send(new GetCommand({
        TableName: TABLE_NAME,
        Key: { productId }
      }));

      return result.Item;
    } catch (error) {
      logger.error('Error getting product by ID', { error: error.message, productId });
      throw error;
    }
  }

  // Update a product
  async updateProduct(productId, updates) {
    try {
      // First check if product exists
      const existingProduct = await this.getProductById(productId);
      if (!existingProduct) {
        const error = new Error('Product not found');
        error.statusCode = 404;
        throw error;
      }

      // Prepare update expression
      let updateExpression = 'SET updatedAt = :updatedAt';
      const expressionAttributeValues = {
        ':updatedAt': new Date().toISOString()
      };
      const expressionAttributeNames = {};

      // Add each field to update expression, except for productId which is the primary key
      Object.entries(updates).forEach(([key, value]) => {
        if (key !== 'productId' && key !== 'createdAt') {
          const attributeKey = `#${key}`;
          const valueKey = `:${key}`;
          
          updateExpression += `, ${attributeKey} = ${valueKey}`;
          expressionAttributeNames[attributeKey] = key;
          expressionAttributeValues[valueKey] = value;
        }
      });

      const params = {
        TableName: TABLE_NAME,
        Key: { productId },
        UpdateExpression: updateExpression,
        ExpressionAttributeValues: expressionAttributeValues,
        ExpressionAttributeNames: expressionAttributeNames,
        ReturnValues: 'ALL_NEW'
      };

      const result = await docClient.send(new UpdateCommand(params));
      return result.Attributes;
    } catch (error) {
      logger.error('Error updating product', { error: error.message, productId });
      throw error;
    }
  }

  // Delete a product
  async deleteProduct(productId) {
    try {
      // First check if product exists
      const existingProduct = await this.getProductById(productId);
      if (!existingProduct) {
        const error = new Error('Product not found');
        error.statusCode = 404;
        throw error;
      }

      const result = await docClient.send(new DeleteCommand({
        TableName: TABLE_NAME,
        Key: { productId },
        ReturnValues: 'ALL_OLD'
      }));

      // Notify Inventory Service to remove stock
      try {
        await axios.delete(`${INVENTORY_SERVICE_URL}/${productId}`);
      } catch (inventoryError) {
        logger.error('Failed to remove inventory for deleted product', {
          error: inventoryError.message,
          productId
        });
        // We'll continue with product deletion even if inventory removal fails
      }

      return result.Attributes;
    } catch (error) {
      logger.error('Error deleting product', { error: error.message, productId });
      throw error;
    }
  }
}

module.exports = new ProductModel();

