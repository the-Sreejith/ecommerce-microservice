// utils/jwtUtils.js
const jwt = require('jsonwebtoken');
const { Session } = require('../models');
const { AppError } = require('./appError');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const SESSION_EXPIRY = process.env.SESSION_EXPIRY || '7d';

/**
 * Create a new session
 */
exports.createSession = async (userId, metadata = {}) => {
  try {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // Default 7 day expiry
    
    const session = await Session.create({
      userId,
      expiresAt,
      ipAddress: metadata.ipAddress,
      userAgent: metadata.userAgent,
      isActive: true
    });
    
    // Generate JWT token
    const token = jwt.sign(
      { 
        sessionId: session.id,
        userId 
      }, 
      JWT_SECRET, 
      { expiresIn: SESSION_EXPIRY }
    );
    
    // Update session with token
    await session.update({ token });
    
    return session;
  } catch (error) {
    throw new AppError('Failed to create session', 500);
  }
};

/**
 * Invalidate a session
 */
exports.invalidateSession = async (sessionId) => {
  try {
    await Session.update(
      { isActive: false },
      { where: { id: sessionId } }
    );
    
    return true;
  } catch (error) {
    throw new AppError('Failed to invalidate session', 500);
  }
};

/**
 * Get session by ID
 */
exports.getSessionById = async (sessionId) => {
  try {
    const session = await Session.findByPk(sessionId);
    return session;
  } catch (error) {
    throw new AppError('Failed to get session', 500);
  }
};

/**
 * Verify JWT token
 */
exports.verifyToken = (token) => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded;
  } catch (error) {
    return null;
  }
};