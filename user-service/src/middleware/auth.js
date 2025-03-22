const { validateSession } = require('../services/sessionService');
const { getUserById } = require('../services/userService');
const { AppError } = require('../utils/appError');

/**
 * Authenticate a request using session ID
 */
exports.authenticate = async (req, res, next) => {
  try {
    // Get session ID from header
    const sessionId = req.headers['x-session-id'];
    
    if (!sessionId) {
      throw new AppError('Authentication required', 401);
    }
    
    // Validate session
    const session = await validateSession(sessionId);
    
    if (!session) {
      throw new AppError('Invalid or expired session', 401);
    }
    
    // Get user
    const user = await getUserById(session.userId);
    
    if (!user) {
      throw new AppError('User not found', 404);
    }
    
    // Attach user and session to request
    req.user = user;
    req.session = session;
    
    next();
  } catch (error) {
    next(error);
  }
};

