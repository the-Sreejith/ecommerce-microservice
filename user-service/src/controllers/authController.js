const { 
    registerUser, 
    loginUser, 
    logoutUser, 
    refreshToken, 
    createAnonymousUser,
    // authenticateWithGoogle,
    // verifyPhoneNumber,
    // authenticateWithPhone
  } = require('../services/authService');
  const { validateRequest } = require('../middleware/validation');
  const { AppError } = require('../utils/appError');
  
  /**
   * Register a new user
   */
  exports.register = async (req, res, next) => {
    try {
      validateRequest(req.body, ['email', 'password', 'firstName', 'lastName']);
      
      const { email, password, firstName, lastName } = req.body;
      const userData = { email, password, firstName, lastName };
      
      const { user, sessionId } = await registerUser(userData);
      
      res.status(201).json({ 
        success: true, 
        message: 'User registered successfully',
        userId: user.id,
        sessionId
      });
    } catch (error) {
      next(error);
    }
  };
  
  /**
   * Login a user
   */
  exports.login = async (req, res, next) => {
    try {
      validateRequest(req.body, ['email', 'password']);
      
      const { email, password } = req.body;
      const ipAddress = req.ip;
      const userAgent = req.headers['user-agent'];
      
      const { user, sessionId } = await loginUser(email, password, { ipAddress, userAgent });
      
      res.status(200).json({
        success: true,
        message: 'Login successful',
        userId: user.id,
        sessionId
      });
    } catch (error) {
      next(error);
    }
  };
  
  /**
   * Logout a user
   */
  exports.logout = async (req, res, next) => {
    try {
      const { sessionId } = req.body;
      
      if (!sessionId) {
        throw new AppError('Session ID is required', 400);
      }
      
      await logoutUser(sessionId);
      
      res.status(200).json({
        success: true,
        message: 'Logged out successfully'
      });
    } catch (error) {
      next(error);
    }
  };
  
  /**
   * Refresh auth token
   */
  exports.refresh = async (req, res, next) => {
    try {
      const { sessionId } = req.body;
      
      if (!sessionId) {
        throw new AppError('Session ID is required', 400);
      }
      
      const { user, newSessionId } = await refreshToken(sessionId);
      
      res.status(200).json({
        success: true,
        message: 'Token refreshed successfully',
        userId: user.id,
        sessionId: newSessionId
      });
    } catch (error) {
      next(error);
    }
  };
  
  /**
   * Create anonymous user
   */
  exports.anonymous = async (req, res, next) => {
    try {
      const ipAddress = req.ip;
      const userAgent = req.headers['user-agent'];
      
      const { user, sessionId } = await createAnonymousUser({ ipAddress, userAgent });
      
      res.status(201).json({
        success: true,
        message: 'Anonymous user created successfully',
        userId: user.id,
        sessionId
      });
    } catch (error) {
      next(error);
    }
  };
  
  /**
   * OAuth Google Authentication (to be implemented)
   */
  /*
  exports.googleAuth = async (req, res, next) => {
    // To be implemented
    res.status(501).json({
      success: false,
      message: 'Google OAuth authentication not implemented yet'
    });
  };
  */
  
  /**
   * Phone number verification (to be implemented)
   */
  /*
  exports.verifyPhone = async (req, res, next) => {
    // To be implemented
    res.status(501).json({
      success: false,
      message: 'Phone authentication not implemented yet'
    });
  };
  */
  
  