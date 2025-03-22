const { validateSession } = require('../services/sessionService');
const { AppError } = require('../utils/appError');

/**
 * Validate session
 */
exports.validate = async (req, res, next) => {
  try {
    const { sessionId } = req.query;
    
    if (!sessionId) {
      throw new AppError('Session ID is required', 400);
    }
    
    const isValid = await validateSession(sessionId);
    
    res.status(200).json({
      success: true,
      isValid
    });
  } catch (error) {
    next(error);
  }
};

