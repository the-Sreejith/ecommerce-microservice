const { User, Session } = require('../models');
const { hashPassword, comparePassword } = require('../utils/passwordUtils');
const { createSession, invalidateSession } = require('../utils/jwtUtils');
const { AppError } = require('../utils/appError');

/**
 * Register a new user
 */
exports.registerUser = async (userData) => {
  const { email, password, firstName, lastName } = userData;
  
  // Check if user already exists
  const existingUser = await User.findOne({
    where: { email }
  });
  
  if (existingUser) {
    throw new AppError('User with this email already exists', 409);
  }
  
  // Hash password
  const hashedPassword = await hashPassword(password);
  
  // Create user
  const user = await User.create({
    email,
    password: hashedPassword,
    firstName,
    lastName,
    isVerified: false // User should verify email
  });
  
  // Create session
  const session = await createSession(user.id);
  
  return { 
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName
    }, 
    sessionId: session.id 
  };
};

/**
 * Login a user
 */
exports.loginUser = async (email, password, metadata = {}) => {
  // Find user
  const user = await User.findOne({
    where: { email }
  });
  
  if (!user) {
    throw new AppError('Invalid credentials', 401);
  }
  
  // Check password
  const isPasswordValid = await comparePassword(password, user.password);
  
  if (!isPasswordValid) {
    throw new AppError('Invalid credentials', 401);
  }
  
  // Create session
  const session = await createSession(user.id, metadata);
  
  return { 
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName
    }, 
    sessionId: session.id 
  };
};

/**
 * Logout a user
 */
exports.logoutUser = async (sessionId) => {
  try {
    await invalidateSession(sessionId);
    return true;
  } catch (error) {
    throw new AppError('Failed to logout', 500);
  }
};

/**
 * Refresh auth token
 */
exports.refreshToken = async (sessionId) => {
  // Get the current session
  const session = await Session.findByPk(sessionId, {
    include: [{ model: User }]
  });
  
  if (!session || !session.isActive) {
    throw new AppError('Invalid or expired session', 401);
  }
  
  // Invalidate current session
  await invalidateSession(sessionId);
  
  // Create new session
  const newSession = await createSession(session.User.id);
  
  return { 
    user: {
      id: session.User.id,
      email: session.User.email,
      firstName: session.User.firstName,
      lastName: session.User.lastName
    }, 
    newSessionId: newSession.id 
  };
};

/**
 * Create anonymous user
 */
exports.createAnonymousUser = async (metadata = {}) => {
  // Create user
  const user = await User.create({
    isAnonymous: true
  });
  
  // Create session
  const session = await createSession(user.id, metadata);
  
  return { 
    user: {
      id: user.id,
      isAnonymous: true
    }, 
    sessionId: session.id 
  };
};