const { AppError } = require('../utils/appError');

/**
 * Validate request body against required fields
 */
exports.validateRequest = (body, requiredFields) => {
  for (const field of requiredFields) {
    if (!body[field]) {
      throw new AppError(`${field} is required`, 400);
    }
  }
  
  return true;
};

