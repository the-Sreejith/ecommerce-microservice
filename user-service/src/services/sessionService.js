// services/sessionService.js
const { Session } = require('../models');
const { AppError } = require('../utils/appError');
const { getSessionById } = require('../utils/jwtUtils');

/**
 * Validate a session
 */
exports.validateSession = async (sessionId) => {
  if (!sessionId) {
    return null;
  }
  
  try {
    const session = await getSessionById(sessionId);
    
    if (!session) {
      return null;
    }
    
    // Check if session is active and not expired
    if (!session.isActive || new Date(session.expiresAt) < new Date()) {
      return null;
    }
    
    return session;
  } catch (error) {
    throw new AppError('Failed to validate session', 500);
  }
};