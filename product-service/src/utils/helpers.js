/**
 * Helper utility functions for the application
 */

/**
 * Validates product data
 * @param {Object} productData - Product data to validate
 * @returns {Object} Validation result
 */
function validateProductData(productData) {
  const errors = [];
  
  // Validate required fields
  const requiredFields = ['name', 'price', 'description'];
  requiredFields.forEach(field => {
    if (!productData[field]) {
      errors.push(`${field} is required`);
    }
  });
  
  // Validate price
  if (productData.price && (isNaN(Number(productData.price)) || Number(productData.price) <= 0)) {
    errors.push('price must be a positive number');
  }
  
  // Validate other fields as needed
  
  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Formats a product for display
 * @param {Object} product - Product to format
 * @returns {Object} Formatted product
 */
function formatProduct(product) {
  if (!product) return null;
  
  return {
    id: product.productId,
    name: product.name,
    price: product.price,
    description: product.description,
    imageUrl: product.imageUrl,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
  };
}

/**
 * Parses pagination parameters from request query
 * @param {Object} query - Request query parameters
 * @returns {Object} Pagination parameters
 */
function parsePaginationParams(query) {
  const page = parseInt(query.page, 10) || 1;
  const limit = parseInt(query.limit, 10) || 10;
  const offset = (page - 1) * limit;
  
  return {
    page,
    limit,
    offset,
  };
}

module.exports = {
  validateProductData,
  formatProduct,
  parsePaginationParams,
}; 