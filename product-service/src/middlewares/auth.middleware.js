const logger = require('../utils/logger');

/**
 * Authentication middleware to validate JWT token
 * This is a simplified version, in a real application you would:
 * - Validate the JWT signature against a secret
 * - Check token expiration
 * - Implement proper error handling
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
function authenticate(req, res, next) {
  try {
    // Get the Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication token is required',
      });
    }
    
    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication token is required',
      });
    }
    
    // In a real application, you would verify the token and extract the user data
    // For this example, we'll simulate a decoded token
    // In production, you would use something like:
    // const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Simulated decoded token with user ID
    const user = {
      id: 'user123', // This would come from the verified token
      email: 'user@example.com',
    };
    
    // Add user data to request object
    req.user = user;
    
    // Continue to the next middleware or route handler
    next();
  } catch (error) {
    logger.error(`Authentication error: ${error.message}`);
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid authentication token',
    });
  }
}

module.exports = {
  authenticate,
}; 